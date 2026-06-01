# AGENTS.md

Applies to the backend app in `tenapp_api`.

## Backend Rules
- Use the ASP.NET and Testing skills for implementation guidance.
- Keep controllers thin; put business rules in services.
- Validate DTOs and return meaningful HTTP status codes using the existing error style.
- Scope protected data by authenticated user; authorize endpoints and re-check ownership in queries.
- Keep `AppDbContext` config, migrations, model snapshot, Swagger, and frontend DTOs in sync.
