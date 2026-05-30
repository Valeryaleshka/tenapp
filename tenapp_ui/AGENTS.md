# Codex Instructions

These to `tenapp_ui` only.

## General

- Prefer small, focused changes over large rewrites.
- Keep code readable and explicit.
- Do not break existing API contracts unless explicitly requested.
- Add or update tests when behavior changes.
- Keep security in mind for auth, validation, and secrets.

## React / Frontend Best Practices (`tenapp_ui`)

- Use TypeScript strict typing; avoid `any`, unchecked casts, and broad object types. Model API payloads with explicit DTO interfaces that match backend JSON.
- Keep UI components presentational when possible. Move HTTP calls, storage access, auth wiring, and data normalization into `src/services/*`, hooks, or route loaders/actions.
- Reuse existing service modules (`src/services/*`) for HTTP calls. Do not create one-off axios/fetch calls inside components unless there is no reusable boundary yet.
- Keep routes/pages thin. Put reusable UI in components, reusable behavior in hooks, and reusable data access in services.
- Prefer composition and small components over large monolithic components. Split when a component owns unrelated state, effects, or rendering branches.
- Keep forms controlled where practical and validate user input before sending it to the API. Prefer React Hook Form for non-trivial forms already using it.
- Handle async errors in UI. Show recoverable error states, avoid unhandled promise rejections, and do not silently swallow failed requests.
- Use `AbortController`, request cancellation, or an equivalent stale-response guard for async work that can outlive a component, route, or current query.
- Avoid duplicated state. Derive values during render or with selectors instead of mirroring props, router params, Redux state, or form state in local state.
- Treat `useEffect` as an escape hatch for synchronizing with external systems, not for deriving render data. Prefer event handlers, render-time derivation, route loaders/actions, or service-level data functions first.
- Use `useEffect` dependencies correctly. Do not suppress hook lint rules without a local explanation and a safer alternative being impractical.
- Keep Effects small and idempotent. Always clean up subscriptions, timers, observers, sockets, and imperative third-party integrations.
- Use React 19 features deliberately. Prefer Actions / `useActionState` / `useOptimistic` for form or mutation flows only when they simplify the existing code; do not mix patterns in the same flow without a reason.
- Do not overuse `useMemo`, `useCallback`, or `React.memo`. Measure first, memoize expensive work or unstable props when it matters, and account for React Compiler-era automatic memoization if the build enables it later.
- Keep component renders pure. Do not mutate props, global state, service singletons, or browser storage during render.
- Keep state local by default. Use Redux Toolkit for shared, cross-route, or cached application state; avoid putting transient form or modal state in global stores.
- Use typed Redux hooks/selectors and Redux Toolkit patterns. Prefer selectors for derived state and keep reducers free of side effects.
- Use React Router data APIs where they improve routing, loading, redirects, or mutation flows. Keep navigation state and URL query params as the source of truth for shareable filters/searches.
- Keep accessibility built in: semantic HTML first, correct labels, keyboard support, focus management for dialogs/navigation, visible focus states, and ARIA only when native semantics are not enough.
- Preserve responsive behavior. Test changed layouts at mobile and desktop sizes, and ensure text does not overflow buttons, cards, tables, or navigation.
- Keep visual implementation consistent with the existing Bootstrap / React Bootstrap usage unless a task explicitly changes the design system.
- Prefer stable keys from data IDs. Never use array indexes as keys for mutable, filtered, sorted, or user-editable lists.
- Avoid unsafe HTML injection. If `dangerouslySetInnerHTML` is unavoidable, sanitize input at the boundary and document why it is safe.
- Keep environment-specific values in Vite environment variables (`VITE_*`) and never hardcode secrets or deployment-only URLs in source.
- Add focused tests for changed behavior when the project has a matching test setup. For UI behavior, cover user-visible outcomes, loading states, error states, and authorization-sensitive flows.
- Run `npm run format`,`npm run build` and `npm run lint` after frontend changes when feasible. Note any command that could not be run.
- Use React query bu default for data fetching.
# React Project Structure Rules

## File organization

Keep React files small, focused, and easy to navigate.

Do not place helpers, interfaces, constants, API functions, or large business logic directly inside component files unless they are truly local and very small.

Preferred structure:
for components, services, helpers, hooks.

```text
src/
  components/
    ComponentName/
      ComponentName.tsx
      ComponentName.constants.ts
      ComponentName.helpers.ts
      ComponentName.interfaces.ts
