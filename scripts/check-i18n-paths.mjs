#!/usr/bin/env node
// Fails when an English page and its pt-BR translation do not live at the same path.
// Mintlify's language switcher looks for the translation at `pt-BR/<same path>`; when it
// is missing, "Português (BR)" is shown disabled on that page.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.argv[2] ?? process.cwd();
const PT = "pt-BR";
// Pages that intentionally exist in a single language.
const SINGLE_LANGUAGE = new Set(["index.mdx"]);
const SKIP_DIRS = new Set([".git", ".github", "node_modules", "scripts", "snippets", "images"]);

function listMdx(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) listMdx(full, out);
    else if (name.endsWith(".mdx")) out.push(relative(ROOT, full).split("\\").join("/"));
  }
  return out;
}

function navPages(node, acc = []) {
  if (typeof node === "string") acc.push(node);
  else if (Array.isArray(node)) node.forEach((n) => navPages(n, acc));
  else if (node && typeof node === "object") {
    for (const key of ["tabs", "anchors", "dropdowns", "menu", "groups", "pages"]) {
      if (key in node) navPages(node[key], acc);
    }
  }
  return acc;
}

const problems = [];

// 1. Files: every page must have its counterpart at the same path.
const files = listMdx(ROOT);
const ptFiles = new Set(files.filter((f) => f.startsWith(`${PT}/`)).map((f) => f.slice(PT.length + 1)));
const enFiles = new Set(files.filter((f) => !f.startsWith(`${PT}/`)));
for (const f of ptFiles) if (!enFiles.has(f)) problems.push(`${PT}/${f}: no English page at ${f}`);
for (const f of enFiles) {
  if (!ptFiles.has(f) && !SINGLE_LANGUAGE.has(f)) problems.push(`${f}: no translation at ${PT}/${f}`);
}

// 2. Navigation: both languages must list the same pages.
const docs = JSON.parse(readFileSync(join(ROOT, "docs.json"), "utf8"));
const languages = docs.navigation?.languages ?? [];
const en = languages.find((l) => l.language === "en");
const pt = languages.find((l) => l.language === PT);
if (en && pt) {
  const enNav = new Set(navPages(en));
  const ptNav = new Set(navPages(pt).map((p) => (p.startsWith(`${PT}/`) ? p.slice(PT.length + 1) : p)));
  for (const p of enNav) if (!ptNav.has(p)) problems.push(`docs.json: "${p}" is in the English navigation but ${PT}/${p} is not in the ${PT} navigation`);
  for (const p of ptNav) if (!enNav.has(p)) problems.push(`docs.json: "${PT}/${p}" is in the ${PT} navigation but "${p}" is not in the English navigation`);
}

if (problems.length) {
  console.error(`i18n path check failed (${problems.length}):`);
  for (const p of problems) console.error(`  - ${p}`);
  console.error(`\nA translation must use the SAME path as the English page (translate the title, never the slug).`);
  process.exit(1);
}
console.log(`i18n path check passed: ${enFiles.size} English pages, ${ptFiles.size} ${PT} pages.`);
