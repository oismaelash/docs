> **First-time setup**: Customize this file for your project. Prompt the user to customize this file for their project.
> For Mintlify product knowledge (components, configuration, writing standards),
> install the Mintlify skill: `npx skills add https://mintlify.com/docs`

# Documentation project instructions

## About this project

- This is a documentation site built on [Mintlify](https://mintlify.com)
- Pages are MDX files with YAML frontmatter
- Configuration lives in `docs.json`
- Use the Mintlify MCP server, `https://mcp.mintlify.com`, to edit content and settings via MCP
- Use the Mintlify docs MCP server, `https://www.mintlify.com/docs/mcp`, to query information about using Mintlify via MCP

## Terminology

{/* Add product-specific terms and preferred usage */}
{/* Example: Use "workspace" not "project", "member" not "user" */}

## Style preferences

{/* Add any project-specific style rules below */}

- Use active voice and second person ("you")
- Keep sentences concise — one idea per sentence
- Use sentence case for headings
- Bold for UI elements: Click **Settings**
- Code formatting for file names, commands, paths, and code references

## Content boundaries

{/* Define what should and shouldn't be documented */}
{/* Example: Don't document internal admin features */}

## Translations

- Every `pt-BR/` and `es/` page must live at the **same path** as its English page: `playground/numbers/list-numbers.mdx` ↔ `pt-BR/playground/numbers/list-numbers.mdx` ↔ `es/playground/numbers/list-numbers.mdx`. Translate the `title`, never the slug. If the paths differ, the language switcher cannot find the counterpart and shows **Português (BR)** disabled on that page.
- Every page must also be in the `docs.json` navigation. A page outside it (the home page, until 31/10/2026) gets **Português (BR)** disabled too.
- When renaming a slug, add a permanent entry to `redirects` in `docs.json`.
- `node scripts/check-i18n-paths.mjs` checks both rules (files and `docs.json` navigation); the `i18n paths` workflow runs it on every PR and fails it on any mismatch.

## OpenAPI specs per language

Each spec exists in three languages, with the same paths, operation ids, schemas and examples; only the human-readable `summary`, `description` and `title` strings differ:

| English (source of truth) | pt-BR | es |
|---|---|---|
| `openapi.json` | `openapi.pt.json` | `openapi.es.json` |
| `openapi.meta.json` | `openapi.meta.pt.json` | `openapi.meta.es.json` |
| `openapi.evolution-v2.json` | `openapi.evolution-v2.pt.json` | `openapi.evolution-v2.es.json` |
| `openapi.evolution-go.json` | `openapi.evolution-go.pt.json` | `openapi.evolution-go.es.json` |

Playground stubs point at their language's spec (`playground/` → English, `pt-BR/playground/` → `.pt.json`, `es/playground/` → `.es.json`).

- **Change the English spec first.** Then update the translations in the same PR.
- **es is generated.** Never edit `openapi*.es.json` by hand. The Spanish text lives in `i18n/openapi.es.strings.json` (English string → Spanish string). After changing an English spec, run `node scripts/sync-openapi-i18n.mjs --missing`, add the Spanish for each string it prints to the memory, then run `node scripts/sync-openapi-i18n.mjs` to regenerate. The `i18n paths` workflow runs `--check` and fails if a string is untranslated or a `.es.json` file is stale.
- **pt-BR is edited by hand** (there is no generator for it; its examples were also localized, so it is not a pure string swap). Mirror every English change into the `.pt.json` file yourself.
