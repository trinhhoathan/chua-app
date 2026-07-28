'use client';

import { useEffect, useId } from 'react';
import {
  markShown108Modal,
  openWaterDonateForm,
} from '@/lib/water-merit-prompt';

interface Props {
  open: boolean;
  onClose: () => void;
  primaryColor: string;
  templeName: string;
  templeId: string;
  strikeCount?: number;
}

export function WaterMeritCelebrateModal({
  open,
  onClose,
  primaryColor,
  templeName,
  templeId,
  strikeCount = 108,
}: Props) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    markShown108Modal(templeId);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, templeId]);

  if (!open) return null;

  function thinhNuoc() {
    onClose();
    openWaterDonateForm({
      qty: 10,
      note: `Hồi hướng sau ${strikeCount} lượt gõ mõ thanh tịnh tại ${templeName}`,
    });
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-6">
      {/* Chỉ đóng bằng 2 nút bên dưới — tránh click gõ mõ liên tục tắt popup */}
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-[2px]" aria-hidden />
      <div
        role="dialog"
        aria-modal
        aria-labelledby={titleId}
        className="relative z-10 w-full sm:max-w-md max-h-[min(92vh,36rem)] overflow-y-auto bg-paper border border-fog shadow-[0_28px_80px_-24px_rgba(0,0,0,0.55)] xam-result-pop"
      >
        <div
          className="px-6 pt-6 pb-4 border-b border-fog"
          style={{
            background: `linear-gradient(165deg, ${primaryColor}18, transparent 70%)`,
          }}
        >
          <p
            className="text-[0.65rem] uppercase tracking-[0.22em] mb-2"
            style={{ color: primaryColor }}
          >
            Công đức thanh tịnh
          </p>
          <h2 id={titleId} className="font-display text-2xl text-ink leading-snug">
            Nam mô A Di Đà Phật
          </h2>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-ink leading-relaxed">
            Quý Phật tử đã tích tụ{' '}
            <strong className="tabular-nums">{strikeCount}</strong> lượt Gõ Mõ
            Thanh Tịnh tại <strong>{templeName}</strong>.
          </p>
          <p className="text-sm text-muted leading-relaxed">
            Quý vị có muốn Phát Tâm Thỉnh Nước Tinh Khiết để gửi giọt nước mát
            lành dâng cúng Tam Bảo và gieo duyên cho khách hành hương không?
          </p>

          <button
            type="button"
            onClick={thinhNuoc}
            className="w-full px-5 py-3 text-sm text-white font-medium"
            style={{ backgroundColor: primaryColor }}
          >
            Phát tâm thỉnh nước dâng chùa
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full px-5 py-2.5 text-sm border border-fog text-muted hover:text-ink hover:border-ink/25"
          >
            Để sau — tiếp tục tu tập
          </button>
          <p className="text-[0.7rem] text-muted text-center leading-relaxed">
            Một giọt nước tinh khiết, muôn phần công đức.
          </p>
        </div>
      </div>
    </div>
  );
}
