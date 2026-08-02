-- Flash sale cho kho sim: thời điểm kết thúc khuyến mãi (đếm ngược trên UI)
alter table public.sim_listings
  add column if not exists sale_ends_at timestamptz;

create index if not exists idx_sim_listings_sale_ends
  on public.sim_listings (temple_id, sale_ends_at)
  where sale_ends_at is not null;
