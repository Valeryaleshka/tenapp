# Codex Instructions

These instructions apply to `tenapp_api` only.

## General

- Prefer small, focused changes over large rewrites.
- Keep code readable, explicit, and easy to review.
- Do not break existing API contracts unless explicitly requested.
- Add or update tests when behavior changes.
- Keep security in mind for auth, validation, authorization, and secrets.
- Prefer framework-supported patterns over custom infrastructure unless the repo already has a clear abstraction.


## .NET / Backend Best Practices (`tenapp_api`)

- Keep controllers thin; put business rules in services when logic grows.
- Validate input DTOs with data annotations, endpoint filters, or explicit validation services, and return meaningful HTTP status codes.
- Scope data access by the current authenticated user for all protected resources.
- Use async EF Core methods (`ToListAsync`, `FirstOrDefaultAsync`, `SaveChangesAsync`, etc.) and pass `CancellationToken` through request, service, and data-access layers where practical.
- Use `AsNoTracking()` for read-only EF Core queries; use tracking only when updating entities in the same unit of work.
- Prefer projection DTOs over returning EF entities directly from API endpoints.
- Avoid lazy loading in API flows; use explicit `Include`, projection, or separate queries to prevent accidental N+1 behavior.
- Keep entity configuration in `AppDbContext` consistent, including required fields, lengths, unique constraints, indexes, relationships, and delete behavior.
- Add migrations for schema changes and keep the model snapshot up to date.
- Use nullable reference types seriously: avoid suppressing nullability warnings unless the invariant is documented by code structure.
- Prefer dependency injection and typed options (`IOptions<T>`, `IOptionsSnapshot<T>`, or `IOptionsMonitor<T>`) over direct configuration reads spread through the codebase.
- Use `HttpClientFactory` or typed clients for outbound HTTP calls; avoid manually newing long-lived or per-request `HttpClient` instances.
- Preserve JWT/cookie auth behavior unless explicitly asked to change it.
- Authorize at the endpoint/controller level and re-check ownership in service/data queries for user-owned resources.
- Never hardcode secrets; use configuration, environment variables, user secrets for local development, and deployment secret stores.
- Do not log sensitive values such as passwords, tokens, cookies, API keys, or full authorization headers.
- Log failures with actionable context, correlation/request identifiers when available, and enough detail to debug without exposing sensitive data.
- Prefer structured logging placeholders over string interpolation in logs.
- Use `ProblemDetails`-style error responses for predictable API errors when it fits the existing API style.
- Keep OpenAPI/Swagger metadata accurate when endpoints, auth requirements, request DTOs, or response DTOs change.
- Prefer current LTS/STS .NET and package versions supported by the project; upgrade deliberately with build and test verification.
- Keep analyzers and compiler warnings meaningful; fix warnings instead of hiding them unless there is a documented reason.
- For background work, use hosted services, queues, or durable infrastructure instead of fire-and-forget tasks from request handlers.
- For time-sensitive code, inject `TimeProvider` where testability matters instead of calling `DateTime.UtcNow` directly throughout business logic.
- Use `DateTimeOffset` for externally visible timestamps unless the existing contract requires another type.
- Keep API responses stable and use `camelCase` JSON naming expected by the frontend.

## Testing / Quality

- Run `dotnet build` after backend changes when possible.
- Run targeted tests first, then broader test suites when shared behavior or infrastructure changes.
- Add unit tests for business rules and integration-style tests for API/EF behavior when practical.
- Test authorization, ownership filtering, validation failures, and success paths for protected endpoints.
- Keep tests deterministic: avoid real clocks, random values, network calls, or environment-specific state unless explicitly controlled.

## API Contract Discipline

- If backend DTOs change, update frontend service types in the same task.
- Keep naming stable (`camelCase` in JSON responses expected by UI).
- For breaking API changes, document required frontend updates in PR/summary.
- Prefer additive API changes over breaking changes when existing clients may depend on behavior.

## Definition of Done

- Code compiles (`dotnet build`, TypeScript build/check where possible).
- New endpoints are reachable and consistent with auth requirements.
- Frontend interactions for changed flows are wired end-to-end.
- Migration files are generated for DB schema changes.
- Tests relevant to the changed behavior pass, or any skipped verification is called out clearly.
