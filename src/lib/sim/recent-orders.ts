import { unstable_cache } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export type RecentSimOrderRow = {
  customer_name: string;
  customer_phone: string;
  phone_display: string;
  created_at: string;
};

async function loadRecentSimOrders(templeId: string): Promise<RecentSimOrderRow[]> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return [];
  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from('sim_orders')
      .select('customer_name, customer_phone, phone_display, created_at')
      .eq('temple_id', templeId)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false })
      .limit(8);
    return (data ?? []) as RecentSimOrderRow[];
  } catch {
    return [];
  }
}

/** Social proof ticker — cache 60s, không query DB mỗi lần lọc/sim. */
export async function getRecentSimOrders(
  templeId: string,
): Promise<RecentSimOrderRow[]> {
  return unstable_cache(
    () => loadRecentSimOrders(templeId),
    ['recent-sim-orders', templeId],
    { revalidate: 60, tags: ['sims', `sims-${templeId}`, `sim-orders-${templeId}`] },
  )();
}
