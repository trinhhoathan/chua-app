import Link from 'next/link';
import { getCurrentTemple } from '@/lib/tenant';
import { FENGSHUI_TOOLS } from '@/lib/fengshui/tools';

export default async function PhongThuyHub() {
  const temple = await getCurrentTemple();
  if (!temple) return null;
  const primary = temple.primary_color || '#7A1F1F';

  const grouped = new Map<string, typeof FENGSHUI_TOOLS>();
  for (const t of FENGSHUI_TOOLS) {
    const arr = grouped.get(t.category) ?? [];
    arr.push(t);
    grouped.set(t.category, arr);
  }

  return (
    <main className="pt-24 pb-16 px-6 md:px-12">
      <div className="mx-auto max-w-5xl">
        <p
          className="text-[0.72rem] tracking-[0.3em] uppercase mb-2"
          style={{ color: primary }}
        >
          Công cụ phong thủy & nghi lễ
        </p>
        <h1 className="font-display text-3xl md:text-4xl text-ink">
          Tra cứu ngày tốt cho Phật tử của {temple.name}
        </h1>
        <p className="mt-3 text-muted max-w-2xl leading-relaxed">
          Các công cụ dưới đây sử dụng lịch âm và các nếp phong tục dân gian
          (Kim Lâu, Hoang Ốc, Tam Tai, Hoàng đạo, Trùng tang, Bát trạch…). Kết
          quả mang tính tham khảo; xin quý Phật tử tham vấn thêm sư trụ trì
          trước khi tiến hành đại sự.
        </p>

        <div className="mt-10 space-y-10">
          {[...grouped.entries()].map(([cat, tools]) => (
            <section key={cat}>
              <h2 className="font-display text-xl text-ink border-b border-fog pb-2 mb-4">
                {cat}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {tools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/phong-thuy/${tool.slug}`}
                    className="group border border-fog p-4 hover:border-ink/30 transition-colors bg-white"
                  >
                    <p className="font-display text-lg text-ink">{tool.title}</p>
                    <p className="mt-1 text-xs text-muted">{tool.subtitle}</p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
