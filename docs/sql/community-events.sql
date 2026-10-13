-- PatriaSoul · Čuvari nasljeđa
-- Community events and RSVP for the separate TEST project.
begin;

create table if not exists public.community_events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 3 and 120),
  description text not null default '' check (char_length(description) <= 5000),
  location text not null default '' check (char_length(location) <= 240),
  starts_at timestamptz not null,
  ends_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'published' check (status in ('published', 'cancelled')),
  created_at timestamptz not null default now(),
  constraint community_events_end_after_start check (ends_at is null or ends_at >= starts_at)
);
create index if not exists community_events_starts_at_idx on public.community_events (starts_at asc) where status = 'published';
create index if not exists community_events_creator_idx on public.community_events (created_by, created_at desc);

create table if not exists public.community_event_attendees (
  event_id uuid not null references public.community_events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'attending' check (status in ('attending', 'interested')),
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);
create index if not exists community_event_attendees_user_idx on public.community_event_attendees (user_id, created_at desc);

alter table public.community_events enable row level security;
alter table public.community_event_attendees enable row level security;

drop policy if exists community_events_read_published on public.community_events;
create policy community_events_read_published on public.community_events
  for select to anon, authenticated using (status = 'published' or created_by = (select auth.uid()));
drop policy if exists community_events_insert_own on public.community_events;
create policy community_events_insert_own on public.community_events
  for insert to authenticated with check (created_by = (select auth.uid()));
drop policy if exists community_events_update_own on public.community_events;
create policy community_events_update_own on public.community_events
  for update to authenticated using (created_by = (select auth.uid()))
  with check (created_by = (select auth.uid()));
drop policy if exists community_events_delete_own on public.community_events;
create policy community_events_delete_own on public.community_events
  for delete to authenticated using (created_by = (select auth.uid()));

drop policy if exists community_event_attendees_read_authenticated on public.community_event_attendees;
create policy community_event_attendees_read_authenticated on public.community_event_attendees
  for select to authenticated using (true);
drop policy if exists community_event_attendees_insert_own on public.community_event_attendees;
create policy community_event_attendees_insert_own on public.community_event_attendees
  for insert to authenticated with check (
    user_id = (select auth.uid()) and exists (
      select 1 from public.community_events e
      where e.id = event_id and e.status = 'published'
    )
  );
drop policy if exists community_event_attendees_update_own on public.community_event_attendees;
create policy community_event_attendees_update_own on public.community_event_attendees
  for update to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
drop policy if exists community_event_attendees_delete_own on public.community_event_attendees;
create policy community_event_attendees_delete_own on public.community_event_attendees
  for delete to authenticated using (user_id = (select auth.uid()));

grant select on public.community_events to anon, authenticated;
grant insert, update, delete on public.community_events to authenticated;
grant select on public.community_event_attendees to authenticated;
grant insert, update, delete on public.community_event_attendees to authenticated;

commit;
