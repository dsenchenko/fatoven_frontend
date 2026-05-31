# Fatoven Frontend

Personal health-tracking web app for Fatoven. Connects to the Fatoven REST API for daily metrics, weekly summaries, and check-ins.

## Prerequisites

- Node.js 18+
- [Fatoven API](http://localhost:3001) running locally

Verify the backend:

```bash
curl http://localhost:3001/health
# {"status":"ok","service":"fatoven-api"}
```

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

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Features (MVP)

- **Auth** — Register, login, JWT stored in `localStorage`, auto-redirect on 401
- **Dashboard** — Today's date, quick stats, recent trend charts
- **Progress** — Full charts: weight, steps, calories, macros, weekly scores & measurements
- **Daily Log** — Upsert weight, steps, calories, macros, Garmin burn
- **History** — Spreadsheet-style table grouped by ISO week with weekly averages and trend charts
- **Weekly Check-in** — Body measurements and 1–10 subjective scores
- **Profile** — Account info and logout

## Project structure

```
src/
  api/           # HTTP client, types, auth token helper
  features/      # auth, daily-log, history, weekly
  components/    # shared UI and layout
  hooks/         # auth context
  pages/         # route entry points
  lib/           # date helpers, utilities
```

## Future features (placeholders)

Routes exist but are not implemented: `/food`, `/garmin`, `/coach`.

## Test flow

1. Register a new account at `/register`
2. Log in and open **Daily Log** — save today's metrics
3. Open **History** — confirm logs appear with weekly averages
4. Open **Weekly Check-in** — save measurements and scores
