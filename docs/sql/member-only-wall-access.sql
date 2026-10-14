-- PatriaSoul · Čuvari nasljeđa
-- SECURITY MIGRATION — REVIEW BEFORE APPLYING.
-- Purpose: wall posts, comments, profiles used by the wall, and post images are
-- available only to authenticated members. This script is intended for the
-- existing project schema that uses public.posts, public.comments and
-- public.profiles. Review the actual live policies first; policies are additive.
--
-- IMPORTANT:
-- 1) This file is NOT automatically applied by GitHub Actions.
-- 2) Confirm the target Supabase project and back up/export current policies first.
-- 3) Existing public URLs are not made private by changing RLS. Any old image
--    URLs already shared externally may remain accessible if their bucket is public.
-- 4) The current frontend uses signed URLs for community post images, which is
--    compatible with a private community-images bucket. Avatar URLs are read
--    from profiles.avatar_url and may need a separate private-bucket/signing
--    migration if they currently point to public storage.
--
-- Run only after confirming table and policy names in the target project.
begin;

-- A private bucket is required: storage RLS does not protect public object URLs
-- when the bucket itself is configured as public.
update storage.buckets
set public = false,
    file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
where id = 'community-images';

-- Remove known anonymous/public wall read policies from earlier SQL drafts.
drop policy if exists posts_select_public on public.posts;
drop policy if exists posts_read_public on public.posts;
drop policy if exists comments_select_public on public.comments;
drop policy if exists comments_read_public on public.comments;
drop policy if exists profiles_select_public on public.profiles;
drop policy if exists profiles_read_public on public.profiles;

-- Remove anonymous table privileges. Authenticated members can read the wall.
revoke all privileges on table public.posts, public.comments, public.profiles from anon;
grant select on table public.posts, public.comments to authenticated;
grant select (id, display_name, username, bio, avatar_path, avatar_url, created_at) on public.profiles to authenticated;

-- Recreate authenticated-only read policies. These policies do not grant guest access.
drop policy if exists posts_select_authenticated on public.posts;
drop policy if exists posts_read_authenticated on public.posts;
create policy posts_read_authenticated on public.posts
  for select to authenticated using ((select auth.uid()) is not null);

drop policy if exists comments_select_authenticated on public.comments;
drop policy if exists comments_read_authenticated on public.comments;
create policy comments_read_authenticated on public.comments
  for select to authenticated using ((select auth.uid()) is not null);

drop policy if exists profiles_select_authenticated on public.profiles;
drop policy if exists profiles_read_authenticated on public.profiles;
create policy profiles_read_authenticated on public.profiles
  for select to authenticated using ((select auth.uid()) is not null);

-- Storage objects for community posts are readable by signed-in members only.
drop policy if exists community_images_read_public on storage.objects;
drop policy if exists community_images_read_authenticated on storage.objects;
create policy community_images_read_authenticated
  on storage.objects for select to authenticated
  using (bucket_id = 'community-images');

commit;

-- Post-apply checks (run manually as appropriate):
-- A) Logged-out/anon request: SELECT from posts/comments/profiles should be denied
--    or return no rows due to privileges/RLS.
-- B) Logged-in member: wall posts/comments and signed image URLs should load.
-- C) Upload/update/delete must remain restricted to the user's own folder.
-- D) Check Storage > Buckets: community-images must be Private.
-- E) Inspect all remaining policies; any additional anon SELECT policy must be removed.
