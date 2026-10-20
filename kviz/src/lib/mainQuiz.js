import { supabase } from "./supabase";

const CATEGORY_ALIASES = {
  "domovinski-rat": "domovinski_rat",
  "sakralna-bastina": "vjera",
  "sakralna_bastina": "vjera",
};

const PAGE_SIZE = 500;

function resolveCategory(category) {
  return CATEGORY_ALIASES[category] ?? category;
}

export async function fetchMainQuizQuestions(category = null) {
  if (!supabase) throw new Error("Supabase nije konfiguriran.");

  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    let query = supabase
      .from("quiz_questions_public")
      .select("id,category,question,answer_a,answer_b,answer_c,answer_d,source_url,created_at")
      .eq("active", true);

    if (category) query = query.eq("category", resolveCategory(category));

    const { data, error } = await query
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    const page = data ?? [];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }

  // Duplicate text can slip into the bank during imports. Keep the first
  // occurrence so the same wording is not shown repeatedly in a round.
  const seenQuestions = new Set();
  return rows
    .filter((row) => {
      const normalized = String(row.question ?? "")
        .normalize("NFKC")
        .toLocaleLowerCase("hr")
        .replace(/\s+/g, " ")
        .trim();
      if (!normalized || seenQuestions.has(normalized)) return false;
      seenQuestions.add(normalized);
      return true;
    })
    .map((row) => ({
      id: row.id,
      category: row.category,
      question: row.question,
      answers: [row.answer_a, row.answer_b, row.answer_c, row.answer_d],
      sourceUrl: row.source_url,
    }));
}

export async function getMainQuizCount(category = null) {
  if (!supabase) return 0;

  let query = supabase
    .from("quiz_questions")
    .select("id", { count: "exact", head: true })
    .eq("active", true);

  if (category) query = query.eq("category", resolveCategory(category));

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}
