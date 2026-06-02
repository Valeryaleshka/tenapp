---
name: testing
description: Verification and testing guidance for the tenapp monorepo. Use after backend or frontend behavior changes, when adding tests, when deciding which checks to run, or when reporting skipped, failed, or environment-blocked validation.
---

# Testing

## General

- Add or update tests when behavior changes.
- Run targeted checks first, then broader checks when feasible.
- If checks are skipped or fail for environment reasons, state exactly what was skipped or failed and why.
- Preserve verification output that matters in the final response.
- Verification is manual through this skill; project-local Codex Stop hooks are disabled.

## Backend Checks

After backend changes, run when feasible:

```powershell
dotnet build tenapp-core.csproj
dotnet test TenappCore.Tests\TenappCore.Tests.csproj
```

Run backend commands from `tenapp_api`. If a narrower relevant test exists, run it before broader backend checks.

## Frontend Checks

After frontend changes, run when feasible:

```powershell
npm run format
npm run lint
npm run build
```

Run frontend commands from `tenapp_ui`. Run relevant frontend tests when they exist. If `package.json` has no test script, say that frontend tests were skipped because no test script exists.
