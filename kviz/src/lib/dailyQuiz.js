import { fetchMainQuizQuestions } from "./mainQuiz";

const DAILY_TIME_ZONE = "Europe/Zagreb";

function getDailyKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: DAILY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function hash(value) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function stableSort(items, key) {
  return [...items].sort((a, b) => {
    const difference = hash(`${key}:${a.id}`) - hash(`${key}:${b.id}`);
    return difference || String(a.id).localeCompare(String(b.id));
  });
}

export async function fetchDailyQuizQuestions(date = new Date()) {
  const dailyKey = getDailyKey(date);
  const all = await fetchMainQuizQuestions();

  if (all.length < 10) {
    throw new Error("Za Dnevni kviz trenutno nema dovoljno aktivnih, jedinstvenih pitanja.");
  }

  const byCategory = new Map();
  for (const question of all) {
    const category = String(question.category ?? "").trim();
    if (!category) continue;
    const list = byCategory.get(category) ?? [];
    list.push(question);
    byCategory.set(category, list);
  }

  const selected = [];
  const usedIds = new Set();
  const usedQuestionText = new Set();

  // Rotate category order deterministically each day so the same early
  // database categories do not dominate every daily set.
  const categories = [...byCategory.keys()].sort((a, b) => {
    const difference = hash(`${dailyKey}:category:${a}`) - hash(`${dailyKey}:category:${b}`);
    return difference || a.localeCompare(b);
  });

  for (const category of categories) {
    if (selected.length >= 10) break;
    const candidates = stableSort(byCategory.get(category), `${dailyKey}:category:${category}`);
    const question = candidates.find((item) => {
      const text = String(item.question ?? "").normalize("NFKC").toLocaleLowerCase("hr").replace(/\s+/g, " ").trim();
      return !usedIds.has(item.id) && text && !usedQuestionText.has(text);
    });
    if (question) {
      selected.push(question);
      usedIds.add(question.id);
      usedQuestionText.add(String(question.question).normalize("NFKC").toLocaleLowerCase("hr").replace(/\s+/g, " ").trim());
    }
  }

  // If fewer than ten categories contain valid questions, fill from the
  // remaining unique questions without repeating an ID or question text.
  if (selected.length < 10) {
    const remaining = stableSort(all, `${dailyKey}:fill`).filter((question) => {
      const text = String(question.question ?? "").normalize("NFKC").toLocaleLowerCase("hr").replace(/\s+/g, " ").trim();
      if (!text || usedIds.has(question.id) || usedQuestionText.has(text)) return false;
      usedIds.add(question.id);
      usedQuestionText.add(text);
      return true;
    });
    selected.push(...remaining.slice(0, 10 - selected.length));
  }

  if (selected.length < 10) {
    throw new Error(`Dnevni kviz ima samo ${selected.length} valjanih, jedinstvenih pitanja; potrebno ih je 10.`);
  }

  return stableSort(selected, `${dailyKey}:order`).slice(0, 10);
}

export function getDailyQuizKey(date = new Date()) {
  return getDailyKey(date);
}
