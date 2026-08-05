/**
 * Kho Sim trung tâm (Lý Gia Phúc An) + đại lý bán trên các domain chùa.
 * Listings luôn thuộc temple LGPA; đơn ghi temple_id = đại lý giới thiệu.
 */

import { unstable_cache } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { isLyGiaPhucAnSite } from '@/lib/ly-gia-phuc-an';
import type { Temple } from '@/types/database';

/** payment_code của temple chứa toàn bộ sim_listings. */
export const SIM_WAREHOUSE_PAYMENT_CODE = 'LGPA';

export type SimStoreTemple = Pick<
  Temple,
  'id' | 'domain' | 'payment_code' | 'name' | 'sim_store_enabled'
>;

/** Site được mở kho sim công khai (đại lý hoặc chính LGPA). */
export function isSimStoreEnabled(
  temple: Pick<Temple, 'sim_store_enabled' | 'payment_code' | 'domain' | 'name'> | null | undefined,
): boolean {
  if (!temple) return false;
  if (temple.sim_store_enabled === true) return true;
  // Fallback trước khi cache/tenant normalize đủ cột mới
  return isLyGiaPhucAnSite(temple);
}

async function loadWarehouseTemple(): Promise<{
  id: string;
  domain: string;
  name: string;
  payment_code: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_account_holder: string | null;
  bank_bin: string | null;
  hotline: string | null;
} | null> {
  const { data } = await supabase
    .from('temples')
    .select(
      'id, domain, name, payment_code, bank_name, bank_account_number, bank_account_holder, bank_bin, hotline',
    )
    .eq('payment_code', SIM_WAREHOUSE_PAYMENT_CODE)
    .eq('is_active', true)
    .maybeSingle();
  if (!data?.id) return null;
  return {
    id: String(data.id),
    domain: String(data.domain ?? ''),
    name: String(data.name ?? ''),
    payment_code: (data.payment_code as string) ?? null,
    bank_name: (data.bank_name as string) ?? null,
    bank_account_number: (data.bank_account_number as string) ?? null,
    bank_account_holder: (data.bank_account_holder as string) ?? null,
    bank_bin: (data.bank_bin as string) ?? null,
    hotline: (data.hotline as string) ?? null,
  };
}

const cachedWarehouse = unstable_cache(
  loadWarehouseTemple,
  ['sim-warehouse-temple'],
  { revalidate: 300, tags: ['temples', 'sims'] },
);

export async function getSimWarehouseTemple() {
  return cachedWarehouse();
}

export async function getSimWarehouseTempleId(): Promise<string | null> {
  const wh = await getSimWarehouseTemple();
  return wh?.id ?? null;
}
