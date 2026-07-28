-- go_mo_dedications + go_mo_daily_scores (applied via Supabase MCP)
create table if not exists public.go_mo_dedications (
  id uuid primary key default gen_random_uuid(),
  temple_id uuid not null references public.temples(id) on delete cascade,
  devotee_name text not null,
  wish text,
  session_count integer not null default 0 check (session_count >= 0),
  day_count integer not null default 0 check (day_count >= 0),
  created_at timestamptz not null default now()
);

create index if not exists go_mo_dedications_temple_created_idx
  on public.go_mo_dedications (temple_id, created_at desc);

create table if not exists public.go_mo_daily_scores (
  id uuid primary key default gen_random_uuid(),
  temple_id uuid not null references public.temples(id) on delete cascade,
  client_key text not null,
  display_name text,
  day date not null default ((timezone('Asia/Ho_Chi_Minh', now()))::date),
  strike_count integer not null default 0 check (strike_count >= 0),
  updated_at timestamptz not null default now(),
  unique (temple_id, client_key, day)
);

create index if not exists go_mo_daily_scores_leaderboard_idx
  on public.go_mo_daily_scores (temple_id, day, strike_count desc);

alter table public.go_mo_dedications enable row level security;
alter table public.go_mo_daily_scores enable row level security;
