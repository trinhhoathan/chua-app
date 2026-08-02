-- Ví lượt luận giải AI (toàn hệ thống, mọi tool AI dùng chung)
-- ai_wallets:       ví theo thiết bị (cookie ẩn danh — lưu HASH, không lưu định danh thô)
-- ai_ip_counters:   trần lượt theo IP/ngày (lưới an toàn chống farm; IP cũng là hash)
-- ai_credit_grants: mỗi đơn hàng đã thanh toán chỉ đổi lượt được đúng 1 lần
-- ai_answers:       cache bài luận dùng chung theo hash input (input tất định)
--
-- Toàn bộ truy cập qua service role / RPC SECURITY DEFINER — không mở cho anon.

-- ---------------------------------------------------------------------------
-- 1) ai_wallets
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_wallets (
  device_hash text PRIMARY KEY,
  free_used integer NOT NULL DEFAULT 0,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  bonus_remaining integer NOT NULL DEFAULT 0,
  bonus_expires_at timestamptz,
  total_used integer NOT NULL DEFAULT 0,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_wallets ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 2) ai_ip_counters
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_ip_counters (
  ip_hash text NOT NULL,
  day date NOT NULL DEFAULT current_date,
  used integer NOT NULL DEFAULT 0,
  PRIMARY KEY (ip_hash, day)
);

ALTER TABLE public.ai_ip_counters ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 3) ai_credit_grants
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_credit_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code text NOT NULL UNIQUE,
  order_kind text NOT NULL CHECK (order_kind IN ('water', 'sim')),
  device_hash text NOT NULL,
  credits integer NOT NULL CHECK (credits > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_credit_grants_device_idx
  ON public.ai_credit_grants (device_hash);

ALTER TABLE public.ai_credit_grants ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 4) ai_answers (cache bài luận theo hash input)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_answers (
  cache_key text PRIMARY KEY,
  topic text NOT NULL,
  content text NOT NULL,
  model text,
  prompt_version integer NOT NULL DEFAULT 1,
  hit_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_hit_at timestamptz
);

CREATE INDEX IF NOT EXISTS ai_answers_topic_idx ON public.ai_answers (topic);

ALTER TABLE public.ai_answers ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 5) RPC consume_ai_credit — trừ 1 lượt, atomic.
--    Thứ tự: khóa ví → kiểm ví → tăng trần IP (có điều kiện) → trừ ví.
--    Reset "lười": hết chu kỳ thì free_used về 0 ngay trong hàm, không cần cron.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.consume_ai_credit(
  p_device_hash text,
  p_ip_hash text,
  p_free_limit integer,
  p_window_seconds integer,
  p_ip_daily_limit integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_w public.ai_wallets%ROWTYPE;
  v_free_used integer;
  v_window_started timestamptz;
  v_bonus integer;
  v_bonus_expires timestamptz;
  v_free_left integer;
  v_ip_used integer;
BEGIN
  IF p_device_hash IS NULL OR length(p_device_hash) < 8 THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'bad_device');
  END IF;

  INSERT INTO public.ai_wallets (device_hash)
  VALUES (p_device_hash)
  ON CONFLICT (device_hash) DO NOTHING;

  SELECT * INTO v_w
  FROM public.ai_wallets
  WHERE device_hash = p_device_hash
  FOR UPDATE;

  v_free_used := v_w.free_used;
  v_window_started := v_w.window_started_at;
  IF now() - v_window_started > make_interval(secs => p_window_seconds) THEN
    v_free_used := 0;
    v_window_started := now();
  END IF;

  v_bonus := v_w.bonus_remaining;
  v_bonus_expires := v_w.bonus_expires_at;
  IF v_bonus > 0 AND v_bonus_expires IS NOT NULL AND v_bonus_expires <= now() THEN
    v_bonus := 0;
  END IF;

  v_free_left := greatest(p_free_limit - v_free_used, 0);

  IF v_free_left = 0 AND v_bonus = 0 THEN
    -- Persist lazy reset (nếu có) rồi từ chối
    UPDATE public.ai_wallets SET
      free_used = v_free_used,
      window_started_at = v_window_started,
      bonus_remaining = v_bonus,
      updated_at = now()
    WHERE device_hash = p_device_hash;
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'quota_exhausted',
      'remaining_free', 0,
      'remaining_bonus', 0
    );
  END IF;

  -- Trần IP/ngày: chỉ tăng khi còn dưới trần
  INSERT INTO public.ai_ip_counters (ip_hash, day, used)
  VALUES (p_ip_hash, current_date, 1)
  ON CONFLICT (ip_hash, day) DO UPDATE
    SET used = ai_ip_counters.used + 1
    WHERE ai_ip_counters.used < p_ip_daily_limit
  RETURNING used INTO v_ip_used;

  IF v_ip_used IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'ip_ceiling',
      'remaining_free', v_free_left,
      'remaining_bonus', v_bonus
    );
  END IF;

  -- Trừ ví: free trước, bonus sau
  IF v_free_left > 0 THEN
    v_free_used := v_free_used + 1;
  ELSE
    v_bonus := v_bonus - 1;
  END IF;

  UPDATE public.ai_wallets SET
    free_used = v_free_used,
    window_started_at = v_window_started,
    bonus_remaining = v_bonus,
    total_used = total_used + 1,
    last_used_at = now(),
    updated_at = now()
  WHERE device_hash = p_device_hash;

  RETURN jsonb_build_object(
    'allowed', true,
    'reason', 'ok',
    'remaining_free', greatest(p_free_limit - v_free_used, 0),
    'remaining_bonus', v_bonus
  );
END;
$$;

-- Supabase mặc định grant EXECUTE cho anon/authenticated qua default privileges
-- → phải thu hồi tường minh, REVOKE FROM PUBLIC là chưa đủ.
REVOKE ALL ON FUNCTION public.consume_ai_credit(text, text, integer, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_credit(text, text, integer, integer, integer) TO service_role;

-- ---------------------------------------------------------------------------
-- 6) RPC grant_ai_credits — đổi mã đơn đã thanh toán lấy lượt bonus.
--    Mỗi order_code chỉ đổi được 1 lần (UNIQUE trên ai_credit_grants).
-- ---------------------------------------------------------------------------
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
  v_code text := upper(btrim(p_order_code));
  v_kind text;
  v_inserted boolean := false;
  v_w public.ai_wallets%ROWTYPE;
  v_bonus integer;
  v_expires timestamptz;
BEGIN
  IF p_device_hash IS NULL OR length(p_device_hash) < 8 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'bad_device');
  END IF;
  IF v_code IS NULL OR length(v_code) < 4 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'order_not_found');
  END IF;

  -- Đơn nước đã thanh toán?
  IF EXISTS (
    SELECT 1 FROM public.water_orders
    WHERE upper(order_code) = v_code
      AND status IN ('paid', 'shipping', 'delivered')
  ) THEN
    v_kind := 'water';
  ELSIF EXISTS (
    SELECT 1 FROM public.sim_orders
    WHERE upper(order_code) = v_code
      AND status IN ('paid', 'delivering', 'completed')
  ) THEN
    v_kind := 'sim';
  ELSE
    RETURN jsonb_build_object('ok', false, 'error', 'order_not_paid_or_not_found');
  END IF;

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

  -- Bonus cũ đã hết hạn thì bỏ, cộng mới và gia hạn
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

REVOKE ALL ON FUNCTION public.grant_ai_credits(text, text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_ai_credits(text, text, integer, integer) TO service_role;

-- ---------------------------------------------------------------------------
-- 7) RPC bump_ai_answer_hit — tăng hit_count cache (fire-and-forget)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.bump_ai_answer_hit(p_cache_key text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  UPDATE public.ai_answers
  SET hit_count = hit_count + 1, last_hit_at = now()
  WHERE cache_key = p_cache_key;
$$;

REVOKE ALL ON FUNCTION public.bump_ai_answer_hit(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bump_ai_answer_hit(text) TO service_role;
