import type { GalleryImage, TempleReview } from '@/types/database';

const ACTOR = 'compass/crawler-google-places';

export type ApifyPlaceMedia = {
  title: string | null;
  address: string | null;
  mapsUrl: string | null;
  mapsEmbedUrl: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  gallery: GalleryImage[];
  reviews: TempleReview[];
  location: { lat: number; lng: number } | null;
};

function getToken(): string {
  const token = process.env.APIFY_TOKEN || process.env.APIFY_API_TOKEN;
  if (!token?.trim()) {
    throw new Error(
      'Thiếu APIFY_TOKEN. Thêm vào .env.local (Apify Console → Settings → Integrations).',
    );
  }
  return token.trim();
}

async function apifyFetch(
  path: string,
  opts: { method?: string; body?: unknown; token: string },
): Promise<unknown> {
  const { method = 'GET', body, token } = opts;
  const sep = path.includes('?') ? '&' : '?';
  const url = `https://api.apify.com/v2${path}${sep}token=${encodeURIComponent(token)}`;
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Apify ${method} ${path} → ${res.status}: ${text.slice(0, 400)}`);
  }
  return res.json();
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Chỉ giữ link CDN Google (không tải file về server). */
export function isGoogleMapsCdnUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      /googleusercontent\.com|ggpht\.com/i.test(u.hostname) &&
      !/accounts\.google|ServiceLogin/i.test(url)
    );
  } catch {
    return false;
  }
}

export function normalizeMapsCdnUrl(url: string): string {
  let u = url.trim();
  // Bỏ size param cũ, gắn bản lớn hơn cho gallery
  u = u
    .replace(/=w\d+-h\d+[^"'&\s]*/i, '')
    .replace(/=s\d+[^"'&\s]*/i, '');
  if (!/=w\d+/i.test(u) && /googleusercontent\.com/i.test(u)) {
    u += '=w1600-h1200-k-no';
  }
  return u;
}

export function buildMapsSearchUrl(name: string, address?: string | null): string {
  const q = [name.trim(), address?.trim()].filter(Boolean).join(' ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}&hl=vi`;
}

function asItems(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];
  if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: Record<string, unknown>[] }).data;
  }
  return [];
}

function parsePlace(place: Record<string, unknown>, templeName: string): ApifyPlaceMedia {
  const title =
    typeof place.title === 'string' && place.title.trim()
      ? place.title.trim()
      : templeName;

  const imageUrls = Array.isArray(place.imageUrls)
    ? place.imageUrls.filter((u): u is string => typeof u === 'string')
    : [];
  if (typeof place.imageUrl === 'string' && place.imageUrl.trim()) {
    imageUrls.unshift(place.imageUrl.trim());
  }

  const seen = new Set<string>();
  const gallery: GalleryImage[] = [];
  for (const raw of imageUrls) {
    if (!isGoogleMapsCdnUrl(raw)) continue;
    const url = normalizeMapsCdnUrl(raw);
    if (seen.has(url)) continue;
    seen.add(url);
    gallery.push({
      url,
      alt: `Ảnh Google Maps — ${title} (${gallery.length + 1})`,
    });
    if (gallery.length >= 60) break;
  }

  const reviewsRaw = Array.isArray(place.reviews) ? place.reviews : [];
  const reviews: TempleReview[] = [];
  for (const r of reviewsRaw) {
    if (!r || typeof r !== 'object') continue;
    const row = r as Record<string, unknown>;
    const author =
      (typeof row.name === 'string' && row.name.trim()) ||
      (typeof row.author === 'string' && row.author.trim()) ||
      'Phật tử';
    const text = String(row.text ?? row.textTranslated ?? '')
      .replace(/\s+/g, ' ')
      .trim();
    const stars = row.stars ?? row.rating;
    const rating =
      typeof stars === 'number' && stars >= 1 && stars <= 5
        ? stars
        : undefined;
    const relative =
      typeof row.publishAt === 'string'
        ? row.publishAt
        : typeof row.relative_time === 'string'
          ? row.relative_time
          : undefined;
    reviews.push({
      author,
      rating,
      text,
      relative_time: relative,
    });
    if (reviews.length >= 80) break;
  }

  const loc = place.location as { lat?: number; lng?: number } | null;
  const location =
    loc && typeof loc.lat === 'number' && typeof loc.lng === 'number'
      ? { lat: loc.lat, lng: loc.lng }
      : null;

  const totalScore =
    typeof place.totalScore === 'number' ? place.totalScore : null;
  const reviewsCount =
    typeof place.reviewsCount === 'number'
      ? place.reviewsCount
      : reviews.length || null;

  const mapsUrl =
    typeof place.url === 'string' && place.url.includes('google.com/maps')
      ? place.url
      : null;

  return {
    title,
    address: typeof place.address === 'string' ? place.address : null,
    mapsUrl,
    mapsEmbedUrl: location
      ? `https://www.google.com/maps?q=${location.lat},${location.lng}&z=17&hl=vi&output=embed`
      : null,
    googleRating: totalScore,
    googleReviewCount: reviewsCount,
    gallery,
    reviews,
    location,
  };
}

/**
 * Chạy Apify Google Maps Scraper — chỉ trả về link ảnh CDN + đánh giá.
 * Không tải/binary ảnh về server.
 */
export async function fetchGoogleMapsMediaViaApify(input: {
  startUrl: string;
  templeName: string;
  maxImages?: number;
  maxReviews?: number;
}): Promise<ApifyPlaceMedia> {
  const token = getToken();
  const maxImages = Math.min(Math.max(input.maxImages ?? 40, 1), 60);
  const maxReviews = Math.min(Math.max(input.maxReviews ?? 60, 0), 80);

  const actorInput = {
    startUrls: [{ url: input.startUrl }],
    language: 'vi',
    maxCrawledPlacesPerSearch: 1,
    maxReviews,
    maxImages,
    reviewsSort: 'newest',
    scrapeReviewsPersonalData: true,
    scrapeImageAuthors: false,
    includeWebResults: false,
    skipClosedPlaces: false,
  };

  const start = (await apifyFetch(`/acts/${encodeURIComponent(ACTOR)}/runs`, {
    method: 'POST',
    body: actorInput,
    token,
  })) as { data?: { id?: string; defaultDatasetId?: string; status?: string } };

  const runId = start.data?.id;
  const datasetId = start.data?.defaultDatasetId;
  if (!runId || !datasetId) {
    throw new Error('Không khởi chạy được Apify actor.');
  }

  let status = start.data?.status ?? 'RUNNING';
  for (let i = 0; i < 90; i++) {
    await sleep(5000);
    const info = (await apifyFetch(`/actor-runs/${runId}`, { token })) as {
      data?: { status?: string };
    };
    status = info.data?.status ?? status;
    if (['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'].includes(status)) break;
  }

  if (status !== 'SUCCEEDED') {
    throw new Error(`Apify kết thúc với trạng thái ${status}.`);
  }

  const itemsPayload = await apifyFetch(
    `/datasets/${datasetId}/items?format=json&clean=true`,
    { token },
  );
  const items = asItems(itemsPayload);
  if (!items.length) {
    throw new Error(
      'Apify không tìm thấy địa điểm. Kiểm tra link Google Maps hoặc tên/địa chỉ chùa.',
    );
  }

  return parsePlace(items[0], input.templeName);
}
