-- Čuvari nasljeđa: jedinstvena korisnička i prikazna imena
-- Primijenjeno ručno u Supabase projektu; ovaj zapis čuva migraciju u repozitoriju.
-- Pravilo: usporedba ne razlikuje velika/mala slova i zanemaruje rubne razmake.
-- Prije primjene na drugoj bazi provjeriti postojeće duplikate.

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique_ci_idx
ON public.profiles (lower(btrim(username)))
WHERE username IS NOT NULL
  AND btrim(username) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS profiles_display_name_unique_ci_idx
ON public.profiles (lower(btrim(display_name)))
WHERE display_name IS NOT NULL
  AND btrim(display_name) <> '';

-- Provjera indeksa:
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public'
--   AND tablename = 'profiles'
--   AND indexname IN (
--     'profiles_username_unique_ci_idx',
--     'profiles_display_name_unique_ci_idx'
--   )
-- ORDER BY indexname;
