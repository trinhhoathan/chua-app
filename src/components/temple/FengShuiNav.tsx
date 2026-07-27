import Link from 'next/link';
import type { Temple } from '@/types/database';
import { FENGSHUI_TOOLS } from '@/lib/fengshui/tools';

interface Props {
  temple: Temple;
}

export function FengShuiNav({ temple }: Props) {
  const primary = temple.primary_color || '#7A1F1F';

  return (
    <section id="phong-thuy" className="bg-ink text-white scroll-mt-8">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-12 md:py-24">
        <div className="max-w-2xl">
          <div className="section-rule mb-6" />
          <h2 className="font-display text-3xl md:text-4xl text-white leading-tight">
            Công cụ Phong thủy & Nghi lễ
          </h2>
          <p className="mt-4 text-white/70 leading-relaxed">
            Tra cứu ngày tốt, hướng nhà, trùng tang, cưới hỏi, khai trương… theo
            lịch âm cho Phật tử của {temple.name}.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FENGSHUI_TOOLS.map((tool) => (
            <Link
              key={tool.slug}
              href={`/phong-thuy/${tool.slug}`}
              className="group border border-white/15 p-5 hover:border-white/40 hover:bg-white/[0.03] transition-colors"
            >
              <p
                className="text-[0.65rem] tracking-[0.25em] uppercase mb-2"
                style={{ color: primary === '#7A1F1F' ? '#c39a4a' : primary }}
              >
                {tool.category}
              </p>
              <p className="font-display text-lg text-white">{tool.title}</p>
              <p className="mt-2 text-xs text-white/60 leading-relaxed">
                {tool.subtitle}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/phong-thuy"
            className="text-sm text-white/70 hover:text-white underline underline-offset-4"
          >
            Xem tất cả công cụ →
          </Link>
        </div>
      </div>
    </section>
  );
}
