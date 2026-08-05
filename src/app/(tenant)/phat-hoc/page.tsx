import Link from 'next/link';
import { getCurrentTemple } from '@/lib/tenant';
import { isLyGiaPhucAnSite } from '@/lib/ly-gia-phuc-an';
import { getSitePersona } from '@/lib/site-persona';
import { WaterPromoBanner } from '@/components/water/WaterPromoBanner';
import {
  NAV_SECTION_LABELS,
  PHAT_HOC_NAV_ORDER,
  PHAT_HOC_NAV_ORDER_LY_GIA,
  groupToolsByNavSection,
  isThamGiaTool,
  toolsByDomain,
  toolHref,
} from '@/lib/fengshui/tools';

export default async function PhatHocHub() {
  const temple = await getCurrentTemple();
  if (!temple) return null;
  const primary = temple.primary_color || '#7A1F1F';
  const isLyGia = isLyGiaPhucAnSite(temple);
  const persona = getSitePersona(temple);
  // Site Lý Gia: ẩn cả nhóm «Tham gia» (không vận hành sổ / quy y / nước)
  const tools = toolsByDomain('phat_hoc').filter(
    (t) => !isLyGia || !isThamGiaTool(t),
  );
  const navOrder = isLyGia ? PHAT_HOC_NAV_ORDER_LY_GIA : PHAT_HOC_NAV_ORDER;
  const grouped = groupToolsByNavSection(navOrder);

  return (
    <main className="pt-24 pb-16 px-6 md:px-12">
      <div className="mx-auto max-w-5xl">
        <p
          className="text-[0.72rem] tracking-[0.3em] uppercase mb-2"
          style={{ color: primary }}
        >
          Phật học · Tâm linh
        </p>
        <h1 className="font-display text-3xl md:text-4xl text-ink">
          {isLyGia
            ? 'Lịch lễ · Kinh · Tu học'
            : 'Lịch lễ · Kinh · Tham gia chùa'}
        </h1>
        <p className="mt-3 text-muted max-w-2xl leading-relaxed">
          {persona.upsell === 'sim'
            ? `Kho mục lục Phật học tham khảo của ${temple.name} — do ${persona.displayName} tuyển chọn.`
            : `Kho mục lục hỗ trợ trụ trì hướng dẫn Phật tử của ${temple.name}. Nhóm «Tham gia» nối thẳng sớ, quy y, hoạt động và cúng dường.`}
        </p>
        <p className="mt-3 text-sm">
          <Link
            href="/phong-thuy"
            className="underline underline-offset-4 text-ink hover:opacity-70"
          >
            ← Công cụ phong thủy · cổ học
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

        <div className="mt-12 space-y-12">
          {grouped.map(({ section, tools: catTools }) => (
            <section
              key={section}
              id={`section-${section}`}
              className="scroll-mt-20"
            >
              <h2
                className="text-[0.72rem] uppercase tracking-[0.22em] mb-3"
                style={{ color: primary }}
              >
                {NAV_SECTION_LABELS[section]}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {catTools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={toolHref(tool)}
                    className="group relative border border-fog p-4 hover:border-ink/30 transition-colors bg-white"
                  >
                    {tool.status === 'coming_soon' ? (
                      <span className="absolute top-3 right-3 text-[0.6rem] uppercase tracking-wide px-1.5 py-0.5 bg-mist text-muted">
                        Sắp có
                      </span>
                    ) : null}
                    <p className="font-display text-lg text-ink pr-14">
                      {tool.title}
                    </p>
                    <p className="mt-1 text-xs text-muted">{tool.subtitle}</p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-14 text-xs text-muted leading-relaxed max-w-2xl">
          {tools.length} mục Phật học trong khung hệ thống.
        </p>

        {!isLyGia ? (
          <WaterPromoBanner primaryColor={primary} templeName={temple.name} />
        ) : null}
      </div>
    </main>
  );
}
