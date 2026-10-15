-- Private user-created museum drafts for Virtualni muzej PatriaSoul.
-- Drafts remain private to their owner; public display requires a later moderation workflow.
create table if not exists public.museum_user_drafts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 140),
  category text not null check (char_length(category) between 1 and 80),
  story text not null check (char_length(story) between 1 and 5000),
  ai_draft text,
  image_path text,
  status text not null default 'draft' check (status in ('draft','submitted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.museum_user_drafts enable row level security;
revoke all on public.museum_user_drafts from anon;
grant select, insert, update, delete on public.museum_user_drafts to authenticated;

drop policy if exists museum_user_drafts_select_own on public.museum_user_drafts;
create policy museum_user_drafts_select_own on public.museum_user_drafts
  for select to authenticated using (owner_id = (select auth.uid()));
drop policy if exists museum_user_drafts_insert_own on public.museum_user_drafts;
create policy museum_user_drafts_insert_own on public.museum_user_drafts
  for insert to authenticated with check (owner_id = (select auth.uid()) and status = 'draft');
drop policy if exists museum_user_drafts_update_own on public.museum_user_drafts;
create policy museum_user_drafts_update_own on public.museum_user_drafts
  for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
drop policy if exists museum_user_drafts_delete_own on public.museum_user_drafts;
create policy museum_user_drafts_delete_own on public.museum_user_drafts
  for delete to authenticated using (owner_id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('virtual-museum-user-items', 'virtual-museum-user-items', false, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = 10485760, allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists museum_user_items_select_own on storage.objects;
create policy museum_user_items_select_own on storage.objects
  for select to authenticated using (bucket_id = 'virtual-museum-user-items' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists museum_user_items_insert_own on storage.objects;
create policy museum_user_items_insert_own on storage.objects
  for insert to authenticated with check (bucket_id = 'virtual-museum-user-items' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists museum_user_items_update_own on storage.objects;
create policy museum_user_items_update_own on storage.objects
  for update to authenticated using (bucket_id = 'virtual-museum-user-items' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'virtual-museum-user-items' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists museum_user_items_delete_own on storage.objects;
create policy museum_user_items_delete_own on storage.objects
  for delete to authenticated using (bucket_id = 'virtual-museum-user-items' and (storage.foldername(name))[1] = (select auth.uid())::text);
