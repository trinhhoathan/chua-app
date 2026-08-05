import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { getCurrentDomain, getTempleByDomain } from '@/lib/tenant';
import { isLyGiaPhucAnSite } from '@/lib/ly-gia-phuc-an';
import {
  getSimWarehouseTempleId,
  isSimStoreEnabled,
} from '@/lib/sim/warehouse';
import { LY_GIA_PRODUCTS } from '@/lib/ly-gia-products';
import { toolsWithOwnPage } from '@/lib/fengshui/tools';
import { SIM_CAREERS } from '@/lib/sim/careers';

export const dynamic = 'force-dynamic';

/** Sitemap đa tenant — sinh theo domain đang truy cập. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers();
  const proto = h.get('x-forwarded-proto') || 'https';
  const host = h.get('x-current-domain') || h.get('host') || '';
  const base = `${proto}://${host}`.replace(/\/$/, '');

  const domain = await getCurrentDomain();
  const temple = await getTempleByDomain(domain);
  if (!temple) return [{ url: base, lastModified: new Date() }];

  const isLyGia = isLyGiaPhucAnSite(temple);
  const simStore = isSimStoreEnabled(temple);
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1 },
    {
      url: `${base}/phong-thuy`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Các trang công cụ phong thủy (chỉ tool ready, có trang riêng)
  for (const tool of toolsWithOwnPage()) {
    if (tool.status !== 'ready') continue;
    entries.push({
      url: `${base}/phong-thuy/${tool.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: tool.slug === 'boi-sim' && simStore ? 0.9 : 0.6,
    });
  }

  if (isLyGia) {
    entries.push({
      url: `${base}/san-pham`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    });
    for (const product of LY_GIA_PRODUCTS) {
      entries.push({
        url: `${base}/san-pham/${product.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.75,
      });
    }
  }

  if (simStore) {
    entries.push({
      url: `${base}/sim`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    });
    entries.push({
      url: `${base}/sim/so-sanh`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    });
    for (const career of SIM_CAREERS) {
      entries.push({
        url: `${base}/sim/nghe/${career.id}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }

    const warehouseId =
      (await getSimWarehouseTempleId()) ?? (isLyGia ? temple.id : null);
    if (warehouseId) {
      const { data } = await supabase
        .from('sim_listings')
        .select('phone, updated_at')
        .eq('temple_id', warehouseId)
        .eq('status', 'available')
        .order('overall_score', { ascending: false })
        .limit(5000);

      for (const row of data ?? []) {
        entries.push({
          url: `${base}/sim/${row.phone}`,
          lastModified: row.updated_at ? new Date(row.updated_at) : now,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    }
  }

  if (!isLyGia) {
    entries.push({
      url: `${base}/phat-hoc`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  return entries;
}
