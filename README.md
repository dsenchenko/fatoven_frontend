# Fatoven Frontend

Personal health-tracking web app for Fatoven. Connects to the Fatoven REST API for daily metrics, weekly summaries, and check-ins.

## Prerequisites

- Node.js 18+
- [Fatoven API](http://localhost:3001) running locally

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Environment

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | API base URL (default: `http://localhost:3001`) |

Copy `.env.production.example` to `.env.production` before production build.

## Production deploy

**Backend:** Docker — see `../fatoven_backend/DEPLOY.md`  
**Frontend:** PM2 — see [`../DEPLOY.md`](../DEPLOY.md)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Features

- **Auth** — Register, login, JWT in `localStorage`
- **Daily log** — Spreadsheet-style table with inline editing, filters, charts, weekly check-ins
- **Shared stats** — `/{username}/stats` read-only page for collaborators (login required)
- **Profile** — Account settings, username, share link

## Project structure

```
src/
  api/              # HTTP client, types, endpoints
  features/         # auth, history, profile, progress, weekly
  components/       # shared UI, layout, charts
  hooks/            # auth and chart preferences
  lib/              # dates, chart data, utilities
```

## Test flow

1. Register at `/register` and log in
2. Edit cells on the daily log, use filters and charts
3. Set a username on **Profile** and open `/{username}/stats`
4. Add a weekly check-in from a week header button
