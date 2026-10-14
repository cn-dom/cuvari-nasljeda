-- Applied to Supabase project azerctpwfzdivydsxyex on 2026-10-14.
-- This migration hardens chat-report submissions/moderation, creates a canonical
-- friendship edge populated transactionally when a request is accepted, and
-- makes public wall-image URLs stable for anonymous visitors.

begin;
revoke execute on all functions in schema public from public, anon;

drop policy if exists "Members can report global chat messages" on public.community_global_chat_reports;
create policy "Members can report global chat messages" on public.community_global_chat_reports
for insert to authenticated with check (
  reporter_id = (select auth.uid())
  and char_length(trim(reason)) between 1 and 80
  and (details is null or char_length(details) <= 500)
  and reason in ('spam','insult','threat','hate','other')
  and exists (select 1 from public.community_global_chat_messages m
    where m.id = message_id and m.sender_id <> (select auth.uid()))
);
drop policy if exists "Members and admins can read chat reports" on public.community_global_chat_reports;
create policy "Members and admins can read chat reports" on public.community_global_chat_reports
for select to authenticated using (
  reporter_id = (select auth.uid())
  or lower(coalesce((select auth.jwt() ->> 'email'),'')) = 'patriasoul@protonmail.com'
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
);
drop policy if exists "Owner and admins can moderate chat reports" on public.community_global_chat_reports;
create policy "Owner and admins can moderate chat reports" on public.community_global_chat_reports
for update to authenticated
using (
  lower(coalesce((select auth.jwt() ->> 'email'),'')) = 'patriasoul@protonmail.com'
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
)
with check (
  lower(coalesce((select auth.jwt() ->> 'email'),'')) = 'patriasoul@protonmail.com'
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
);
revoke update on public.community_global_chat_reports from authenticated;
grant update(status) on public.community_global_chat_reports to authenticated;

create table if not exists public.community_friendships (
  user_low uuid not null references public.profiles(id) on delete cascade,
  user_high uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_low, user_high),
  constraint community_friendships_ordered check (user_low < user_high)
);
alter table public.community_friendships enable row level security;
drop policy if exists "Members can read their own friendships" on public.community_friendships;
create policy "Members can read their own friendships" on public.community_friendships
for select to authenticated using ((select auth.uid()) = user_low or (select auth.uid()) = user_high);
revoke all on public.community_friendships from anon, public;
grant select on public.community_friendships to authenticated;

create or replace function public.sync_community_friendship_on_accept()
returns trigger language plpgsql security definer set search_path = ''
as $function$
declare v_low uuid; v_high uuid;
begin
  if new.status = 'accepted' and old.status is distinct from 'accepted' then
    v_low := least(new.sender_id, new.recipient_id);
    v_high := greatest(new.sender_id, new.recipient_id);
    insert into public.community_friendships(user_low, user_high)
    values (v_low, v_high) on conflict (user_low, user_high) do nothing;
  elsif new.status = 'declined' and old.status = 'accepted' then
    v_low := least(new.sender_id, new.recipient_id);
    v_high := greatest(new.sender_id, new.recipient_id);
    delete from public.community_friendships where user_low = v_low and user_high = v_high;
  end if;
  return new;
end;
$function$;
revoke execute on function public.sync_community_friendship_on_accept() from public, anon, authenticated;
drop trigger if exists sync_community_friendship_on_accept on public.community_friend_requests;
create trigger sync_community_friendship_on_accept after update of status
on public.community_friend_requests for each row execute function public.sync_community_friendship_on_accept();
insert into public.community_friendships(user_low, user_high)
select least(sender_id, recipient_id), greatest(sender_id, recipient_id)
from public.community_friend_requests where status = 'accepted' and sender_id <> recipient_id
on conflict (user_low, user_high) do nothing;

update storage.buckets set public = true where id = 'community-images';
drop policy if exists "community_images_read_public" on storage.objects;
create policy "community_images_read_public" on storage.objects
for select to anon, authenticated using (bucket_id = 'community-images');
commit;
