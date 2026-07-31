'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { SoHousehold } from '@/types/database';
import type { SoPaperSize } from '@/lib/so-render/types';

type TemplateItem = {
  id: number;
  name: string;
  lang: string;
  kind?: string;
  sizes?: string[];
};

type TemplateSet = {
  id: string;
  name: string;
  longsoIds: number[];
};

type Props = {
  households: Pick<SoHousehold, 'id' | 'chu_ho'>[];
  templates: TemplateItem[];
  sets: TemplateSet[];
  initialHouseholdId?: string;
};

const PAPER_SIZES: { value: SoPaperSize; label: string }[] = [
  { value: 'A3', label: 'A3 ngang (42×29.7 cm)' },
  { value: 'A3s', label: 'A3s ngang (47×30 cm)' },
  { value: 'long', label: 'Dài ngang (55×30 cm)' },
  { value: 'super_long', label: 'Siêu dài ngang (79×30 cm)' },
  { value: 'A2', label: 'A2 ngang (60×42 cm)' },
];

const LANG_LABEL: Record<string, string> = {
  qn: 'Quốc ngữ',
  nom: 'Nôm',
  songngu: 'Song ngữ',
};

export function PrintSoBoard({
  households,
  templates,
  sets,
  initialHouseholdId,
}: Props) {
  const [activeSetId, setActiveSetId] = useState<string | null>(
    sets[0]?.id ?? null,
  );
  const [filter, setFilter] = useState('');
  const [langFilter, setLangFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [householdId, setHouseholdId] = useState(
    initialHouseholdId && households.some((h) => h.id === initialHouseholdId)
      ? initialHouseholdId
      : households[0]?.id ?? '',
  );
  const [paperSize, setPaperSize] = useState<SoPaperSize>('A3');

  const templateById = useMemo(() => {
    const m = new Map<number, TemplateItem>();
    for (const t of templates) m.set(t.id, t);
    return m;
  }, [templates]);

  const setIds = useMemo(() => {
    if (!activeSetId) return null;
    const s = sets.find((x) => x.id === activeSetId);
    return s ? new Set(s.longsoIds) : null;
  }, [activeSetId, sets]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return templates.filter((t) => {
      if (setIds && !setIds.has(t.id)) return false;
      if (langFilter !== 'all' && t.lang !== langFilter) return false;
      if (q && !t.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [templates, setIds, langFilter, filter]);

  const selectedTemplates = selectedIds
    .map((id) => templateById.get(id))
    .filter(Boolean) as TemplateItem[];

  const household =
    households.find((h) => h.id === householdId) ?? null;

  function toggleSelect(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function addSetAll() {
    if (!setIds) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of setIds) next.add(id);
      return [...next];
    });
  }

  const previewQs = new URLSearchParams();
  if (householdId) previewQs.set('household', householdId);
  if (selectedIds.length) previewQs.set('longso', selectedIds.join(','));
  previewQs.set('size', paperSize);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-muted mb-1">Hộ tín chủ</label>
          <select
            className="px-3 py-2 text-sm border border-fog bg-paper min-w-[14rem]"
            value={householdId}
            onChange={(e) => setHouseholdId(e.target.value)}
          >
            {households.length === 0 ? (
              <option value="">— Chưa có hộ —</option>
            ) : (
              households.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.chu_ho}
                </option>
              ))
            )}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Khổ giấy</label>
          <select
            className="px-3 py-2 text-sm border border-fog bg-paper"
            value={paperSize}
            onChange={(e) => setPaperSize(e.target.value as SoPaperSize)}
          >
            {PAPER_SIZES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[28rem]">
        <aside className="lg:col-span-3 border border-fog bg-paper overflow-y-auto max-h-[32rem]">
          <div className="p-2 border-b border-fog bg-mist text-xs text-muted flex items-center justify-between gap-2">
            <span>Bộ sớ</span>
            <span className="tabular-nums shrink-0">
              {sets.length} bộ · {templates.length} sớ
            </span>
          </div>
          <button
            type="button"
            className={`w-full text-left px-3 py-2 text-sm border-b border-fog hover:bg-mist ${
              activeSetId === null ? 'bg-mist font-medium' : ''
            }`}
            onClick={() => setActiveSetId(null)}
          >
            Tất cả lòng sớ
          </button>
          {sets.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`w-full text-left px-3 py-2 text-sm border-b border-fog hover:bg-mist ${
                activeSetId === s.id ? 'bg-mist font-medium' : ''
              }`}
              onClick={() => setActiveSetId(s.id)}
            >
              <span className="block">{s.name}</span>
              <span className="text-xs text-muted">
                {s.longsoIds.length} sớ
              </span>
            </button>
          ))}
        </aside>

        <section className="lg:col-span-5 border border-fog bg-paper flex flex-col max-h-[32rem]">
          <div className="p-2 border-b border-fog bg-mist flex flex-wrap gap-2">
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Lọc tên sớ…"
              className="flex-1 min-w-[8rem] px-2 py-1.5 text-sm border border-fog bg-paper"
            />
            <select
              className="px-2 py-1.5 text-sm border border-fog bg-paper"
              value={langFilter}
              onChange={(e) => setLangFilter(e.target.value)}
            >
              <option value="all">Mọi ngôn ngữ</option>
              <option value="qn">Quốc ngữ</option>
              <option value="nom">Nôm</option>
              <option value="songngu">Song ngữ</option>
            </select>
            {activeSetId ? (
              <button
                type="button"
                onClick={addSetAll}
                className="px-2 py-1.5 text-xs border border-fog hover:bg-mist"
              >
                Chọn cả bộ
              </button>
            ) : null}
          </div>
          <ul className="overflow-y-auto flex-1 text-sm">
            {filtered.length === 0 ? (
              <li className="p-4 text-muted text-center">Không có sớ khớp.</li>
            ) : (
              filtered.map((t) => {
                const on = selectedIds.includes(t.id);
                return (
                  <li key={t.id} className="border-b border-fog">
                    <button
                      type="button"
                      onClick={() => toggleSelect(t.id)}
                      className={`w-full text-left px-3 py-2 hover:bg-mist ${
                        on ? 'bg-mist' : ''
                      }`}
                    >
                      <span className="font-medium">{t.name}</span>
                      <span className="block text-xs text-muted">
                        #{t.id} · {LANG_LABEL[t.lang] ?? t.lang}
                        {on ? ' · đã chọn' : ''}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </section>

        <aside className="lg:col-span-4 border border-fog bg-paper flex flex-col max-h-[32rem]">
          <div className="p-2 border-b border-fog bg-mist text-xs text-muted flex justify-between">
            <span>Đã chọn ({selectedIds.length})</span>
            {selectedIds.length > 0 ? (
              <button
                type="button"
                className="hover:text-ink"
                onClick={() => setSelectedIds([])}
              >
                Xóa hết
              </button>
            ) : null}
          </div>
          <ul className="overflow-y-auto flex-1 text-sm">
            {selectedTemplates.length === 0 ? (
              <li className="p-4 text-muted text-center">
                Chọn lòng sớ ở cột giữa.
              </li>
            ) : (
              selectedTemplates.map((t) => (
                <li
                  key={t.id}
                  className="px-3 py-2 border-b border-fog flex justify-between gap-2"
                >
                  <span>
                    {t.name}
                    <span className="block text-xs text-muted">#{t.id}</span>
                  </span>
                  <button
                    type="button"
                    className="text-xs text-muted hover:text-ink shrink-0"
                    onClick={() => toggleSelect(t.id)}
                  >
                    Bỏ
                  </button>
                </li>
              ))
            )}
          </ul>
        </aside>
      </div>

      <section className="border border-fog bg-paper p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-xl text-ink">Xem trước &amp; in</h2>
          <Link
            href={`/quan-tri/viet-so/in/preview?${previewQs.toString()}`}
            className={`px-4 py-2 text-sm ${
              householdId && selectedIds.length
                ? 'bg-ink text-white'
                : 'bg-mist text-muted pointer-events-none'
            }`}
          >
            Mở xem trước / In
          </Link>
        </div>
        <p className="text-sm text-muted">
          {household
            ? `Hộ: ${household.chu_ho}`
            : 'Chọn hộ tín chủ'}
          {' · '}
          {selectedIds.length
            ? `${selectedIds.length} lòng sớ · khổ ${paperSize}`
            : 'Chưa chọn lòng sớ'}
        </p>
        {selectedTemplates.length > 0 ? (
          <ul className="text-sm space-y-1 max-h-40 overflow-y-auto">
            {selectedTemplates.map((t) => (
              <li key={t.id}>
                · {t.name}{' '}
                <span className="text-muted">
                  ({LANG_LABEL[t.lang] ?? t.lang})
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
