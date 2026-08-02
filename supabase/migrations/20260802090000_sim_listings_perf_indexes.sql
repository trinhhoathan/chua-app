-- Index cho sort mặc định trang /sim và sort "mới về kho"
-- (temple_id, status) là filter nóng; featured + overall_score / created_at là ORDER BY.

CREATE INDEX IF NOT EXISTS sim_listings_temple_status_feat_score_idx
  ON public.sim_listings (temple_id, status, featured DESC, overall_score DESC);

CREATE INDEX IF NOT EXISTS sim_listings_temple_status_created_idx
  ON public.sim_listings (temple_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS sim_listings_temple_status_price_idx
  ON public.sim_listings (temple_id, status, price_vnd);

-- Lọc theo tags (array) — @> / contains
CREATE INDEX IF NOT EXISTS sim_listings_tags_gin_idx
  ON public.sim_listings USING gin (tags);

-- Lọc theo quẻ Kinh Dịch
CREATE INDEX IF NOT EXISTS sim_listings_temple_status_que_idx
  ON public.sim_listings (temple_id, status, que_number);
