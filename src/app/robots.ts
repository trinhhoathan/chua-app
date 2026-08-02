import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

/** robots.txt đa tenant — sitemap trỏ về domain đang truy cập. */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const h = await headers();
  const proto = h.get('x-forwarded-proto') || 'https';
  const host = h.get('x-current-domain') || h.get('host') || '';
  const base = `${proto}://${host}`.replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/quan-tri', '/api/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
