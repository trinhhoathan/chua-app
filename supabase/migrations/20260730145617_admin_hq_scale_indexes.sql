-- Indexes for SuperAdmin HQ multi-temple lists & temple search (scale ~15k)

CREATE INDEX IF NOT EXISTS devotees_temple_created_at_idx
  ON public.devotees (temple_id, created_at DESC);

CREATE INDEX IF NOT EXISTS inventory_items_temple_active_idx
  ON public.inventory_items (temple_id)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS broadcast_campaigns_temple_created_at_idx
  ON public.broadcast_campaigns (temple_id, created_at DESC);

CREATE INDEX IF NOT EXISTS temple_events_temple_starts_at_idx
  ON public.temple_events (temple_id, starts_at DESC);

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS temples_name_trgm_idx
  ON public.temples USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS temples_domain_trgm_idx
  ON public.temples USING gin (domain gin_trgm_ops);
