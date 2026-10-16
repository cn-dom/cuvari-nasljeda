-- Complete automatic award calculation for quiz, museum, and community activity.
-- Additive and safe to rerun: existing users, profiles, quiz progress, and earned awards remain intact.

create or replace function private.get_public_member_badges(p_user_ids uuid[])
returns table(user_id uuid, badge_key text, earned_at timestamptz, badge_source text)
language sql
stable
security definer
set search_path = ''
as $$
  with requested_users as (
    select distinct unnest(coalesce(p_user_ids, array[]::uuid[])) as user_id
  ),
  quiz_xp as (
    select pp.user_id, coalesce(sum(pp.xp), 0)::integer as total_xp
    from public.player_progress pp
    join requested_users ru on ru.user_id = pp.user_id
    group by pp.user_id
  ),
  quiz_levels as (
    select q.user_id,
      least(100, greatest(1, floor(q.total_xp / 100.0)::integer + 1)) as level
    from quiz_xp q
  ),
  quiz_badges as (
    select q.user_id, ('quiz_badge_' || levels.level)::text as badge_key
    from quiz_levels q
    cross join lateral generate_series(10, 100, 10) as levels(level)
    where q.level >= levels.level
  )
  select a.user_id, a.badge_key, a.earned_at, a.source as badge_source
  from public.heritage_badge_awards a
  join requested_users ru on ru.user_id = a.user_id
  union
  select qb.user_id, qb.badge_key, now(), 'quiz'
  from quiz_badges qb
  union
  select ru.user_id, 'quiz_beginner', now(), 'quiz'
  from requested_users ru
  where not exists (select 1 from quiz_badges qb where qb.user_id = ru.user_id)
$$;

revoke all on function private.get_public_member_badges(uuid[]) from public, anon;
grant execute on function private.get_public_member_badges(uuid[]) to authenticated;

create or replace function private.award_community_activity_badges()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_count integer;
  v_badge_key text;
begin
  if tg_table_name = 'posts' then
    v_user_id := new.author_id;
    insert into public.heritage_badge_awards(user_id, badge_key, source)
    values (v_user_id, 'community_first_post', 'system')
    on conflict do nothing;

    select count(*)::integer into v_count
    from public.posts p where p.author_id = v_user_id;
    if v_count >= 10 then
      insert into public.heritage_badge_awards(user_id, badge_key, source)
      values (v_user_id, 'community_10_posts', 'system')
      on conflict do nothing;
    end if;
  elsif tg_table_name = 'forum_topics' then
    v_user_id := new.user_id;
    v_badge_key := 'community_first_topic';
  elsif tg_table_name = 'forum_posts' then
    v_user_id := new.user_id;
    v_badge_key := 'community_first_forum_reply';
  elsif tg_table_name = 'community_comments' then
    v_user_id := new.user_id;
    v_badge_key := 'community_first_comment';
  elsif tg_table_name = 'community_events' then
    v_user_id := new.created_by;
    v_badge_key := 'community_first_event';
  else
    return new;
  end if;

  if v_badge_key is not null and v_user_id is not null then
    insert into public.heritage_badge_awards(user_id, badge_key, source)
    values (v_user_id, v_badge_key, 'system')
    on conflict do nothing;
  end if;
  return new;
end;
$$;

revoke all on function private.award_community_activity_badges() from public, anon, authenticated;

drop trigger if exists award_community_badge_after_post on public.posts;
create trigger award_community_badge_after_post
after insert on public.posts
for each row execute function private.award_community_activity_badges();

drop trigger if exists award_community_badge_after_forum_topic on public.forum_topics;
create trigger award_community_badge_after_forum_topic
after insert on public.forum_topics
for each row execute function private.award_community_activity_badges();

drop trigger if exists award_community_badge_after_forum_reply on public.forum_posts;
create trigger award_community_badge_after_forum_reply
after insert on public.forum_posts
for each row execute function private.award_community_activity_badges();

drop trigger if exists award_community_badge_after_comment on public.community_comments;
create trigger award_community_badge_after_comment
after insert on public.community_comments
for each row execute function private.award_community_activity_badges();

drop trigger if exists award_community_badge_after_event on public.community_events;
create trigger award_community_badge_after_event
after insert on public.community_events
for each row execute function private.award_community_activity_badges();

-- Keep the PostgREST-facing wrapper aligned with the private implementation.
create or replace function public.get_public_member_badges(p_user_ids uuid[])
returns table(user_id uuid, badge_key text, earned_at timestamptz, badge_source text)
language sql
stable
set search_path = ''
as $$ select * from private.get_public_member_badges(p_user_ids) $$;

revoke all on function public.get_public_member_badges(uuid[]) from public, anon;
grant execute on function public.get_public_member_badges(uuid[]) to authenticated;
