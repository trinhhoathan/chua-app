'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  searchTemplesAction,
  setWorkingTempleAction,
} from '@/app/actions/temple-scope';
import type { TempleBrief } from '@/lib/auth';

export function TempleScopePicker({
  isSuperAdmin,
  temples,
  selected,
  templeCount,
}: {
  isSuperAdmin: boolean;
  temples: TempleBrief[];
  selected: TempleBrief | null;
  templeCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<TempleBrief[]>(temples);
  const [pending, startTransition] = useTransition();
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const t = setTimeout(() => {
      startTransition(async () => {
        const rows = await searchTemplesAction(q);
        if (!cancelled) setResults(rows);
      });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q, open]);

  if (!isSuperAdmin && temples.length <= 1) {
    return null;
  }

  function applyTemple(id: string | null) {
    startTransition(async () => {
      await setWorkingTempleAction(id);
      const params = new URLSearchParams(searchParams.toString());
      if (id) params.set('temple', id);
      else params.delete('temple');
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
      router.refresh();
      setOpen(false);
    });
  }

  const label = selected
    ? selected.name
    : isSuperAdmin
      ? `Toàn hệ thống (${templeCount.toLocaleString('vi-VN')} Phật tự)`
      : 'Chọn Phật tự';

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="max-w-[min(100vw-2rem,20rem)] truncate px-3 py-1.5 text-xs border border-white/25 hover:bg-white/10 text-left"
        disabled={pending}
      >
        <span className="text-white/50 mr-1.5">Phật tự</span>
        {label}
      </button>
      {open ? (
        <div className="absolute right-0 z-50 mt-1 w-[min(100vw-2rem,22rem)] border border-fog bg-paper text-ink shadow-lg">
          <div className="p-2 border-b border-fog">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm tên hoặc domain…"
              className="w-full px-2 py-1.5 text-sm border border-fog bg-mist outline-none focus:border-ink/30"
            />
          </div>
          {isSuperAdmin ? (
            <button
              type="button"
              onClick={() => applyTemple(null)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-mist border-b border-fog"
            >
              Toàn hệ thống
            </button>
          ) : null}
          <ul className="max-h-64 overflow-y-auto">
            {results.length === 0 ? (
              <li className="px-3 py-3 text-sm text-muted">Không có kết quả</li>
            ) : (
              results.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => applyTemple(t.id)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-mist ${
                      selected?.id === t.id ? 'bg-mist font-medium' : ''
                    }`}
                  >
                    <span className="block truncate">{t.name}</span>
                    <span className="block text-[11px] text-muted truncate">
                      {t.domain}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
