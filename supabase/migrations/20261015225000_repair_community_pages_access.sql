-- Repair community pages Data API access and member-scoped RLS.
alter table public.community_pages enable row level security;
alter table public.community_page_posts enable row level security;

drop policy if exists community_pages_read_published on public.community_pages;
create policy community_pages_read_published
on public.community_pages for select
to anon, authenticated
using (is_published = true or created_by = (select auth.uid()));

drop policy if exists community_pages_insert_own on public.community_pages;
create policy community_pages_insert_own
on public.community_pages for insert
to authenticated
with check (created_by = (select auth.uid()));

drop policy if exists community_pages_update_own on public.community_pages;
create policy community_pages_update_own
on public.community_pages for update
to authenticated
using (created_by = (select auth.uid()))
with check (created_by = (select auth.uid()));

drop policy if exists community_pages_delete_own on public.community_pages;
create policy community_pages_delete_own
on public.community_pages for delete
to authenticated
using (created_by = (select auth.uid()));

drop policy if exists community_page_posts_read_visible on public.community_page_posts;
create policy community_page_posts_read_visible
on public.community_page_posts for select
to anon, authenticated
using (
  exists (
    select 1 from public.community_pages p
    where p.id = page_id
      and (p.is_published = true or p.created_by = (select auth.uid()))
  )
);

drop policy if exists community_page_posts_insert_own on public.community_page_posts;
create policy community_page_posts_insert_own
on public.community_page_posts for insert
to authenticated
with check (
  author_id = (select auth.uid())
  and exists (
    select 1 from public.community_pages p
    where p.id = page_id and p.is_published = true
  )
);

drop policy if exists community_page_posts_update_own on public.community_page_posts;
create policy community_page_posts_update_own
on public.community_page_posts for update
to authenticated
using (author_id = (select auth.uid()))
with check (author_id = (select auth.uid()));

drop policy if exists community_page_posts_delete_own on public.community_page_posts;
create policy community_page_posts_delete_own
on public.community_page_posts for delete
to authenticated
using (author_id = (select auth.uid()));

grant select on public.community_pages, public.community_page_posts to anon, authenticated;
grant insert, update, delete on public.community_pages, public.community_page_posts to authenticated;
