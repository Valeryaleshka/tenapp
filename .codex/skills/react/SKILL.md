---
name: react
description: React frontend implementation guidance for the tenapp_ui app. Use when working on React components, routes, hooks, forms, API data loading, state management, Bootstrap or React Bootstrap UI, component file structure, accessibility, responsive behavior, or frontend UX changes.
---

# React

## Component Structure

- Keep pages and routes thin; move reusable UI into components and reusable logic into hooks.
- Keep components presentational when possible.
- Derive state from props, router state, server state, or form state instead of duplicating it.
- Put every new component in its own folder and use PascalCase file names.
- Create only the colocated files needed for the component:
  - `Component.tsx`
  - `Component.interfaces.ts`
  - `Component.constants.ts`
  - `Component.helpers.ts`
  - `Component.css`
  - `Component.test.tsx`
- Keep component interfaces, styles, helpers, constants, and tests colocated inside the component folder.
- Move shared reusable files to:
  - `src/types/*`
  - `src/constants/*`
  - `src/utils/*`
  - `src/hooks/*`
  - `src/services/*`

## Data And State

- Use React Query by default for server data.
- Avoid one-off `fetch` or axios calls in components.
- Put API calls in `src/services/*`.
- Use Redux Toolkit only for shared cross-route or app-level state.
- Keep local form, modal, and transient UI state local.

## Effects

- Treat `useEffect` as an escape hatch.
- Use correct dependency arrays.
- Add cleanup for subscriptions, timers, and async flows.
- Guard async effects against stale responses or cancellation issues.

## UI Conventions

- Preserve Bootstrap and React Bootstrap patterns unless the task changes the design system.
- Build accessible, responsive UI with semantic HTML, labels, keyboard support, focus states, and no overflow.
- Use stable keys from data IDs.
- Never use array indexes as keys for mutable, filtered, sorted, or editable lists.
- Use a separate style file for separated components and import it directly in the component.
