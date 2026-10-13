-- PatriaSoul · Čuvari nasljeđa
-- Applied to the separate test Supabase project.
-- Public visitors may read wall posts, comments and limited public profile fields.
-- Anonymous users receive no write access to these tables.
begin;

revoke all privileges on table public.posts, public.comments, public.post_reactions, public.profiles from anon;
grant select on table public.posts, public.comments to anon;
grant select (id, display_name, username, avatar_path, avatar_url) on table public.profiles to anon;
grant select (avatar_url) on table public.profiles to authenticated;
grant update (avatar_url) on table public.profiles to authenticated;

drop policy if exists posts_select_authenticated on public.posts;
drop policy if exists posts_select_public on public.posts;
drop policy if exists posts_read_public on public.posts;
create policy posts_read_public on public.posts
  for select to anon, authenticated using (true);

drop policy if exists comments_select_authenticated on public.comments;
drop policy if exists comments_select_public on public.comments;
drop policy if exists comments_read_public on public.comments;
create policy comments_read_public on public.comments
  for select to anon, authenticated using (true);

drop policy if exists profiles_select_authenticated on public.profiles;
drop policy if exists profiles_select_public on public.profiles;
drop policy if exists profiles_read_public on public.profiles;
create policy profiles_read_public on public.profiles
  for select to anon, authenticated using (true);

commit;
