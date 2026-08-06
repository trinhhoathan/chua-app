'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FENGSHUI_TOOLS,
  NAV_SECTION_LABELS,
  PHAT_HOC_NAV_ORDER,
  PHONG_THUY_NAV_ORDER,
  toolHref,
  type FengShuiToolMeta,
  type NavSection,
} from '@/lib/fengshui/tools';
import { getToolGuideCopy, publicToolSubtitle } from './tool-guide-copy';

const SECTION_ORDER: NavSection[] = [
  ...PHONG_THUY_NAV_ORDER,
  ...PHAT_HOC_NAV_ORDER,
];

function groupTools(): { section: NavSection; tools: FengShuiToolMeta[] }[] {
  const map = new Map<NavSection, FengShuiToolMeta[]>();
  for (const tool of FENGSHUI_TOOLS) {
    if (tool.status !== 'ready') continue;
    const list = map.get(tool.navSection) ?? [];
    list.push(tool);
    map.set(tool.navSection, list);
  }
  return SECTION_ORDER.filter((s) => map.has(s)).map((section) => ({
    section,
    tools: map.get(section)!,
  }));
}

export function ToolGuideCatalog() {
  const groups = groupTools();
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    groups.forEach((g, i) => {
      init[g.section] = i < 2;
    });
    return init;
  });

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted leading-relaxed">
        {FENGSHUI_TOOLS.filter((t) => t.status === 'ready').length} công cụ sẵn
        sàng. Mỗi công cụ gắn thương hiệu trụ trì trên website — Phật tử tự tra
        cứu, thầy giảm tải hỏi lặt vặt và giữ uy tín điểm tựa tâm linh 24/7.
      </p>

      {groups.map(({ section, tools }) => {
        const isOpen = open[section] ?? false;
        return (
          <div key={section} className="border-b border-fog/80">
            <button
              type="button"
              className="flex w-full items-baseline justify-between gap-3 py-3 text-left"
              onClick={() =>
                setOpen((prev) => ({ ...prev, [section]: !isOpen }))
              }
              aria-expanded={isOpen}
            >
              <span className="font-display text-lg text-ink">
                {NAV_SECTION_LABELS[section]}
              </span>
              <span className="shrink-0 text-xs text-muted tabular-nums">
                {tools.length} · {isOpen ? 'Thu gọn' : 'Mở'}
              </span>
            </button>
            {isOpen ? (
              <ul className="space-y-6 pb-6">
                {tools.map((tool) => {
                  const copy = getToolGuideCopy(tool);
                  return (
                    <li key={tool.slug} className="pl-0 md:pl-1">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h4 className="font-display text-base text-ink">
                          {tool.title}
                        </h4>
                        <span className="text-xs text-muted">
                          {publicToolSubtitle(tool)}
                        </span>
                        <Link
                          href={toolHref(tool)}
                          className="text-xs font-medium underline-offset-2 hover:underline"
                          style={{ color: 'var(--primary-color, #7A1F1F)' }}
                        >
                          Mở công cụ
                        </Link>
                      </div>
                      <p className="mt-1.5 text-sm text-muted leading-relaxed">
                        {tool.description}
                      </p>
                      <div className="mt-2 grid gap-3 text-sm leading-relaxed md:grid-cols-2">
                        <div>
                          <p className="text-[0.7rem] uppercase tracking-[0.12em] text-gilt">
                            Cách dùng
                          </p>
                          <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-muted">
                            {copy.howTo.map((step) => (
                              <li key={step}>{step}</li>
                            ))}
                          </ol>
                        </div>
                        <div>
                          <p className="text-[0.7rem] uppercase tracking-[0.12em] text-gilt">
                            Lợi ích với thầy
                          </p>
                          <p className="mt-1 text-muted">{copy.benefit}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
