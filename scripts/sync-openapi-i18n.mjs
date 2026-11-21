#!/usr/bin/env node
// Builds the Spanish OpenAPI specs (openapi*.es.json) from the English specs plus a
// translation memory (i18n/openapi.es.strings.json: English string -> Spanish string).
// Only human-readable `summary`, `description` and `title` strings are translated; paths,
// operation ids, schemas, enums and examples are copied from the English spec unchanged.
//
//   node scripts/sync-openapi-i18n.mjs          regenerate the .es.json files
//   node scripts/sync-openapi-i18n.mjs --check  fail if a string has no translation or a
//                                               generated file is out of date (CI)
//   node scripts/sync-openapi-i18n.mjs --missing  print the untranslated strings as JSON
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SPECS = ["openapi.json", "openapi.meta.json", "openapi.evolution-v2.json", "openapi.evolution-go.json"];
const KEYS = new Set(["summary", "description", "title"]);
const SKIP = new Set(["example", "examples", "default", "enum", "const", "x-codeSamples"]);
const MEMORY = join(ROOT, "i18n/openapi.es.strings.json");
const mode = process.argv[2] ?? "";

function walk(node, fn, parent) {
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) walk(node[i], fn, parent);
  } else if (node && typeof node === "object") {
    for (const k of Object.keys(node)) {
      if (SKIP.has(k)) continue;
      const v = node[k];
      if (KEYS.has(k) && typeof v === "string" && parent !== "properties") node[k] = fn(v);
      else walk(v, fn, k);
    }
  }
}

const memory = JSON.parse(readFileSync(MEMORY, "utf8"));
const missing = new Set();
const stale = [];
for (const spec of SPECS) {
  const doc = JSON.parse(readFileSync(join(ROOT, spec), "utf8"));
  walk(doc, (s) => {
    if (!s.trim()) return s;
    if (!(s in memory)) {
      missing.add(s);
      return s; // falls back to English
    }
    return memory[s];
  });
  const out = JSON.stringify(doc, null, 2) + "\n";
  const target = join(ROOT, spec.replace(/\.json$/, ".es.json"));
  if (mode === "--check") {
    if (!existsSync(target) || readFileSync(target, "utf8") !== out) stale.push(target);
  } else if (mode !== "--missing") writeFileSync(target, out);
}

if (mode === "--missing") {
  console.log(JSON.stringify([...missing], null, 1));
  process.exit(0);
}
if (missing.size) {
  console.error(`${missing.size} English OpenAPI string(s) have no Spanish translation in i18n/openapi.es.strings.json.`);
  console.error(`Run: node scripts/sync-openapi-i18n.mjs --missing  (translate, add to the memory, re-run without flags)`);
}
if (stale.length) console.error(`Out of date, regenerate with node scripts/sync-openapi-i18n.mjs:\n  ${stale.join("\n  ")}`);
if (mode === "--check" && (missing.size || stale.length)) process.exit(1);
if (!missing.size && !stale.length) console.log(`openapi es sync ok: ${Object.keys(memory).length} strings, ${SPECS.length} specs.`);
