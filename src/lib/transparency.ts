import { supabase } from './supabase';

export interface WaterTransparencyRecent {
  customer_name: string;
  quantity: number;
  total_amount: number;
  paid_at: string | null;
  order_code: string;
}

export interface WaterTransparency {
  total_quantity: number;
  total_amount: number;
  order_count: number;
  recent: WaterTransparencyRecent[];
}

const EMPTY: WaterTransparency = {
  total_quantity: 0,
  total_amount: 0,
  order_count: 0,
  recent: [],
};

export async function getTempleWaterTransparency(
  templeId: string,
): Promise<WaterTransparency> {
  const { data, error } = await supabase.rpc('get_temple_water_transparency', {
    p_temple_id: templeId,
  });

  if (error || !data || typeof data !== 'object') {
    return EMPTY;
  }

  const row = data as Record<string, unknown>;
  const recentRaw = Array.isArray(row.recent) ? row.recent : [];

  return {
    total_quantity: Number(row.total_quantity ?? 0),
    total_amount: Number(row.total_amount ?? 0),
    order_count: Number(row.order_count ?? 0),
    recent: recentRaw.map((item) => {
      const r = item as Record<string, unknown>;
      return {
        customer_name: String(r.customer_name ?? 'Phật tử'),
        quantity: Number(r.quantity ?? 0),
        total_amount: Number(r.total_amount ?? 0),
        paid_at: r.paid_at ? String(r.paid_at) : null,
        order_code: String(r.order_code ?? ''),
      };
    }),
  };
}

export function formatPaidAt(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso));
}
