-- Check constraint cũ vẫn quantity >= 10; đồng bộ với app (tối thiểu 1 thùng).
ALTER TABLE public.water_orders
  DROP CONSTRAINT IF EXISTS water_orders_quantity_check;

ALTER TABLE public.water_orders
  ADD CONSTRAINT water_orders_quantity_check
  CHECK (quantity >= 1 AND quantity <= 100000);
