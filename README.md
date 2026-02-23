# Tenapp Monorepo

Monorepo containing the Tenapp backend API and frontend UI.

## Projects

## `tenapp_api`

ASP.NET Core Web API for:

- Authentication (register/login/refresh/logout/forgot/reset password)
- Property management (`/api/properties`)
- PostgreSQL + Entity Framework Core migrations

Detailed guide:

- [tenapp_api/README.md](D:/tenapp/tenapp_api/README.md)

## `tenapp_ui`

React + TypeScript + Vite application for:

- User authentication screens
- Property table with add/edit modal flow and delete action in edit modal
- API integration through `/api` proxy

Detailed guide:

- [tenapp_ui/README.md](D:/tenapp/tenapp_ui/README.md)

## Quick Start (Local Development)

1. Start backend infrastructure and API:

```powershell
cd /tenapp_api
docker compose up -d postgres pgadmin
dotnet ef database update --project .\tenapp-core.csproj
dotnet build
dotnet run
```

2. Start frontend:

```powershell
cd /tenapp_ui
npm install
npm run dev
```

If PowerShell blocks npm scripts, use `npm.cmd` equivalents.

## Default Local URLs

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`
- Swagger: `http://localhost:3001/swagger`
- PostgreSQL: `localhost:5432`
- pgAdmin: `http://localhost:5050`

## Repository Layout

```text
tenapp/
  tenapp_api/   # .NET backend
  tenapp_ui/    # React frontend
```
