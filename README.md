# Job Board

A production-minded jobs platform built with React, TypeScript, and Supabase.

## Overview

This project is a single-page application for browsing and managing job postings, with:

- Public job listing pages with search, filtering, and pagination
- Supabase-backed CRUD operations
- Email/password authentication using Supabase Auth
- Authorization controls so users can only edit or delete their own jobs

## Tech Stack

- React + TypeScript + Vite
- React Router
- Supabase (Postgres + Auth)
- ESLint
- Tailwind CSS
- Nginx (container runtime)
- GitHub Actions (CI)

## Key Features

- Search and filter jobs by title/description and job type
- URL-synced query state (`q`, `type`, `page`) for shareable filtered views
- Protected routes for creating and editing job posts
- Ownership checks before update/delete actions
- Responsive UI for desktop and mobile

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file from `.env.example` and set:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_BASE_PATH` (use `/` for root hosting or `/your-subdirectory/` for subdirectory hosting)

### 3. Set up Supabase schema/data

Run the SQL in this order in the Supabase SQL Editor:

1. `supabase/schema.sql`
2. `supabase/seed.sql` (optional sample data)

### 4. Start the app

```bash
npm run dev
```

The Vite server is pinned to port 3000 with `strictPort: true` to avoid silent fallback to another port.

## Quality Commands

```bash
npm run lint
npm run typecheck
npm run build
npm run check
```

- `check` runs lint + production build.

## CI

GitHub Actions workflow: `.github/workflows/ci.yml`

On pushes to `main`/`master` and on pull requests, CI executes:

1. `npm ci`
2. `npm run lint`
3. `npm run build`

## Shared Hosting CI/CD (Subdirectory Deploy)

GitHub Actions deploy workflow: `.github/workflows/deploy-shared-hosting.yml`

This workflow:

1. Runs quality gate (`npm run check`)
2. Builds with your configured `VITE_APP_BASE_PATH`
3. Uploads `dist/` to shared hosting using FTP

Required GitHub repository secrets:

- `FTP_SERVER`
- `FTP_USERNAME`
- `FTP_PASSWORD`
- `FTP_SERVER_DIR` (example: `/public_html/jobboard/`)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Optional GitHub repository variable:

- `VITE_APP_BASE_PATH` (example: `/jobboard/`)

Shared hosting notes:

- `public/.htaccess` is included in build output for SPA fallback on Apache hosts.
- `public/healthz` provides a static health check endpoint (`/healthz`).
- If your host uses a panel deploy path (for example `public_html/myapp/`), set both:
  - `FTP_SERVER_DIR=/public_html/myapp/`
  - `VITE_APP_BASE_PATH=/myapp/`

## Containerized Runtime

### Build image

```bash
docker build -t jobboard:latest .
```

### Run container

```bash
docker run --rm -p 8080:80 jobboard:latest
```

Then open `http://localhost:8080`.

### Health endpoint

Nginx exposes:

- `GET /healthz` -> `200 ok`

Useful for container orchestration liveness/readiness checks.

## Production Notes

- App is served as static assets from Nginx.
- SPA routing is handled via `try_files ... /index.html` fallback.
- Build-time environment variables must be set before running `npm run build`.
- Supabase Row Level Security (RLS) policies in `supabase/schema.sql` enforce data ownership.

## Troubleshooting

- Blank/failed data load:
  - Confirm `.env` values are present and correct.
  - Confirm Supabase schema has been applied.
- Auth works but restricted actions fail:
  - Check RLS policies and ensure logged-in user owns the row.
- Port conflict on dev startup:
  - Stop any process already using port 3000, then rerun `npm run dev`.

## Project Structure

- `src/services/jobsApi.ts`: Supabase data access layer
- `src/context/AuthContext.tsx`: auth/session state
- `src/components/ProtectedRoute.tsx`: route guard for authenticated pages
- `supabase/schema.sql`: database schema and policies
- `supabase/seed.sql`: sample seed data
- `.github/workflows/ci.yml`: CI pipeline
- `.github/workflows/deploy-shared-hosting.yml`: shared-hosting deployment pipeline
- `Dockerfile`: production build + runtime image
- `nginx.conf`: SPA + health check configuration
