-- PatriaSoul – Čuvari nasljeđa
-- SQL NACRT za potvrde čitanja grupnih poruka. Nije izvršen ni nad jednom bazom.
-- Primijeniti tek nakon pregleda na zasebnom testnom Supabase projektu.

begin;

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
revoke all on function public.mark_group_messages_read(uuid, uuid[]) from public;
grant execute on function public.mark_group_messages_read(uuid, uuid[]) to authenticated;

-- Broj nepročitanih poruka po grupi za prijavljenog člana.
create or replace function public.get_group_unread_counts()
returns table (group_id uuid, unread_count bigint)
language sql
security definer
set search_path = public, pg_temp
set row_security = off
as $
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
$;

revoke all on function public.get_group_unread_counts() from public;
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

commit;
