# Frontend production deploy (PM2)

Backend runs in Docker — see the `fatoven_backend` repo and `DEPLOY.md` there.

## On the server

```bash
cd fatoven_frontend          # your git clone
cp .env.production.example .env.production
nano .env.production         # VITE_API_BASE_URL=http://YOUR_SERVER_IP:3000

sudo npm install -g pm2
chmod +x deploy.sh
./deploy.sh
```

Or step by step:

```bash
npm ci
npm run build
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup                  # optional: run on boot
```

App listens on **port 4173**.

```bash
pm2 status
pm2 logs fatoven-web
curl -I http://localhost:4173
```

## Updates

```bash
git pull
./deploy.sh
```
