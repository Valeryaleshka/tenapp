# Tenapp Core API

Backend Part of Property Managment Application

## Stack

- .NET 9 (ASP.NET Core Web API)
- Entity Framework Core + PostgreSQL
- JWT auth with HttpOnly cookies
- Swagger

## Local Prerequisites

- .NET SDK 9+
- Docker Desktop
- `dotnet-ef` tool

Install EF CLI (once):

```powershell
dotnet tool install --global dotnet-ef
```

## Quick Start (Recommended for UI integration)

This mode runs database in Docker and API locally on `http://localhost:3001` (matches UI proxy config).

1. Start infra:

```powershell
docker compose up -d postgres
```

2. Apply migrations:

```powershell
dotnet ef database update
```

3. Run API:

```powershell
dotnet build
dotnet run
```

4. Open Swagger:

- `http://localhost:3001/swagger`

## Full Docker Run (API + DB + pgAdmin)

```powershell
docker compose up -d --build
```

Services:

- API: `http://localhost:8080`
- PostgreSQL: `localhost:5432`
- pgAdmin: `http://localhost:5050`
  - Email: `admin@tenapp-core.com`
  - Password: `admin123`

Stop:

```powershell
docker compose down
```

## HTTPS on EC2 (host nginx + existing cert files)

Use host-installed nginx with repo config file `nginx/nginx.config`:

- redirects `http://` to `https://`
- terminates TLS with:
  - `/home/ec2-user/nginx/certs.pem`
  - `/home/ec2-user/nginx/key.pem`
- proxies traffic to API on `127.0.0.1:8080`

Install and apply config:

```bash
sudo cp nginx/nginx.config /etc/nginx/conf.d/tenapp.conf
sudo nginx -t
sudo systemctl reload nginx
```

## Useful Commands

Start only database:

```powershell
docker compose up -d postgres
```

Start everything (API + DB + pgAdmin):

```powershell
docker compose up -d --build
```

Apply migrations:

```powershell
dotnet ef database update 
```

Run API locally (http profile):

```powershell
dotnet run
```

Stop containers:

```powershell
docker compose down
```

## Tests

Unit tests live in [TenappCore.Tests](D:/tenapp/tenapp_api/TenappCore.Tests/TenappCore.Tests.csproj) and use xUnit.net with EF Core InMemory.

The current suite covers:

- Auth, tenant, and property controller result mapping and validation
- Auth service registration, login, refresh, password reset, account update, and logout flows
- Cookie token generation, validation, hashing, and cookie writes
- Current user resolution, normalization helpers, Mailgun configuration validation, and email queue enqueue behavior

Run tests:

```powershell
dotnet test TenappCore.Tests\TenappCore.Tests.csproj
```

If the API is already running locally and locks `bin\Debug`, run tests with isolated output folders:

```powershell
dotnet test TenappCore.Tests\TenappCore.Tests.csproj /p:BaseOutputPath=artifacts\test-bin\ /p:BaseIntermediateOutputPath=artifacts\test-obj\
```

## Configuration

- Main config: [appsettings.json](D:/tenapp/tenapp_api/appsettings.json)
- Development overrides: [appsettings.Development.json](D:/tenapp/tenapp_api/appsettings.Development.json)
- Local secrets/overrides: `appsettings.Local.json` (ignored by git)

Default DB connection for local run:

- `Host=localhost;Port=5432;Database=tenapp_core_db;Username=postgres;Password=postgres123`

## API Notes

- Auth routes: `/api/auth/*`
- Property routes: `/api/properties`
- In Development, EF migrations are auto-applied on API startup.
