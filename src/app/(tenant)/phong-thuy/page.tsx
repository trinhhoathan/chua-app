import Link from 'next/link';
import { getCurrentTemple } from '@/lib/tenant';
import { isLyGiaPhucAnSite } from '@/lib/ly-gia-phuc-an';
import { getSitePersona } from '@/lib/site-persona';
import { WaterPromoBanner } from '@/components/water/WaterPromoBanner';
import {
  NAV_SECTION_LABELS,
  PHONG_THUY_NAV_ORDER,
  groupToolsByCategory,
  groupToolsByNavSection,
  phongThuyMenuTools,
  toolHref,
  type FengShuiToolMeta,
} from '@/lib/fengshui/tools';

function ToolCardGrid({
  tools,
  muted,
}: {
  tools: FengShuiToolMeta[];
  muted: boolean;
}) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {tools.map((tool) => (
        <Link
          key={tool.slug}
          href={toolHref(tool)}
          className={`group relative border p-4 transition-colors bg-white ${
            muted
              ? 'border-fog/80 hover:border-ink/20 opacity-95'
              : 'border-fog hover:border-ink/30'
          }`}
        >
          {tool.status === 'coming_soon' ? (
            <span className="absolute top-3 right-3 text-[0.6rem] uppercase tracking-wide px-1.5 py-0.5 bg-mist text-muted">
              Sắp có
            </span>
          ) : null}
          <p className="font-display text-lg text-ink pr-14">{tool.title}</p>
          <p className="mt-1 text-xs text-muted">{tool.subtitle}</p>
        </Link>
      ))}
    </div>
  );
}

export default async function PhongThuyHub() {
  const temple = await getCurrentTemple();
  if (!temple) return null;
  const primary = temple.primary_color || '#7A1F1F';
  const persona = getSitePersona(temple);
  const isLyGia = isLyGiaPhucAnSite(temple);
  const grouped = groupToolsByNavSection(PHONG_THUY_NAV_ORDER);
  const count = phongThuyMenuTools().length;

  return (
    <main className="pt-24 pb-16 px-6 md:px-12">
      <div className="mx-auto max-w-5xl">
        <p
          className="text-[0.72rem] tracking-[0.3em] uppercase mb-2"
          style={{ color: primary }}
        >
          Công cụ phong thủy
        </p>
        <h1 className="font-display text-3xl md:text-4xl text-ink">
          Mỗi ngày · Hệ trọng · Tử vi
        </h1>
        <p className="mt-3 text-muted max-w-2xl leading-relaxed">
          {persona.upsell === 'sim'
            ? `Bộ công cụ ${persona.displayName} dùng để tư vấn khách của ${temple.name}. Quẻ / thần số nằm nhóm «Tham khảo thêm» — không ưu tiên trên menu.`
            : `Bộ công cụ hỗ trợ trụ trì tư vấn Phật tử của ${temple.name}. Quẻ / thần số nằm nhóm «Tham khảo thêm» — không ưu tiên trên menu.`}
        </p>
        <p className="mt-3 text-sm">
          <Link
            href="/phat-hoc"
            className="underline underline-offset-4 text-ink hover:opacity-70"
          >
            Sang mục Phật học →
          </Link>
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {grouped.map(({ section }) => (
            <a
              key={section}
              href={`#section-${section}`}
              className="px-3 py-1.5 text-xs border border-fog hover:border-ink/30 text-ink"
            >
              {NAV_SECTION_LABELS[section]}
            </a>
          ))}
        </div>

        <div className="mt-12 space-y-14">
          {grouped.map(({ section, tools }) => (
            <section
              key={section}
              id={`section-${section}`}
              className="scroll-mt-20"
            >
              <h2
                className="font-display text-2xl text-ink border-b border-fog pb-2 mb-6"
                style={{ borderColor: `${primary}55` }}
              >
                {NAV_SECTION_LABELS[section]}
              </h2>
              {section === 'bat_cuc' ? (
                <div className="space-y-8">
                  {groupToolsByCategory(tools).map(([category, catTools]) => (
                    <div key={category}>
                      <p className="text-[0.7rem] tracking-[0.22em] uppercase text-muted mb-3">
                        {category}
                      </p>
                      <ToolCardGrid tools={catTools} muted={false} />
                    </div>
                  ))}
                </div>
              ) : (
                <ToolCardGrid tools={tools} muted={section === 'tham_khao'} />
              )}
            </section>
          ))}
        </div>

        <p className="mt-14 text-xs text-muted leading-relaxed max-w-2xl">
          {count} chức năng phong thủy / cổ học · Phật học xem tại mục riêng.
        </p>

        {!isLyGia ? (
          <WaterPromoBanner primaryColor={primary} templeName={temple.name} />
        ) : null}
      </div>
    </main>
  );
}
