import { cache } from 'react';
import { headers } from 'next/headers';
import { unstable_cache } from 'next/cache';
import { supabase } from './supabase';
import type { Temple } from '@/types/database';
import { normalizeContactLinks } from '@/lib/contact-links';

/** Cache temple theo domain — đủ dài để trang public nhanh, CMS vẫn revalidateTag. */
const CACHE_SECONDS = 300;

/**
 * Extract the tenant domain from the current request headers (set by
 * `src/proxy.ts` via the `x-current-domain` header). Falls back to the
 * standard `host` header. Port suffix is stripped so
 * `covien.localhost:3000` resolves as `covien.localhost`.
 * Bare `localhost` is not mapped to any temple.
 */
export async function getCurrentDomain(): Promise<string> {
  const h = await headers();
  const raw = h.get('x-current-domain') || h.get('host') || '';
  return raw.split(':')[0].toLowerCase().trim();
}

async function loadTempleByDomain(domain: string): Promise<Temple | null> {
  if (!domain) return null;

  // First try alias table (supports multiple domains per temple).
  const { data: alias } = await supabase
    .from('temple_domains')
    .select('temple_id')
    .eq('domain', domain)
    .maybeSingle();

  if (alias?.temple_id) {
    const { data: temple } = await supabase
      .from('temples')
      .select('*')
      .eq('id', alias.temple_id)
      .eq('is_active', true)
      .maybeSingle();
    if (temple) return normalizeTemple(temple);
  }

  // Fallback: legacy `temples.domain` direct match.
  const { data: temple } = await supabase
    .from('temples')
    .select('*')
    .eq('domain', domain)
    .eq('is_active', true)
    .maybeSingle();

  return temple ? normalizeTemple(temple) : null;
}

const cachedLoad = unstable_cache(
  async (domain: string) => loadTempleByDomain(domain),
  ['temple-by-domain'],
  { revalidate: CACHE_SECONDS, tags: ['temples'] },
);

export async function getTempleByDomain(
  domain: string,
): Promise<Temple | null> {
  return cachedLoad(domain);
}

/** Dedupe trong cùng 1 request (layout + page + metadata). */
export const getCurrentTemple = cache(async (): Promise<Temple | null> => {
  const domain = await getCurrentDomain();
  return getTempleByDomain(domain);
});

function normalizeTemple(row: Record<string, unknown>): Temple {
  const asArray = (v: unknown) => (Array.isArray(v) ? v : []);
  return {
    id: String(row.id),
    domain: String(row.domain ?? ''),
    name: String(row.name ?? 'Chùa'),
    temple_alt_name: (row.temple_alt_name as string) ?? null,
    slogan: (row.slogan as string) ?? null,
    tagline: (row.tagline as string) ?? null,
    primary_color: (row.primary_color as string) ?? null,
    logo_url: (row.logo_url as string) ?? null,
    hero_image_url: (row.hero_image_url as string) ?? null,
    qr_donate: (row.qr_donate as string) ?? null,
    address: (row.address as string) ?? null,
    maps_url: (row.maps_url as string) ?? null,
    maps_embed_url: (row.maps_embed_url as string) ?? null,
    google_rating:
      row.google_rating == null ? null : Number(row.google_rating),
    google_review_count:
      row.google_review_count == null
        ? null
        : Number(row.google_review_count),
    reviews: asArray(row.reviews) as Temple['reviews'],
    history_summary: (row.history_summary as string) ?? null,
    abbott_name: (row.abbott_name as string) ?? null,
    abbott_title: (row.abbott_title as string) ?? null,
    abbott_bio: (row.abbott_bio as string) ?? null,
    abbott_image_url: (row.abbott_image_url as string) ?? null,
    hotline: (row.hotline as string) ?? null,
    contact_links: normalizeContactLinks(row.contact_links, row.hotline as string | null),
    gallery: asArray(row.gallery) as Temple['gallery'],
    extra_sections: asArray(row.extra_sections) as Temple['extra_sections'],
    timeline: asArray(row.timeline) as Temple['timeline'],
    features: asArray(row.features) as Temple['features'],
    videos: asArray(row.videos) as Temple['videos'],
    bank_name: (row.bank_name as string) ?? null,
    bank_account_number: (row.bank_account_number as string) ?? null,
    bank_account_holder: (row.bank_account_holder as string) ?? null,
    bank_bin: (row.bank_bin as string) ?? null,
    payment_code: (row.payment_code as string) ?? null,
    sim_store_enabled: Boolean(row.sim_store_enabled ?? false),
    sim_agent_commission_pct: Number(row.sim_agent_commission_pct ?? 10),
    water_price_vnd: Number(row.water_price_vnd ?? 80000),
    water_profit_share_pct: Number(row.water_profit_share_pct ?? 50),
    is_active: Boolean(row.is_active ?? true),
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  };
}

export function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + '\u00a0đ';
}
