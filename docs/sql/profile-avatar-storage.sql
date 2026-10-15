-- Public profile pictures are intentionally separate from private community post images.
-- Anyone who can see a profile may view its avatar; only the owning member can upload,
-- replace, or delete files in their own folder. Max upload: 10 MiB.
begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-avatars',
  'profile-avatars',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = true,
    file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

drop policy if exists profile_avatars_read_public on storage.objects;
create policy profile_avatars_read_public
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'profile-avatars');

drop policy if exists profile_avatars_upload_own on storage.objects;
create policy profile_avatars_upload_own
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'profile-avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists profile_avatars_update_own on storage.objects;
create policy profile_avatars_update_own
  on storage.objects for update to authenticated
  using (
    bucket_id = 'profile-avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'profile-avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists profile_avatars_delete_own on storage.objects;
create policy profile_avatars_delete_own
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'profile-avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

commit;
