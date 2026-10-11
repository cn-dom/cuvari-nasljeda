-- PatriaSoul – Čuvari nasljeđa
-- REVIEW-ONLY migration draft. Do not apply to production without explicit approval.
-- Private messages: participants can read; sender can insert their own messages.
begin;

create table if not exists public.private_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now(),
  constraint private_messages_no_self_message check (sender_id <> recipient_id)
);

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

-- No UPDATE or DELETE policy is granted to ordinary members.
commit;
