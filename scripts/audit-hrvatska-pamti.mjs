#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = path.join(root, "src", "HrvatskaPamtiGrobnice.jsx");
const mapPath = path.join(root, "src", "HrvatskaPamtiMap.jsx");
const dossierPath = path.join(root, "src", "HrvatskaPamtiMjesto.jsx");
const source = await readFile(registryPath, "utf8");
const mapSource = await readFile(mapPath, "utf8");
const dossierSource = await readFile(dossierPath, "utf8");

function extractTopLevelObjects(text) {
  const arrayStart = text.indexOf("export const sites = [");
  if (arrayStart < 0) throw new Error("Ne mogu pronaći export const sites = [ u registru.");
  const start = text.indexOf("[", arrayStart) + 1;
  const objects = [];
  let objectStart = -1;
  let braceDepth = 0;
  let squareDepth = 0;
  let quote = null;
  let escaped = false;

  for (let i = start; i < text.length; i += 1) {
    const char = text[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "[") {
      squareDepth += 1;
      continue;
    }
    if (char === "]") {
      if (squareDepth === 0 && braceDepth === 0) break;
      squareDepth -= 1;
      continue;
    }
    if (char === "{" && squareDepth === 0) {
      if (braceDepth === 0) objectStart = i;
      braceDepth += 1;
      continue;
    }
    if (char === "}" && squareDepth === 0) {
      braceDepth -= 1;
      if (braceDepth === 0 && objectStart >= 0) {
        objects.push(text.slice(objectStart, i + 1));
        objectStart = -1;
      }
    }
  }
  return objects;
}

function topLevelProperties(objectText) {
  const body = objectText.slice(1, -1);
  const properties = new Map();
  let start = 0;
  let brace = 0;
  let square = 0;
  let paren = 0;
  let quote = null;
  let escaped = false;

  const save = (end) => {
    const part = body.slice(start, end).trim();
    const match = part.match(/^([A-Za-z_$][\w$]*)\s*:/);
    if (match) properties.set(match[1], part.slice(match[0].length).trim());
  };

  for (let i = 0; i < body.length; i += 1) {
    const char = body[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "{") brace += 1;
    else if (char === "}") brace -= 1;
    else if (char === "[") square += 1;
    else if (char === "]") square -= 1;
    else if (char === "(") paren += 1;
    else if (char === ")") paren -= 1;
    else if (char === "," && brace === 0 && square === 0 && paren === 0) {
      save(i);
      start = i + 1;
    }
  }
  save(body.length);
  return properties;
}

const records = extractTopLevelObjects(source).map((raw) => ({ raw, props: topLevelProperties(raw) }));
const errors = [];
const warnings = [];
const seen = new Set();

for (const { raw, props } of records) {
  const idMatch = raw.match(/^\{\s*id\s*:\s*["']([^"']+)["']/);
  const id = idMatch?.[1];
  if (!id) {
    errors.push("Zapis bez početnog ID-a: " + raw.slice(0, 100).replace(/\s+/g, " "));
    continue;
  }
  if (seen.has(id)) errors.push("Dupli ID: " + id);
  seen.add(id);

  for (const field of ["name", "period", "status", "certainty"]) {
    if (!props.has(field)) warnings.push(id + ": nedostaje polje " + field);
  }

  if (props.get("countInTotal") === "true" && !/^\d+(?:\.\d+)?\s*(?:,|$)/.test(props.get("victimsFound") ?? "")) {
    errors.push(id + ": countInTotal je true, ali victimsFound nije broj.");
  }

  const sourceUrl = props.get("sourceUrl")?.match(/^["']([^"']+)["']/)?.[1];
  if (sourceUrl) {
    try {
      const parsed = new URL(sourceUrl);
      if (parsed.protocol !== "https:") errors.push(id + ": sourceUrl mora koristiti HTTPS.");
    } catch {
      errors.push(id + ": sourceUrl nije valjan URL.");
    }
  } else {
    warnings.push(id + ": nema izravnog sourceUrl; izvor treba moći otvoriti iz zapisa.");
  }

  const coordinates = props.get("coordinates");
  if (coordinates && coordinates !== "null") {
    const lat = coordinates.match(/\blat\s*:\s*(-?\d+(?:\.\d+)?)/)?.[1];
    const lng = coordinates.match(/\b(?:lng|long)\s*:\s*(-?\d+(?:\.\d+)?)/)?.[1];
    if (lat === undefined || lng === undefined) errors.push(id + ": coordinates moraju imati lat i lng.");
    else if (Number(lat) < -90 || Number(lat) > 90 || Number(lng) < -180 || Number(lng) > 180) {
      errors.push(id + ": koordinate su izvan dopuštenog raspona.");
    }
  }
}

// Provjeri da svako mjesto prikazano na karti ima odgovarajući dosje.
const mapSlugByName = new Map([
  ["Vukovar", "vukovar"],
  ["Škabrnja", "skabrnja"],
  ["Dubrovnik", "dubrovnik"],
  ["Lika i Krbava", "lika-i-krbava"],
  ["Zagreb", "zagreb"],
  ["Knin", "knin"],
  ["Osijek", "osijek"],
  ["Sinj", "sinj"],
]);
const mapNames = [...mapSource.matchAll(/\{\s*name:\s*"([^"]+)"\s*,\s*coordinates:\s*\[\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\]/g)];
const dossierSlugs = new Set([...dossierSource.matchAll(/^\s{2}(?:"([^"]+)"|([a-z][\w-]*))\s*:\s*\{\s*name:/gm)].map((match) => match[1] ?? match[2]));
const mapSeen = new Set();
for (const match of mapNames) {
  const [, name, longitudeText, latitudeText] = match;
  const longitude = Number(longitudeText);
  const latitude = Number(latitudeText);
  if (mapSeen.has(name)) errors.push("Duplikat mjesta na karti: " + name);
  mapSeen.add(name);
  if (!mapSlugByName.has(name)) errors.push("Mjesto na karti nema mapiranje prema dosjeu: " + name);
  else if (!dossierSlugs.has(mapSlugByName.get(name))) errors.push("Mjesto na karti nema dosje: " + name);
  if (longitude < 12 || longitude > 21 || latitude < 41 || latitude > 47.5) {
    errors.push(name + ": koordinata karte je izvan očekivanog područja Hrvatske.");
  }
}
for (const name of mapSlugByName.keys()) {
  if (!mapSeen.has(name)) errors.push("Očekivano mjesto nedostaje na karti: " + name);
}

// Provjeri da svi ID-evi koje dosjei navode doista postoje u registru.
const registryIds = new Set(records.map(({ raw }) => raw.match(/^\{\s*id\s*:\s*["']([^"']+)["']/)?.[1]).filter(Boolean));
const dossierReferences = [...dossierSource.matchAll(/graveRegistryIds:\s*\[([\s\S]*?)\]/g)]
  .flatMap((match) => [...match[1].matchAll(/["']([^"']+)["']/g)].map((item) => item[1]));
for (const id of new Set(dossierReferences)) {
  if (!registryIds.has(id)) errors.push("Dosje upućuje na nepostojeći ID registra: " + id);
}

// Čuvaj provjerene brojeve za četiri slovenske lokacije i spriječi dvostruko brojanje ukopa u Maclju.
const expectedSlovenianCounts = new Map([
  ["trebce-slovenija", 10],
  ["rugarski-klanci-podstenice", 22],
  ["kosnica-pri-celju", 307],
  ["cerklje-na-krki", 161],
]);
const recordById = new Map(records.map(({ raw, props }) => [
  raw.match(/^\{\s*id\s*:\s*["']([^"']+)["']/)?.[1],
  props,
]));
let slovenianCountSum = 0;
for (const [id, expectedCount] of expectedSlovenianCounts) {
  const props = recordById.get(id);
  if (!props) {
    errors.push("Nedostaje službeno potvrđena slovenska lokacija: " + id);
    continue;
  }
  const actualCount = Number(props.get("victimsFound"));
  if (actualCount !== expectedCount) {
    errors.push(id + ": očekivano " + expectedCount + " ekshumiranih, pronađeno " + props.get("victimsFound") + ".");
  }
  if (props.get("countInTotal") !== "true") {
    errors.push(id + ": potvrđeni broj ekshumiranih mora biti uključen u zbroj nalazišta.");
  }
  slovenianCountSum += actualCount;
}
if (slovenianCountSum !== 500) {
  errors.push("Četiri slovenske lokacije moraju zbrojem dati 500 ekshumiranih; dobiveno: " + slovenianCountSum + ".");
}
const maceljRecord = recordById.get("macelj-zajednicki-ukop-2026");
if (maceljRecord && (maceljRecord.get("countInTotal") !== "false" || maceljRecord.get("countsTowardUniqueTotal") !== "false")) {
  errors.push("Macelj je odredišni ukop i kumulativni broj; ne smije se ponovno pribrajati nalazima iz Slovenije.");
}

console.log("Hrvatska pamti — provjera registra i povezivanja");
console.log("Broj zapisa:", records.length);
console.log("Jedinstvenih ID-eva:", seen.size);
console.log("Mjesta na karti:", mapSeen.size);
console.log("Poveznice dosjea prema registru:", dossierReferences.length);
console.log("Upozorenja:", warnings.length);
console.log("Pogreške:", errors.length);
for (const warning of warnings) console.warn("UPOZORENJE:", warning);
for (const error of errors) console.error("POGREŠKA:", error);

if (errors.length) process.exitCode = 1;
