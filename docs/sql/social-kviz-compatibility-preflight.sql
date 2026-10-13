-- Čuvari nasljeđa / PatriaSoul — READ-ONLY compatibility preflight
-- Safe for SQL Editor: SELECT-only; does not create, alter, or delete anything.
-- Run against the intended Supabase project before preparing any migration.

with required_objects(object_name, object_kind) as (
  values
    ('profiles', 'table/view'),
    ('posts', 'table/view'),
    ('comments', 'table/view'),
    ('post_reactions', 'table/view'),
    ('blocked_users', 'table/view'),
    ('private_messages', 'table/view'),
    ('private_message_reactions', 'table/view'),
    ('group_chats', 'table/view'),
    ('group_chat_messages', 'table/view'),
    ('notifications', 'table/view'),
    ('community_posts', 'table/view'),
    ('community_post_comments', 'table/view'),
    ('community_comments', 'table/view'),
    ('community_notifications', 'table/view'),
    ('quiz_results', 'table/view'),
    ('player_progress', 'table/view'),
    ('player_badges', 'table/view'),
    ('quiz_questions', 'table/view'),
    ('quiz_questions_public', 'table/view'),
    ('cities', 'table/view'),
    ('city_questions', 'table/view'),
    ('city_questions_public', 'table/view'),
    ('start_quiz_attempt', 'function'),
    ('submit_quiz_answer', 'function'),
    ('finish_quiz_attempt', 'function'),
    ('record_quiz_result', 'function'),
    ('get_leaderboard', 'function'),
    ('admin_dashboard_stats', 'function'),
    ('admin_list_users', 'function'),
    ('admin_list_quiz_results', 'function'),
    ('admin_delete_quiz_result', 'function'),
    ('create_community_notification', 'function')
)
select
  r.object_name,
  r.object_kind,
  case
    when r.object_kind = 'function' and exists (
      select 1 from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = r.object_name
    ) then 'FOUND'
    when r.object_kind <> 'function'
      and to_regclass('public.' || r.object_name) is not null then 'FOUND'
    else 'MISSING'
  end as status
from required_objects r
order by r.object_kind, r.object_name;

-- Exact profile and direct-message columns that determine code compatibility.
select
  table_name,
  string_agg(column_name, ', ' order by ordinal_position) as columns
from information_schema.columns
where table_schema = 'public'
  and table_name in (
    'profiles',
    'posts',
    'comments',
    'private_messages',
    'private_conversations',
    'private_conversation_members',
    'community_posts',
    'community_post_comments',
    'community_comments'
  )
group by table_name
order by table_name;

-- RLS status for relevant public tables. Missing tables naturally do not appear.
select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind in ('r', 'p')
  and c.relname in (
    'profiles', 'posts', 'comments', 'post_reactions', 'blocked_users',
    'private_messages', 'private_message_reactions', 'group_chats',
    'group_chat_messages', 'notifications', 'community_posts',
    'community_post_comments', 'community_comments', 'community_notifications',
    'quiz_results', 'player_progress', 'player_badges', 'quiz_questions',
    'quiz_questions_public', 'cities', 'city_questions', 'city_questions_public'
  )
order by c.relname;
