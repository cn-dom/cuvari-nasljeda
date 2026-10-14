-- PatriaSoul · Čuvari nasljeđa
-- SECURITY UPDATE: community images must be private and available only to members.
-- The bucket itself must be Private in Supabase Storage. A public bucket can
-- bypass object SELECT policies for public object URLs.
-- For a complete review-first migration, see member-only-wall-access.sql.

begin;

update storage.buckets
set public = false,
    file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
where id = 'community-images';

drop policy if exists community_images_read_public on storage.objects;
drop policy if exists community_images_read_authenticated on storage.objects;
drop policy if exists community_images_insert_own_folder on storage.objects;
drop policy if exists community_images_delete_own_folder on storage.objects;
drop policy if exists community_images_update_own_folder on storage.objects;
drop policy if exists community_images_upload_own on storage.objects;
drop policy if exists community_images_delete_own on storage.objects;
drop policy if exists community_images_update_own on storage.objects;

create policy community_images_read_authenticated
  on storage.objects for select to authenticated
  using (bucket_id = 'community-images');

create policy community_images_upload_own
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'community-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy community_images_update_own
  on storage.objects for update to authenticated
  using (
    bucket_id = 'community-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'community-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy community_images_delete_own
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'community-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

commit;
