-- PatriaSoul – Čuvari nasljeđa
-- REVIEW-ONLY migration draft. Do not apply to production without explicit approval.
-- Private messages: participants can read; sender can insert their own messages.
begin;

create table if not exists public.private_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  reply_to_id uuid references public.private_messages(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint private_messages_no_self_message check (sender_id <> recipient_id)
);

alter table public.private_messages
  add column if not exists reply_to_id uuid references public.private_messages(id) on delete set null;

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
as $
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
$;

drop trigger if exists private_messages_validate_reply on public.private_messages;
create trigger private_messages_validate_reply
  before insert or update of reply_to_id, sender_id, recipient_id
  on public.private_messages
  for each row execute function public.validate_private_message_reply();

-- No UPDATE or DELETE policy is granted to ordinary members.
commit;
