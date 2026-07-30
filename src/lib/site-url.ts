import { headers } from 'next/headers';
import type { Temple } from '@/types/database';

/** Origin của request hiện tại (proto + host). */
export async function getRequestOrigin(): Promise<string> {
  const h = await headers();
  const xfHost = h.get('x-forwarded-host')?.split(',')[0]?.trim();
  const hostHeader = xfHost || h.get('host') || '';
  const host = hostHeader.split(':')[0].toLowerCase().trim();
  if (!host) return 'http://localhost:3000';

  const isLocal =
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.startsWith('127.');

  if (isLocal) {
    const port = hostHeader.includes(':')
      ? hostHeader.split(':')[1]
      : '3000';
    return `http://${host}:${port}`;
  }

  const proto = (
    h.get('x-forwarded-proto')?.split(',')[0]?.trim() || 'https'
  ).toLowerCase();
  return `${proto === 'http' ? 'http' : 'https'}://${host}`;
}

/**
 * Origin công khai để gắn OG/canonical.
 * Ưu tiên domain chính của chùa (tránh Vercel mặc định / domain chùa khác).
 */
export function getTemplePublicOrigin(
  temple: Pick<Temple, 'domain'>,
  requestOrigin: string,
): string {
  const domain = temple.domain?.trim().toLowerCase();
  if (
    domain &&
    !domain.includes('localhost') &&
    !domain.endsWith('.vercel.app')
  ) {
    return `https://${domain}`;
  }
  return requestOrigin;
}

/** Đưa URL media (tương đối hoặc tuyệt đối) về dạng absolute. */
export function toAbsoluteMediaUrl(
  url: string | null | undefined,
  origin: string,
): string | null {
  if (!url?.trim()) return null;
  const raw = url.trim();
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('//')) return `https:${raw}`;
  try {
    return new URL(raw, origin.endsWith('/') ? origin : `${origin}/`).href;
  } catch {
    return null;
  }
}
