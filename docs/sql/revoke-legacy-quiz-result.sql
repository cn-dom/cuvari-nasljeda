-- PatriaSoul / Čuvari nasljeđa
-- Sigurnosna migracija: deaktivacija starog RPC-a koji prihvaća rezultat od klijenta.
--
-- VAŽNO:
-- 1. Prije primjene potvrditi da je odabran pravi Supabase projekt.
-- 2. Aktivni ugrađeni kviz koristi start_quiz_attempt / submit_quiz_answer /
--    finish_quiz_attempt. Oni računaju rezultat na strani baze.
-- 3. Ovaj SQL namjerno nije pokrenut automatski. Prvo testirati na zasebnom
--    testnom projektu i provjeriti sve vanjske aplikacije koje bi mogle koristiti
--    record_quiz_result.

begin;

revoke all privileges
on function public.record_quiz_result(text, text, text, integer, integer, integer)
from public, anon, authenticated;

commit;

-- Provjera nakon primjene: anon_exec i authenticated_exec trebaju biti false.
select
  p.oid::regprocedure::text as function_name,
  has_function_privilege('anon', p.oid, 'EXECUTE') as anon_exec,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_exec
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'record_quiz_result';
