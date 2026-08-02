-- Nguồn / kho sim (nhà cung cấp) — lọc theo nguồn + liên hệ + hoa hồng khi bán

CREATE TABLE IF NOT EXISTS public.sim_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  temple_id uuid NOT NULL REFERENCES public.temples (id) ON DELETE CASCADE,
  name text NOT NULL,
  contact_name text,
  contact_phone text,
  contact_note text,
  -- % hoa hồng được hưởng khi bán thành công (mặc định 30)
  commission_percent numeric(5, 2) NOT NULL DEFAULT 30
    CHECK (commission_percent >= 0 AND commission_percent <= 100),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (temple_id, name)
);

CREATE INDEX IF NOT EXISTS sim_sources_temple_active_idx
  ON public.sim_sources (temple_id, active);

ALTER TABLE public.sim_sources ENABLE ROW LEVEL SECURITY;

-- Nguồn chứa SĐT liên hệ + hoa hồng → chỉ admin chùa / super admin
DROP POLICY IF EXISTS "Public read active sim sources" ON public.sim_sources;
DROP POLICY IF EXISTS "Temple admins read sim sources" ON public.sim_sources;
CREATE POLICY "Temple admins read sim sources"
  ON public.sim_sources
  FOR SELECT
  TO authenticated
  USING (
    temple_id IN (SELECT public.user_temple_ids())
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS "Temple admins manage sim sources" ON public.sim_sources;
CREATE POLICY "Temple admins manage sim sources"
  ON public.sim_sources
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

-- Gắn nguồn vào từng sim
ALTER TABLE public.sim_listings
  ADD COLUMN IF NOT EXISTS source_id uuid REFERENCES public.sim_sources (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS sim_listings_temple_source_idx
  ON public.sim_listings (temple_id, source_id);

-- Snapshot nguồn trên đơn (giữ khi sim đổi nguồn / bị xóa)
ALTER TABLE public.sim_orders
  ADD COLUMN IF NOT EXISTS source_id uuid REFERENCES public.sim_sources (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_name text,
  ADD COLUMN IF NOT EXISTS commission_percent numeric(5, 2);

-- Seed kho sim "simkinhdich.com" cho tenant LGPA + gán toàn bộ sim hiện có
DO $$
DECLARE
  v_temple uuid;
  v_source uuid;
BEGIN
  SELECT id INTO v_temple
  FROM public.temples
  WHERE payment_code = 'LGPA'
     OR domain ILIKE '%lygiaphucan%'
     OR domain ILIKE '%ly-gia-phuc-an%'
  LIMIT 1;

  IF v_temple IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.sim_sources (
    temple_id, name, contact_name, contact_note, commission_percent, active
  )
  VALUES (
    v_temple,
    'simkinhdich.com',
    NULL,
    'Kho sim chính — liên hệ mua hàng qua simkinhdich.com. Hoa hồng 30% khi bán thành công.',
    30,
    true
  )
  ON CONFLICT (temple_id, name) DO UPDATE
    SET updated_at = now()
  RETURNING id INTO v_source;

  IF v_source IS NULL THEN
    SELECT id INTO v_source
    FROM public.sim_sources
    WHERE temple_id = v_temple AND name = 'simkinhdich.com'
    LIMIT 1;
  END IF;

  UPDATE public.sim_listings
  SET source_id = v_source
  WHERE temple_id = v_temple
    AND source_id IS NULL;
END $$;
