'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { GalleryImage } from '@/types/database';

interface Props {
  images: GalleryImage[];
  templeName: string;
  openIndex: number | null;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
}

export function GalleryLightbox({
  images,
  templeName,
  openIndex,
  onClose,
  onChangeIndex,
}: Props) {
  const open = openIndex != null && openIndex >= 0 && openIndex < images.length;
  const current = open ? images[openIndex!] : null;
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (dir: -1 | 1) => {
      if (openIndex == null || images.length === 0) return;
      const next = (openIndex + dir + images.length) % images.length;
      onChangeIndex(next);
    },
    [images.length, onChangeIndex, openIndex],
  );

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    }
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [go, onClose, open]);

  if (!open || !current) return null;

  return (
    <div
      className="fixed inset-0 z-[80] bg-ink/90 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Xem ảnh thư viện"
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-4 py-3 text-white/80 text-sm">
        <p>
          {openIndex! + 1} / {images.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 border border-white/30 hover:bg-white/10 text-xs"
        >
          Đóng
        </button>
      </div>

      <div
        className="relative flex-1 flex items-center justify-center px-12 md:px-20 pb-8 touch-pan-y"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => {
          touchX.current = e.changedTouches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const start = touchX.current;
          const end = e.changedTouches[0]?.clientX;
          touchX.current = null;
          if (start == null || end == null || images.length < 2) return;
          const delta = end - start;
          if (Math.abs(delta) < 48) return;
          go(delta > 0 ? -1 : 1);
        }}
      >
        {images.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Ảnh trước"
              onClick={() => go(-1)}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 size-10 md:size-12 border border-white/30 text-white text-xl hover:bg-white/10"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Ảnh sau"
              onClick={() => go(1)}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 size-10 md:size-12 border border-white/30 text-white text-xl hover:bg-white/10"
            >
              ›
            </button>
          </>
        ) : null}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.url}
          alt={current.alt || `${templeName} — ảnh ${(openIndex ?? 0) + 1}`}
          className="max-h-[78vh] max-w-full object-contain shadow-2xl"
        />
      </div>

      {current.alt ? (
        <p className="px-4 pb-4 text-center text-sm text-white/70">
          {current.alt}
        </p>
      ) : null}
    </div>
  );
}

export function useGalleryLightbox() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return {
    openIndex,
    openAt: (index: number) => setOpenIndex(index),
    close: () => setOpenIndex(null),
    setOpenIndex,
  };
}
