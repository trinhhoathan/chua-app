'use client';

import { useEffect, useState } from 'react';
import { HUONG_DAN_TOC } from './toc';

export function HuongDanToc() {
  const [active, setActive] = useState(HUONG_DAN_TOC[0]?.id ?? '');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const ids = HUONG_DAN_TOC.map((t) => t.id);
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              (a.boundingClientRect.top ?? 0) - (b.boundingClientRect.top ?? 0),
          );
        if (visible[0]?.target?.id) setActive(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.25, 0.5] },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const nav = (
    <nav aria-label="Mục lục hướng dẫn" className="space-y-1">
      {HUONG_DAN_TOC.map((item) => {
        const isActive = active === item.id;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={() => setMobileOpen(false)}
            className={`block border-l-2 py-1.5 pl-3 text-[0.8rem] leading-snug transition-colors ${
              isActive
                ? 'border-[var(--primary-color,#7A1F1F)] text-ink font-medium'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="lg:hidden mb-8 border border-fog bg-white/40">
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-ink"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
        >
          Mục lục hướng dẫn
          <span className="text-muted text-xs">{mobileOpen ? 'Đóng' : 'Mở'}</span>
        </button>
        {mobileOpen ? <div className="border-t border-fog px-2 py-3">{nav}</div> : null}
      </div>

      <aside className="hidden lg:block sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
        <p className="mb-3 text-[0.65rem] uppercase tracking-[0.16em] text-gilt">
          Mục lục
        </p>
        {nav}
      </aside>
    </>
  );
}
