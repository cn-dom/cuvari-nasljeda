-- Read-only preflight for the PatriaSoul quiz integration.
-- Safe to run in the SQL editor: it does not create or modify any object.

with required_objects(object_name, object_kind) as (
  values
    ('public.profiles', 'table/view'),
    ('public.player_progress', 'table/view'),
    ('public.quiz_results', 'table/view'),
    ('public.quiz_questions', 'table/view'),
    ('public.quiz_questions_public', 'table/view'),
    ('public.cities', 'table/view'),
    ('public.city_questions_public', 'table/view'),
    ('public.community_comments', 'table/view'),
    ('public.community_notifications', 'table/view'),
    ('public.start_quiz_attempt', 'function'),
    ('public.submit_quiz_answer', 'function'),
    ('public.finish_quiz_attempt', 'function'),
    ('public.record_quiz_result', 'function'),
    ('public.get_leaderboard', 'function'),
    ('public.admin_dashboard_stats', 'function'),
    ('public.admin_list_users', 'function'),
    ('public.admin_list_quiz_results', 'function'),
    ('public.admin_delete_quiz_result', 'function'),
    ('public.create_community_notification', 'function')
)
select
  r.object_name,
  r.object_kind,
  case
    when r.object_kind = 'function' and exists (
      select 1
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = split_part(r.object_name, '.', 1)
        and p.proname = split_part(r.object_name, '.', 2)
    ) then 'FOUND'
    when r.object_kind <> 'function' and to_regclass(r.object_name) is not null then 'FOUND'
    else 'MISSING'
  end as status
from required_objects r
order by r.object_kind, r.object_name;

-- Required columns used by the quiz profile and account views.
select
  c.column_name,
  case when c.column_name is null then 'MISSING' else 'FOUND' end as status
from (values ('id'), ('display_name'), ('role'), ('avatar_url')) required(column_name)
left join information_schema.columns c
  on c.table_schema = 'public'
 and c.table_name = 'profiles'
 and c.column_name = required.column_name
order by required.column_name;
