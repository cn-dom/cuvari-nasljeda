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
as $$
  select exists (
    select 1 from public.group_chats gc
    where gc.id = target_group_id and gc.created_by = auth.uid()
  );
$$;

revoke all on function public.is_group_chat_member(uuid) from public;
grant execute on function public.is_group_chat_member(uuid) to authenticated;
revoke all on function public.is_group_chat_creator(uuid) from public;
grant execute on function public.is_group_chat_creator(uuid) to authenticated;

drop policy if exists group_chats_select_members on public.group_chats;
create policy group_chats_select_members on public.group_chats
for select to authenticated
using (public.is_group_chat_member(id) or created_by = auth.uid());

drop policy if exists group_chats_insert_creator on public.group_chats;
create policy group_chats_insert_creator on public.group_chats
for insert to authenticated
with check (created_by = auth.uid() and char_length(trim(name)) between 2 and 60);

-- No ordinary member can change a group's name, creator, or delete the group in this first version.

drop policy if exists group_chat_members_select_members on public.group_chat_members;
create policy group_chat_members_select_members on public.group_chat_members
for select to authenticated
using (public.is_group_chat_member(group_id) or user_id = auth.uid());

drop policy if exists group_chat_members_insert_creator on public.group_chat_members;
create policy group_chat_members_insert_creator on public.group_chat_members
for insert to authenticated
with check (
  public.is_group_chat_creator(group_id)
  and (
    (role = 'admin' and user_id = auth.uid())
    or role = 'member'
  )
);

-- Leave member removal and role changes disabled until a separate admin workflow exists.

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
