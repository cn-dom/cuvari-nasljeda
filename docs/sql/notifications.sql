-- PatriaSoul – Čuvari nasljeđa
-- REVIEW-ONLY migration draft. Do not apply to production without explicit approval.
-- Initial notification support: notify the recipient when a private message is created.
begin;

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

revoke execute on function public.notify_private_message_recipient() from public;
revoke execute on function public.notify_private_message_recipient() from anon;
revoke execute on function public.notify_private_message_recipient() from authenticated;

commit;
