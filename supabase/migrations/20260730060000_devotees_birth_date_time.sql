ALTER TABLE public.devotees
  ADD COLUMN IF NOT EXISTS birth_date date,
  ADD COLUMN IF NOT EXISTS birth_time time without time zone;

UPDATE public.devotees
SET birth_year = EXTRACT(YEAR FROM birth_date)::integer
WHERE birth_date IS NOT NULL
  AND (birth_year IS NULL OR birth_year <> EXTRACT(YEAR FROM birth_date)::integer);
