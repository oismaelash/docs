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

- Every `pt-BR/` page must live at the **same path** as its English page: `playground/numbers/list-numbers.mdx` ↔ `pt-BR/playground/numbers/list-numbers.mdx`. Translate the `title`, never the slug. If the paths differ, the language switcher cannot find the counterpart and shows **Português (BR)** disabled on that page.
- When renaming a slug, add a permanent entry to `redirects` in `docs.json`.
- `node scripts/check-i18n-paths.mjs` checks both rules (files and `docs.json` navigation); the `i18n paths` workflow runs it on every PR and fails it on any mismatch.
