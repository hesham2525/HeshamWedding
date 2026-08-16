create extension if not exists "pgcrypto";

create table if not exists public.wedding_wishes (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Guest' check (char_length(name) <= 60),
  message text not null check (char_length(message) <= 500),
  created_at timestamptz not null default now()
);

alter table public.wedding_wishes
  add column if not exists name text not null default 'Guest'
  check (char_length(name) <= 60);

alter table public.wedding_wishes enable row level security;

-- The site writes and reads through the private server API using the service role key.
-- No public client-side database access is required.
