-- Quẻ Kinh Dịch cho sim (Mai Hoa Dịch Số):
-- cộng 5 số đầu mod 8 → Thượng quái, cộng 5 số cuối mod 8 → Hạ quái (dư 0 = 8),
-- tra Tiên thiên bát quái (1 Càn · 2 Đoài · 3 Ly · 4 Chấn · 5 Tốn · 6 Khảm · 7 Cấn · 8 Khôn)
-- → số quẻ Văn Vương 1–64. Cột dùng để lọc "chọn sim theo quẻ" + hiển thị admin.

alter table public.sim_listings
  add column if not exists que_number smallint;

create index if not exists sim_listings_que_number_idx
  on public.sim_listings (temple_id, que_number);

-- Backfill toàn bộ sim hiện có
with mapping(up, lo, que) as (
  values
    (1,1,1),(1,2,10),(1,3,13),(1,4,25),(1,5,44),(1,6,6),(1,7,33),(1,8,12),
    (2,1,43),(2,2,58),(2,3,49),(2,4,17),(2,5,28),(2,6,47),(2,7,31),(2,8,45),
    (3,1,14),(3,2,38),(3,3,30),(3,4,21),(3,5,50),(3,6,64),(3,7,56),(3,8,35),
    (4,1,34),(4,2,54),(4,3,55),(4,4,51),(4,5,32),(4,6,40),(4,7,62),(4,8,16),
    (5,1,9),(5,2,61),(5,3,37),(5,4,42),(5,5,57),(5,6,59),(5,7,53),(5,8,20),
    (6,1,5),(6,2,60),(6,3,63),(6,4,3),(6,5,48),(6,6,29),(6,7,39),(6,8,8),
    (7,1,26),(7,2,41),(7,3,22),(7,4,27),(7,5,18),(7,6,4),(7,7,52),(7,8,23),
    (8,1,11),(8,2,19),(8,3,36),(8,4,24),(8,5,46),(8,6,7),(8,7,15),(8,8,2)
),
calc as (
  select
    id,
    coalesce(
      nullif(
        (select sum(d::int) from unnest(string_to_array(substr(phone, 1, 5), null)) as d) % 8,
        0
      ),
      8
    ) as up,
    coalesce(
      nullif(
        (select sum(d::int) from unnest(string_to_array(substr(phone, 6), null)) as d) % 8,
        0
      ),
      8
    ) as lo
  from public.sim_listings
  where que_number is null and length(phone) = 10
)
update public.sim_listings s
set que_number = m.que
from calc c
join mapping m on m.up = c.up and m.lo = c.lo
where s.id = c.id;
