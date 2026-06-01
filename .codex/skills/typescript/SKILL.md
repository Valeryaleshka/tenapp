---
name: typescript
description: TypeScript implementation guidance for tenapp. Use when adding or modifying TypeScript types, React props, API payload interfaces, service responses, helpers, constants, strict typing, error handling, or frontend model contracts.
---

# TypeScript

## Type Safety

- Use strict TypeScript.
- Model API payloads with explicit interfaces matching backend JSON.
- Avoid `any`, unsafe casts, non-null assertions without proof, and broad type assertions.
- Prefer narrowing, discriminated unions, typed helpers, and explicit return types where they clarify contracts.
- Keep interfaces close to the code they describe unless they are shared across the app.
- Put shared types in `src/types/*`.

## Naming

- Use PascalCase for components and types.
- Use camelCase for helpers, variables, and functions.
- Use UPPER_SNAKE_CASE for constant objects.

## API Contracts

- Keep frontend DTOs aligned with backend response casing and shape.
- Prefer stable `camelCase` JSON contracts.
- Do not silently ignore unknown or missing critical fields.
- Keep environment-specific values in `VITE_*` variables.
- Never hardcode deployment URLs or secrets.

## Error Handling

- Avoid broad `try/catch` blocks.
- Do not swallow errors silently.
- Preserve useful error context without logging secrets, tokens, cookies, API keys, auth headers, or passwords.
