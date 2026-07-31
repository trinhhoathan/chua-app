import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { requireAdmin, assertTempleAccess } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import {
  buildMapsSearchUrl,
  fetchGoogleMapsMediaViaApify,
} from '@/lib/apify-google-maps';
import type { GalleryImage } from '@/types/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
/** Apify Google Maps thường chạy 1–3 phút */
export const maxDuration = 300;

type Body = {
  templeId?: string;
  /** Ghi đè / bổ sung URL Google Maps place hoặc search */
  mapsUrl?: string;
  /** true = thay toàn bộ thư viện bằng link Maps; false = giữ ảnh local, thêm Maps */
  replaceGallery?: boolean;
  maxImages?: number;
  maxReviews?: number;
};

function isLocalOrStorageUrl(url: string): boolean {
  const u = url.trim();
  return u.startsWith('/') || u.includes('supabase.co/storage');
}

export async function POST(req: Request) {
  let ctx;
  try {
    ctx = await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 });
  }

  if (!ctx.isSuperAdmin) {
    return NextResponse.json(
      { error: 'Chỉ SuperAdmin mới dùng được chức năng này.' },
      { status: 403 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Yêu cầu không hợp lệ.' }, { status: 400 });
  }

  const templeId = String(body.templeId ?? '').trim();
  if (!templeId) {
    return NextResponse.json({ error: 'Thiếu templeId.' }, { status: 400 });
  }

  try {
    await assertTempleAccess(templeId);
  } catch {
    return NextResponse.json({ error: 'Không có quyền với chùa này.' }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: temple, error: findErr } = await supabase
    .from('temples')
    .select(
      'id, name, address, maps_url, maps_embed_url, hero_image_url, gallery',
    )
    .eq('id', templeId)
    .maybeSingle();

  if (findErr || !temple) {
    return NextResponse.json(
      { error: findErr?.message || 'Không tìm thấy chùa.' },
      { status: 404 },
    );
  }

  const overrideMaps = String(body.mapsUrl ?? '').trim();
  const existingMaps =
    typeof temple.maps_url === 'string' ? temple.maps_url.trim() : '';
  const startUrl =
    overrideMaps ||
    existingMaps ||
    buildMapsSearchUrl(String(temple.name), temple.address as string | null);

  if (!startUrl.includes('google.com/maps') && !startUrl.includes('maps.app.goo.gl')) {
    return NextResponse.json(
      {
        error:
          'Cần link Google Maps hợp lệ (maps_url của chùa) hoặc tên/địa chỉ để tìm kiếm.',
      },
      { status: 400 },
    );
  }

  try {
    const media = await fetchGoogleMapsMediaViaApify({
      startUrl,
      templeName: String(temple.name),
      maxImages: body.maxImages,
      maxReviews: body.maxReviews,
    });

    if (!media.gallery.length && !media.reviews.length) {
      return NextResponse.json(
        {
          error:
            'Không lấy được ảnh/đánh giá. Thử nhập đúng link Google Maps của chùa.',
        },
        { status: 422 },
      );
    }

    const existingGallery = Array.isArray(temple.gallery)
      ? (temple.gallery as GalleryImage[])
      : [];
    const localKeep = existingGallery.filter(
      (g) => g?.url && isLocalOrStorageUrl(String(g.url)),
    );

    const replace = body.replaceGallery !== false;
    const gallery: GalleryImage[] = replace
      ? media.gallery
      : [
          ...localKeep,
          ...media.gallery.filter(
            (g) => !localKeep.some((l) => l.url === g.url),
          ),
        ].slice(0, 60);

    const patch: Record<string, unknown> = {
      gallery,
      reviews: media.reviews,
      updated_at: new Date().toISOString(),
    };

    if (media.googleRating != null) patch.google_rating = media.googleRating;
    if (media.googleReviewCount != null) {
      patch.google_review_count = media.googleReviewCount;
    }
    if (media.mapsUrl) patch.maps_url = media.mapsUrl;
    if (media.mapsEmbedUrl) patch.maps_embed_url = media.mapsEmbedUrl;
    if (media.address && !temple.address) patch.address = media.address;

    // Hero: chỉ set nếu chưa có — dùng link CDN, không tải file
    if (!temple.hero_image_url && media.gallery[0]?.url) {
      patch.hero_image_url = media.gallery[0].url;
    }

    const { error: upErr } = await supabase
      .from('temples')
      .update(patch)
      .eq('id', templeId);

    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    revalidateTag('temples', 'max');
    revalidatePath('/quan-tri/hinh-anh');
    revalidatePath('/');

    return NextResponse.json({
      ok: true,
      title: media.title,
      gallery,
      hero_image_url: (patch.hero_image_url as string | undefined) ?? temple.hero_image_url,
      galleryCount: gallery.length,
      mapsGalleryCount: media.gallery.length,
      reviewsCount: media.reviews.length,
      googleRating: media.googleRating,
      googleReviewCount: media.googleReviewCount,
      mapsUrl: (patch.maps_url as string | undefined) ?? media.mapsUrl ?? startUrl,
      heroUpdated: Boolean(patch.hero_image_url && !temple.hero_image_url),
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Không lấy được dữ liệu Google Maps.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
