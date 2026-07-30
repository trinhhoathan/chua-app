-- Chùa Cổ Viễn: chuyển domain thichminhthanh.info → thichminhthanh.com

UPDATE public.temples
SET
  domain = 'thichminhthanh.com',
  updated_at = now()
WHERE id = 'a084105a-d028-4f31-81e0-67d2628200f7'
   OR domain = 'thichminhthanh.info';

DELETE FROM public.temple_domains
WHERE domain IN ('thichminhthanh.info', 'www.thichminhthanh.info');

UPDATE public.temple_domains
SET is_primary = false
WHERE temple_id = 'a084105a-d028-4f31-81e0-67d2628200f7';

INSERT INTO public.temple_domains (temple_id, domain, is_primary)
VALUES
  ('a084105a-d028-4f31-81e0-67d2628200f7', 'thichminhthanh.com', true),
  ('a084105a-d028-4f31-81e0-67d2628200f7', 'www.thichminhthanh.com', false)
ON CONFLICT (domain) DO UPDATE
SET
  temple_id = EXCLUDED.temple_id,
  is_primary = EXCLUDED.is_primary;
