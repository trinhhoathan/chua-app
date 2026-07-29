CREATE OR REPLACE FUNCTION public.register_devotee_web(
  p_temple_id uuid,
  p_full_name text,
  p_phone text,
  p_dharma_name text DEFAULT NULL,
  p_birth_date date DEFAULT NULL,
  p_birth_time time without time zone DEFAULT NULL,
  p_birth_year integer DEFAULT NULL,
  p_address text DEFAULT NULL,
  p_note text DEFAULT NULL,
  p_quy_y_date date DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_id uuid;
  v_existing boolean := false;
  v_year integer;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.temples t
    WHERE t.id = p_temple_id AND t.is_active = true
  ) THEN
    RAISE EXCEPTION 'Không tìm thấy chùa.';
  END IF;

  IF p_full_name IS NULL OR length(btrim(p_full_name)) < 2 THEN
    RAISE EXCEPTION 'Vui lòng nhập đầy đủ họ và tên.';
  END IF;

  IF p_phone IS NULL OR length(btrim(p_phone)) < 8 THEN
    RAISE EXCEPTION 'Số điện thoại chưa hợp lệ.';
  END IF;

  v_year := COALESCE(
    p_birth_year,
    CASE WHEN p_birth_date IS NOT NULL THEN EXTRACT(YEAR FROM p_birth_date)::integer ELSE NULL END
  );

  SELECT d.id INTO v_id
  FROM public.devotees d
  WHERE d.temple_id = p_temple_id AND d.phone = btrim(p_phone)
  LIMIT 1;

  IF v_id IS NOT NULL THEN
    v_existing := true;
    UPDATE public.devotees SET
      full_name = btrim(p_full_name),
      dharma_name = NULLIF(btrim(COALESCE(p_dharma_name, '')), ''),
      birth_date = p_birth_date,
      birth_time = p_birth_time,
      birth_year = v_year,
      address = NULLIF(btrim(COALESCE(p_address, '')), ''),
      note = NULLIF(btrim(COALESCE(p_note, '')), ''),
      quy_y_date = p_quy_y_date,
      consent_contact = true,
      preferred_channel = COALESCE(preferred_channel, 'zalo'),
      updated_at = now()
    WHERE id = v_id;
  ELSE
    INSERT INTO public.devotees (
      temple_id,
      full_name,
      phone,
      dharma_name,
      birth_date,
      birth_time,
      birth_year,
      address,
      note,
      quy_y_date,
      consent_contact,
      preferred_channel,
      source
    ) VALUES (
      p_temple_id,
      btrim(p_full_name),
      btrim(p_phone),
      NULLIF(btrim(COALESCE(p_dharma_name, '')), ''),
      p_birth_date,
      p_birth_time,
      v_year,
      NULLIF(btrim(COALESCE(p_address, '')), ''),
      NULLIF(btrim(COALESCE(p_note, '')), ''),
      p_quy_y_date,
      true,
      'zalo',
      'web'
    )
    RETURNING id INTO v_id;
  END IF;

  RETURN jsonb_build_object('id', v_id, 'existing', v_existing);
END;
$$;

REVOKE ALL ON FUNCTION public.register_devotee_web(
  uuid, text, text, text, date, time without time zone, integer, text, text, date
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.register_devotee_web(
  uuid, text, text, text, date, time without time zone, integer, text, text, date
) TO anon, authenticated;
