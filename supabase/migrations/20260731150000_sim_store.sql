-- Kho Sim Phong Thủy (Lý Gia Phúc An)
-- sim_listings: kho số bán, điểm phong thủy precompute từ engine Bát Cực Linh Số
-- sim_orders:   đơn đặt mua sim, thanh toán chuyển khoản VietQR về TK của tenant
-- temples.bank_bin: mã BIN NAPAS để sinh VietQR từ tài khoản riêng của tenant

ALTER TABLE public.temples ADD COLUMN IF NOT EXISTS bank_bin text;

-- ---------------------------------------------------------------------------
-- 1) sim_listings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sim_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  temple_id uuid NOT NULL REFERENCES public.temples (id) ON DELETE CASCADE,
  -- 10 chữ số chuẩn hóa (0xxxxxxxxx)
  phone text NOT NULL CHECK (phone ~ '^0[0-9]{9}$'),
  phone_display text NOT NULL,
  network text NOT NULL DEFAULT 'khac',
  price_vnd bigint NOT NULL DEFAULT 0 CHECK (price_vnd >= 0),
  original_price_vnd bigint CHECK (original_price_vnd >= 0),
  status text NOT NULL DEFAULT 'available' CHECK (
    status IN ('available', 'reserved', 'sold', 'hidden')
  ),
  featured boolean NOT NULL DEFAULT false,
  tags text[] NOT NULL DEFAULT '{}',
  -- Điểm phong thủy precompute (engine Bát Cực Linh Số)
  overall_score integer NOT NULL DEFAULT 0,
  du_nien_score integer NOT NULL DEFAULT 0,
  verdict text NOT NULL DEFAULT 'trung_binh' CHECK (
    verdict IN ('tot', 'kha', 'trung_binh', 'yeu')
  ),
  nut integer NOT NULL DEFAULT 0,
  element text NOT NULL DEFAULT 'tho' CHECK (
    element IN ('kim', 'moc', 'thuy', 'hoa', 'tho')
  ),
  so_ly_81 integer NOT NULL DEFAULT 0,
  aspects jsonb NOT NULL DEFAULT '{}'::jsonb,
  star_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  careers text[] NOT NULL DEFAULT '{}',
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (temple_id, phone)
);

CREATE INDEX IF NOT EXISTS sim_listings_temple_status_score_idx
  ON public.sim_listings (temple_id, status, overall_score DESC);

CREATE INDEX IF NOT EXISTS sim_listings_temple_price_idx
  ON public.sim_listings (temple_id, price_vnd);

-- Tìm kiếm kiểu 090*8888 (LIKE prefix/suffix)
CREATE INDEX IF NOT EXISTS sim_listings_phone_pattern_idx
  ON public.sim_listings (phone text_pattern_ops);

ALTER TABLE public.sim_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read visible sims" ON public.sim_listings;
CREATE POLICY "Public read visible sims"
  ON public.sim_listings
  FOR SELECT
  TO public
  USING (status <> 'hidden');

DROP POLICY IF EXISTS "Temple admins manage sims" ON public.sim_listings;
CREATE POLICY "Temple admins manage sims"
  ON public.sim_listings
  FOR ALL
  TO authenticated
  USING (
    temple_id IN (SELECT public.user_temple_ids())
    OR public.is_super_admin()
  )
  WITH CHECK (
    temple_id IN (SELECT public.user_temple_ids())
    OR public.is_super_admin()
  );

-- ---------------------------------------------------------------------------
-- 2) sim_orders
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sim_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code text NOT NULL UNIQUE,
  temple_id uuid NOT NULL REFERENCES public.temples (id) ON DELETE CASCADE,
  sim_id uuid REFERENCES public.sim_listings (id) ON DELETE SET NULL,
  -- snapshot tại thời điểm đặt (giữ nguyên khi sim đổi giá / bị xóa)
  phone text NOT NULL,
  phone_display text NOT NULL,
  price_vnd bigint NOT NULL DEFAULT 0,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  note text,
  -- thông tin sinh (tùy chọn) để thầy tư vấn / chọn ngày kích sim
  birth_date date,
  birth_time time,
  gender text CHECK (gender IN ('nam', 'nu')),
  status text NOT NULL DEFAULT 'pending_payment' CHECK (
    status IN ('pending_payment', 'paid', 'delivering', 'completed', 'cancelled')
  ),
  payment_ref text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sim_orders_temple_created_idx
  ON public.sim_orders (temple_id, created_at DESC);

CREATE INDEX IF NOT EXISTS sim_orders_temple_status_idx
  ON public.sim_orders (temple_id, status);

ALTER TABLE public.sim_orders ENABLE ROW LEVEL SECURITY;

-- Khách vãng lai tạo đơn (server action dùng anon key khi thiếu service role)
DROP POLICY IF EXISTS "Anyone can create pending sim order" ON public.sim_orders;
CREATE POLICY "Anyone can create pending sim order"
  ON public.sim_orders
  FOR INSERT
  TO public
  WITH CHECK (status = 'pending_payment');

DROP POLICY IF EXISTS "Temple admins manage sim orders" ON public.sim_orders;
CREATE POLICY "Temple admins manage sim orders"
  ON public.sim_orders
  FOR ALL
  TO authenticated
  USING (
    temple_id IN (SELECT public.user_temple_ids())
    OR public.is_super_admin()
  )
  WITH CHECK (
    temple_id IN (SELECT public.user_temple_ids())
    OR public.is_super_admin()
  );

-- ---------------------------------------------------------------------------
-- 3) RPC: tra cứu đơn theo mã (trang thanh toán public, không cần đăng nhập)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_sim_order_by_code(p_code text)
RETURNS SETOF public.sim_orders
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT *
  FROM public.sim_orders
  WHERE upper(order_code) = upper(trim(p_code))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_sim_order_by_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_sim_order_by_code(text) TO anon, authenticated;
