import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  getLocalCalendarDayNumber,
  getLocalDateKey,
  normalizeCroatianWord,
} from "../kviz/src/lib/croatianWords.js";

const centerSource = readFileSync("kviz/src/pages/CentarIgaraRijeci.jsx", "utf8");
const classicSource = readFileSync("kviz/src/pages/RijeciDomovine.jsx", "utf8");

function sectionBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, `Missing section: ${startMarker}`);
  const end = source.indexOf(endMarker, start);
  assert.notEqual(end, -1, `Missing section end: ${endMarker}`);
  return source.slice(start, end);
}

const bankSection = sectionBetween(centerSource, "const BANK = [", "\n];");
const bank = [...bankSection.matchAll(/\{\s*word:"([^"]+)"\s*,\s*clue:"([^"]*)"\s*,\s*group:"([^"]+)"\s*\}/g)]
  .map((match) => ({ word: match[1], clue: match[2], group: match[3] }));

const groupSection = sectionBetween(centerSource, "const GROUPS = [", "\n];");
const groups = [...groupSection.matchAll(/\{title:"([^"]+)",words:\[([^\]]+)\]\}/g)]
  .map((match) => ({
    title: match[1],
    words: [...match[2].matchAll(/"([^"]+)"/g)].map((word) => word[1]),
  }));

const classicSection = sectionBetween(classicSource, "const WORDS = [", "\n];");
const classicWords = [...classicSection.matchAll(/\{\s*word:\s*"([^"]+)"\s*,\s*category:\s*"([^"]+)"\s*,\s*level:\s*(\d+)\s*,\s*clue:\s*"([^"]*)"\s*,\s*explanation:\s*"([^"]*)"\s*\}/g)]
  .map((match) => ({
    word: match[1],
    category: match[2],
    level: Number(match[3]),
    clue: match[4],
    explanation: match[5],
  }));

function assertUniqueWords(entries, label) {
  const seen = new Set();
  for (const entry of entries) {
    const key = normalizeCroatianWord(entry.word);
    assert.ok(key, `${label}: empty normalized word`);
    assert.equal(entry.word, entry.word.normalize("NFC"), `${label}: word is not NFC-normalized: ${entry.word}`);
    assert.ok(!seen.has(key), `${label}: duplicate word: ${entry.word}`);
    seen.add(key);
    assert.ok(entry.clue.trim(), `${label}: missing clue for ${entry.word}`);
  }
}

assert.ok(bank.length >= 410, `Expected at least 410 words in the game centre; found ${bank.length}`);
assert.ok(classicWords.length >= 370, `Expected at least 370 words in the classic game; found ${classicWords.length}`);
assertUniqueWords(bank, "Centar igara");
assertUniqueWords(classicWords, "Klasična igra");

const groupTitles = new Set();
const groupedWords = new Set();
for (const group of groups) {
  assert.ok(!groupTitles.has(group.title), `Duplicate group title: ${group.title}`);
  groupTitles.add(group.title);
  assert.equal(group.words.length, 4, `${group.title}: group must contain exactly four words`);
  assert.equal(new Set(group.words).size, 4, `${group.title}: repeated word inside group`);
  for (const word of group.words) {
    assert.ok(bank.some((entry) => entry.word === word), `${group.title}: word is missing from BANK: ${word}`);
    assert.ok(!groupedWords.has(word), `Word appears in more than one group: ${word}`);
    groupedWords.add(word);
  }
}

for (const entry of classicWords) {
  assert.ok(entry.explanation.trim(), `Klasična igra: missing explanation for ${entry.word}`);
  assert.ok(entry.level >= 1 && entry.level <= 3, `Invalid level for ${entry.word}`);
}

assert.equal(normalizeCroatianWord("č ć đ š ž"), "ČĆĐŠŽ", "Croatian diacritics must be preserved");
assert.notEqual(normalizeCroatianWord("C"), normalizeCroatianWord("Č"), "C and Č must remain distinct letters");
assert.notEqual(normalizeCroatianWord("D"), normalizeCroatianWord("Đ"), "D and Đ must remain distinct letters");

const dateParts = (year, month, day) => ({
  getFullYear: () => year,
  getMonth: () => month,
  getDate: () => day,
});
for (const [from, to] of [
  [dateParts(2026, 2, 28), dateParts(2026, 2, 29)],
  [dateParts(2026, 2, 29), dateParts(2026, 2, 30)],
  [dateParts(2026, 9, 24), dateParts(2026, 9, 25)],
  [dateParts(2026, 9, 25), dateParts(2026, 9, 26)],
]) {
  assert.equal(getLocalCalendarDayNumber(to) - getLocalCalendarDayNumber(from), 1, "Daily word index must advance once per local calendar day, including DST changes");
}
assert.equal(getLocalDateKey(dateParts(2026, 2, 29)), "2026-03-29");

assert.match(centerSource, /const DAILY = WORDS\.filter/);
assert.ok(centerSource.includes('const DAILY = WORDS.filter(item=>item.clean.length>=4&&item.clean.length<=10).map(item=>item.word);'), "Daily challenge should include eligible multiword answers");
assert.ok(centerSource.includes('Tajna riječ ima {normalize(dailyWord).length} slova.'), "Daily challenge should count normalized letters, not spaces");
assert.match(centerSource, /DAILY\[getLocalCalendarDayNumber\(today\)%DAILY\.length\]/);
assert.match(centerSource, /alphabet=\["A","B","C","Č","Ć","D","Đ"/);
assert.match(centerSource, /"S","Š","T","U","V","Z","Ž"/);
const scrambleUi = sectionBetween(centerSource, '{active==="scramble"&&', '{active==="guess"&&');
assert.match(scrambleUi, /Odaberi slovo/);
assert.doesNotMatch(scrambleUi, /<LetterKeyboard/);
assert.ok(classicSource.includes('const letters = normalize(word).split("");'), "Classic game must scramble NFC-normalized Croatian letters");
assert.doesNotMatch(classicSource, /setTypedAnswer/);
assert.match(classicSource, /patriasoul_rijeci_daily_best/);

const requiredTerms = [
  "PAŠKA ČIPKA",
  "LEPOGLAVSKA ČIPKA",
  "HVARSKA ČIPKA",
  "STAROGRADSKO POLJE",
  "LASTOVSKI POKLAD",
  "MEĐIMURSKA POPEVKA",
  "ZA KRIŽEN",
  "FESTA SVETOG VLAHA",
  "OSJEČKA TVRĐA",
  "MORSKE ORGULJE",
  "POZDRAV SUNCU",
  "ZLATNI RAT",
  "SVETI DONAT",
  "RIMSKI FORUM",
];
for (const word of requiredTerms) {
  assert.ok(bank.some((entry) => entry.word === word), `Missing new game-centre word: ${word}`);
  assert.ok(classicWords.some((entry) => entry.word === word), `Missing classic-game word: ${word}`);
}

console.log(`Riječi domovine audit passed: ${bank.length} centre words, ${classicWords.length} classic words, ${groups.length} valid groups, Croatian diacritics and daily-date checks passed.`);
