-- PatriaSoul – Čuvari nasljeđa
-- REVIEW-ONLY schema for a separately confirmed TEST Supabase project.
-- This file is not applied automatically. Review and apply only after project confirmation.
begin;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text not null default '',
  bio text not null default '',
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (
    username is null or username ~ '^[a-zA-Z0-9_.-]{3,24}$'
  ),
  constraint profiles_display_name_length check (char_length(display_name) <= 60),
  constraint profiles_bio_length check (char_length(bio) <= 240)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null default '',
  image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_body_length check (char_length(body) <= 5000),
  constraint posts_body_or_image check (char_length(trim(body)) > 0 or image_path is not null)
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_author_id_idx on public.posts (author_id, created_at desc);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint comments_body_length check (char_length(body) between 1 and 2000)
);

create index if not exists comments_post_created_idx on public.comments (post_id, created_at asc);
create index if not exists comments_author_idx on public.comments (author_id, created_at desc);

create table if not exists public.post_reactions (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction text not null check (reaction in ('like', 'patriotism', 'gratitude', 'support')),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.post_reactions enable row level security;

-- Public community profiles are readable; only the owner may create/update their own profile.
create policy "profiles_select_authenticated" on public.profiles
  for select to authenticated using (true);
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (id = (select auth.uid()));
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Community posts can be read by signed-in members; only the author may write or delete.
create policy "posts_select_authenticated" on public.posts
  for select to authenticated using (true);
create policy "posts_insert_own" on public.posts
  for insert to authenticated with check (author_id = (select auth.uid()));
create policy "posts_update_own" on public.posts
  for update to authenticated using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));
create policy "posts_delete_own" on public.posts
  for delete to authenticated using (author_id = (select auth.uid()));

-- Comments are readable to members; insert/update/delete are restricted to the author.
create policy "comments_select_authenticated" on public.comments
  for select to authenticated using (true);
create policy "comments_insert_own" on public.comments
  for insert to authenticated with check (author_id = (select auth.uid()));
create policy "comments_update_own" on public.comments
  for update to authenticated using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));
create policy "comments_delete_own" on public.comments
  for delete to authenticated using (author_id = (select auth.uid()));

create policy "post_reactions_select_authenticated" on public.post_reactions
  for select to authenticated using (true);
create policy "post_reactions_insert_own" on public.post_reactions
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "post_reactions_update_own" on public.post_reactions
  for update to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "post_reactions_delete_own" on public.post_reactions
  for delete to authenticated using (user_id = (select auth.uid()));

-- Create a minimal profile after a new Auth user is created.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

commit;
