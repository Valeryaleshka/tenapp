---
name: aspnet
description: ASP.NET Core backend implementation guidance for the tenapp_api app. Use when working on controllers, services, DTOs, EF Core queries, migrations, authentication, authorization, dependency injection, configuration, logging, Swagger, timestamps, or backend API behavior.
---

# ASP.NET Core

## Architecture

- Keep controllers thin.
- Put business rules in services.
- Use DI for services and infrastructure dependencies.
- Use typed options for configuration.
- Use `HttpClientFactory` for outbound HTTP clients.
- Use structured logging.
- Preserve existing API contracts, auth behavior, and error style.

## DTOs And API Responses

- Validate DTOs.
- Return meaningful HTTP status codes using the existing error style.
- Prefer projection DTOs over returning EF entities.
- Keep stable `camelCase` JSON responses.
- Keep Swagger and frontend DTOs in sync with backend API changes.

## Authorization And Data Scope

- Scope protected data by authenticated user.
- Authorize protected endpoints.
- Re-check ownership in queries and service operations.
- Never rely only on client-provided identifiers for protected data access.

## EF Core

- Use async EF Core APIs with `CancellationToken` where practical.
- Use `AsNoTracking()` for read-only queries.
- Avoid lazy loading and accidental N+1 queries.
- Keep `AppDbContext` config, migrations, and model snapshot in sync.

## Time

- Prefer `DateTimeOffset` for external timestamps.
- Use `TimeProvider` where testability matters.
