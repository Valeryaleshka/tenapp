# Tenapp UI

Frontend application for authentication and property management.

## Stack

- React 19 + TypeScript
- Vite
- React Router
- Axios + cookie-based auth flow
- React Bootstrap

## Local Prerequisites

- Node.js 20+
- npm 10+

## Install

```powershell
npm install
```


## Run Locally

```powershell
npm run dev
```

App URL:

- `http://localhost:3000`

## Backend Connection

Vite proxy is configured in [vite.config.ts](D:/tenapp/tenapp_ui/vite.config.ts):

- `/api` -> `http://localhost:3001`

So for local development, run backend API on `http://localhost:3001` (recommended mode in API README).

## Build

```powershell
npm run build
```

Preview production build:

```powershell
npm run preview
```

## Scripts

- `npm run dev`: start dev server
- `npm run build`: type-check + production build
- `npm run lint`: run ESLint
- `npm run preview`: preview built app

## Notes

- API client uses `withCredentials: true`, so auth relies on cookies from backend.
- If login appears stuck, verify backend is running and CORS/proxy target is reachable.
