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
