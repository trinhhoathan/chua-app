'use client';

import { useEffect, useRef, useState } from 'react';
import { getFeatureDef, getOption } from '@/lib/fengshui/nhan-tuong';
import {
  VISION_CONFIDENCE_LABELS,
  type VisionAnalysis,
} from '@/lib/fengshui/nhan-tuong-vision';

/**
 * Khối "Gợi ý từ ảnh" — người dùng chọn/chụp ảnh chân dung, MediaPipe phân
 * tích landmark NGAY TRÊN TRÌNH DUYỆT (ảnh không upload lên máy chủ), rồi
 * điền gợi ý vào form Nhân tướng bên dưới. Thư viện nhận diện chỉ được tải
 * khi người dùng thật sự chọn ảnh (dynamic import).
 */

type Phase = 'idle' | 'analyzing' | 'done' | 'error';

export function NhanTuongPhoto({
  primaryColor,
  onApply,
}: {
  primaryColor: string;
  /** Cha nhận kết quả để pre-fill form. */
  onApply: (analysis: VisionAnalysis) => void;
}) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<VisionAnalysis | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Cho phép chọn lại cùng một file
    e.target.value = '';
    if (!file) return;

    setPhase('analyzing');
    setError(null);
    setAnalysis(null);

    const url = URL.createObjectURL(file);
    setPreviewUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return url;
    });

    try {
      const image = await loadImage(url);
      const { analyzeFacePhoto, VisionError } = await import(
        '@/lib/fengshui/nhan-tuong-vision'
      );
      try {
        const result = await analyzeFacePhoto(image);
        setAnalysis(result);
        setPhase('done');
        onApply(result);
      } catch (err) {
        setError(
          err instanceof VisionError
            ? err.message
            : 'Không phân tích được ảnh này. Quý vị thử ảnh khác giúp.',
        );
        setPhase('error');
      }
    } catch {
      setError('Không đọc được tệp ảnh. Quý vị chọn ảnh JPG/PNG giúp.');
      setPhase('error');
    }
  }

  return (
    <section
      className="border border-fog bg-white p-4 sm:p-5"
      style={{ borderTopWidth: 3, borderTopColor: primaryColor }}
    >
      <p
        className="text-[0.65rem] font-semibold uppercase tracking-[0.25em]"
        style={{ color: primaryColor }}
      >
        Gợi ý từ ảnh · không bắt buộc
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Quý vị có thể chọn một ảnh chân dung{' '}
        <span className="text-ink">chụp thẳng mặt, đủ sáng, không đeo kính
        râm / khẩu trang</span>{' '}
        — máy sẽ đo tỷ lệ khuôn mặt và điền sẵn một phần form bên dưới.{' '}
        <span className="text-ink">
          Ảnh được phân tích ngay trên thiết bị của quý vị, không tải lên máy
          chủ, không lưu lại.
        </span>
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPickFile}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={phase === 'analyzing'}
          className="px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: primaryColor }}
        >
          {phase === 'analyzing'
            ? 'Đang phân tích trên máy…'
            : analysis
              ? 'Chọn ảnh khác'
              : 'Chọn / chụp ảnh chân dung'}
        </button>
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- blob cục bộ, không qua image optimizer
          <img
            src={previewUrl}
            alt="Ảnh chân dung đang phân tích"
            className="size-14 border border-fog object-cover"
          />
        ) : null}
      </div>

      {phase === 'analyzing' ? (
        <p className="mt-2 animate-pulse text-xs text-muted">
          Lần đầu cần tải bộ nhận diện (vài MB) — quý vị đợi chút…
        </p>
      ) : null}

      {phase === 'error' && error ? (
        <p className="mt-2 border border-fog bg-mist px-3 py-2 text-xs text-ink">
          {error}
        </p>
      ) : null}

      {phase === 'done' && analysis ? (
        <div className="mt-3 border border-fog bg-paper/60 p-3">
          <p className="text-xs font-semibold text-ink">
            Đã điền {analysis.suggestions.length} bộ vị vào form bên dưới —
            quý vị lướt xuống xem lại từng mục trước khi luận.
          </p>
          <ul className="mt-2 space-y-1.5">
            {analysis.suggestions.map((s) => {
              const feature = getFeatureDef(s.featureId);
              const option = getOption(s.featureId, s.optionId);
              return (
                <li key={s.featureId} className="text-[11px] leading-relaxed">
                  <span className="font-semibold text-ink">
                    {feature.title}:
                  </span>{' '}
                  <span style={{ color: primaryColor }}>
                    {option?.label ?? s.optionId}
                  </span>{' '}
                  <span className="text-muted">
                    ({VISION_CONFIDENCE_LABELS[s.confidence]}) — {s.reason}
                  </span>
                </li>
              );
            })}
          </ul>
          {analysis.manualFeatures.length ? (
            <p className="mt-2 text-[11px] leading-relaxed text-muted">
              Máy không đo được từ ảnh, quý vị tự đối chiếu giúp:{' '}
              <span className="text-ink">
                {analysis.manualFeatures
                  .map((id) => getFeatureDef(id).title)
                  .join(' · ')}
              </span>
              .
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}
