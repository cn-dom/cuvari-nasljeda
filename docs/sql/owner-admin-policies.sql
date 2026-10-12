-- PatriaSoul – owner-only moderation policies
-- REVIEW-ONLY migration. Apply ONLY to the separately confirmed TEST Supabase project.
-- This uses the verified email claim from Supabase Auth; it is not a frontend-only check.
begin;

-- Preserve moderation history when a reported post is removed.
alter table public.content_reports alter column post_id drop not null;
alter table public.content_reports drop constraint if exists content_reports_post_id_fkey;
alter table public.content_reports
  add constraint content_reports_post_id_fkey
  foreign key (post_id) references public.posts(id) on delete set null;

alter table public.content_reports enable row level security;
drop policy if exists "owner_select_content_reports" on public.content_reports;
create policy "owner_select_content_reports" on public.content_reports
  for select to authenticated
  using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'patriasoul@protonmail.com');

drop policy if exists "owner_update_content_reports" on public.content_reports;
create policy "owner_update_content_reports" on public.content_reports
  for update to authenticated
  using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'patriasoul@protonmail.com')
  with check (
    lower(coalesce(auth.jwt() ->> 'email', '')) = 'patriasoul@protonmail.com'
    and status in ('pending', 'reviewed', 'dismissed', 'actioned')
  );

drop policy if exists "owner_delete_posts" on public.posts;
create policy "owner_delete_posts" on public.posts
  for delete to authenticated
  using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'patriasoul@protonmail.com');

drop policy if exists "owner_update_posts" on public.posts;
create policy "owner_update_posts" on public.posts
  for update to authenticated
  using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'patriasoul@protonmail.com')
  with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'patriasoul@protonmail.com');

drop policy if exists "owner_delete_comments" on public.comments;
create policy "owner_delete_comments" on public.comments
  for delete to authenticated
  using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'patriasoul@protonmail.com');

commit;
