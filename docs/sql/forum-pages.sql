-- PatriaSoul · Čuvari nasljeđa
-- Additive schema for forum and community pages.
-- Applied to the separately used test project; keep this file as the reviewable schema source.

create table if not exists public.forum_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.forum_topics (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.forum_categories(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 5 and 160),
  body text not null check (char_length(trim(body)) between 1 and 10000),
  status text not null default 'published' check (status in ('published','hidden','locked')),
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists forum_topics_category_created_idx on public.forum_topics(category_id, created_at desc);
create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.forum_topics(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.forum_posts(id) on delete cascade,
  content text not null check (char_length(trim(content)) between 1 and 5000),
  status text not null default 'published' check (status in ('published','hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists forum_posts_topic_created_idx on public.forum_posts(topic_id, created_at asc);
create table if not exists public.community_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null check (char_length(trim(name)) between 3 and 80),
  description text not null default '' check (char_length(description) <= 1000),
  category text not null default 'Zajednica',
  created_by uuid not null references public.profiles(id) on delete cascade,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists community_pages_published_created_idx on public.community_pages(is_published, created_at desc);
create table if not exists public.community_page_posts (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.community_pages(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists community_page_posts_page_created_idx on public.community_page_posts(page_id, created_at desc);

alter table public.forum_categories enable row level security;
alter table public.forum_topics enable row level security;
alter table public.forum_posts enable row level security;
alter table public.community_pages enable row level security;
alter table public.community_page_posts enable row level security;

drop policy if exists forum_categories_read_active on public.forum_categories;
create policy forum_categories_read_active on public.forum_categories for select to anon, authenticated using (is_active);
drop policy if exists forum_topics_read_published on public.forum_topics;
create policy forum_topics_read_published on public.forum_topics for select to anon, authenticated using (status = 'published' or (auth.uid() = user_id and status <> 'published'));
drop policy if exists forum_topics_insert_own on public.forum_topics;
create policy forum_topics_insert_own on public.forum_topics for insert to authenticated with check (user_id = (select auth.uid()) and exists (select 1 from public.forum_categories c where c.id = category_id and c.is_active));
drop policy if exists forum_topics_update_own on public.forum_topics;
create policy forum_topics_update_own on public.forum_topics for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists forum_topics_delete_own on public.forum_topics;
create policy forum_topics_delete_own on public.forum_topics for delete to authenticated using (user_id = (select auth.uid()));
drop policy if exists forum_posts_read_published on public.forum_posts;
create policy forum_posts_read_published on public.forum_posts for select to anon, authenticated using (status = 'published' or user_id = (select auth.uid()));
drop policy if exists forum_posts_insert_own on public.forum_posts;
create policy forum_posts_insert_own on public.forum_posts for insert to authenticated with check (user_id = (select auth.uid()) and exists (select 1 from public.forum_topics t where t.id = topic_id and t.status = 'published'));
drop policy if exists forum_posts_update_own on public.forum_posts;
create policy forum_posts_update_own on public.forum_posts for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists forum_posts_delete_own on public.forum_posts;
create policy forum_posts_delete_own on public.forum_posts for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists community_pages_read_published on public.community_pages;
create policy community_pages_read_published on public.community_pages for select to anon, authenticated using (is_published or created_by = (select auth.uid()));
drop policy if exists community_pages_insert_own on public.community_pages;
create policy community_pages_insert_own on public.community_pages for insert to authenticated with check (created_by = (select auth.uid()));
drop policy if exists community_pages_update_own on public.community_pages;
create policy community_pages_update_own on public.community_pages for update to authenticated using (created_by = (select auth.uid())) with check (created_by = (select auth.uid()));
drop policy if exists community_pages_delete_own on public.community_pages;
create policy community_pages_delete_own on public.community_pages for delete to authenticated using (created_by = (select auth.uid()));
drop policy if exists community_page_posts_read_visible on public.community_page_posts;
create policy community_page_posts_read_visible on public.community_page_posts for select to anon, authenticated using (exists (select 1 from public.community_pages p where p.id = page_id and (p.is_published or p.created_by = (select auth.uid()))));
drop policy if exists community_page_posts_insert_own on public.community_page_posts;
create policy community_page_posts_insert_own on public.community_page_posts for insert to authenticated with check (author_id = (select auth.uid()) and exists (select 1 from public.community_pages p where p.id = page_id and p.is_published));
drop policy if exists community_page_posts_update_own on public.community_page_posts;
create policy community_page_posts_update_own on public.community_page_posts for update to authenticated using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
drop policy if exists community_page_posts_delete_own on public.community_page_posts;
create policy community_page_posts_delete_own on public.community_page_posts for delete to authenticated using (author_id = (select auth.uid()));

grant select on public.forum_categories, public.forum_topics, public.forum_posts, public.community_pages, public.community_page_posts to anon, authenticated;
grant insert, update, delete on public.forum_topics, public.forum_posts, public.community_pages, public.community_page_posts to authenticated;
grant insert, update, delete on public.forum_categories to authenticated;

insert into public.forum_categories (slug, name, description, sort_order) values
 ('hrvatska-povijest','Hrvatska povijest','Povijesni događaji, osobe i izvori.',1),
 ('domovina-i-zavicaj','Domovina i zavičaj','Gradovi, mjesta, krajolici i lokalne priče.',2),
 ('obitelj-i-obicaji','Obitelj i običaji','Obiteljske uspomene, običaji i tradicija.',3),
 ('vjera-i-duhovnost','Vjera i duhovnost','Razgovori o vjeri, blagdanima i duhovnom životu.',4),
 ('branitelji-i-sjecanje','Branitelji i sjećanje','Svjedočanstva i kultura sjećanja.',5),
 ('knjige-i-istrazivanje','Knjige i istraživanje','Literatura, arhivi, izvori i istraživačka pitanja.',6),
 ('kviz-i-znanje','Kviz i znanje','Pitanja, rezultati i učenje kroz kviz.',7),
 ('opci-razgovori','Opći razgovori','Predstavljanje, pitanja i teme zajednice.',8)
on conflict (slug) do nothing;
