import { requireAdmin, searchTemples } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { GalleryImage } from '@/types/database';
import { resolveTempleScope } from '@/lib/temple-scope';
import { TempleRequiredNotice } from '@/components/admin/TempleRequiredNotice';
import { MediaAdminBoard, type MediaTemple } from './MediaAdminBoard';

function asGallery(raw: unknown): GalleryImage[] {
  if (!Array.isArray(raw)) return [];
  const out: GalleryImage[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const url = String((item as { url?: unknown }).url ?? '').trim();
    if (!url) continue;
    const altRaw = (item as { alt?: unknown }).alt;
    const alt =
      typeof altRaw === 'string' && altRaw.trim() ? altRaw.trim() : undefined;
    out.push(alt ? { url, alt } : { url });
  }
  return out;
}

interface Props {
  searchParams: Promise<{ temple?: string }>;
}

export default async function HinhAnhPage({ searchParams }: Props) {
  const ctx = await requireAdmin();
  const sp = await searchParams;
  const scope = await resolveTempleScope(ctx, sp.temple);
  const supabase = await createClient();

  let templeIds: string[] = [];
  if (scope.templeId) {
    templeIds = [scope.templeId];
  } else if (!ctx.isSuperAdmin) {
    templeIds = ctx.temples.map((t) => t.id);
  } else {
    const found = await searchTemples('', 30);
    templeIds = found.map((t) => t.id);
  }

  if (templeIds.length === 0) {
    return <TempleRequiredNotice feature="Hình ảnh" />;
  }

  const { data } = await supabase
    .from('temples')
    .select(
      'id, name, abbott_name, abbott_image_url, hero_image_url, gallery, maps_url, address',
    )
    .in('id', templeIds)
    .eq('is_active', true)
    .order('name');

  const temples: MediaTemple[] = (data ?? []).map((t) => ({
    id: String(t.id),
    name: String(t.name),
    abbott_name: (t.abbott_name as string) ?? null,
    abbott_image_url: (t.abbott_image_url as string) ?? null,
    hero_image_url: (t.hero_image_url as string) ?? null,
    gallery: asGallery(t.gallery),
    maps_url: (t.maps_url as string) ?? null,
    address: (t.address as string) ?? null,
  }));

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Hình ảnh</h1>
      <p className="mt-2 text-sm text-muted max-w-2xl leading-relaxed">
        Trụ trì tự cập nhật ảnh banner, chân dung và thư viện ảnh trên trang
        chủ. Có thể cắt khung trước khi lưu; hệ thống nén gọn ảnh từ điện thoại
        hoặc máy tính.
      </p>
      <div className="mt-8">
        <MediaAdminBoard
          temples={temples}
          isSuperAdmin={ctx.isSuperAdmin}
        />
      </div>
    </div>
  );
}
