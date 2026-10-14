-- PatriaSoul · Čuvari nasljeđa
-- SECURITY UPDATE: despite the historical filename, the wall is NOT public.
-- For a full review-first migration, see member-only-wall-access.sql.
-- Apply only to the confirmed project after reviewing existing policies.

begin;

revoke all privileges on table public.posts, public.comments, public.post_reactions, public.profiles from anon;
grant select on table public.posts, public.comments to authenticated;
grant select (id, display_name, username, avatar_path, avatar_url) on public.profiles to authenticated;
grant update (avatar_url) on public.profiles to authenticated;

drop policy if exists posts_select_authenticated on public.posts;
drop policy if exists posts_select_public on public.posts;
drop policy if exists posts_read_public on public.posts;
drop policy if exists posts_read_authenticated on public.posts;
create policy posts_read_authenticated on public.posts
  for select to authenticated using ((select auth.uid()) is not null);

drop policy if exists comments_select_authenticated on public.comments;
drop policy if exists comments_select_public on public.comments;
drop policy if exists comments_read_public on public.comments;
drop policy if exists comments_read_authenticated on public.comments;
create policy comments_read_authenticated on public.comments
  for select to authenticated using ((select auth.uid()) is not null);

drop policy if exists profiles_select_authenticated on public.profiles;
drop policy if exists profiles_select_public on public.profiles;
drop policy if exists profiles_read_public on public.profiles;
drop policy if exists profiles_read_authenticated on public.profiles;
create policy profiles_read_authenticated on public.profiles
  for select to authenticated using ((select auth.uid()) is not null);

commit;
