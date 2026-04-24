# Tech Jobs Hub

A React + TypeScript + Vite job board for general technology roles, powered by Supabase (Postgres + Auth).

## Features

- Public browsing of tech jobs
- Email/password authentication
- Protected routes for posting and editing jobs
- Owner-only update/delete controls
- Row Level Security (RLS) backed authorization

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Supabase (`@supabase/supabase-js`)

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and fill values:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

3. In Supabase SQL editor, run:

- `supabase/schema.sql`
- optional: `supabase/seed.sql` (replace `created_by` placeholders first)

4. Start the app:

```bash
npm run dev
```

5. Open:

- `http://localhost:3000`

## Build

```bash
npm run build
npm run preview
```

## Important Notes

- Runtime data now comes from Supabase, not `src/jobs.json`.
- `src/jobs.json` is retained as legacy sample content.
- Write security is enforced by RLS policies in `supabase/schema.sql`.

## Documentation

For complete implementation and interview preparation docs, see:

- `docs/IMPLEMENTATION_GUIDE.md`
- `docs/INTERVIEW_WALKTHROUGH.md`
- `docs/CHANGES_SUMMARY.md`
