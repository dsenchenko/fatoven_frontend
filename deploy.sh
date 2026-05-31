#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

if [[ ! -f .env.production ]]; then
  echo "ERROR: .env.production is missing."
  echo "Copy .env.production.example and set VITE_API_BASE_URL to your public API URL."
  exit 1
fi

echo "==> Building frontend"
npm ci
npm run build
npm prune --production

echo "==> Starting PM2"
mkdir -p logs
pm2 startOrReload ecosystem.config.cjs --env production
pm2 save

echo ""
echo "Done."
echo "  Frontend: http://YOUR_SERVER_IP:4173"
echo "  pm2 status"
echo "  pm2 logs fatoven-web"
