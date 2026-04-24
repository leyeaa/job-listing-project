# Interview Walkthrough

Use this script to explain the project confidently in an interview.

## 1) 30-Second Project Pitch

"This is a full-stack-ready tech job board built with React and TypeScript. I migrated it from file-based storage to Supabase Postgres, added authentication, and enforced owner-based authorization using Row Level Security. Users can browse public jobs, sign in, and post or manage only jobs they created."

## 2) Problem and Motivation

Original state:

- Data was stored in a local JSON file.
- There was no authentication.
- No production-safe access control for job posting and editing.

Target state:

- Persistent database storage.
- User accounts and login.
- Access control for create/update/delete operations.

## 3) Key Technical Decisions

### Why Supabase

- Fastest way to add a real Postgres database.
- Built-in Auth reduces custom backend code.
- RLS makes authorization explicit and secure.

### Why service layer

- Centralizes data access in `src/services/jobsApi.ts`.
- Keeps components focused on UI behavior.
- Makes testing and future API swaps easier.

### Why typed domain model

- `src/types/job.ts` guarantees consistent shapes across forms, pages, and service calls.
- Reduces runtime shape bugs and improves maintainability.

## 4) Security Story (Important)

There are two layers:

1. UI-level checks:

- Protected routes block unauthenticated users from `/add-job` and `/edit-job/:id`.
- Non-owner users do not see edit/delete controls.

2. Database-level checks (real security):

- RLS policies allow only the creator (`created_by = auth.uid()`) to update or delete a job.
- Even if someone bypasses UI, unauthorized writes are denied.

## 5) Live Demo Flow

1. Open Home page and Jobs page.
2. Show public job listings.
3. Click Post Job while logged out and show redirect to login.
4. Create account or sign in.
5. Post a new job.
6. Open job details and show edit/delete visible for owner.
7. Sign out and open the same job to show edit/delete are hidden.

## 6) Files to Mention During Code Walkthrough

- `src/lib/supabase.ts`
- `src/context/AuthContext.tsx`
- `src/components/ProtectedRoute.tsx`
- `src/services/jobsApi.ts`
- `src/App.tsx`
- `src/pages/LoginPage.tsx`
- `src/pages/AddJobPage.tsx`
- `src/pages/EditJobPage.tsx`
- `src/pages/JobPage.tsx`
- `supabase/schema.sql`

## 7) Technical Challenges and Solutions

### Challenge: moving from nested JSON object to flat SQL columns

Solution:

- Mapped row fields to nested UI objects in one place (`jobsApi.ts`).
- Prevented mapping logic from leaking into components.

### Challenge: protecting write operations

Solution:

- Added route guard for UX.
- Added owner checks in service calls.
- Added RLS policies for hard security guarantees.

## 8) If Asked "What Would You Improve Next?"

- Add search/filter/sort with indexed columns.
- Add pagination and infinite scrolling.
- Add unit/integration tests.
- Add role-based access (employer vs candidate).
- Add resume upload and application workflow.

## 9) If Asked "How Is This Production-Ready?"

Strong points:

- Real database with persistence.
- Authenticated flows.
- Security controls at DB layer.
- Typed frontend architecture.

Current gaps (honest + mature answer):

- No automated tests yet.
- No monitoring/logging dashboards yet.
- No admin moderation workflow yet.
