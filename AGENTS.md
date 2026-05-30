# AGENTS.md

Applies to the whole monorepo: `tenapp_api` and `tenapp_ui`.

## Core Rules
- Make small, focused changes. Preserve existing behavior, API contracts, auth, and UX unless asked.
- Deliver working code, not only a plan. Use reasonable assumptions; ask only when blocked.
- Follow existing patterns before adding new abstractions. Reuse helpers/services instead of duplicating logic.
- Keep type safety. Avoid `any`, unsafe casts, broad `try/catch`, silent failures, and swallowed errors.
- Never hardcode secrets or log passwords, tokens, cookies, API keys, or auth headers.
- Do not use destructive git commands or revert user changes unless explicitly requested.

## Tools & Workflow
- Prefer dedicated tools over shell commands. Use `rg`/`rg --files` for search when available.
- Read enough context before editing. Batch related edits; avoid repeated micro-patches.
- Use `apply_patch` for manual file edits when practical.
- Add/update tests when behavior changes. Run targeted checks first, then broader checks when needed.
- Final response: concise summary, changed paths, verification run or skipped.

## Backend: `tenapp_api`
- Keep controllers thin; put business rules in services.
- Validate DTOs and return meaningful HTTP status codes / existing error style.
- Scope protected data by authenticated user; authorize endpoints and re-check ownership in queries.
- Use async EF Core with `CancellationToken` where practical; use `AsNoTracking()` for read-only queries.
- Prefer projection DTOs over returning EF entities. Avoid lazy loading and accidental N+1 queries.
- Keep `AppDbContext` config, migrations, model snapshot, Swagger, and frontend DTOs in sync.
- Use DI, typed options, `HttpClientFactory`, structured logging, and stable `camelCase` JSON responses.
- Prefer `DateTimeOffset` for external timestamps; use `TimeProvider` where testability matters.

## Frontend: `tenapp_ui`
- Use strict TypeScript. Model API payloads with explicit interfaces matching backend JSON.
- Keep pages/routes thin. Put UI in components, logic in hooks, API calls in `src/services/*`.
- Use React Query by default for server data. Avoid one-off `fetch`/axios calls in components.
- Keep components presentational when possible. Derive state instead of duplicating props/router/store/form data.
- Treat `useEffect` as an escape hatch. Use correct deps, cleanup, cancellation/stale-response guards.
- Use Redux Toolkit only for shared cross-route/app state; keep local form/modal state local.
- Preserve Bootstrap / React Bootstrap patterns unless the task changes the design system.
- Build accessible, responsive UI: semantic HTML, labels, keyboard support, focus states, no overflow.
- Avoid unsafe HTML injection; sanitize and document if `dangerouslySetInnerHTML` is unavoidable.
- Use `VITE_*` env vars for environment-specific values; never hardcode deployment URLs/secrets.
- Use a separate style file for separated components and import it directly in the component.

## React File Structure
- Keep component files small. Move reusable helpers, interfaces, constants, API logic, and large transformations out of `.tsx`.
- Put every new component in its own folder and use PascalCase file names.
- Local component folder files: `Component.tsx`, `Component.interfaces.ts`, `Component.constants.ts`, `Component.helpers.ts`, `Component.css`, `Component.test.tsx`. Create only the files that are needed for that component.
- Keep component interfaces, styles, helpers, constants, and tests colocated inside the component folder instead of placing them beside unrelated components.
- Shared files: `src/types/*`, `src/constants/*`, `src/utils/*`, `src/hooks/*`, `src/services/*`.
- Use PascalCase for components, camelCase for helpers, and UPPER_SNAKE_CASE for constant objects.
- Prefer stable keys from data IDs; never use array indexes for mutable, filtered, sorted, or editable lists.

## Checks
- Backend: run `dotnet build` and relevant tests after backend changes when feasible.
- Frontend: run `npm run format`, `npm run lint`, `npm run build`, and relevant tests after frontend changes when feasible.
- If checks are skipped or fail for environment reasons, state exactly what was skipped/failed and why.
