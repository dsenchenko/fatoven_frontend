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

## Production deploy (PM2)

Files are in this repo: `ecosystem.config.cjs`, `deploy.sh`, `DEPLOY.md`.

```bash
cp .env.production.example .env.production
# edit VITE_API_BASE_URL=http://YOUR_SERVER_IP:3000
chmod +x deploy.sh && ./deploy.sh
```

Backend API: Docker in `fatoven_backend` (`docker compose -f docker-compose.prod.yml up -d --build`).

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
