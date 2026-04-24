create table if not exists public.jobs (
  id bigint generated always as identity primary key,
  title text not null,
  type text not null,
  description text not null,
  location text not null,
  salary text not null,
  company_name text not null,
  company_description text not null default '',
  contact_email text not null,
  contact_phone text not null default '',
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.jobs enable row level security;

drop policy if exists "Jobs are readable by everyone" on public.jobs;
drop policy if exists "Authenticated users can insert own jobs" on public.jobs;
drop policy if exists "Users can update own jobs" on public.jobs;
drop policy if exists "Users can delete own jobs" on public.jobs;

create policy "Jobs are readable by everyone"
on public.jobs for select
to anon, authenticated
using (true);

create policy "Authenticated users can insert own jobs"
on public.jobs for insert
to authenticated
with check (auth.uid() = created_by);

create policy "Users can update own jobs"
on public.jobs for update
to authenticated
using (auth.uid() = created_by)
with check (auth.uid() = created_by);

create policy "Users can delete own jobs"
on public.jobs for delete
to authenticated
using (auth.uid() = created_by);
