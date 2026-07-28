'use client';

interface Props {
  primaryColor: string;
  templeName: string;
  source: 'go_mo' | 'xin_xam';
  onThinhNuoc: () => void;
  onDismiss?: () => void;
  compact?: boolean;
}

export function WaterMeritInlineCta({
  primaryColor,
  templeName,
  source,
  onThinhNuoc,
  onDismiss,
  compact,
}: Props) {
  const copy =
    source === 'xin_xam'
      ? `Sau khi xin xăm, quý vị có thể gieo duyên thỉnh nước tinh khiết dâng ${templeName}.`
      : `Tiếp nối công đức gõ mõ — thỉnh nước tinh khiết dâng ${templeName}.`;

  return (
    <div
      className={`relative border text-left ${
        compact ? 'mt-4 p-3' : 'mt-6 p-4'
      }`}
      style={{
        borderColor: `${primaryColor}40`,
        background: `${primaryColor}0a`,
      }}
    >
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-2 right-2 size-7 text-muted hover:text-ink"
          aria-label="Ẩn gợi ý"
        >
          ×
        </button>
      ) : null}
      <p
        className="text-[0.65rem] uppercase tracking-[0.18em] mb-1 pr-8"
        style={{ color: primaryColor }}
      >
        Gieo duyên cùng chùa
      </p>
      <p className="text-xs text-ink/85 leading-relaxed pr-6">{copy}</p>
      <button
        type="button"
        onClick={onThinhNuoc}
        className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-white px-3 py-2"
        style={{ backgroundColor: primaryColor }}
      >
        <WaterDropIcon />
        Thỉnh nước dâng chùa
      </button>
    </div>
  );
}

function WaterDropIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor" aria-hidden>
      <path d="M8 1.5C8 1.5 3.5 7 3.5 10a4.5 4.5 0 1 0 9 0C12.5 7 8 1.5 8 1.5z" />
    </svg>
  );
}
