# EduCMS — Deployment Guide

## Deploy to Render (free tier)

The repo ships a [`Dockerfile`](Dockerfile) and a [`render.yaml`](../render.yaml) Blueprint that
provisions both the API (as a Docker web service) and a free PostgreSQL database in one shot.

1. Push this repo to GitHub (already done: `origin` → `Moumadjad/Content-Management-System`).
2. Create a free account at https://render.com (no credit card required) and connect your GitHub account.
3. In the Render dashboard: **New** → **Blueprint**, select this repo. Render reads `render.yaml`
   and creates:
   - `educms-db` — free PostgreSQL instance
   - `educms-api` — free web service, built from `educms-backend/Dockerfile`, wired to
     `educms-db` via the `DATABASE_URL` env var, with `JWT_SECRET`/`JWT_REFRESH_SECRET`
     auto-generated.
4. Click **Apply**. Render builds the image and starts the service; `server.js` applies
   `src/database/schema.sql` automatically on first boot (it's a no-op on later restarts —
   pre-deploy commands aren't available on the free plan, so the migration runs at startup
   instead and checks whether the schema is already there before touching anything).
5. Once live, check `https://<your-service>.onrender.com/health`.

**Free tier limits:** the web service spins down after ~15 min of inactivity (cold start ~30s on
the next request), and the free Postgres database expires after 90 days unless upgraded — fine for
a school project/demo, not for real production traffic.

### Local Docker

```bash
cd educms-backend
docker build -t educms-api .
docker run --rm -p 5000:5000 --env-file .env educms-api
```

## Deploy to Heroku (paid — kept for reference)

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create new app
heroku create educms-api

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set JWT_SECRET=your_secret_key
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Run migrations
heroku run npm run migrate
```
