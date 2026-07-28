'use client';

import { useState } from 'react';
import { XinXamQuanAmModal } from '@/components/temple/XinXamQuanAmModal';

interface Props {
  primaryColor: string;
  templeName?: string;
  templeId?: string;
  className?: string;
}

export function HeroXinXamButton({
  primaryColor,
  templeName,
  templeId,
  className,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          'inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white/90 border border-white/35 hover:bg-white/10 transition-colors'
        }
      >
        Xin quẻ Quan Âm
      </button>
      <XinXamQuanAmModal
        open={open}
        onClose={() => setOpen(false)}
        primaryColor={primaryColor}
        templeName={templeName}
        templeId={templeId}
      />
    </>
  );
}
