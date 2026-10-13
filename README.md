# Smart Inventory Frontend

React, TypeScript, and Vite user interface. Requires Node.js 18+ and the backend API running at `http://localhost:8081`.

Copy `.env.example` to `.env` and set `VITE_API_BASE_URL=https://your-api-host/api` when the backend is hosted elsewhere. `VITE_API_BASE_URL` is embedded at build time.

## Install and run

```powershell
npm ci
npm run dev
```

Vite serves the application at `http://localhost:4200`.

## Build

```powershell
npm run build
```

## Publish this folder separately

Create a GitHub repository, then run these commands from this folder:

```powershell
git init -b main
git add .
git commit -m "Initial frontend commit"
git remote add origin <your-frontend-repository-url>
git push -u origin main
```
