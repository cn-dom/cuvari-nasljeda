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
 
-- Prijave neprimjerenih oglasa. Vlasnik mreže može pregledavati i moderirati prijave.
create table if not exists public.community_help_ad_reports (
  id uuid primary key default gen_random_uuid(),
  ad_id uuid not null references public.community_help_ads(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (reason in ('spam','scam','harassment','hate','privacy','other')),
  details text null check (details is null or char_length(details) <= 2000),
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now(),
  unique (ad_id, reporter_id)
);
create index if not exists community_help_ad_reports_status_created_idx
  on public.community_help_ad_reports (status, created_at desc);
create index if not exists community_help_ad_reports_reporter_idx
  on public.community_help_ad_reports (reporter_id, created_at desc);
alter table public.community_help_ad_reports enable row level security;
revoke all on table public.community_help_ad_reports from anon;
grant select, insert, update on table public.community_help_ad_reports to authenticated;
drop policy if exists "Members can report help ads" on public.community_help_ad_reports;
create policy "Members can report help ads"
  on public.community_help_ad_reports for insert to authenticated
  with check (
    reporter_id = (select auth.uid())
    and exists (
      select 1 from public.community_help_ads a
      where a.id = ad_id and a.status = 'open' and a.author_id <> (select auth.uid())
    )
  );
drop policy if exists "Reporters can view own help ad reports" on public.community_help_ad_reports;
create policy "Reporters can view own help ad reports"
  on public.community_help_ad_reports for select to authenticated
  using (reporter_id = (select auth.uid()));
drop policy if exists "Network owner can manage help ad reports" on public.community_help_ad_reports;
create policy "Network owner can manage help ad reports"
  on public.community_help_ad_reports for all to authenticated
  using ((select auth.email()) = 'patriasoul@protonmail.com')
  with check ((select auth.email()) = 'patriasoul@protonmail.com');
