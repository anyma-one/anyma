-- The shared anyma waitlist, used by ching's Deep Cast sign-up and Full Cast waitlist.
-- Written by the monorepo's api/waitlist.ts (sign-up) and api/waitlist-confirm.ts (confirm link).
-- Safe to run more than once: it creates the table only if it's missing and adds missing columns.
-- Run in Supabase → SQL Editor, in the project whose SUPABASE_URL the hub uses.

create table if not exists public.waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,                        -- one row per address (upsert key)
  token       uuid not null unique default gen_random_uuid(), -- the confirmation link
  verified    boolean not null default false,
  interest    text,                                        -- latest project: ching, dosha, soul
  interests   text[] not null default '{}',                -- every project signed up for
  source      text,                                        -- where: deep-cast, full-cast (ching)
  consent_at  timestamptz not null default now(),
  verified_at timestamptz,
  created_at  timestamptz not null default now()
);

-- For a table soul created earlier: add anything it doesn't have yet.
alter table public.waitlist add column if not exists interest    text;
alter table public.waitlist add column if not exists interests   text[] not null default '{}';
alter table public.waitlist add column if not exists source      text;
alter table public.waitlist add column if not exists verified_at timestamptz;

-- Only the server functions (service-role key) read or write it.
alter table public.waitlist enable row level security;

-- Who's waiting for Full Cast (confirmed addresses):
--   select email, verified_at from public.waitlist
--   where 'ching' = any(interests) and source = 'full-cast' and verified
--   order by verified_at;
