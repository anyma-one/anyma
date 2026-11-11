-- ching: Full Cast usage counters (BUILD.md §6.3). Stores hashes and counts only:
-- never a question or message text. RLS on with no policies: only the service-role key
-- used by api/ching-dialogue.ts can touch these, as with the monorepo's other tables.

create table if not exists public.ching_readings (
  reading_id text primary key,              -- sha256(unlockId | totals | normalized question)
  unlock_id  text not null,                 -- sha256(passcode | device id); a purchase id later
  messages   integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists ching_readings_unlock on public.ching_readings (unlock_id);
alter table public.ching_readings enable row level security;

create table if not exists public.ching_daily_tokens (
  day    date primary key,
  tokens bigint not null default 0
);
alter table public.ching_daily_tokens enable row level security;

-- Count one dialogue message. Returns 'ok' or 'limit'. Atomic: the row lock on the reading
-- and the advisory lock on the unlock stop two requests from slipping past a limit together.
create or replace function public.ching_count_message(
  p_reading_id text, p_unlock_id text, p_max_messages integer, p_max_readings integer
) returns text language plpgsql security definer as $$
declare
  n integer;
begin
  perform pg_advisory_xact_lock(hashtext(p_unlock_id));
  if not exists (select 1 from public.ching_readings where reading_id = p_reading_id) then
    select count(*) into n from public.ching_readings where unlock_id = p_unlock_id;
    if n >= p_max_readings then return 'limit'; end if;
    insert into public.ching_readings (reading_id, unlock_id) values (p_reading_id, p_unlock_id);
  end if;
  update public.ching_readings set messages = messages + 1
    where reading_id = p_reading_id and messages < p_max_messages;
  if not found then return 'limit'; end if;
  return 'ok';
end $$;

create or replace function public.ching_add_tokens(p_day date, p_tokens bigint)
returns void language sql security definer as $$
  insert into public.ching_daily_tokens (day, tokens) values (p_day, p_tokens)
  on conflict (day) do update set tokens = public.ching_daily_tokens.tokens + excluded.tokens;
$$;

create or replace function public.ching_tokens_today(p_day date)
returns bigint language sql security definer as $$
  select coalesce((select tokens from public.ching_daily_tokens where day = p_day), 0);
$$;

revoke all on function public.ching_count_message(text, text, integer, integer) from public, anon, authenticated;
revoke all on function public.ching_add_tokens(date, bigint) from public, anon, authenticated;
revoke all on function public.ching_tokens_today(date) from public, anon, authenticated;
