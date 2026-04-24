# Implementation Guide

This guide explains the full migration from a local JSON file to a production-style Supabase backend with authentication and owner-based authorization.

## 1) What Changed

The project was migrated from JSON API storage to Supabase (Postgres + Auth), and the domain content was expanded from React-only roles to general technology jobs.

### Core upgrades

- Replaced local API fetches with Supabase queries.
- Added authentication (email/password) with sign in and sign up.
- Protected posting and editing routes behind authentication.
- Enforced owner-only update/delete using database policies and app-level checks.
- Updated UI copy and seed content to support general tech jobs.

## 2) Architecture Overview

### Frontend

- React + TypeScript + Vite
- React Router for routing
- Tailwind CSS for styling
- React Toastify for feedback messages

### Backend-as-a-Service

- Supabase Postgres for jobs data
- Supabase Auth for users
- Postgres Row Level Security (RLS) for authorization

### Data access pattern

- UI pages call typed service methods in `src/services/jobsApi.ts`.
- Service methods map database row shape to UI-friendly `Job` objects.
- Components never call raw SQL directly.

## 3) File-by-File Modification Map

### New files

- `src/lib/supabase.ts`: Supabase client setup and environment validation.
- `src/services/jobsApi.ts`: Typed CRUD operations for jobs.
- `src/types/job.ts`: Shared `Job`, `Company`, and `JobFormInput` interfaces.
- `src/context/AuthContext.tsx`: Auth session state and auth actions.
- `src/components/ProtectedRoute.tsx`: Route guard for authenticated pages.
- `src/pages/LoginPage.tsx`: Sign in / sign up page.
- `.env.example`: required client environment variables.
- `supabase/schema.sql`: database table + RLS policy definition.
- `supabase/seed.sql`: optional seed script for starter data.

### Updated files

- `src/App.tsx`: route protection and service-based CRUD handlers.
- `src/main.tsx`: wraps app with `AuthProvider`.
- `src/components/JobListings.tsx`: database listing calls.
- `src/components/JobListing.tsx`: strict typing and wording updates.
- `src/components/NavBar.tsx`: auth-aware links and sign out.
- `src/components/Hero.tsx`: general tech-jobs messaging.
- `src/components/HomeCards.tsx`: auth-aware CTA and broader audience copy.
- `src/pages/AddJobPage.tsx`: async typed submit for DB inserts.
- `src/pages/EditJobPage.tsx`: fetch+edit with owner guard.
- `src/pages/JobPage.tsx`: fetch single job + owner-only management UI.
- `src/layouts/MainLayout.tsx`: fixed toast stylesheet import.
- `src/jobs.json`: converted sample content to general tech jobs.
- `src/vite-env.d.ts`: typed Supabase env vars.

## 4) Authentication and Authorization Flow

### Login flow

1. User navigates to `/login`.
2. User chooses sign in or create account.
3. Supabase Auth returns session.
4. `AuthContext` stores user/session and updates app state.

### Route protection

- `ProtectedRoute` checks user session.
- Unauthenticated users are redirected to `/login`.
- After login, user returns to originally requested route.

### Owner-only editing/deletion

- Every job row stores `created_by` user id.
- Update and delete operations include `created_by = currentUser.id` checks.
- RLS policies enforce this at database level.
- UI also hides edit/delete for non-owners.

## 5) Data Model

Table: `public.jobs`

- `id` bigint identity primary key
- `title` text
- `type` text
- `description` text
- `location` text
- `salary` text
- `company_name` text
- `company_description` text
- `contact_email` text
- `contact_phone` text
- `created_by` uuid references `auth.users(id)`
- `created_at` timestamptz default now

In UI, these fields are mapped into a nested object:

- `job.company.name`
- `job.company.description`
- `job.company.contactEmail`
- `job.company.contactPhone`

## 6) How to Run Locally

1. Copy `.env.example` to `.env`.
2. Fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. In Supabase SQL editor, run `supabase/schema.sql`.
4. Optionally run `supabase/seed.sql` after replacing `created_by` values.
5. Run:

```bash
npm install
npm run dev
```

## 7) Error Handling Strategy

- Service layer throws clear errors for failed database operations.
- UI catches errors and displays toast notifications.
- List and detail pages render inline error cards when data cannot load.
- Missing env vars produce actionable setup messages.

## 8) Why This Design Is Interview-Friendly

- Shows a realistic full-stack pattern without building a custom backend.
- Demonstrates authentication + authorization separation.
- Uses typed service architecture with explicit mapping boundaries.
- Security is enforced at the database layer (RLS), not only in UI.

## 9) Known Constraints

- Client-side app uses public anon key, so all write security must rely on RLS.
- Seed script requires a valid `auth.users.id` for `created_by`.
- No pagination yet; list fetch currently loads all jobs for `/jobs`.

## 10) Suggested Next Enhancements

- Add search, filters, and pagination.
- Add profile/company pages for employers.
- Add tests for services and route guards.
- Add server-side rendered metadata for SEO.
