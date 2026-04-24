# Changes Summary

## Major migration

- Replaced JSON-based runtime data flow with Supabase Postgres.
- Added authentication and route protection.
- Added owner-only edit and delete behavior.
- Shifted project content from React-only jobs to general tech jobs.

## UX improvements

- Better loading and error handling in list/detail/edit flows.
- Auth-aware navbar and homepage CTA.
- Clear setup warnings when env vars are missing.

## Data model and security

- Added `jobs` table with `created_by` and `created_at`.
- Enabled Row Level Security.
- Added policies for public reads and owner-scoped writes.

## Dev experience

- Added `.env.example` for onboarding.
- Added SQL artifacts in `supabase/schema.sql` and `supabase/seed.sql`.
- Added in-depth docs in `docs/IMPLEMENTATION_GUIDE.md` and `docs/INTERVIEW_WALKTHROUGH.md`.

## Legacy note

- `src/jobs.json` is retained as legacy sample content and no longer drives runtime listing data.
