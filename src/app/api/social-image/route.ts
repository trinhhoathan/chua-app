import { readFile } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { getCurrentTemple } from '@/lib/tenant';

export const runtime = 'nodejs';

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

async function loadHeroBuffer(heroUrl: string): Promise<Buffer | null> {
  if (heroUrl.startsWith('/')) {
    const filePath = path.join(process.cwd(), 'public', heroUrl);
    try {
      return await readFile(filePath);
    } catch {
      return null;
    }
  }

  if (!/^https?:\/\//i.test(heroUrl)) return null;

  try {
    const res = await fetch(heroUrl, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

/**
 * Ảnh Open Graph tối ưu (~1200×630, JPEG nhẹ) theo chùa của domain hiện tại.
 * Zalo/Facebook cần URL tuyệt đối + file không quá nặng.
 */
export async function GET() {
  const temple = await getCurrentTemple();
  const hero = temple?.hero_image_url?.trim();
  if (!hero) {
    return new Response('Not found', { status: 404 });
  }

  const input = await loadHeroBuffer(hero);
  if (!input) {
    return new Response('Image unavailable', { status: 404 });
  }

  const body = await sharp(input)
    .rotate()
    .resize(OG_WIDTH, OG_HEIGHT, {
      fit: 'cover',
      position: 'centre',
    })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();

  return new Response(new Uint8Array(body), {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control':
        'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
    },
  });
}
