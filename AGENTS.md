# Codex Instructions

These instructions apply to the whole monorepo (`tenapp_api` and `tenapp_ui`).

## General

- Prefer small, focused changes over large rewrites.
- Keep code readable and explicit.
- Do not break existing API contracts unless explicitly requested.
- Add or update tests when behavior changes.
- Keep security in mind for auth, validation, and secrets.

## React / Frontend Best Practices (`tenapp_ui`)

- Use TypeScript strict typing; avoid `any`.
- Keep UI components presentational when possible; move API logic to services.
- Reuse existing service modules (`src/services/*`) for HTTP calls.
- Handle async errors in UI and avoid unhandled promise rejections.
- Keep forms controlled and validate user input before sending to API.
- Avoid duplicated state; derive state when possible.
- Use `useEffect` dependencies correctly and avoid unnecessary re-renders.
- Prefer composition and small reusable components over large monolithic ones.
- Keep routes/pages thin and move reusable logic to hooks/services.
- Use consistent naming for DTOs/interfaces matching backend payloads.

## .NET / Backend Best Practices (`tenapp_api`)

- Keep controllers thin; put business rules in services when logic grows.
- Validate input DTOs and return meaningful HTTP status codes.
- Scope data access by current authenticated user for all protected resources.
- Use async EF Core methods (`ToListAsync`, `FirstOrDefaultAsync`, etc.).
- Use `AsNoTracking()` for read-only queries.
- Keep entity configuration in `AppDbContext` consistent (constraints, indexes, lengths).
- Add migrations for schema changes and keep model snapshot up to date.
- Never hardcode secrets; use config files/env vars and local overrides.
- Preserve JWT/cookie auth behavior unless explicitly asked to change it.
- Log failures with actionable context, but never log sensitive tokens/passwords.

## API Contract Discipline

- If backend DTO changes, update frontend service types in the same task.
- Keep naming stable (`camelCase` in JSON responses expected by UI).
- For breaking API changes, document required frontend updates in PR/summary.

## Definition of Done

- Code compiles (`dotnet build`, TypeScript build/check where possible).
- New endpoints are reachable and consistent with auth requirements.
- Frontend interactions for changed flows are wired end-to-end.
- Migration files are generated for DB schema changes.
