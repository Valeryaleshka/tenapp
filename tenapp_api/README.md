# Tenapp Core API

Backend API for authentication and property management.

## Stack

- .NET 9 (ASP.NET Core Web API)
- Entity Framework Core + PostgreSQL
- JWT auth with HttpOnly cookies
- Swagger/OpenAPI in Development

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
docker compose up
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

## Useful Commands

Start only database tools:

```powershell
docker compose up -d postgres pgadmin
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
