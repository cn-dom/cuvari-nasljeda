-- PatriaSoul · Čuvari nasljeđa
-- Zajednički plutajući Domoljubni chat, postavka utišavanja, prijave poruka i zahtjevi za prijateljstvo.
begin;

create table if not exists public.community_global_chat_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 1500),
  created_at timestamptz not null default now(),
  edited_at timestamptz
);
create index if not exists community_global_chat_messages_created_idx
  on public.community_global_chat_messages (created_at desc);
create index if not exists community_global_chat_messages_sender_idx
  on public.community_global_chat_messages (sender_id, created_at desc);

create table if not exists public.community_chat_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  muted boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.community_global_chat_reports (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.community_global_chat_messages(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null check (char_length(trim(reason)) between 1 and 80),
  details text,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  unique (message_id, reporter_id)
);
create index if not exists community_global_chat_reports_status_created_idx
  on public.community_global_chat_reports (status, created_at desc);
create index if not exists community_global_chat_reports_reporter_idx
  on public.community_global_chat_reports (reporter_id, created_at desc);

create table if not exists public.community_friend_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (sender_id <> recipient_id),
  unique (sender_id, recipient_id)
);
create index if not exists community_friend_requests_recipient_status_idx
  on public.community_friend_requests (recipient_id, status, created_at desc);

create or replace function public.guard_community_friend_request_participants()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  if new.sender_id is distinct from old.sender_id or new.recipient_id is distinct from old.recipient_id then
    raise exception 'Friend request participants cannot be changed';
  end if;
  if new.status not in ('accepted', 'declined') then
    raise exception 'Invalid friend request status change';
  end if;
  new.updated_at := now();
  return new;
end;
$function$;

drop trigger if exists guard_community_friend_request_participants on public.community_friend_requests;
create trigger guard_community_friend_request_participants
before update on public.community_friend_requests
for each row execute function public.guard_community_friend_request_participants();

alter table public.community_global_chat_messages enable row level security;
alter table public.community_chat_preferences enable row level security;
alter table public.community_global_chat_reports enable row level security;
alter table public.community_friend_requests enable row level security;

drop policy if exists "Members can read global chat messages" on public.community_global_chat_messages;
create policy "Members can read global chat messages" on public.community_global_chat_messages
for select to authenticated using ((select auth.uid()) is not null);

drop policy if exists "Members can send own global chat messages" on public.community_global_chat_messages;
create policy "Members can send own global chat messages" on public.community_global_chat_messages
for insert to authenticated with check ((select auth.uid()) = sender_id);

drop policy if exists "Authors can edit own global chat messages" on public.community_global_chat_messages;
create policy "Authors can edit own global chat messages" on public.community_global_chat_messages
for update to authenticated using ((select auth.uid()) = sender_id)
with check ((select auth.uid()) = sender_id);

drop policy if exists "Authors can delete own global chat messages" on public.community_global_chat_messages;
create policy "Authors can delete own global chat messages" on public.community_global_chat_messages
for delete to authenticated using ((select auth.uid()) = sender_id);

drop policy if exists "Members manage own chat preferences" on public.community_chat_preferences;
create policy "Members manage own chat preferences" on public.community_chat_preferences
for all to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Members can report global chat messages" on public.community_global_chat_reports;
create policy "Members can report global chat messages" on public.community_global_chat_reports
for insert to authenticated with check ((select auth.uid()) = reporter_id);
drop policy if exists "Members and admins can read chat reports" on public.community_global_chat_reports;
create policy "Members and admins can read chat reports" on public.community_global_chat_reports
for select to authenticated using (
  (select auth.uid()) = reporter_id
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
);

drop policy if exists "Participants can read friend requests" on public.community_friend_requests;
create policy "Participants can read friend requests" on public.community_friend_requests
for select to authenticated using ((select auth.uid()) = sender_id or (select auth.uid()) = recipient_id);
drop policy if exists "Members can send own friend requests" on public.community_friend_requests;
create policy "Members can send own friend requests" on public.community_friend_requests
for insert to authenticated with check ((select auth.uid()) = sender_id and status = 'pending');
drop policy if exists "Recipients can respond to friend requests" on public.community_friend_requests;
create policy "Recipients can respond to friend requests" on public.community_friend_requests
for update to authenticated using ((select auth.uid()) = recipient_id and status = 'pending')
with check ((select auth.uid()) = recipient_id and status in ('accepted', 'declined'));

grant select, insert, update, delete on public.community_global_chat_messages to authenticated;
grant select, insert, update, delete on public.community_chat_preferences to authenticated;
grant select, insert on public.community_global_chat_reports to authenticated;
grant select, insert, update on public.community_friend_requests to authenticated;

do $publication$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public'
         and tablename = 'community_global_chat_messages'
     ) then
    alter publication supabase_realtime add table public.community_global_chat_messages;
  end if;
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public'
         and tablename = 'community_friend_requests'
     ) then
    alter publication supabase_realtime add table public.community_friend_requests;
  end if;
end;
$publication$;

commit;
