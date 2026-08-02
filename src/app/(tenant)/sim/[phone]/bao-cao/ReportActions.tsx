'use client';

import { useState } from 'react';

export function ReportActions({
  primaryColor,
  zaloUrl,
}: {
  primaryColor: string;
  zaloUrl: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // trình duyệt cũ: chọn thủ công trên thanh địa chỉ
      window.prompt('Sao chép liên kết báo cáo:', window.location.href);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex h-10 items-center gap-2 px-4 text-sm font-semibold text-white"
        style={{ backgroundColor: primaryColor }}
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" />
        </svg>
        Tải báo cáo PDF
      </button>
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex h-10 items-center gap-2 border border-fog bg-paper px-4 text-sm font-medium text-ink hover:border-ink/30"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <rect x="9" y="9" width="12" height="12" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        {copied ? 'Đã sao chép liên kết' : 'Sao chép link chia sẻ'}
      </button>
      <a
        href={zaloUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-10 items-center bg-[#0068FF] px-4 text-sm font-medium text-white"
      >
        Hỏi thầy qua Zalo
      </a>
      <p className="basis-full text-[0.68rem] text-muted sm:basis-auto">
        Bấm &ldquo;Tải báo cáo PDF&rdquo; rồi chọn &ldquo;Lưu dưới dạng PDF&rdquo; trong hộp thoại in.
      </p>
    </div>
  );
}
