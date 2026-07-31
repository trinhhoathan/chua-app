-- Lịch tụng kinh livestream (YouTube) theo chùa
create table if not exists public.chanting_schedules (
  id uuid primary key default gen_random_uuid(),
  temple_id uuid not null references public.temples(id) on delete cascade,
  title text not null,
  description text,
  youtube_channel_id text,
  youtube_channel_url text,
  recurrence text not null default 'daily'
    check (recurrence in ('daily', 'weekly', 'once')),
  days_of_week integer[] not null default '{}',
  start_date date,
  start_time time not null,
  duration_minutes integer not null default 60
    check (duration_minutes > 0 and duration_minutes <= 24 * 60),
  display_scope text not null default 'both'
    check (display_scope in ('both', 'home', 'go_mo', 'hidden')),
  is_live boolean not null default false,
  live_video_url text,
  live_started_at timestamptz,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chanting_schedules_once_needs_date check (
    recurrence <> 'once' or start_date is not null
  ),
  constraint chanting_schedules_weekly_needs_days check (
    recurrence <> 'weekly' or cardinality(days_of_week) > 0
  )
);

create index if not exists chanting_schedules_temple_active_idx
  on public.chanting_schedules (temple_id, is_active, sort_order desc);

create index if not exists chanting_schedules_temple_live_idx
  on public.chanting_schedules (temple_id, is_live)
  where is_live = true;

alter table public.chanting_schedules enable row level security;

create policy "Public read active chanting schedules"
  on public.chanting_schedules
  for select
  to anon, authenticated
  using (
    is_active = true
    and display_scope <> 'hidden'
    and exists (
      select 1 from public.temples t
      where t.id = chanting_schedules.temple_id
        and t.is_active = true
    )
  );

create policy "Temple admins manage chanting schedules"
  on public.chanting_schedules
  for all
  to authenticated
  using (
    temple_id in (select public.user_temple_ids())
    or public.is_super_admin()
  )
  with check (
    temple_id in (select public.user_temple_ids())
    or public.is_super_admin()
  );

-- Realtime: đổi is_live / live_video_url đẩy xuống trang public
do $$
begin
  alter publication supabase_realtime add table public.chanting_schedules;
exception
  when duplicate_object then null;
end $$;
