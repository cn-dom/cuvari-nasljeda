-- PatriaSoul / Čuvari nasljeđa — SIGURNOSNI PREGLED (READ ONLY)
-- Ovaj upit samo čita metapodatke. Ne mijenja tablice, pravila ni dozvole.
-- Pokrenuti u Supabase SQL Editoru projekta Čuvari nasljeđa.
-- Pregled rezultata prije bilo kakve migracije; ne dijeliti izlaz javno ako sadrži interne detalje.

-- 1) RLS status ključnih tablica
select n.nspname as schema_name, c.relname as object_name,
       c.relkind as object_type, c.relrowsecurity as rls_enabled,
       c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'profiles','posts','comments','content_reports','admin_audit_log',
    'private_messages','group_chats','group_chat_members','group_chat_messages',
    'quiz_questions','quiz_questions_public','city_questions','city_questions_public',
    'quiz_attempts','quiz_attempt_questions','quiz_attempt_answers',
    'quiz_results','player_progress','notifications','community_notifications'
  )
order by c.relname;

-- 2) Stvarna RLS pravila za osjetljive tablice
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'profiles','content_reports','admin_audit_log','private_messages',
    'group_chat_members','group_chat_messages','quiz_questions','quiz_questions_public',
    'city_questions','city_questions_public','quiz_attempts','quiz_attempt_questions',
    'quiz_attempt_answers','quiz_results','player_progress','notifications'
  )
order by tablename, policyname;

-- 3) Dozvole SELECT/INSERT/UPDATE/DELETE za anon i authenticated
select table_schema, table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon','authenticated')
  and table_name in (
    'profiles','content_reports','admin_audit_log','private_messages',
    'group_chat_members','group_chat_messages','quiz_questions','quiz_questions_public',
    'city_questions','city_questions_public','quiz_attempts','quiz_attempt_questions',
    'quiz_attempt_answers','quiz_results','player_progress','notifications'
  )
order by table_name, grantee, privilege_type;

-- 4) Definicije javnih kviznih pogleda — provjeriti da ne vraćaju correct_index
select schemaname, viewname, definition
from pg_views
where schemaname = 'public'
  and viewname in ('quiz_questions_public','city_questions_public');

-- 5) SECURITY DEFINER funkcije i EXECUTE dozvole
-- Ovaj popis pokazuje tko ih može pozvati; rezultat sam po sebi ne dokazuje propust.
select n.nspname as schema_name,
       p.proname as function_name,
       pg_get_function_identity_arguments(p.oid) as arguments,
       p.prosecdef as security_definer,
       has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_can_execute,
       p.proconfig as function_settings
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.prosecdef = true
  and (
    p.proname like 'admin_%'
    or p.proname like '%quiz%'
    or p.proname like '%message%'
    or p.proname like '%group_chat%'
    or p.proname like '%notification%'
    or p.proname like '%conversation%'
  )
order by p.proname, arguments;

-- 6) Pregled definicija kritičnih RPC funkcija (izvršiti zasebno po potrebi)
-- Rezultati mogu sadržavati interne logike; čuvati ih privatno.
-- select pg_get_functiondef('public.admin_list_users()'::regprocedure);
-- select pg_get_functiondef('public.admin_list_quiz_results()'::regprocedure);
-- select pg_get_functiondef('public.admin_dashboard_stats()'::regprocedure);
-- select pg_get_functiondef('public.submit_quiz_answer(uuid,uuid,integer)'::regprocedure);
-- Prije pokretanja prilagoditi potpis stvarnim argumentima iz odjeljka 5.

-- 7) Provjera polja profila koja bi mogla mijenjati ovlasti
select column_name, data_type, is_updatable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'profiles'
  and column_name in ('id','role','is_admin','email','username','display_name')
order by ordinal_position;

-- NE PRIMJENJUJE promjene. Nakon pregleda definicija i poziva klijenta treba pripremiti
-- minimalnu migraciju i prvo testirati anonimnog korisnika, člana i vlasnika.
