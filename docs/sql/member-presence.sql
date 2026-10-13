-- PatriaSoul – Čuvari nasljeđa
-- Migracija je primijenjena na povezani Supabase projekt.
-- Ponovno pokretanje je idempotentno: tablica i pravila se provjeravaju prije izmjene.

begin;

create table if not exists public.member_presence (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  last_seen_at timestamptz not null default now(),
  show_activity boolean not null default true
);

create index if not exists member_presence_last_seen_idx
  on public.member_presence (last_seen_at desc);

alter table public.member_presence enable row level security;

drop policy if exists member_presence_read_visible on public.member_presence;
create policy member_presence_read_visible
  on public.member_presence for select to authenticated
  using (show_activity = true or user_id = auth.uid());

drop policy if exists member_presence_insert_own on public.member_presence;
create policy member_presence_insert_own
  on public.member_presence for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists member_presence_update_own on public.member_presence;
create policy member_presence_update_own
  on public.member_presence for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Nema DELETE politike: članovi ne mogu brisati tuđe zapise aktivnosti.
-- Vrijeme aktivnosti ažurira prijavljeni klijent približno jednom u minuti.
-- UI računa: Na mreži <= 2 min; Nedavno aktivan <= 5 min; Izvan mreže > 5 min.
-- Status se prikazuje samo ako show_activity=true. Nemoj koristiti status
-- kao dokaz identiteta ili kao sigurnosnu kontrolu.
--
-- Realtime je opcionalan; klijenti se mogu osvježiti ponovnim učitavanjem imenika.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'member_presence'
     ) then
    alter publication supabase_realtime add table public.member_presence;
  end if;
end
$$;

commit;

-- Provjera nakon primjene:
-- select * from pg_policies where tablename = 'member_presence';
-- select * from pg_publication_tables where pubname = 'supabase_realtime'
--   and schemaname = 'public' and tablename = 'member_presence';
