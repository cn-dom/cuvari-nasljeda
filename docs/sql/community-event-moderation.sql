-- PatriaSoul · Čuvari nasljeđa
-- Owner moderation of community events in the separate TEST project.
-- Run only in the intended test Supabase project.
begin;

drop policy if exists owner_update_community_events on public.community_events;
create policy owner_update_community_events on public.community_events
  for update to authenticated
  using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'patriasoul@protonmail.com')
  with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'patriasoul@protonmail.com');

drop policy if exists owner_delete_community_events on public.community_events;
create policy owner_delete_community_events on public.community_events
  for delete to authenticated
  using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'patriasoul@protonmail.com');

commit;
