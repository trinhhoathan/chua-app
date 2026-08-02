-- Hợp nhất mã đơn: bỏ dấu '-' (CV-7WVL34 → CV7WVL34) để khớp QR / SePay / mở khóa luận giải.

-- 1) Chuẩn hoá mã đơn hiện có
UPDATE public.water_orders
SET order_code = upper(replace(order_code, '-', '')),
    updated_at = now()
WHERE order_code LIKE '%-%';

UPDATE public.sim_orders
SET order_code = upper(replace(order_code, '-', '')),
    updated_at = now()
WHERE order_code LIKE '%-%';

UPDATE public.ai_credit_grants
SET order_code = upper(replace(order_code, '-', ''))
WHERE order_code LIKE '%-%';

-- 2) Lookup nhận cả mã có/không gạch
CREATE OR REPLACE FUNCTION public.get_water_order_by_code(p_code text)
RETURNS SETOF water_orders
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT *
  FROM public.water_orders
  WHERE replace(upper(order_code), '-', '') =
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
  WHERE replace(upper(order_code), '-', '') =
        regexp_replace(upper(btrim(COALESCE(p_code, ''))), '[^A-Z0-9]', '', 'g')
  LIMIT 1;
$$;

-- 3) Đổi mã đơn lấy lượt AI — so khớp không phụ thuộc dấu '-'
CREATE OR REPLACE FUNCTION public.grant_ai_credits(
  p_device_hash text,
  p_order_code text,
  p_credits integer,
  p_ttl_seconds integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_code text := regexp_replace(upper(btrim(COALESCE(p_order_code, ''))), '[^A-Z0-9]', '', 'g');
  v_kind text;
  v_inserted boolean := false;
  v_w public.ai_wallets%ROWTYPE;
  v_bonus integer;
  v_expires timestamptz;
  v_canonical text;
BEGIN
  IF p_device_hash IS NULL OR length(p_device_hash) < 8 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'bad_device');
  END IF;
  IF v_code IS NULL OR length(v_code) < 4 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'order_not_found');
  END IF;

  SELECT order_code INTO v_canonical
  FROM public.water_orders
  WHERE replace(upper(order_code), '-', '') = v_code
    AND status IN ('paid', 'shipping', 'delivered')
  LIMIT 1;

  IF v_canonical IS NOT NULL THEN
    v_kind := 'water';
  ELSE
    SELECT order_code INTO v_canonical
    FROM public.sim_orders
    WHERE replace(upper(order_code), '-', '') = v_code
      AND status IN ('paid', 'delivering', 'completed')
    LIMIT 1;
    IF v_canonical IS NOT NULL THEN
      v_kind := 'sim';
    END IF;
  END IF;

  IF v_canonical IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'order_not_paid_or_not_found');
  END IF;

  v_code := replace(upper(v_canonical), '-', '');

  INSERT INTO public.ai_credit_grants (order_code, order_kind, device_hash, credits)
  VALUES (v_code, v_kind, p_device_hash, p_credits)
  ON CONFLICT (order_code) DO NOTHING;
  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  IF NOT v_inserted THEN
    RETURN jsonb_build_object('ok', false, 'error', 'order_already_redeemed');
  END IF;

  INSERT INTO public.ai_wallets (device_hash)
  VALUES (p_device_hash)
  ON CONFLICT (device_hash) DO NOTHING;

  SELECT * INTO v_w
  FROM public.ai_wallets
  WHERE device_hash = p_device_hash
  FOR UPDATE;

  v_bonus := v_w.bonus_remaining;
  IF v_bonus > 0 AND v_w.bonus_expires_at IS NOT NULL AND v_w.bonus_expires_at <= now() THEN
    v_bonus := 0;
  END IF;
  v_bonus := v_bonus + p_credits;
  v_expires := now() + make_interval(secs => p_ttl_seconds);

  UPDATE public.ai_wallets SET
    bonus_remaining = v_bonus,
    bonus_expires_at = v_expires,
    updated_at = now()
  WHERE device_hash = p_device_hash;

  RETURN jsonb_build_object(
    'ok', true,
    'bonus_remaining', v_bonus,
    'bonus_expires_at', v_expires
  );
END;
$$;

-- 4) Cập nhật devotee info theo mã không gạch
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
  v_key text := regexp_replace(upper(btrim(COALESCE(p_code, ''))), '[^A-Z0-9]', '', 'g');
  v_address text := NULLIF(btrim(COALESCE(p_address, '')), '');
  v_ward text := NULLIF(btrim(COALESCE(p_ward, '')), '');
  v_note text := NULLIF(btrim(COALESCE(p_note, '')), '');
BEGIN
  IF v_key IS NULL OR length(v_key) < 3 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Mã đơn không hợp lệ.');
  END IF;

  SELECT * INTO o
  FROM public.water_orders
  WHERE replace(upper(order_code), '-', '') = v_key
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
