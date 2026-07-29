'use client';

import { useState, useTransition } from 'react';
import {
  updateAbbottPortrait,
  updateTempleGallery,
  uploadTempleMedia,
} from '@/app/actions/admin';
import { compressImageForUpload } from '@/lib/compress-image';
import type { GalleryImage } from '@/types/database';

export type MediaTemple = {
  id: string;
  name: string;
  abbott_name: string | null;
  abbott_image_url: string | null;
  gallery: GalleryImage[];
};

async function uploadCompressed(
  templeId: string,
  kind: 'abbott' | 'gallery',
  file: File,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    const compressed = await compressImageForUpload(file, {
      maxEdge: kind === 'abbott' ? 1400 : 1600,
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

export function MediaAdminBoard({ temples }: { temples: MediaTemple[] }) {
  const [templeId, setTempleId] = useState(temples[0]?.id ?? '');
  const current = temples.find((t) => t.id === templeId) ?? temples[0];
  const [portrait, setPortrait] = useState(current?.abbott_image_url ?? '');
  const [gallery, setGallery] = useState<GalleryImage[]>(
    current?.gallery ?? [],
  );
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);

  function onSelectTemple(id: string) {
    const t = temples.find((x) => x.id === id);
    setTempleId(id);
    setPortrait(t?.abbott_image_url ?? '');
    setGallery(t?.gallery ?? []);
    setMsg(null);
    setErr(null);
  }

  async function onPortraitPick(file: File | null) {
    if (!file || !templeId) return;
    setErr(null);
    setMsg(null);
    setUploading(true);
    const up = await uploadCompressed(templeId, 'abbott', file);
    setUploading(false);
    if (!up.ok) {
      setErr(up.error);
      return;
    }
    start(async () => {
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
          <h2 className="font-display text-xl text-ink">Ảnh chân dung trụ trì</h2>
          <p className="mt-1 text-sm text-muted">
            Hiện ở mục Trụ trì trên trang chủ
            {current.abbott_name ? ` (${current.abbott_name})` : ''}.
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
              {uploading || pending ? 'Đang tải…' : 'Chọn ảnh từ máy / điện thoại'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/*"
                disabled={uploading || pending}
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  e.target.value = '';
                  void onPortraitPick(f);
                }}
              />
            </label>
            {portrait ? (
              <button
                type="button"
                disabled={pending}
                onClick={removePortrait}
                className="block text-xs text-lacquer underline"
              >
                Gỡ ảnh chân dung
              </button>
            ) : null}
            <p className="text-[11px] text-muted max-w-xs">
              JPG/PNG/WebP · tự nén · tối đa ~2MB
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
            {uploading || pending ? 'Đang tải…' : 'Thêm ảnh'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*"
              multiple
              disabled={uploading || pending}
              className="sr-only"
              onChange={(e) => {
                const files = e.target.files;
                e.target.value = '';
                void onGalleryPick(files);
              }}
            />
          </label>
        </div>

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
                      disabled={pending || idx === 0}
                      onClick={() => moveGallery(idx, -1)}
                      className="px-1.5 py-0.5 border border-fog disabled:opacity-30"
                      title="Đưa lên trước"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={pending || idx === gallery.length - 1}
                      onClick={() => moveGallery(idx, 1)}
                      className="px-1.5 py-0.5 border border-fog disabled:opacity-30"
                      title="Đưa xuống sau"
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={pending}
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
    </div>
  );
}
