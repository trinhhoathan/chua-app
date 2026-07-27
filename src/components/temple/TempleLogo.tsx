'use client';

import { useId, useState } from 'react';
import { resolveTempleLogoUrl } from '@/lib/temple-logo';

function DharmaWheelIcon({ className }: { className?: string }) {
  const gid = useId().replace(/:/g, '');
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Bieu tuong Phat giao"
    >
      <defs>
        <radialGradient id={gid} cx="50%" cy="42%" r="58%">
          <stop offset="0%" stopColor="#F6E7B2" />
          <stop offset="55%" stopColor="#D4A84B" />
          <stop offset="100%" stopColor="#8B6914" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill={`url(#${gid})`} />
      <circle
        cx="60"
        cy="60"
        r="48"
        fill="none"
        stroke="#FFF8E7"
        strokeWidth="1.5"
        opacity="0.55"
      />
      <circle cx="60" cy="60" r="8" fill="#FFF8E7" />
      <circle cx="60" cy="60" r="4.5" fill="#7A1F1F" />
      <g stroke="#FFF8E7" strokeWidth="3" strokeLinecap="round">
        <line x1="60" y1="22" x2="60" y2="48" />
        <line x1="60" y1="72" x2="60" y2="98" />
        <line x1="22" y1="60" x2="48" y2="60" />
        <line x1="72" y1="60" x2="98" y2="60" />
        <line x1="33.1" y1="33.1" x2="51.5" y2="51.5" />
        <line x1="68.5" y1="68.5" x2="86.9" y2="86.9" />
        <line x1="86.9" y1="33.1" x2="68.5" y2="51.5" />
        <line x1="51.5" y1="68.5" x2="33.1" y2="86.9" />
      </g>
      <circle
        cx="60"
        cy="60"
        r="36"
        fill="none"
        stroke="#FFF8E7"
        strokeWidth="2.5"
      />
      <circle
        cx="60"
        cy="60"
        r="41"
        fill="none"
        stroke="#FFF8E7"
        strokeWidth="1"
        opacity="0.45"
      />
    </svg>
  );
}

export function TempleLogo({
  logoUrl,
  name,
  className,
}: {
  logoUrl: string | null | undefined;
  name: string;
  className?: string;
}) {
  const resolved = resolveTempleLogoUrl(logoUrl);
  const [failed, setFailed] = useState(false);

  if (!resolved || failed) {
    return (
      <DharmaWheelIcon
        className={className ?? 'h-14 w-14 mb-6 shrink-0'}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved}
      alt={`Logo ${name}`}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
