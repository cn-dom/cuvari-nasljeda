-- Shared PatriaSoul badge catalog and verified 3D museum achievements.
-- Additive migration: existing quiz progress/results are not modified.

create schema if not exists private;
grant usage on schema private to authenticated;
revoke all on schema private from anon;

create table if not exists public.museum_exhibit_visits (
  user_id uuid not null references auth.users(id) on delete cascade,
  exhibit_id text not null check (exhibit_id in ('vucedol','bascanska','pleter','novac','nosnja')),
  first_viewed_at timestamptz not null default now(),
  primary key (user_id, exhibit_id)
);

create table if not exists public.heritage_badge_awards (
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_key text not null,
  earned_at timestamptz not null default now(),
  source text not null check (source in ('museum','moderation','system')),
  primary key (user_id, badge_key)
);

alter table public.museum_exhibit_visits enable row level security;
alter table public.heritage_badge_awards enable row level security;

drop policy if exists museum_exhibit_visits_select_own on public.museum_exhibit_visits;
create policy museum_exhibit_visits_select_own on public.museum_exhibit_visits
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists heritage_badge_awards_select_own on public.heritage_badge_awards;
create policy heritage_badge_awards_select_own on public.heritage_badge_awards
  for select to authenticated using (user_id = (select auth.uid()));

revoke all on public.museum_exhibit_visits from anon, authenticated;
grant select on public.museum_exhibit_visits to authenticated;
revoke all on public.heritage_badge_awards from anon, authenticated;
grant select on public.heritage_badge_awards to authenticated;

create or replace function private.record_museum_exhibit_visit(p_exhibit_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_count integer;
  v_rows integer;
  v_new_badges text[] := array[]::text[];
  v_key text;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;
  if p_exhibit_id not in ('vucedol','bascanska','pleter','novac','nosnja') then
    raise exception 'Unknown museum exhibit';
  end if;

  insert into public.museum_exhibit_visits(user_id, exhibit_id)
  values (v_user_id, p_exhibit_id)
  on conflict (user_id, exhibit_id) do nothing;

  select count(*)::integer into v_count
  from public.museum_exhibit_visits where user_id = v_user_id;

  if v_count >= 1 then
    insert into public.heritage_badge_awards(user_id,badge_key,source)
    values (v_user_id,'museum_first_visit','museum') on conflict do nothing;
    get diagnostics v_rows = row_count;
    if v_rows > 0 then v_new_badges := array_append(v_new_badges, 'museum_first_visit'); end if;
  end if;
  if v_count >= 3 then
    insert into public.heritage_badge_awards(user_id,badge_key,source)
    values (v_user_id,'museum_3_exhibits','museum') on conflict do nothing;
    get diagnostics v_rows = row_count;
    if v_rows > 0 then v_new_badges := array_append(v_new_badges, 'museum_3_exhibits'); end if;
  end if;
  if v_count >= 5 then
    insert into public.heritage_badge_awards(user_id,badge_key,source)
    values (v_user_id,'museum_all_exhibits','museum') on conflict do nothing;
    get diagnostics v_rows = row_count;
    if v_rows > 0 then v_new_badges := array_append(v_new_badges, 'museum_all_exhibits'); end if;
  end if;

  v_key := case p_exhibit_id
    when 'vucedol' then 'museum_archaeology'
    when 'bascanska' then 'museum_glagolitic'
    when 'pleter' then 'museum_ornament'
    when 'novac' then 'museum_numismatics'
    when 'nosnja' then 'museum_ethnography'
  end;
  insert into public.heritage_badge_awards(user_id,badge_key,source)
  values (v_user_id,v_key,'museum') on conflict do nothing;
  get diagnostics v_rows = row_count;
  if v_rows > 0 then v_new_badges := array_append(v_new_badges, v_key); end if;

  return jsonb_build_object('visited_count', v_count, 'new_badges', v_new_badges);
end;
$$;

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
  quiz_badges as (
    select q.user_id,
      case
        when least(100, greatest(1, floor(q.total_xp / 100.0)::integer + 1)) >= 100 then 'quiz_badge_100'
        when least(100, greatest(1, floor(q.total_xp / 100.0)::integer + 1)) >= 90 then 'quiz_badge_90'
        when least(100, greatest(1, floor(q.total_xp / 100.0)::integer + 1)) >= 80 then 'quiz_badge_80'
        when least(100, greatest(1, floor(q.total_xp / 100.0)::integer + 1)) >= 70 then 'quiz_badge_70'
        when least(100, greatest(1, floor(q.total_xp / 100.0)::integer + 1)) >= 60 then 'quiz_badge_60'
        when least(100, greatest(1, floor(q.total_xp / 100.0)::integer + 1)) >= 50 then 'quiz_badge_50'
        when least(100, greatest(1, floor(q.total_xp / 100.0)::integer + 1)) >= 40 then 'quiz_badge_40'
        when least(100, greatest(1, floor(q.total_xp / 100.0)::integer + 1)) >= 30 then 'quiz_badge_30'
        when least(100, greatest(1, floor(q.total_xp / 100.0)::integer + 1)) >= 20 then 'quiz_badge_20'
        when least(100, greatest(1, floor(q.total_xp / 100.0)::integer + 1)) >= 10 then 'quiz_badge_10'
        else 'quiz_beginner'
      end as badge_key
    from quiz_xp q
  )
  select a.user_id, a.badge_key, a.earned_at, a.source as badge_source
  from public.heritage_badge_awards a
  join requested_users ru on ru.user_id = a.user_id
  union all
  select qb.user_id, qb.badge_key, now(), 'quiz'
  from quiz_badges qb
  union all
  select ru.user_id, 'quiz_beginner', now(), 'quiz'
  from requested_users ru
  where not exists (select 1 from quiz_badges qb where qb.user_id = ru.user_id)
$$;

revoke all on function private.record_museum_exhibit_visit(text) from public, anon;
grant execute on function private.record_museum_exhibit_visit(text) to authenticated;
revoke all on function private.get_public_member_badges(uuid[]) from public, anon;
grant execute on function private.get_public_member_badges(uuid[]) to authenticated;

-- PostgREST-visible invoker wrappers; privileged logic remains in private schema.
create or replace function public.record_museum_exhibit_visit(p_exhibit_id text)
returns jsonb
language sql
set search_path = ''
as $$ select private.record_museum_exhibit_visit(p_exhibit_id) $$;

create or replace function public.get_public_member_badges(p_user_ids uuid[])
returns table(user_id uuid, badge_key text, earned_at timestamptz, badge_source text)
language sql
stable
set search_path = ''
as $$ select * from private.get_public_member_badges(p_user_ids) $$;

revoke all on function public.record_museum_exhibit_visit(text) from public, anon;
grant execute on function public.record_museum_exhibit_visit(text) to authenticated;
revoke all on function public.get_public_member_badges(uuid[]) from public, anon;
grant execute on function public.get_public_member_badges(uuid[]) to authenticated;
