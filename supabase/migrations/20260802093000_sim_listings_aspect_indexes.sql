-- Index expression cho lọc/sort mục đích (aspects->key) trên sim đang bán.
-- Khớp filter PostgREST: aspects->tai_loc gte ... + temple_id + status=available.

CREATE INDEX IF NOT EXISTS sim_listings_aspect_tai_loc_idx
  ON public.sim_listings (temple_id, ((aspects -> 'tai_loc')))
  WHERE status = 'available';

CREATE INDEX IF NOT EXISTS sim_listings_aspect_su_nghiep_idx
  ON public.sim_listings (temple_id, ((aspects -> 'su_nghiep')))
  WHERE status = 'available';

CREATE INDEX IF NOT EXISTS sim_listings_aspect_quy_nhan_idx
  ON public.sim_listings (temple_id, ((aspects -> 'quy_nhan')))
  WHERE status = 'available';

CREATE INDEX IF NOT EXISTS sim_listings_aspect_giai_han_idx
  ON public.sim_listings (temple_id, ((aspects -> 'giai_han')))
  WHERE status = 'available';

CREATE INDEX IF NOT EXISTS sim_listings_aspect_bao_an_idx
  ON public.sim_listings (temple_id, ((aspects -> 'bao_an')))
  WHERE status = 'available';

CREATE INDEX IF NOT EXISTS sim_listings_aspect_can_bang_idx
  ON public.sim_listings (temple_id, ((aspects -> 'can_bang')))
  WHERE status = 'available';

CREATE INDEX IF NOT EXISTS sim_listings_aspect_suc_khoe_idx
  ON public.sim_listings (temple_id, ((aspects -> 'suc_khoe')))
  WHERE status = 'available';

CREATE INDEX IF NOT EXISTS sim_listings_aspect_tinh_duyen_idx
  ON public.sim_listings (temple_id, ((aspects -> 'tinh_duyen')))
  WHERE status = 'available';

CREATE INDEX IF NOT EXISTS sim_listings_aspect_gia_dao_idx
  ON public.sim_listings (temple_id, ((aspects -> 'gia_dao')))
  WHERE status = 'available';

CREATE INDEX IF NOT EXISTS sim_listings_aspect_con_cai_idx
  ON public.sim_listings (temple_id, ((aspects -> 'con_cai')))
  WHERE status = 'available';

CREATE INDEX IF NOT EXISTS sim_listings_aspect_tinh_cam_idx
  ON public.sim_listings (temple_id, ((aspects -> 'tinh_cam')))
  WHERE status = 'available';
