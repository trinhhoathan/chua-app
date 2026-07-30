import Link from 'next/link';
import type { Temple } from '@/types/database';
import {
  NAV_SECTION_LABELS,
  PHAT_HOC_NAV_ORDER,
  toolHref,
  toolsByNavSection,
} from '@/lib/fengshui/tools';

interface Props {
  temple: Temple;
}

export function PhatHocNav({ temple }: Props) {
  const primary = temple.primary_color || '#7A1F1F';

  const bySection = PHAT_HOC_NAV_ORDER.map((section) => {
    const all = toolsByNavSection(section);
    const ready = all.filter((t) => t.status === 'ready');
    const soon = all.filter((t) => t.status === 'coming_soon');
    return { section, tools: [...ready, ...soon] };
  }).filter((g) => g.tools.length > 0);

  return (
    <section id="phat-hoc" className="bg-paper scroll-mt-8">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-12 md:py-24">
        <div className="max-w-2xl">
          <div className="section-rule mb-6" />
          <p
            className="text-[0.72rem] tracking-[0.3em] uppercase mb-2"
            style={{ color: primary }}
          >
            Phật học · Tâm linh
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-ink leading-tight">
            Lịch lễ · Kinh · Tham gia chùa
          </h2>
          <p className="mt-4 text-muted leading-relaxed">
            Hướng dẫn Phật tử của {temple.name}: vía lễ, kinh khấn, và các việc
            thực tế tại chùa (sớ, quy y, hoạt động).
          </p>
        </div>

        <div className="mt-12 space-y-10">
          {bySection.map(({ section, tools }) => (
            <div key={section}>
              <p
                className="text-[0.65rem] tracking-[0.25em] uppercase mb-3"
                style={{ color: primary }}
              >
                {NAV_SECTION_LABELS[section]}
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {tools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={toolHref(tool)}
                    className="group relative border border-fog bg-white p-5 hover:border-ink/25 transition-colors"
                  >
                    {tool.status === 'coming_soon' ? (
                      <span className="absolute top-4 right-4 text-[0.6rem] uppercase tracking-wide text-muted">
                        Sắp có
                      </span>
                    ) : null}
                    <p className="font-display text-lg text-ink pr-12">
                      {tool.title}
                    </p>
                    <p className="mt-2 text-xs text-muted leading-relaxed">
                      {tool.subtitle}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/phat-hoc"
            className="text-sm text-ink underline underline-offset-4 hover:opacity-70"
          >
            Xem tất cả mục Phật học →
          </Link>
        </div>
      </div>
    </section>
  );
}
