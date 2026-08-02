'use client';

import type { CSSProperties, ReactNode } from 'react';
import { openWaterDonateForm } from '@/lib/water-merit-prompt';

interface Props {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  qty?: number;
  note?: string;
}

export function OpenWaterDonateButton({
  children,
  className,
  style,
  qty,
  note,
}: Props) {
  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={() => openWaterDonateForm({ qty, note })}
    >
      {children}
    </button>
  );
}
