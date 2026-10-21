# Supabase alignment audit: PatriaSoul social app and quiz

Date: 2026-10-21

## Decision

Keep `azerctpwfzdivydsxyex` (PatriaSoul's Project) as the production source of truth for the combined application unless a later deployment inspection proves otherwise. Do not copy schemas, profiles, attempts, or progress from `ijimozjfdffejbczwyzb` (kviz) wholesale.

The quiz frontend already re-exports the shared client from the main app:

- `kviz/src/lib/supabase.js` re-exports `supabase` and `isSupabaseConfigured` from `src/lib/supabase.js`.
- The main client uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` and persists/refreshes the same browser session.

This means the immediate concern is data/schema drift, not a need to introduce a second frontend client.

## Read-only comparison

Observed on 2026-10-21:

| Dataset | Main project | `kviz` project |
|---|---:|---:|
| `quiz_questions` rows | 2,191 | 2,025 |
| Active `quiz_questions` | 1,242 | 2,025 |
| Active distinct normalized question texts in main | 1,215 | — |
| `city_questions` rows | 9,600 | 9,600 |
| Cities | 128 | 128 |

Category distribution differs materially. For example, the main project has 100 active `opce` questions, 101 active `glagoljica` questions, and 100 active `vjera` questions. The `kviz` project has 17, 16, and 15 respectively. Conversely, the secondary project has 165 active `domovinski_rat` questions while the main project has 42.

A normalized exact-text comparison found 153 secondary-project questions whose question text does not currently exist in the main project. All 153 are categorized as `domovinski_rat`. Questions with the same normalized text had matching answer sets and matching correct-answer meaning, allowing answer-option order to differ.

The main project has 27 extra active rows beyond the count of distinct normalized active question texts. The quiz selection function is intended to prevent exact normalized repeats within a round; this count does not establish that all 27 are harmful duplicates across all categories.

## Why no automatic import was performed

The 153 candidate questions include differently worded versions of similar facts and some template-like phrasing. A raw insert could increase the apparent question count while making the quiz repetitive. The secondary project's quiz schema also differs from the main project's schema and its profiles/attempts are not interchangeable.

Do not:
- switch production URLs to the secondary project;
- copy `profiles`, `quiz_attempts`, `quiz_results`, or `player_progress` between projects;
- overwrite main-project question rows;
- import all 153 candidates without reviewing wording, answer correctness, category, and sources;
- change city IDs or copy city-question foreign keys without mapping cities by `slug`.

## Safe next steps

1. Keep the shared frontend client and production URL unchanged.
2. Review the 153 candidate questions, deduplicating paraphrases and checking facts against reliable sources.
3. Prepare an additive-only import for approved questions, generating new IDs and leaving existing attempts/results/progress untouched.
4. Compare city questions by city `slug` and normalized question text before any city data transfer. The equal row counts alone do not prove the data is identical.
5. Verify production configuration, auth/session continuity, quiz start/submit/result/progress functions, and RLS before calling the alignment complete.
6. Re-run the read-only count and duplicate audit after any approved import.

This report records diagnostics only. It does not modify either database.
