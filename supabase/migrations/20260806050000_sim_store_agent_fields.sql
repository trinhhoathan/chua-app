-- Kho sim đại lý: bật store theo temple + % HH đại lý; snapshot HH trên đơn
ALTER TABLE public.temples
  ADD COLUMN IF NOT EXISTS sim_store_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sim_agent_commission_pct numeric(5,2) NOT NULL DEFAULT 10
    CHECK (sim_agent_commission_pct >= 0 AND sim_agent_commission_pct <= 100);

ALTER TABLE public.sim_orders
  ADD COLUMN IF NOT EXISTS agent_commission_percent numeric(5,2)
    CHECK (agent_commission_percent IS NULL OR (agent_commission_percent >= 0 AND agent_commission_percent <= 100));

COMMENT ON COLUMN public.temples.sim_store_enabled IS 'Bật kho sim công khai (đại lý bán từ kho trung tâm LGPA)';
COMMENT ON COLUMN public.temples.sim_agent_commission_pct IS '% hoa hồng đại lý (trụ trì) trên đơn sim phát sinh từ domain này';
COMMENT ON COLUMN public.sim_orders.agent_commission_percent IS 'Snapshot % HH đại lý lúc tạo đơn (tách biệt commission_percent nguồn kho)';

UPDATE public.temples
SET sim_store_enabled = true
WHERE payment_code IN ('LGPA', 'BH', 'CV', 'QL');
