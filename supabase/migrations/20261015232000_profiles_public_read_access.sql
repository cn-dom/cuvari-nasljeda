-- Public profile fields are used in forum, community pages, and member directory joins.
-- RLS remains enabled; only profile rows are exposed, never auth.users.
grant select on table public.profiles to anon, authenticated;

drop policy if exists profiles_public_read on public.profiles;
create policy profiles_public_read
on public.profiles for select
to anon, authenticated
using (true);
