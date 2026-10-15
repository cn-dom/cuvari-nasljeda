-- Repair forum access policies and Data API grants.
-- Existing forum tables and category data are already present in production.
alter table public.forum_categories enable row level security;
alter table public.forum_topics enable row level security;
alter table public.forum_posts enable row level security;

drop policy if exists "Forum categories are readable" on public.forum_categories;
create policy "Forum categories are readable"
on public.forum_categories for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Published forum topics are readable" on public.forum_topics;
create policy "Published forum topics are readable"
on public.forum_topics for select
to anon, authenticated
using (status = 'published' or user_id = (select auth.uid()));

drop policy if exists "Members can create forum topics" on public.forum_topics;
create policy "Members can create forum topics"
on public.forum_topics for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "Authors can update their forum topics" on public.forum_topics;
create policy "Authors can update their forum topics"
on public.forum_topics for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "Published forum replies are readable" on public.forum_posts;
create policy "Published forum replies are readable"
on public.forum_posts for select
to anon, authenticated
using (status = 'published' or user_id = (select auth.uid()));

drop policy if exists "Members can reply to published forum topics" on public.forum_posts;
create policy "Members can reply to published forum topics"
on public.forum_posts for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.forum_topics t
    where t.id = topic_id and t.status = 'published'
  )
);

drop policy if exists "Authors can update their forum replies" on public.forum_posts;
create policy "Authors can update their forum replies"
on public.forum_posts for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

grant select on public.forum_categories, public.forum_topics, public.forum_posts to anon, authenticated;
grant insert, update on public.forum_topics, public.forum_posts to authenticated;
