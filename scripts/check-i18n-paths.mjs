#!/usr/bin/env node
// Fails when an English page and its translations (pt-BR, es) do not live at the same path.
// Mintlify's language switcher looks for the translation at `<locale>/<same path>`; when it
// is missing, that language is shown disabled on the page.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.argv[2] ?? process.cwd();
const LOCALES = ["pt-BR", "es"];
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

const localeOf = (f) => LOCALES.find((l) => f.startsWith(`${l}/`));
const problems = [];

// 1. Files: every page must have its counterpart at the same path in every language.
const files = listMdx(ROOT);
const enFiles = new Set(files.filter((f) => !localeOf(f)));
const counts = {};
for (const loc of LOCALES) {
  const locFiles = new Set(files.filter((f) => f.startsWith(`${loc}/`)).map((f) => f.slice(loc.length + 1)));
  counts[loc] = locFiles.size;
  for (const f of locFiles) if (!enFiles.has(f)) problems.push(`${loc}/${f}: no English page at ${f}`);
  for (const f of enFiles) if (!locFiles.has(f)) problems.push(`${f}: no translation at ${loc}/${f}`);
}

// 2. Navigation: every language must list the same pages.
const docs = JSON.parse(readFileSync(join(ROOT, "docs.json"), "utf8"));
const languages = docs.navigation?.languages ?? [];
const en = languages.find((l) => l.language === "en");
const navAll = new Set();
if (en) {
  const enNav = new Set(navPages(en));
  enNav.forEach((p) => navAll.add(p));
  for (const loc of LOCALES) {
    const lang = languages.find((l) => l.language === loc);
    if (!lang) {
      problems.push(`docs.json: no "${loc}" entry in navigation.languages`);
      continue;
    }
    const raw = navPages(lang);
    raw.forEach((p) => navAll.add(p));
    const locNav = new Set(raw.map((p) => (p.startsWith(`${loc}/`) ? p.slice(loc.length + 1) : p)));
    for (const p of enNav) if (!locNav.has(p)) problems.push(`docs.json: "${p}" is in the English navigation but ${loc}/${p} is not in the ${loc} navigation`);
    for (const p of locNav) if (!enNav.has(p)) problems.push(`docs.json: "${loc}/${p}" is in the ${loc} navigation but "${p}" is not in the English navigation`);
  }

  // 3. A page outside the navigation also gets the switcher disabled (the home page did, until 31/10/2026).
  for (const f of files) {
    const page = f.replace(/\.mdx$/, "");
    if (!navAll.has(page)) problems.push(`${f}: not in docs.json navigation (language switcher is disabled on pages outside it)`);
  }
}

if (problems.length) {
  console.error(`i18n path check failed (${problems.length}):`);
  for (const p of problems) console.error(`  - ${p}`);
  console.error(`\nA translation must use the SAME path as the English page (translate the title, never the slug).`);
  process.exit(1);
}
console.log(`i18n path check passed: ${enFiles.size} English pages, ${LOCALES.map((l) => `${counts[l]} ${l}`).join(", ")} pages.`);
