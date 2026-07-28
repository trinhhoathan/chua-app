'use client';

import { useEffect, useId, useState } from 'react';
import { XinXamDrawPanel } from '@/components/temple/XinXamDrawPanel';

interface Props {
  primaryColor?: string;
  templeName?: string;
  templeId?: string;
  open: boolean;
  onClose: () => void;
}

export function XinXamQuanAmModal({
  primaryColor = '#7A1F1F',
  templeName,
  templeId,
  open,
  onClose,
}: Props) {
  const titleId = useId();
  const [panelKey, setPanelKey] = useState(0);

  useEffect(() => {
    if (!open) return;
    setPanelKey((k) => k + 1);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 bg-ink/55 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal
        aria-labelledby={titleId}
        className="relative z-10 w-full sm:max-w-lg max-h-[min(92vh,40rem)] overflow-y-auto bg-paper border border-fog shadow-[0_28px_80px_-24px_rgba(0,0,0,0.55)]"
      >
        <div
          className="px-5 py-4 border-b border-fog flex items-start justify-between gap-3"
          style={{
            background: `linear-gradient(160deg, ${primaryColor}14, transparent)`,
          }}
        >
          <div>
            <p
              className="text-[0.65rem] uppercase tracking-[0.22em] mb-1"
              style={{ color: primaryColor }}
            >
              Quan Âm Linh Xăm
            </p>
            <h2 id={titleId} className="font-display text-xl text-ink">
              Xin xăm Quan Âm online
            </h2>
            <p className="mt-1 text-xs text-muted leading-relaxed">
              Thành tâm cầu nguyện rồi lắc ống — rút 1 trong 100 quẻ.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 size-8 inline-flex items-center justify-center text-muted hover:text-ink"
            aria-label="Đóng"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-6">
          <XinXamDrawPanel
            key={panelKey}
            primaryColor={primaryColor}
            templeName={templeName}
            templeId={templeId}
            extraActions={
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm border border-fog text-ink hover:border-ink/30"
              >
                Đóng
              </button>
            }
          />
        </div>
      </div>
    </div>
  );
}
