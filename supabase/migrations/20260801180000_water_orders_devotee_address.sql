-- Địa chỉ / phường xã Phật tử (ghi nhận danh sách cho chùa, không giao hàng).
-- Thu thập sau khi thanh toán thành công để không làm chậm checkout.

ALTER TABLE public.water_orders
  ADD COLUMN IF NOT EXISTS customer_address text,
  ADD COLUMN IF NOT EXISTS customer_ward text;

COMMENT ON COLUMN public.water_orders.customer_address IS
  'Địa chỉ Phật tử (tùy chọn, thu thập sau thanh toán — không dùng để giao hàng)';
COMMENT ON COLUMN public.water_orders.customer_ward IS
  'Phường / xã / khu vực (tùy chọn, thu thập sau thanh toán)';

-- Public cập nhật thông tin danh sách sau khi đã TT (qua mã đơn).
CREATE OR REPLACE FUNCTION public.update_water_order_devotee_info(
  p_code text,
  p_address text DEFAULT NULL,
  p_ward text DEFAULT NULL,
  p_note text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  o public.water_orders%ROWTYPE;
  v_address text := NULLIF(btrim(COALESCE(p_address, '')), '');
  v_ward text := NULLIF(btrim(COALESCE(p_ward, '')), '');
  v_note text := NULLIF(btrim(COALESCE(p_note, '')), '');
BEGIN
  IF p_code IS NULL OR length(btrim(p_code)) < 3 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Mã đơn không hợp lệ.');
  END IF;

  SELECT * INTO o
  FROM public.water_orders
  WHERE order_code = upper(btrim(p_code))
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Không tìm thấy đơn.');
  END IF;

  IF o.status NOT IN ('paid', 'shipping', 'delivered') THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'Chỉ cập nhật sau khi đơn đã thanh toán.'
    );
  END IF;

  IF v_address IS NULL AND v_ward IS NULL AND v_note IS NULL THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'Vui lòng nhập ít nhất một thông tin.'
    );
  END IF;

  IF v_address IS NOT NULL AND length(v_address) > 300 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Địa chỉ quá dài.');
  END IF;
  IF v_ward IS NOT NULL AND length(v_ward) > 120 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Phường / xã quá dài.');
  END IF;
  IF v_note IS NOT NULL AND length(v_note) > 500 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Ghi chú quá dài.');
  END IF;

  UPDATE public.water_orders
  SET
    customer_address = COALESCE(v_address, customer_address),
    customer_ward = COALESCE(v_ward, customer_ward),
    note = COALESCE(v_note, note),
    updated_at = now()
  WHERE id = o.id;

  RETURN jsonb_build_object('ok', true, 'order_code', o.order_code);
END;
$$;

REVOKE ALL ON FUNCTION public.update_water_order_devotee_info(text, text, text, text)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_water_order_devotee_info(text, text, text, text)
  TO anon, authenticated;
