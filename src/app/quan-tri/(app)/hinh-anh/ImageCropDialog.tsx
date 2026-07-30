'use client';

import { useCallback, useEffect, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { cropAndCompressImage } from '@/lib/compress-image';

type Props = {
  open: boolean;
  imageSrc: string | null;
  fileName?: string;
  aspect: number;
  title?: string;
  hint?: string;
  maxEdge?: number;
  onCancel: () => void;
  onConfirm: (file: File) => void;
};

export function ImageCropDialog({
  open,
  imageSrc,
  fileName,
  aspect,
  title = 'Cắt ảnh',
  hint,
  maxEdge = 1920,
  onCancel,
  onConfirm,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setBusy(false);
    setError(null);
  }, [open, imageSrc]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  async function handleConfirm() {
    if (!imageSrc || !croppedAreaPixels) return;
    setBusy(true);
    setError(null);
    try {
      const file = await cropAndCompressImage(imageSrc, croppedAreaPixels, {
        maxEdge,
        quality: 0.86,
        fileName: fileName ?? 'anh-banner',
      });
      onConfirm(file);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không cắt được ảnh.');
      setBusy(false);
    }
  }

  if (!open || !imageSrc) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/70 p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-dialog-title"
    >
      <div className="w-full max-w-2xl bg-paper shadow-lg flex flex-col max-h-[100dvh] sm:max-h-[90vh]">
        <div className="px-4 py-3 border-b border-fog shrink-0">
          <h2
            id="crop-dialog-title"
            className="font-display text-lg text-ink"
          >
            {title}
          </h2>
          {hint ? (
            <p className="mt-1 text-xs text-muted leading-relaxed">{hint}</p>
          ) : null}
        </div>

        <div className="relative w-full aspect-[16/10] bg-ink shrink-0">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid
            objectFit="contain"
          />
        </div>

        <div className="px-4 py-3 space-y-3 border-t border-fog shrink-0">
          <label className="flex items-center gap-3 text-xs text-muted">
            <span className="w-12 shrink-0">Phóng</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-jade-deep"
            />
          </label>

          {error ? (
            <p className="text-sm text-lacquer">{error}</p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={onCancel}
              className="px-4 py-2 text-sm border border-fog bg-white hover:bg-mist disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={busy || !croppedAreaPixels}
              onClick={() => void handleConfirm()}
              className="px-4 py-2 text-sm text-white bg-ink hover:bg-jade-deep disabled:opacity-50"
            >
              {busy ? 'Đang xử lý…' : 'Dùng phần đã cắt'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
