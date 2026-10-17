-- Hrvatska pamti: proposed content schema.
-- REVIEW ONLY: do not apply to production until the active Supabase project,
-- existing naming conventions, backups, and RLS have been verified.
-- Public clients may read only published records. Editorial writes should use
-- an authenticated admin workflow/server-side function, never a service key in the browser.

create extension if not exists pgcrypto;

create table if not exists public.hp_places (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  region text,
  place_type text not null default 'heritage'
    check (place_type in ('city','memorial','burial_site','heritage','museum','other')),
  latitude double precision,
  longitude double precision,
  summary text not null default '',
  status text not null default 'draft'
    check (status in ('draft','review','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hp_places_latitude_range check (latitude is null or latitude between -90 and 90),
  constraint hp_places_longitude_range check (longitude is null or longitude between -180 and 180)
);

create table if not exists public.hp_sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  publisher text,
  source_type text not null default 'other'
    check (source_type in ('archive','museum','register','academic','book','testimony','official','other')),
  url text,
  citation text,
  accessed_on date,
  notes text,
  created_at timestamptz not null default now(),
  constraint hp_sources_url_scheme check (url is null or url ~ '^https?://')
);

create table if not exists public.hp_stories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  body text not null default '',
  record_type text not null default 'story'
    check (record_type in ('story','event','testimony','biography','research_note')),
  evidence_status text not null default 'unverified'
    check (evidence_status in ('verified','estimated','testimony','tradition','under_research','unverified')),
  occurred_on date,
  date_precision text not null default 'unknown'
    check (date_precision in ('day','month','year','approximate','unknown')),
  place_id uuid references public.hp_places(id) on delete set null,
  status text not null default 'draft'
    check (status in ('draft','review','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hp_story_sources (
  story_id uuid not null references public.hp_stories(id) on delete cascade,
  source_id uuid not null references public.hp_sources(id) on delete restrict,
  relation_note text,
  primary key (story_id, source_id)
);

create table if not exists public.hp_media (
  id uuid primary key default gen_random_uuid(),
  place_id uuid references public.hp_places(id) on delete cascade,
  story_id uuid references public.hp_stories(id) on delete cascade,
  media_type text not null check (media_type in ('image','audio','video','document')),
  title text not null,
  description text,
  storage_path text,
  external_url text,
  credit text not null,
  rights_status text not null default 'needs_review'
    check (rights_status in ('public_domain','licensed','permission_granted','needs_review','restricted')),
  status text not null default 'draft'
    check (status in ('draft','review','published','archived')),
  created_at timestamptz not null default now(),
  constraint hp_media_parent_required check (place_id is not null or story_id is not null),
  constraint hp_media_url_scheme check (external_url is null or external_url ~ '^https?://')
);

create index if not exists hp_places_status_idx on public.hp_places(status);
create index if not exists hp_stories_status_date_idx on public.hp_stories(status, occurred_on);
create index if not exists hp_stories_place_idx on public.hp_stories(place_id);
create index if not exists hp_story_sources_source_idx on public.hp_story_sources(source_id);
create index if not exists hp_media_place_idx on public.hp_media(place_id);
create index if not exists hp_media_story_idx on public.hp_media(story_id);

alter table public.hp_places enable row level security;
alter table public.hp_sources enable row level security;
alter table public.hp_stories enable row level security;
alter table public.hp_story_sources enable row level security;
alter table public.hp_media enable row level security;

drop policy if exists "hp published places readable" on public.hp_places;
create policy "hp published places readable" on public.hp_places
  for select to anon, authenticated using (status = 'published');

drop policy if exists "hp sources for published stories readable" on public.hp_sources;
create policy "hp sources for published stories readable" on public.hp_sources
  for select to anon, authenticated using (
    exists (
      select 1
      from public.hp_story_sources ss
      join public.hp_stories s on s.id = ss.story_id
      where ss.source_id = hp_sources.id and s.status = 'published'
    )
  );

drop policy if exists "hp published stories readable" on public.hp_stories;
create policy "hp published stories readable" on public.hp_stories
  for select to anon, authenticated using (status = 'published');

drop policy if exists "hp links for published stories readable" on public.hp_story_sources;
create policy "hp links for published stories readable" on public.hp_story_sources
  for select to anon, authenticated using (
    exists (select 1 from public.hp_stories s where s.id = story_id and s.status = 'published')
  );

drop policy if exists "hp published media readable" on public.hp_media;
create policy "hp published media readable" on public.hp_media
  for select to anon, authenticated using (
    status = 'published'
    and (
      (place_id is not null and exists (select 1 from public.hp_places p where p.id = place_id and p.status = 'published'))
      or
      (story_id is not null and exists (select 1 from public.hp_stories s where s.id = story_id and s.status = 'published'))
    )
  );

-- Intentionally no client INSERT/UPDATE/DELETE policies. Add a reviewed editorial
-- authorization flow before enabling any writes. Never seed invented history.
