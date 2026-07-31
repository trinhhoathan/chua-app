'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  updateAbbottPortrait,
  updateTempleGallery,
  updateTempleHero,
  uploadTempleMedia,
} from '@/app/actions/admin';
import { compressImageForUpload } from '@/lib/compress-image';
import type { GalleryImage } from '@/types/database';
import { ImageCropDialog } from './ImageCropDialog';

export type MediaTemple = {
  id: string;
  name: string;
  abbott_name: string | null;
  abbott_image_url: string | null;
  hero_image_url: string | null;
  gallery: GalleryImage[];
  maps_url?: string | null;
  address?: string | null;
};

const HERO_ASPECT = 16 / 9;
const PORTRAIT_ASPECT = 3 / 4;

type CropKind = 'hero' | 'abbott';

type CropSession = {
  kind: CropKind;
  src: string;
  fileName: string;
};

async function uploadCompressed(
  templeId: string,
  kind: 'abbott' | 'gallery' | 'hero',
  file: File,
  skipCompress = false,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    const compressed = skipCompress
      ? file
      : await compressImageForUpload(file, {
          maxEdge: kind === 'abbott' ? 1400 : kind === 'hero' ? 1920 : 1600,
          quality: 0.84,
        });
    if (compressed.size > 2 * 1024 * 1024) {
      return {
        ok: false,
        error: 'Ảnh vẫn quá lớn sau khi nén (tối đa 2MB).',
      };
    }
    const fd = new FormData();
    fd.set('templeId', templeId);
    fd.set('kind', kind);
    fd.set('file', compressed);
    const res = await uploadTempleMedia(fd);
    if (!res.ok || !res.url) {
      return { ok: false, error: res.error ?? 'Không tải được ảnh.' };
    }
    return { ok: true, url: res.url };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Không xử lý được ảnh.',
    };
  }
}

export function MediaAdminBoard({
  temples,
  isSuperAdmin = false,
}: {
  temples: MediaTemple[];
  isSuperAdmin?: boolean;
}) {
  const [templeId, setTempleId] = useState(temples[0]?.id ?? '');
  const current = temples.find((t) => t.id === templeId) ?? temples[0];
  const [portrait, setPortrait] = useState(current?.abbott_image_url ?? '');
  const [hero, setHero] = useState(current?.hero_image_url ?? '');
  const [gallery, setGallery] = useState<GalleryImage[]>(
    current?.gallery ?? [],
  );
  const [mapsUrlInput, setMapsUrlInput] = useState(current?.maps_url ?? '');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [importingMaps, setImportingMaps] = useState(false);
  const [cropSession, setCropSession] = useState<CropSession | null>(null);

  useEffect(() => {
    return () => {
      if (cropSession?.src) URL.revokeObjectURL(cropSession.src);
    };
  }, [cropSession]);

  function onSelectTemple(id: string) {
    const t = temples.find((x) => x.id === id);
    setTempleId(id);
    setPortrait(t?.abbott_image_url ?? '');
    setHero(t?.hero_image_url ?? '');
    setGallery(t?.gallery ?? []);
    setMapsUrlInput(t?.maps_url ?? '');
    setMsg(null);
    setErr(null);
    closeCrop();
  }

  async function importFromGoogleMaps() {
    if (!templeId || !isSuperAdmin) return;
    setErr(null);
    setMsg(null);
    setImportingMaps(true);
    try {
      const res = await fetch('/api/quan-tri/google-maps-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templeId,
          mapsUrl: mapsUrlInput.trim() || undefined,
          replaceGallery: true,
          maxImages: 40,
          maxReviews: 60,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        gallery?: GalleryImage[];
        hero_image_url?: string | null;
        galleryCount?: number;
        reviewsCount?: number;
        googleRating?: number | null;
        googleReviewCount?: number | null;
        heroUpdated?: boolean;
        mapsUrl?: string;
      };
      if (!res.ok || !data.ok) {
        setErr(data.error ?? 'Không lấy được dữ liệu Google Maps.');
        return;
      }

      if (Array.isArray(data.gallery)) setGallery(data.gallery);
      if (data.hero_image_url) setHero(data.hero_image_url);
      if (data.mapsUrl) setMapsUrlInput(data.mapsUrl);

      const parts = [
        `Đã lấy ${data.galleryCount ?? data.gallery?.length ?? 0} link ảnh`,
        `${data.reviewsCount ?? 0} đánh giá`,
      ];
      if (data.googleRating != null) {
        parts.push(`${data.googleRating}★ (${data.googleReviewCount ?? 0})`);
      }
      if (data.heroUpdated) parts.push('đã gắn banner từ Maps');
      setMsg(
        `${parts.join(' · ')}. Chỉ lưu link CDN — không tải file về server.`,
      );
    } catch (e) {
      setErr(
        e instanceof Error
          ? e.message
          : 'Lỗi kết nối khi gọi Google Maps / Apify.',
      );
    } finally {
      setImportingMaps(false);
    }
  }

  function closeCrop() {
    setCropSession((prev) => {
      if (prev?.src) URL.revokeObjectURL(prev.src);
      return null;
    });
  }

  function openCrop(kind: CropKind, file: File) {
    setErr(null);
    setMsg(null);
    setCropSession((prev) => {
      if (prev?.src) URL.revokeObjectURL(prev.src);
      return {
        kind,
        src: URL.createObjectURL(file),
        fileName: file.name,
      };
    });
  }

  async function onCroppedConfirm(file: File) {
    if (!templeId || !cropSession) return;
    const kind = cropSession.kind;
    closeCrop();
    setUploading(true);
    setErr(null);
    setMsg(null);

    const up = await uploadCompressed(templeId, kind, file, true);
    setUploading(false);
    if (!up.ok) {
      setErr(up.error);
      return;
    }

    start(async () => {
      if (kind === 'hero') {
        const res = await updateTempleHero({
          templeId,
          imageUrl: up.url,
        });
        if (!res.ok) {
          setErr(res.error ?? 'Không lưu được ảnh banner.');
          return;
        }
        setHero(up.url);
        setMsg('Đã cập nhật ảnh banner trang chủ.');
        return;
      }

      const res = await updateAbbottPortrait({
        templeId,
        imageUrl: up.url,
      });
      if (!res.ok) {
        setErr(res.error ?? 'Không lưu được ảnh chân dung.');
        return;
      }
      setPortrait(up.url);
      setMsg('Đã cập nhật ảnh chân dung trụ trì.');
    });
  }

  function removeHero() {
    if (!templeId) return;
    setErr(null);
    setMsg(null);
    start(async () => {
      const res = await updateTempleHero({ templeId, imageUrl: null });
      if (!res.ok) {
        setErr(res.error ?? 'Không gỡ được ảnh banner.');
        return;
      }
      setHero('');
      setMsg('Đã gỡ ảnh banner.');
    });
  }

  function removePortrait() {
    if (!templeId) return;
    setErr(null);
    setMsg(null);
    start(async () => {
      const res = await updateAbbottPortrait({ templeId, imageUrl: null });
      if (!res.ok) {
        setErr(res.error ?? 'Không gỡ được ảnh.');
        return;
      }
      setPortrait('');
      setMsg('Đã gỡ ảnh chân dung.');
    });
  }

  async function onGalleryPick(files: FileList | null) {
    if (!files?.length || !templeId) return;
    setErr(null);
    setMsg(null);
    setUploading(true);

    const next = [...gallery];
    const errors: string[] = [];

    for (const file of Array.from(files).slice(0, 12)) {
      const up = await uploadCompressed(templeId, 'gallery', file);
      if (!up.ok) {
        errors.push(up.error);
        continue;
      }
      next.unshift({
        url: up.url,
        alt: current?.name ? `${current.name}` : undefined,
      });
    }

    setUploading(false);

    if (next.length === gallery.length) {
      setErr(errors[0] ?? 'Không tải được ảnh.');
      return;
    }

    start(async () => {
      const res = await updateTempleGallery({ templeId, gallery: next });
      if (!res.ok) {
        setErr(res.error ?? 'Không lưu được thư viện.');
        return;
      }
      setGallery(next);
      setMsg(
        errors.length
          ? `Đã thêm một phần ảnh. Lỗi: ${errors[0]}`
          : 'Đã thêm ảnh vào thư viện.',
      );
    });
  }

  function removeGalleryAt(index: number) {
    if (!templeId) return;
    const next = gallery.filter((_, i) => i !== index);
    setErr(null);
    setMsg(null);
    start(async () => {
      const res = await updateTempleGallery({ templeId, gallery: next });
      if (!res.ok) {
        setErr(res.error ?? 'Không xóa được ảnh.');
        return;
      }
      setGallery(next);
      setMsg('Đã xóa ảnh khỏi thư viện.');
    });
  }

  function moveGallery(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= gallery.length || !templeId) return;
    const next = [...gallery];
    const [item] = next.splice(index, 1);
    next.splice(j, 0, item);
    setErr(null);
    setMsg(null);
    start(async () => {
      const res = await updateTempleGallery({ templeId, gallery: next });
      if (!res.ok) {
        setErr(res.error ?? 'Không đổi thứ tự được.');
        return;
      }
      setGallery(next);
    });
  }

  if (!current) {
    return <p className="text-sm text-muted">Chưa có chùa để cấu hình.</p>;
  }

  const busy = uploading || pending || importingMaps;

  return (
    <div className="space-y-8">
      {temples.length > 1 ? (
        <label className="block text-xs text-muted max-w-md">
          Chùa
          <select
            value={templeId}
            onChange={(e) => onSelectTemple(e.target.value)}
            className="mt-1 w-full border border-fog px-3 py-2 bg-white text-sm"
          >
            {temples.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p className="text-sm font-medium text-ink">{current.name}</p>
      )}

      {msg ? (
        <p className="text-sm text-jade-deep bg-jade/10 border border-jade/20 p-3">
          {msg}
        </p>
      ) : null}
      {err ? (
        <p className="text-sm text-lacquer bg-lacquer/5 border border-lacquer/20 p-3">
          {err}
        </p>
      ) : null}

      <section className="border border-fog bg-paper p-5 md:p-6 space-y-4">
        <div>
          <h2 className="font-display text-xl text-ink">Ảnh banner trang chủ</h2>
          <p className="mt-1 text-sm text-muted">
            Ảnh nền toàn màn hình phía trên trang chủ. Sau khi chọn ảnh, hãy
            kéo/phóng để cắt khung 16:9 cho đẹp.
          </p>
        </div>

        <div className="space-y-3">
          <div className="relative w-full max-w-2xl aspect-video overflow-hidden bg-fog border border-fog">
            {hero ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={hero}
                alt="Banner trang chủ"
                className="size-full object-cover"
              />
            ) : (
              <div className="size-full flex items-center justify-center text-xs text-muted px-2 text-center">
                Chưa có ảnh banner
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer px-4 py-2 text-sm text-white bg-ink hover:bg-jade-deep">
              {busy ? 'Đang tải…' : 'Thay ảnh banner'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/*"
                disabled={busy}
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  e.target.value = '';
                  if (f) openCrop('hero', f);
                }}
              />
            </label>
            {hero ? (
              <button
                type="button"
                disabled={busy}
                onClick={removeHero}
                className="text-xs text-lacquer underline"
              >
                Gỡ ảnh banner
              </button>
            ) : null}
          </div>
          <p className="text-[11px] text-muted max-w-lg">
            JPG/PNG/WebP · cắt khung 16:9 · tự nén · tối đa ~2MB. Phần quan
            trọng nên để giữa ảnh vì trên điện thoại hai bên có thể bị cắt thêm.
          </p>
        </div>
      </section>

      <section className="border border-fog bg-paper p-5 md:p-6 space-y-4">
        <div>
          <h2 className="font-display text-xl text-ink">Ảnh chân dung trụ trì</h2>
          <p className="mt-1 text-sm text-muted">
            Hiện ở mục Trụ trì trên trang chủ
            {current.abbott_name ? ` (${current.abbott_name})` : ''}. Có thể cắt
            khung 3:4 trước khi lưu.
          </p>
        </div>

        <div className="flex flex-wrap items-start gap-4">
          <div className="relative w-36 aspect-[3/4] overflow-hidden bg-fog border border-fog">
            {portrait ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={portrait}
                alt="Chân dung trụ trì"
                className="size-full object-cover object-top"
              />
            ) : (
              <div className="size-full flex items-center justify-center text-xs text-muted px-2 text-center">
                Chưa có ảnh
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="inline-flex cursor-pointer px-4 py-2 text-sm border border-fog bg-white hover:bg-mist">
              {busy ? 'Đang tải…' : 'Chọn ảnh từ máy / điện thoại'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/*"
                disabled={busy}
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  e.target.value = '';
                  if (f) openCrop('abbott', f);
                }}
              />
            </label>
            {portrait ? (
              <button
                type="button"
                disabled={busy}
                onClick={removePortrait}
                className="block text-xs text-lacquer underline"
              >
                Gỡ ảnh chân dung
              </button>
            ) : null}
            <p className="text-[11px] text-muted max-w-xs">
              JPG/PNG/WebP · cắt khung 3:4 · tự nén · tối đa ~2MB
            </p>
          </div>
        </div>
      </section>

      <section className="border border-fog bg-paper p-5 md:p-6 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-ink">Thư viện ảnh</h2>
            <p className="mt-1 text-sm text-muted">
              Ảnh hiện ở mục «Thư viện ảnh» trên trang chủ ({gallery.length} ảnh).
            </p>
          </div>
          <label className="inline-flex cursor-pointer px-4 py-2 text-sm text-white bg-ink hover:bg-jade-deep">
            {busy && !importingMaps ? 'Đang tải…' : 'Thêm ảnh'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*"
              multiple
              disabled={busy}
              className="sr-only"
              onChange={(e) => {
                const files = e.target.files;
                e.target.value = '';
                void onGalleryPick(files);
              }}
            />
          </label>
        </div>

        {isSuperAdmin ? (
          <div className="rounded-sm border border-dashed border-fog bg-mist/40 p-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-ink">
                SuperAdmin · Lấy từ Google Maps (Apify)
              </p>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Một lần nhấn: lấy link ảnh CDN + đánh giá Google Maps, ghi vào
                thư viện và review của chùa. Không tải file ảnh về server.
                Có thể mất 1–3 phút.
              </p>
            </div>
            <label className="block text-xs text-muted">
              Link Google Maps (tuỳ chọn — để trống sẽ dùng maps_url hoặc tìm theo
              tên/địa chỉ)
              <input
                type="url"
                value={mapsUrlInput}
                onChange={(e) => setMapsUrlInput(e.target.value)}
                placeholder="https://www.google.com/maps/place/..."
                disabled={busy}
                className="mt-1 w-full border border-fog px-3 py-2 bg-white text-sm text-ink"
              />
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() => void importFromGoogleMaps()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white bg-jade-deep hover:bg-ink disabled:opacity-50"
            >
              {importingMaps
                ? 'Đang lấy từ Google Maps…'
                : 'Lấy ảnh & đánh giá Google Maps'}
            </button>
          </div>
        ) : null}

        {gallery.length === 0 ? (
          <p className="text-sm text-muted py-6 text-center border border-dashed border-fog">
            Chưa có ảnh trong thư viện.
          </p>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {gallery.map((img, idx) => (
              <li
                key={`${img.url}-${idx}`}
                className="border border-fog bg-white overflow-hidden"
              >
                <div className="relative aspect-[4/3] bg-fog">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.alt || `Ảnh ${idx + 1}`}
                    className="size-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between gap-1 p-2 text-[11px]">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={busy || idx === 0}
                      onClick={() => moveGallery(idx, -1)}
                      className="px-1.5 py-0.5 border border-fog disabled:opacity-30"
                      title="Đưa lên trước"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={busy || idx === gallery.length - 1}
                      onClick={() => moveGallery(idx, 1)}
                      className="px-1.5 py-0.5 border border-fog disabled:opacity-30"
                      title="Đưa xuống sau"
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => removeGalleryAt(idx)}
                    className="text-lacquer underline"
                  >
                    Xóa
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ImageCropDialog
        open={Boolean(cropSession)}
        imageSrc={cropSession?.src ?? null}
        fileName={cropSession?.fileName}
        aspect={
          cropSession?.kind === 'abbott' ? PORTRAIT_ASPECT : HERO_ASPECT
        }
        maxEdge={cropSession?.kind === 'abbott' ? 1400 : 1920}
        title={
          cropSession?.kind === 'abbott'
            ? 'Cắt ảnh chân dung'
            : 'Cắt ảnh banner'
        }
        hint={
          cropSession?.kind === 'abbott'
            ? 'Kéo ảnh và chỉnh phóng to để mặt trụ trì nằm đẹp trong khung dọc 3:4.'
            : 'Kéo ảnh và chỉnh phóng to để cảnh chính nằm trong khung ngang 16:9.'
        }
        onCancel={closeCrop}
        onConfirm={(file) => void onCroppedConfirm(file)}
      />
    </div>
  );
}
