-- Hrvatska pamti: proposed archival records extension.
-- REVIEW ONLY. Depends on 202610170001_hrvatska_pamti_schema.sql.
-- Do not apply to production until the active Supabase project, current schema,
-- legal basis, data-protection process, backups and RLS have been reviewed.
--
-- Safety principles:
-- * no client-side write policies are created;
-- * private/unpublished records are not readable through the public Data API;
-- * testimony is publicly readable only when explicit publication consent is recorded;
-- * do not store sensitive personal data, unredacted witness details, or exact grave
--   coordinates in public-facing records without a documented legal/ethical review.

create table if not exists public.hp_people (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  alternative_names text[] not null default '{}',
  person_type text not null default 'person'
    check (person_type in ('civilian_victim','defender','missing_person','historical_person','witness','person')),
  birth_year integer,
  death_year integer,
  identity_status text not null default 'needs_verification'
    check (identity_status in ('verified','partially_verified','needs_verification','disputed','withheld')),
  short_biography text not null default '',
  place_id uuid references public.hp_places(id) on delete set null,
  publication_status text not null default 'draft'
    check (publication_status in ('draft','review','published','archived')),
  privacy_reviewed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hp_people_birth_year_range check (birth_year is null or birth_year between 1 and 2200),
  constraint hp_people_death_year_range check (death_year is null or death_year between 1 and 2200),
  constraint hp_people_year_order check (birth_year is null or death_year is null or death_year >= birth_year)
);

create table if not exists public.hp_memorial_sites (
  id uuid primary key default gen_random_uuid(),
  place_id uuid references public.hp_places(id) on delete set null,
  name text not null,
  site_type text not null
    check (site_type in ('memorial','cemetery','mass_grave','execution_site','detention_site','museum','other')),
  description text not null default '',
  historical_period text,
  location_precision text not null default 'general_area'
    check (location_precision in ('exact','approximate','general_area','withheld')),
  latitude double precision,
  longitude double precision,
  location_public boolean not null default false,
  evidence_status text not null default 'under_research'
    check (evidence_status in ('verified','corroborated','testimony','under_research','disputed','unverified')),
  publication_status text not null default 'draft'
    check (publication_status in ('draft','review','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hp_memorial_sites_latitude_range check (latitude is null or latitude between -90 and 90),
  constraint hp_memorial_sites_longitude_range check (longitude is null or longitude between -180 and 180),
  constraint hp_memorial_sites_coordinates_pair check ((latitude is null) = (longitude is null)),
  constraint hp_memorial_sites_location_visibility check (location_public = false or location_precision in ('exact','approximate','general_area'))
);

create table if not exists public.hp_documents (
  id uuid primary key default gen_random_uuid(),
  place_id uuid references public.hp_places(id) on delete set null,
  memorial_site_id uuid references public.hp_memorial_sites(id) on delete set null,
  title text not null,
  document_type text not null default 'other'
    check (document_type in ('archive_record','register_entry','official_report','photograph','map','newspaper','letter','court_record','book_excerpt','other')),
  holding_institution text not null,
  fonds_or_collection text,
  reference_code text,
  document_date date,
  date_description text,
  summary text not null default '',
  transcription text,
  storage_path text,
  rights_status text not null default 'needs_review'
    check (rights_status in ('public_domain','licensed','permission_granted','metadata_only','restricted','needs_review')),
  evidence_status text not null default 'under_research'
    check (evidence_status in ('verified','corroborated','under_research','disputed','unverified')),
  publication_status text not null default 'draft'
    check (publication_status in ('draft','review','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hp_documents_parent_required check (place_id is not null or memorial_site_id is not null),
  constraint hp_documents_storage_path_safe check (storage_path is null or (storage_path !~ '^/' and storage_path !~ '(^|/)\.\.(/|$)'))
);

create table if not exists public.hp_testimonies (
  id uuid primary key default gen_random_uuid(),
  place_id uuid references public.hp_places(id) on delete set null,
  memorial_site_id uuid references public.hp_memorial_sites(id) on delete set null,
  title text not null,
  testimony_text text not null default '',
  testimony_date date,
  event_date_description text,
  speaker_display_name text,
  speaker_person_id uuid references public.hp_people(id) on delete set null,
  anonymized boolean not null default true,
  consent_to_publish boolean not null default false,
  consent_record_reference text,
  consent_checked_at timestamptz,
  consent_scope text not null default 'not_recorded'
    check (consent_scope in ('public_text','public_audio_video','excerpt_only','research_only','withdrawn','not_recorded')),
  evidence_status text not null default 'testimony'
    check (evidence_status in ('testimony','corroborated','under_research','disputed')),
  publication_status text not null default 'draft'
    check (publication_status in ('draft','review','published','archived')),
  privacy_reviewed boolean not null default false,
  rights_status text not null default 'needs_review'
    check (rights_status in ('permission_granted','restricted','needs_review')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hp_testimonies_parent_required check (place_id is not null or memorial_site_id is not null),
  constraint hp_testimonies_consent_consistency check (
    consent_to_publish = false
    or (consent_checked_at is not null and consent_scope in ('public_text','public_audio_video','excerpt_only'))
  )
);

create table if not exists public.hp_document_people (
  document_id uuid not null references public.hp_documents(id) on delete cascade,
  person_id uuid not null references public.hp_people(id) on delete restrict,
  relation_note text,
  primary key (document_id, person_id)
);

create table if not exists public.hp_testimony_sources (
  testimony_id uuid not null references public.hp_testimonies(id) on delete cascade,
  source_id uuid not null references public.hp_sources(id) on delete restrict,
  relation_note text,
  primary key (testimony_id, source_id)
);

create index if not exists hp_people_publication_idx on public.hp_people(publication_status, display_name);
create index if not exists hp_people_place_idx on public.hp_people(place_id);
create index if not exists hp_memorial_sites_publication_idx on public.hp_memorial_sites(publication_status, site_type);
create index if not exists hp_memorial_sites_place_idx on public.hp_memorial_sites(place_id);
create index if not exists hp_documents_publication_idx on public.hp_documents(publication_status, document_date);
create index if not exists hp_documents_site_idx on public.hp_documents(memorial_site_id);
create index if not exists hp_testimonies_publication_idx on public.hp_testimonies(publication_status, testimony_date);
create index if not exists hp_testimonies_site_idx on public.hp_testimonies(memorial_site_id);
create index if not exists hp_document_people_person_idx on public.hp_document_people(person_id);
create index if not exists hp_testimony_sources_source_idx on public.hp_testimony_sources(source_id);

alter table public.hp_people enable row level security;
alter table public.hp_memorial_sites enable row level security;
alter table public.hp_documents enable row level security;
alter table public.hp_testimonies enable row level security;
alter table public.hp_document_people enable row level security;
alter table public.hp_testimony_sources enable row level security;

drop policy if exists "hp published people readable" on public.hp_people;
create policy "hp published people readable" on public.hp_people
  for select to anon, authenticated
  using (publication_status = 'published' and privacy_reviewed = true and identity_status in ('verified','partially_verified'));

drop policy if exists "hp published memorial sites readable" on public.hp_memorial_sites;
create policy "hp published memorial sites readable" on public.hp_memorial_sites
  for select to anon, authenticated
  using (publication_status = 'published');

drop policy if exists "hp published documents readable" on public.hp_documents;
create policy "hp published documents readable" on public.hp_documents
  for select to anon, authenticated
  using (publication_status = 'published' and rights_status in ('public_domain','licensed','permission_granted','metadata_only'));

drop policy if exists "hp published document people readable" on public.hp_document_people;
create policy "hp published document people readable" on public.hp_document_people
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.hp_documents d
      join public.hp_people p on p.id = hp_document_people.person_id
      where d.id = hp_document_people.document_id
        and d.publication_status = 'published'
        and d.rights_status in ('public_domain','licensed','permission_granted','metadata_only')
        and p.publication_status = 'published'
        and p.privacy_reviewed = true
        and p.identity_status in ('verified','partially_verified')
    )
  );

drop policy if exists "hp consented published testimonies readable" on public.hp_testimonies;
create policy "hp consented published testimonies readable" on public.hp_testimonies
  for select to anon, authenticated
  using (
    publication_status = 'published'
    and consent_to_publish = true
    and consent_checked_at is not null
    and consent_scope in ('public_text','public_audio_video','excerpt_only')
    and privacy_reviewed = true
    and rights_status = 'permission_granted'
  );

drop policy if exists "hp testimony sources for public testimonies readable" on public.hp_testimony_sources;
create policy "hp testimony sources for public testimonies readable" on public.hp_testimony_sources
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.hp_testimonies t
      where t.id = hp_testimony_sources.testimony_id
        and t.publication_status = 'published'
        and t.consent_to_publish = true
        and t.consent_checked_at is not null
        and t.consent_scope in ('public_text','public_audio_video','excerpt_only')
        and t.privacy_reviewed = true
        and t.rights_status = 'permission_granted'
    )
  );

-- No INSERT, UPDATE, or DELETE policies are intentionally provided.
-- Editorial administration must be designed and tested separately. In particular,
-- exact coordinates and unredacted testimony should not be published by default.
