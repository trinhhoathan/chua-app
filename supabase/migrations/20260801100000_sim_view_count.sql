-- Đếm lượt xem trang chi tiết sim (social proof + thống kê admin)
alter table public.sim_listings
  add column if not exists view_count integer not null default 0;

create or replace function public.increment_sim_view(p_temple_id uuid, p_phone text)
returns void
language sql
security definer
set search_path = public
as $$
  update sim_listings
  set view_count = view_count + 1
  where temple_id = p_temple_id and phone = p_phone;
$$;

revoke all on function public.increment_sim_view(uuid, text) from public;
grant execute on function public.increment_sim_view(uuid, text) to anon, authenticated;
