-- Deduplicate templated variants in the main Croatian quiz bank.
--
-- The imported 1200-question bank contains ten wording templates for each
-- underlying fact. Keep the first row in each ten-row group and disable the
-- nine paraphrases so players do not receive the same fact repeatedly.
UPDATE public.quiz_questions
SET active = false,
    updated_at = now()
WHERE source_key LIKE '1200:%_new_%'
  AND substring(source_key from '([0-9]{3})$')::integer % 10 <> 1;

-- The remaining generated Vukovar-symbol question duplicates the original
-- question already present in the 150-question source bank.
UPDATE public.quiz_questions
SET active = false,
    updated_at = now()
WHERE source_key = '1200:domovinski_rat_new_021'
  AND active = true;
