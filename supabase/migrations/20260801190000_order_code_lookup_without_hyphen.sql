-- VietQR / ngân hàng thường bỏ dấu '-' trong nội dung CK (CV-XXXX → CVXXXX).
-- Lookup đơn theo mã đã chuẩn hoá (chỉ A–Z / 0–9).

CREATE OR REPLACE FUNCTION public.get_water_order_by_code(p_code text)
RETURNS SETOF water_orders
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT *
  FROM public.water_orders
  WHERE order_code = upper(btrim(p_code))
     OR replace(order_code, '-', '') =
        regexp_replace(upper(btrim(COALESCE(p_code, ''))), '[^A-Z0-9]', '', 'g')
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_sim_order_by_code(p_code text)
RETURNS SETOF sim_orders
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT *
  FROM public.sim_orders
  WHERE order_code = upper(btrim(p_code))
     OR replace(order_code, '-', '') =
        regexp_replace(upper(btrim(COALESCE(p_code, ''))), '[^A-Z0-9]', '', 'g')
  LIMIT 1;
$$;
