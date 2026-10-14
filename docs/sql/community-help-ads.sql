-- Oglasnik zajednice: članovi mogu tražiti ili ponuditi pomoć.
-- Pregledati i primijeniti u Supabase SQL Editoru prije testiranja oglasa.

create table if not exists public.community_help_ads (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  ad_type text not null check (ad_type in ('seeking', 'offering')),
  title text not null check (char_length(btrim(title)) between 4 and 120),
  description text not null check (char_length(btrim(description)) between 10 and 4000),
  category text not null default 'Ostalo',
  location text null check (location is null or char_length(location) <= 100),
  status text not null default 'open' check (status in ('open', 'closed', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists community_help_ads_type_status_created_idx
  on public.community_help_ads (ad_type, status, created_at desc);
create index if not exists community_help_ads_author_created_idx
  on public.community_help_ads (author_id, created_at desc);

alter table public.community_help_ads enable row level security;

revoke all on table public.community_help_ads from anon;
grant select, insert, update, delete on table public.community_help_ads to authenticated;

drop policy if exists "Members can view open help ads" on public.community_help_ads;
create policy "Members can view open help ads"
  on public.community_help_ads for select
  to authenticated
  using (status = 'open' or author_id = (select auth.uid()));

drop policy if exists "Members can create their own help ads" on public.community_help_ads;
create policy "Members can create their own help ads"
  on public.community_help_ads for insert
  to authenticated
  with check (author_id = (select auth.uid()));

drop policy if exists "Members can update their own help ads" on public.community_help_ads;
create policy "Members can update their own help ads"
  on public.community_help_ads for update
  to authenticated
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));

drop policy if exists "Members can delete their own help ads" on public.community_help_ads;
create policy "Members can delete their own help ads"
  on public.community_help_ads for delete
  to authenticated
  using (author_id = (select auth.uid()));
