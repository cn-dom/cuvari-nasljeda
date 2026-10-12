-- Consolidated social messaging schema applied to the confirmed TEST Supabase project.
-- Includes private messages/reactions, group chats/messages/reactions/read receipts,
-- notification generation, RLS policies, and restricted trigger/function permissions.
-- Apply only after reviewing the target project and dependencies.
begin;
-- Source: docs/sql/private-messages.sql
-- PatriaSoul – Čuvari nasljeđa
-- REVIEW-ONLY migration draft. Do not apply to production without explicit approval.
-- Private messages: participants can read; sender can insert their own messages.

create table if not exists public.private_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  reply_to_id uuid references public.private_messages(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint private_messages_no_self_message check (sender_id <> recipient_id)
);

alter table public.private_messages
  add column if not exists reply_to_id uuid references public.private_messages(id) on delete set null,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists private_messages_sender_created_idx
  on public.private_messages (sender_id, created_at desc);
create index if not exists private_messages_recipient_created_idx
  on public.private_messages (recipient_id, created_at desc);

alter table public.private_messages enable row level security;

drop policy if exists private_messages_select_participant on public.private_messages;
create policy private_messages_select_participant
  on public.private_messages for select to authenticated
  using (sender_id = (select auth.uid()) or recipient_id = (select auth.uid()));

drop policy if exists private_messages_insert_sender on public.private_messages;
create policy private_messages_insert_sender
  on public.private_messages for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and recipient_id <> (select auth.uid())
    and char_length(trim(body)) between 1 and 2000
  );

-- Validate the reply target outside the INSERT policy to avoid recursive RLS evaluation.
create or replace function public.validate_private_message_reply()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
set row_security = off
as $$
declare
  parent_message public.private_messages%rowtype;
begin
  if new.reply_to_id is null then
    return new;
  end if;

  select * into parent_message
  from public.private_messages
  where id = new.reply_to_id;

  if not found then
    raise exception 'Reply target does not exist';
  end if;

  if not (
    (parent_message.sender_id = new.sender_id and parent_message.recipient_id = new.recipient_id)
    or
    (parent_message.recipient_id = new.sender_id and parent_message.sender_id = new.recipient_id)
  ) then
    raise exception 'Reply target must belong to the same conversation';
  end if;

  return new;
end;
$$;
drop trigger if exists private_messages_validate_reply on public.private_messages;
create trigger private_messages_validate_reply
  before insert or update of reply_to_id, sender_id, recipient_id
  on public.private_messages
  for each row execute function public.validate_private_message_reply();

-- Members may update/delete only messages they sent; recipients cannot alter the sender's message.
drop policy if exists private_messages_update_sender on public.private_messages;
create policy private_messages_update_sender
  on public.private_messages for update to authenticated
  using (sender_id = (select auth.uid()))
  with check (
    sender_id = (select auth.uid())
    and recipient_id <> (select auth.uid())
    and char_length(trim(body)) between 1 and 2000
  );

drop policy if exists private_messages_delete_sender on public.private_messages;
create policy private_messages_delete_sender
  on public.private_messages for delete to authenticated
  using (sender_id = (select auth.uid()));

-- Keep updated_at controlled by the database whenever a message body changes.
create or replace function public.set_private_message_updated_at()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists private_messages_set_updated_at on public.private_messages;
create trigger private_messages_set_updated_at before update of body on public.private_messages
for each row execute function public.set_private_message_updated_at();

-- Prevent changing the sender, recipient, or reply target after a message is created.
create or replace function public.guard_private_message_identity()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  if new.sender_id <> old.sender_id
    or new.recipient_id <> old.recipient_id
    or new.reply_to_id is distinct from old.reply_to_id
    or new.created_at <> old.created_at then
    raise exception 'Message participants and reply target cannot be changed';
  end if;
  return new;
end;
$$;
drop trigger if exists private_messages_guard_identity on public.private_messages;
create trigger private_messages_guard_identity before update on public.private_messages
for each row execute function public.guard_private_message_identity();


-- Source: docs/sql/private-message-reactions.sql
-- PatriaSoul – Čuvari nasljeđa
-- SQL NACRT: emoji reakcije na privatne poruke.
-- Pregledati i primijeniti samo na zasebnoj testnoj Supabase bazi.
-- Ovaj dokument nije izvršen nad bazom.

create table if not exists public.private_message_reactions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.private_messages(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  emoji text not null check (emoji in ('👍', '❤️', '😂', '😮', '😢', '🙏')),
  created_at timestamptz not null default now(),
  constraint private_message_reactions_one_per_emoji unique (message_id, user_id, emoji)
);

create index if not exists private_message_reactions_message_idx
  on public.private_message_reactions (message_id, created_at);

alter table public.private_message_reactions enable row level security;

drop policy if exists "Participants can read private message reactions" on public.private_message_reactions;
create policy "Participants can read private message reactions"
  on public.private_message_reactions for select to authenticated
  using (exists (
    select 1 from public.private_messages pm
    where pm.id = message_id and (pm.sender_id = auth.uid() or pm.recipient_id = auth.uid())
  ));

drop policy if exists "Participants can add own private message reactions" on public.private_message_reactions;
create policy "Participants can add own private message reactions"
  on public.private_message_reactions for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.private_messages pm
      where pm.id = message_id and (pm.sender_id = auth.uid() or pm.recipient_id = auth.uid())
    )
  );

drop policy if exists "Members can remove own private message reactions" on public.private_message_reactions;
create policy "Members can remove own private message reactions"
  on public.private_message_reactions for delete to authenticated
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.private_messages pm
      where pm.id = message_id and (pm.sender_id = auth.uid() or pm.recipient_id = auth.uid())
    )
  );

-- Supabase Realtime: uključi nove i obrisane reakcije ako tablica još nije objavljena.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public'
         and tablename = 'private_message_reactions'
     ) then
    alter publication supabase_realtime add table public.private_message_reactions;
  end if;
end
$$;

-- Potreban je id u DELETE događaju Realtime kanala.
alter table public.private_message_reactions replica identity full;

-- Provjera nakon primjene:
-- select count(*) from public.private_message_reactions;
-- select * from pg_publication_tables where pubname = 'supabase_realtime'
--   and schemaname = 'public' and tablename = 'private_message_reactions';


-- Source: docs/sql/group-chats.sql
-- PatriaSoul – Čuvari nasljeđa
-- SQL NACRT za grupne razgovore. Samo pregled; nije izvršen ni nad jednom bazom.
-- Primijeniti tek nakon provjere na zasebnom testnom Supabase projektu.

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
create or replace function public.is_group_chat_admin(target_group_id uuid)
returns boolean
language sql stable security definer
set search_path = public, pg_temp
set row_security = off
as $$
  select exists (
    select 1 from public.group_chat_members gcm
    where gcm.group_id = target_group_id
      and gcm.user_id = auth.uid()
      and gcm.role = 'admin'
  );
$$;
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
as $$
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
$$;
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
with check (public.is_group_chat_admin(id));

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
  (public.is_group_chat_creator(group_id) and role = 'admin' and user_id = auth.uid())
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
as $$
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
$$;
revoke all on function public.transfer_group_chat_admin(uuid, uuid) from public;
grant execute on function public.transfer_group_chat_admin(uuid, uuid) to authenticated;

drop policy if exists group_chat_messages_select_members on public.group_chat_messages;
create policy group_chat_messages_select_members on public.group_chat_messages
for select to authenticated
using (public.is_group_chat_member(group_id));

-- Keep message identity fields immutable while allowing authors to edit text.
create or replace function public.guard_group_chat_message_changes()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.id is distinct from old.id
     or new.group_id is distinct from old.group_id
     or new.sender_id is distinct from old.sender_id
     or new.created_at is distinct from old.created_at then
    raise exception 'Group message identity fields cannot be changed';
  end if;
  return new;
end;
$$;
drop trigger if exists guard_group_chat_message_changes on public.group_chat_messages;
create trigger guard_group_chat_message_changes before update on public.group_chat_messages
for each row execute function public.guard_group_chat_message_changes();

drop policy if exists group_chat_messages_update_own on public.group_chat_messages;
create policy group_chat_messages_update_own on public.group_chat_messages
for update to authenticated
using (sender_id = auth.uid() and public.is_group_chat_member(group_id))
with check (
  sender_id = auth.uid()
  and public.is_group_chat_member(group_id)
  and char_length(trim(body)) between 1 and 2000
);

drop policy if exists group_chat_messages_delete_own on public.group_chat_messages;
create policy group_chat_messages_delete_own on public.group_chat_messages
for delete to authenticated
using (sender_id = auth.uid() and public.is_group_chat_member(group_id));

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

-- Members can leave; the last admin must transfer admin rights first.
create or replace function public.leave_group_chat(target_group_id uuid)
returns void
language plpgsql security definer
set search_path = public, pg_temp
set row_security = off
as $$
declare
  caller_role text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  select role into caller_role
    from public.group_chat_members
    where group_id = target_group_id and user_id = auth.uid();
  if caller_role is null then
    raise exception 'You are not a member of this group';
  end if;
  if caller_role = 'admin' and not exists (
    select 1 from public.group_chat_members
    where group_id = target_group_id and role = 'admin' and user_id <> auth.uid()
  ) then
    raise exception 'Cannot leave as the last admin';
  end if;
  delete from public.group_chat_members
    where group_id = target_group_id and user_id = auth.uid();
end;
$$;
revoke all on function public.leave_group_chat(uuid) from public;
grant execute on function public.leave_group_chat(uuid) to authenticated;

-- Only a current group admin may permanently delete the group and its content.
create or replace function public.delete_group_chat(target_group_id uuid)
returns void
language plpgsql security definer
set search_path = public, pg_temp
set row_security = off
as $$
begin
  if auth.uid() is null or not public.is_group_chat_admin(target_group_id) then
    raise exception 'Only a group admin can delete this group';
  end if;
  delete from public.group_chats where id = target_group_id;
  if not found then
    raise exception 'Group not found';
  end if;
end;
$$;
revoke all on function public.delete_group_chat(uuid) from public;
grant execute on function public.delete_group_chat(uuid) to authenticated;


-- Odgovori na pojedinačne poruke u grupnim razgovorima.
alter table public.group_chat_messages
  add column if not exists reply_to_id uuid null
  references public.group_chat_messages(id) on delete set null;

create index if not exists group_chat_messages_reply_to_idx
  on public.group_chat_messages (reply_to_id)
  where reply_to_id is not null;

-- Odgovor mora upućivati na poruku iz iste grupe; nakon slanja cilj ne može se mijenjati.
create or replace function public.guard_group_chat_message_changes()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.id is distinct from old.id
     or new.group_id is distinct from old.group_id
     or new.sender_id is distinct from old.sender_id
     or new.created_at is distinct from old.created_at then
    raise exception 'Group message identity and reply target cannot be changed';
  end if;
  if new.reply_to_id is not null and not exists (
    select 1 from public.group_chat_messages replied
    where replied.id = new.reply_to_id and replied.group_id = new.group_id
  ) then
    raise exception 'Reply target must belong to the same group';
  end if;
  return new;
end;
$$;

-- Verification after manually applying to the test project:
-- select * from pg_policies where tablename in ('group_chats', 'group_chat_members', 'group_chat_messages');
-- select * from pg_publication_tables where pubname = 'supabase_realtime'
--   and schemaname = 'public' and tablename = 'group_chat_messages';


-- Source: docs/sql/group-message-reads.sql
-- PatriaSoul – Čuvari nasljeđa
-- SQL NACRT za potvrde čitanja grupnih poruka. Nije izvršen ni nad jednom bazom.
-- Primijeniti tek nakon pregleda na zasebnom testnom Supabase projektu.

create table if not exists public.group_chat_message_reads (
  message_id uuid not null references public.group_chat_messages(id) on delete cascade,
  group_id uuid not null references public.group_chats(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (message_id, user_id)
);

create index if not exists group_chat_message_reads_group_message_idx
  on public.group_chat_message_reads (group_id, message_id);

alter table public.group_chat_message_reads enable row level security;

drop policy if exists group_chat_message_reads_select_members on public.group_chat_message_reads;
create policy group_chat_message_reads_select_members
on public.group_chat_message_reads
for select to authenticated
using (public.is_group_chat_member(group_id));

-- Klijent ne može sam upisati potvrdu za drugu osobu ili poruku iz druge grupe.
-- RPC provjerava članstvo i stvarnu pripadnost svake poruke grupi, a zatim
-- upisuje samo potvrde za tuđе poruke. Već postojeće potvrde ostaju nepromijenjene.
create or replace function public.mark_group_messages_read(
  target_group_id uuid,
  target_message_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
set row_security = off
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if not public.is_group_chat_member(target_group_id) then
    raise exception 'Only group members can mark messages as read';
  end if;

  if target_message_ids is null or cardinality(target_message_ids) = 0 then
    return;
  end if;

  if exists (
    select 1
    from unnest(target_message_ids) requested(message_id)
    left join public.group_chat_messages message
      on message.id = requested.message_id
     and message.group_id = target_group_id
    where message.id is null
  ) then
    raise exception 'Every message must belong to the selected group';
  end if;

  insert into public.group_chat_message_reads (message_id, group_id, user_id)
  select message.id, target_group_id, current_user_id
  from public.group_chat_messages message
  where message.group_id = target_group_id
    and message.id = any(target_message_ids)
    and message.sender_id <> current_user_id
  on conflict (message_id, user_id) do nothing;
end;
$$;

revoke all on function public.mark_group_messages_read(uuid, uuid[]) from public;
grant execute on function public.mark_group_messages_read(uuid, uuid[]) to authenticated;

-- Broj nepročitanih poruka po grupi za prijavljenog člana.
create or replace function public.get_group_unread_counts()
returns table (group_id uuid, unread_count bigint)
language sql
security definer
set search_path = public, pg_temp
set row_security = off
as $$
  select membership.group_id, count(message.id)::bigint as unread_count
  from public.group_chat_members membership
  left join public.group_chat_messages message
    on message.group_id = membership.group_id
   and message.sender_id <> auth.uid()
   and not exists (
     select 1 from public.group_chat_message_reads message_read
     where message_read.message_id = message.id
       and message_read.user_id = auth.uid()
   )
  where membership.user_id = auth.uid()
  group by membership.group_id;
$$;
revoke all on function public.get_group_unread_counts() from public;
grant execute on function public.get_group_unread_counts() to authenticated;

-- Omogući realtime događaje ako tablica još nije uključena u publikaciju.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'group_chat_message_reads'
     ) then
    alter publication supabase_realtime add table public.group_chat_message_reads;
  end if;
end;
$$;


-- Source: docs/sql/notifications.sql
-- PatriaSoul – Čuvari nasljeđa
-- REVIEW-ONLY migration draft. Do not apply to production without explicit approval.
-- Initial notification support: notify the recipient when a private message is created.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null check (type in ('private_message')),
  title text not null check (char_length(title) between 1 and 160),
  body text not null check (char_length(body) between 1 and 240),
  reference_id uuid,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  constraint notifications_no_self_notice check (actor_id is null or recipient_id <> actor_id)
);

create index if not exists notifications_recipient_created_idx
  on public.notifications (recipient_id, created_at desc);
create index if not exists notifications_unread_idx
  on public.notifications (recipient_id, created_at desc)
  where read_at is null;

alter table public.notifications enable row level security;

drop policy if exists notifications_select_recipient on public.notifications;
create policy notifications_select_recipient
  on public.notifications for select to authenticated
  using (recipient_id = (select auth.uid()));

drop policy if exists notifications_update_read_recipient on public.notifications;
create policy notifications_update_read_recipient
  on public.notifications for update to authenticated
  using (recipient_id = (select auth.uid()))
  with check (recipient_id = (select auth.uid()));

-- Prevent recipients from rewriting notification content or ownership.
create or replace function public.guard_notification_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.id is distinct from old.id
     or new.recipient_id is distinct from old.recipient_id
     or new.actor_id is distinct from old.actor_id
     or new.type is distinct from old.type
     or new.title is distinct from old.title
     or new.body is distinct from old.body
     or new.reference_id is distinct from old.reference_id
     or new.created_at is distinct from old.created_at then
    raise exception 'Only read_at may be changed on a notification';
  end if;
  return new;
end;
$$;

drop trigger if exists notifications_guard_update on public.notifications;
create trigger notifications_guard_update
before update on public.notifications
for each row execute function public.guard_notification_update();

-- Ordinary members receive no INSERT or DELETE policy on notifications.
-- Only this trusted database trigger creates notifications.
create or replace function public.notify_private_message_recipient()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.notifications (recipient_id, actor_id, type, title, body, reference_id)
  values (
    new.recipient_id,
    new.sender_id,
    'private_message',
    'Nova privatna poruka',
    left(trim(new.body), 240),
    new.id
  );
  return new;
end;
$$;

drop trigger if exists private_message_notification on public.private_messages;
create trigger private_message_notification
after insert on public.private_messages
for each row execute function public.notify_private_message_recipient();


-- Reactions on group-chat messages (used by the current application).
create table if not exists public.group_chat_message_reactions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.group_chat_messages(id) on delete cascade,
  group_id uuid not null references public.group_chats(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction text not null check (reaction in ('👍','❤️','😂','😮','😢','🙏')),
  created_at timestamptz not null default now(),
  constraint group_chat_message_reactions_one_per_emoji unique (message_id, user_id, reaction)
);
create index if not exists group_chat_message_reactions_group_idx on public.group_chat_message_reactions (group_id, message_id);
alter table public.group_chat_message_reactions enable row level security;
drop policy if exists group_chat_message_reactions_select_members on public.group_chat_message_reactions;
create policy group_chat_message_reactions_select_members on public.group_chat_message_reactions for select to authenticated using (public.is_group_chat_member(group_id));
drop policy if exists group_chat_message_reactions_insert_own on public.group_chat_message_reactions;
create policy group_chat_message_reactions_insert_own on public.group_chat_message_reactions for insert to authenticated
with check (user_id = (select auth.uid()) and public.is_group_chat_member(group_id)
and exists (select 1 from public.group_chat_messages m where m.id = message_id and m.group_id = group_chat_message_reactions.group_id));
drop policy if exists group_chat_message_reactions_delete_own on public.group_chat_message_reactions;
create policy group_chat_message_reactions_delete_own on public.group_chat_message_reactions for delete to authenticated
using (user_id = (select auth.uid()) and public.is_group_chat_member(group_id));

revoke execute on function public.validate_private_message_reply() from public;
revoke execute on function public.validate_private_message_reply() from anon;
revoke execute on function public.validate_private_message_reply() from authenticated;
revoke execute on function public.notify_private_message_recipient() from public;
revoke execute on function public.notify_private_message_recipient() from anon;
revoke execute on function public.notify_private_message_recipient() from authenticated;

do $$
begin
 if exists (select 1 from pg_publication where pubname='supabase_realtime') then
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='private_messages') then
   alter publication supabase_realtime add table public.private_messages;
  end if;
 end if;
end
$$;
alter table public.private_messages replica identity full;
alter table public.group_chat_messages replica identity full;

commit;
