# AGENTS.md

Applies to the whole monorepo: `tenapp_api` and `tenapp_ui`.

## Repository Rules
- Make small, focused changes. Preserve existing behavior, API contracts, auth, and UX unless asked.
- Deliver working code, not only a plan. Use reasonable assumptions; ask only when blocked.
- Follow existing patterns before adding new abstractions. Reuse helpers/services instead of duplicating logic.
- Preserve type safety and error visibility. Avoid broad `try/catch`, silent failures, and swallowed errors.
- Never hardcode secrets or log passwords, tokens, cookies, API keys, or auth headers.
- Do not use destructive git commands or revert user changes unless explicitly requested.

## Workflow
- Prefer dedicated tools over shell commands. Use `rg`/`rg --files` for search when available.
- Read enough context before editing. Batch related edits; avoid repeated micro-patches.
- Use `apply_patch` for manual file edits when practical.
- For new feature work, create a new branch instead of committing directly to `main`.
- Open a pull request targeting `main` after pushing new feature changes.
- Add or update tests when behavior changes.
- Final response: concise summary, changed paths, verification run or skipped.
