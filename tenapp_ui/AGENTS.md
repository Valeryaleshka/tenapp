# AGENTS.md

Applies to the frontend app in `tenapp_ui`.

## Frontend Rules

- Use the React, TypeScript, and Testing skills for implementation guidance.
- Keep pages/routes thin. Put UI in components, logic in hooks, and API calls in `src/services/*`.
- Model backend API payloads with explicit TypeScript interfaces matching backend JSON.
- Preserve Bootstrap / React Bootstrap patterns unless the task changes the design system.
- Use `VITE_*` env vars for environment-specific values; never hardcode deployment URLs or secrets.
- Use a separate style file for separated components and import it directly in the component.
