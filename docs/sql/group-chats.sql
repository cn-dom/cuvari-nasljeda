-- PatriaSoul – Čuvari nasljeđa
-- SQL NACRT za grupne razgovore. Samo pregled; nije izvršen ni nad jednom bazom.
-- Primijeniti tek nakon provjere na zasebnom testnom Supabase projektu.

begin;

create table if not exists public.group_chats (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 60),
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.group_chat_members (
  group_id uuid not null references public.group_chats(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists public.group_chat_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.group_chats(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists group_chat_members_user_idx
  on public.group_chat_members (user_id, group_id);
create index if not exists group_chat_messages_group_created_idx
  on public.group_chat_messages (group_id, created_at asc);

alter table public.group_chats enable row level security;
alter table public.group_chat_members enable row level security;
alter table public.group_chat_messages enable row level security;

-- SECURITY DEFINER helpers avoid recursive RLS checks on group_chat_members.
create or replace function public.is_group_chat_member(target_group_id uuid)
returns boolean
language sql stable security definer
set search_path = public, pg_temp
set row_security = off
as $$
  select exists (
    select 1 from public.group_chat_members gcm
    where gcm.group_id = target_group_id and gcm.user_id = auth.uid()
  );
$$;

create or replace function public.is_group_chat_creator(target_group_id uuid)
returns boolean
language sql stable security definer
set search_path = public, pg_temp
set row_security = off
as $
  select exists (
    select 1 from public.group_chats gc
    where gc.id = target_group_id and gc.created_by = auth.uid()
  );
$;

create or replace function public.is_group_chat_admin(target_group_id uuid)
returns boolean
language sql stable security definer
set search_path = public, pg_temp
set row_security = off
as $
  select exists (
    select 1 from public.group_chat_members gcm
    where gcm.group_id = target_group_id
      and gcm.user_id = auth.uid()
      and gcm.role = 'admin'
  );
$;

revoke all on function public.is_group_chat_member(uuid) from public;
grant execute on function public.is_group_chat_member(uuid) to authenticated;
revoke all on function public.is_group_chat_creator(uuid) from public;
grant execute on function public.is_group_chat_creator(uuid) to authenticated;
revoke all on function public.is_group_chat_admin(uuid) from public;
grant execute on function public.is_group_chat_admin(uuid) to authenticated;

drop policy if exists group_chats_select_members on public.group_chats;
create policy group_chats_select_members on public.group_chats
for select to authenticated
using (public.is_group_chat_member(id) or created_by = auth.uid());

drop policy if exists group_chats_insert_creator on public.group_chats;
create policy group_chats_insert_creator on public.group_chats
for insert to authenticated
with check (created_by = auth.uid() and char_length(trim(name)) between 2 and 60);

-- Keep ownership and membership identity immutable through direct table updates.
create or replace function public.guard_group_chat_admin_changes()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $
begin
  if tg_table_name = 'group_chats' then
    if new.created_by is distinct from old.created_by then
      raise exception 'Group creator cannot be changed directly';
    end if;
    return new;
  end if;
  if new.group_id is distinct from old.group_id or new.user_id is distinct from old.user_id then
    raise exception 'Group membership identity cannot be changed';
  end if;
  if new.role is distinct from old.role
     and coalesce(current_setting('patriasoul.admin_transfer', true), '') <> 'on' then
    raise exception 'Use the admin transfer function to change roles';
  end if;
  return new;
end;
$;

drop trigger if exists guard_group_chats_admin_changes on public.group_chats;
create trigger guard_group_chats_admin_changes before update on public.group_chats
for each row execute function public.guard_group_chat_admin_changes();

drop trigger if exists guard_group_chat_members_admin_changes on public.group_chat_members;
create trigger guard_group_chat_members_admin_changes before update on public.group_chat_members
for each row execute function public.guard_group_chat_admin_changes();

drop policy if exists group_chats_update_admin on public.group_chats;
create policy group_chats_update_admin on public.group_chats
for update to authenticated
using (public.is_group_chat_admin(id))
with check (public.is_group_chat_admin(id) and created_by = created_by);

-- Group membership management is reserved for admins. Creator check remains
-- solely to allow the initial admin/member rows during group creation.
drop policy if exists group_chat_members_select_members on public.group_chat_members;
create policy group_chat_members_select_members on public.group_chat_members
for select to authenticated
using (public.is_group_chat_member(group_id) or user_id = auth.uid());

drop policy if exists group_chat_members_insert_creator on public.group_chat_members;
create policy group_chat_members_insert_creator on public.group_chat_members
for insert to authenticated
with check (
  (public.is_group_chat_creator(group_id) and
    ((role = 'admin' and user_id = auth.uid()) or role = 'member'))
  or (public.is_group_chat_admin(group_id) and role = 'member')
);

drop policy if exists group_chat_members_delete_admin on public.group_chat_members;
create policy group_chat_members_delete_admin on public.group_chat_members
for delete to authenticated
using (public.is_group_chat_admin(group_id) and role <> 'admin');

drop policy if exists group_chat_members_update_admin on public.group_chat_members;
create policy group_chat_members_update_admin on public.group_chat_members
for update to authenticated
using (public.is_group_chat_admin(group_id))
with check (public.is_group_chat_admin(group_id));

-- Atomic admin transfer: transfer to an existing member, then demote the
-- previous admin in one transaction.
create or replace function public.transfer_group_chat_admin(target_group_id uuid, new_admin_user_id uuid)
returns void
language plpgsql security definer
set search_path = public, pg_temp
set row_security = off
as $
begin
  if not public.is_group_chat_admin(target_group_id) then
    raise exception 'Only a group admin can transfer admin rights';
  end if;
  if new_admin_user_id = auth.uid() then
    raise exception 'Choose another group member';
  end if;
  if not exists (
    select 1 from public.group_chat_members
    where group_id = target_group_id and user_id = new_admin_user_id
  ) then
    raise exception 'Target must already be a group member';
  end if;
  perform set_config('patriasoul.admin_transfer', 'on', true);
  update public.group_chat_members
    set role = 'member'
    where group_id = target_group_id and user_id = auth.uid() and role = 'admin';
  update public.group_chat_members
    set role = 'admin'
    where group_id = target_group_id and user_id = new_admin_user_id;
end;
$;

revoke all on function public.transfer_group_chat_admin(uuid, uuid) from public;
grant execute on function public.transfer_group_chat_admin(uuid, uuid) to authenticated;

drop policy if exists group_chat_messages_select_members on public.group_chat_messages;
create policy group_chat_messages_select_members on public.group_chat_messages
for select to authenticated
using (public.is_group_chat_member(group_id));

drop policy if exists group_chat_messages_insert_members on public.group_chat_messages;
create policy group_chat_messages_insert_members on public.group_chat_messages
for insert to authenticated
with check (
  sender_id = auth.uid()
  and public.is_group_chat_member(group_id)
  and char_length(trim(body)) between 1 and 2000
);

-- Realtime publication for group messages, if available and not already configured.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'group_chat_messages'
     ) then
    alter publication supabase_realtime add table public.group_chat_messages;
  end if;
end
$$;

commit;

-- Verification after manually applying to the test project:
-- select * from pg_policies where tablename in ('group_chats', 'group_chat_members', 'group_chat_messages');
-- select * from pg_publication_tables where pubname = 'supabase_realtime'
--   and schemaname = 'public' and tablename = 'group_chat_messages';
