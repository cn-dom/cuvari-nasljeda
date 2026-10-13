-- PatriaSoul · Čuvari nasljeđa
-- Storage access for public wall images in the separate TEST project.
-- Images are readable for public feed display; writes/deletes are limited to the owner's folder.
begin;

drop policy if exists community_images_read_public on storage.objects;
drop policy if exists community_images_read_authenticated on storage.objects;
drop policy if exists community_images_insert_own_folder on storage.objects;
drop policy if exists community_images_delete_own_folder on storage.objects;
drop policy if exists community_images_update_own_folder on storage.objects;
drop policy if exists community_images_upload_own on storage.objects;
drop policy if exists community_images_delete_own on storage.objects;
drop policy if exists community_images_update_own on storage.objects;

create policy community_images_read_public
  on storage.objects for select to anon, authenticated
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
