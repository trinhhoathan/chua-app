CREATE OR REPLACE FUNCTION public.guard_temple_water_price()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.water_price_vnd IS DISTINCT FROM OLD.water_price_vnd THEN
    IF NOT public.is_super_admin() THEN
      RAISE EXCEPTION 'Chỉ siêu quản trị viên được đổi đơn giá nước';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_temple_water_price ON public.temples;
CREATE TRIGGER trg_guard_temple_water_price
  BEFORE UPDATE ON public.temples
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_temple_water_price();
