-- Remove the abandoned personal museum feature and its database policies.
drop policy if exists "Virtual museum owners can upload images" on storage.objects;
drop policy if exists "Virtual museum owners can read their images" on storage.objects;
drop policy if exists "Virtual museum owners can update their images" on storage.objects;
drop policy if exists "Virtual museum owners can delete their images" on storage.objects;
drop table if exists public.virtual_museum_items cascade;
drop table if exists public.virtual_museums cascade;

-- The private Storage bucket must be removed through the Supabase Storage API,
-- which prevents direct SQL deletion of storage objects. The bucket is no longer
-- referenced by the application and its access policies have been removed.
