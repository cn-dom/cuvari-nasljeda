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
create policy "profiles_select_public" on public.profiles
  for select to anon, authenticated using (true);
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (id = (select auth.uid()));
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Community posts can be read by signed-in members; only the author may write or delete.
create policy "posts_select_public" on public.posts
  for select to anon, authenticated using (true);
create policy "posts_insert_own" on public.posts
  for insert to authenticated with check (author_id = (select auth.uid()));
create policy "posts_update_own" on public.posts
  for update to authenticated using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));
create policy "posts_delete_own" on public.posts
  for delete to authenticated using (author_id = (select auth.uid()));

-- Comments are readable to members; insert/update/delete are restricted to the author.
create policy "comments_select_public" on public.comments
  for select to anon, authenticated using (true);
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

-- The trigger can invoke this function, but API clients must not call it directly.
revoke execute on function public.handle_new_auth_user() from public;
revoke execute on function public.handle_new_auth_user() from anon;
revoke execute on function public.handle_new_auth_user() from authenticated;


-- Private image bucket for community posts.
-- Keep the private image bucket aligned with the 10 MB application upload limit.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'community-images',
  'community-images',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Content reports are private submissions. No SELECT/UPDATE policy is granted here:
-- ordinary members cannot read reports or change their moderation status.
create table if not exists public.blocked_users (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint blocked_users_no_self_block check (blocker_id <> blocked_id)
);

create index if not exists blocked_users_blocked_id_idx
  on public.blocked_users (blocked_id, blocker_id);

alter table public.blocked_users enable row level security;

-- A member can view only their own block list, add blocks, and remove their own blocks.
create policy "blocked_users_select_own" on public.blocked_users
  for select to authenticated using (blocker_id = (select auth.uid()));
create policy "blocked_users_insert_own" on public.blocked_users
  for insert to authenticated with check (
    blocker_id = (select auth.uid())
    and blocked_id <> (select auth.uid())
  );
create policy "blocked_users_delete_own" on public.blocked_users
  for delete to authenticated using (blocker_id = (select auth.uid()));

create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  reason text not null check (reason in ('spam', 'harassment', 'hate', 'misinformation', 'privacy', 'copyright', 'other')),
  details text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed', 'actioned')),
  created_at timestamptz not null default now(),
  constraint content_reports_details_length check (details is null or char_length(details) <= 1000)
);

create index if not exists content_reports_status_created_idx
  on public.content_reports (status, created_at asc);
create index if not exists content_reports_post_idx
  on public.content_reports (post_id, created_at desc);

alter table public.content_reports enable row level security;

create policy "content_reports_insert_own" on public.content_reports
  for insert to authenticated
  with check (reporter_id = (select auth.uid()));

-- Intentionally no member SELECT/UPDATE/DELETE policy. Moderator access needs a
-- separately designed, server-enforced role system before it is enabled.

-- Public wall photos are viewable through short-lived signed URLs.
-- This SELECT policy allows signing community-image URLs for public posts; keep
-- this bucket exclusively for images intentionally shared on the public community wall.
create policy "community_images_read_public_posts"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'community-images');

-- Each member may upload only into their own first-level folder: <auth.uid()>/<filename>.
create policy "community_images_insert_own_folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'community-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "community_images_update_own_folder"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'community-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'community-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "community_images_delete_own_folder"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'community-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

commit;
