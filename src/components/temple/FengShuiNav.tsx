import Link from 'next/link';
import type { Temple } from '@/types/database';
import {
  NAV_SECTION_LABELS,
  PHONG_THUY_NAV_ORDER,
  toolHref,
  toolsByNavSection,
} from '@/lib/fengshui/tools';

interface Props {
  temple: Temple;
}

export function FengShuiNav({ temple }: Props) {
  const primary = temple.primary_color || '#7A1F1F';
  const accent = primary === '#7A1F1F' ? '#c39a4a' : primary;

  const bySection = PHONG_THUY_NAV_ORDER.filter((s) => s !== 'tham_khao').map(
    (section) => {
      const all = toolsByNavSection(section);
      const ready = all.filter((t) => t.status === 'ready');
      const soon = all.filter((t) => t.status === 'coming_soon');
      return {
        section,
        tools: [...ready, ...soon].slice(0, section === 'hang_ngay' ? 4 : 6),
      };
    },
  );

  return (
    <section id="phong-thuy" className="bg-ink text-white scroll-mt-8">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-12 md:py-24">
        <div className="max-w-2xl">
          <div className="section-rule mb-6" />
          <h2 className="font-display text-3xl md:text-4xl text-white leading-tight">
            Công cụ Phong thủy
          </h2>
          <p className="mt-4 text-white/70 leading-relaxed">
            Việc mỗi ngày, việc hệ trọng và tử vi — hỗ trợ trụ trì tư vấn Phật
            tử của {temple.name}.
          </p>
        </div>

        <div className="mt-12 space-y-10">
          {bySection.map(({ section, tools }) => {
            if (tools.length === 0) return null;
            return (
              <div key={section}>
                <p
                  className="text-[0.65rem] tracking-[0.25em] uppercase mb-3"
                  style={{ color: accent }}
                >
                  {NAV_SECTION_LABELS[section]}
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {tools.map((tool) => (
                    <Link
                      key={tool.slug}
                      href={toolHref(tool)}
                      className="group border border-white/15 p-5 hover:border-white/40 hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-display text-lg text-white">
                          {tool.title}
                        </p>
                        {tool.status === 'coming_soon' ? (
                          <span className="shrink-0 text-[0.6rem] uppercase tracking-wide text-white/40">
                            Sắp có
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-xs text-white/60 leading-relaxed">
                        {tool.subtitle}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap gap-6">
          <Link
            href="/phong-thuy"
            className="text-sm text-white/70 hover:text-white underline underline-offset-4"
          >
            Tất cả công cụ phong thủy →
          </Link>
          <Link
            href="/#phat-hoc"
            className="text-sm text-white/50 hover:text-white underline underline-offset-4"
          >
            Phật học phía dưới
          </Link>
        </div>
      </div>
    </section>
  );
}
