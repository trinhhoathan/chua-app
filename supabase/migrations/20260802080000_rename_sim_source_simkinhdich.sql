-- Đổi tên kho sim LGPA: "Sim Kinh Dịch" → "simkinhdich.com"
-- và đảm bảo mọi sim chưa gán đều thuộc kho này.

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

  -- Đổi tên kho cũ nếu còn
  UPDATE public.sim_sources
  SET
    name = 'simkinhdich.com',
    contact_note = COALESCE(
      NULLIF(trim(contact_note), ''),
      'Kho sim chính — liên hệ mua hàng qua simkinhdich.com. Hoa hồng 30% khi bán thành công.'
    ),
    updated_at = now()
  WHERE temple_id = v_temple
    AND name = 'Sim Kinh Dịch';

  -- Đảm bảo kho simkinhdich.com tồn tại
  INSERT INTO public.sim_sources (
    temple_id, name, contact_note, commission_percent, active
  )
  VALUES (
    v_temple,
    'simkinhdich.com',
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

  -- Gán mọi sim chưa có kho
  UPDATE public.sim_listings
  SET source_id = v_source
  WHERE temple_id = v_temple
    AND source_id IS NULL;
END $$;
