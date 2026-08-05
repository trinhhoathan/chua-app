import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentTemple } from '@/lib/tenant';
import { LY_GIA } from '@/lib/ly-gia-phuc-an';
import {
  getSimWarehouseTempleId,
  isSimStoreEnabled,
} from '@/lib/sim/warehouse';
import { simStoreContact } from '@/lib/sim/branding';
import { querySims } from '@/lib/sim/catalog';
import {
  SIM_CAREERS,
  careerById,
  careerCompatibleElements,
  careerFitScore,
} from '@/lib/sim/careers';
import { elementLabel, ASPECT_LABELS } from '@/lib/fengshui/bat-cuc';
import { SimCard, SimEmptyState } from '@/components/sim/sim-ui';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const career = careerById(id);
  const temple = await getCurrentTemple();
  const brand = temple?.name ? ` | ${temple.name}` : '';
  if (!career) return { title: `Sim theo ngành nghề${brand}` };
  return {
    title: `Sim phong thủy cho nghề ${career.label}${brand}`,
    description: `${career.blurb} Kho sim hợp nghề ${career.label} (${career.examples}) đã chấm điểm theo nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận, đặt mua online.`,
  };
}

export default async function SimCareerLandingPage({ params }: Props) {
  const temple = await getCurrentTemple();
  if (!temple || !isSimStoreEnabled(temple)) notFound();
  const warehouseId = await getSimWarehouseTempleId();
  if (!warehouseId) notFound();

  const { id } = await params;
  const career = careerById(id);
  if (!career) notFound();

  const primary = temple.primary_color || LY_GIA.primary;
  const contact = simStoreContact(temple);
  const elements = careerCompatibleElements(career);

  const { sims, total } = await querySims(warehouseId, {
    elements,
    sort: 'score',
    pageSize: 24,
  });

  // Xếp lại theo điểm hợp nghề (kết hợp hành + phương diện + điểm tổng)
  const ranked = sims
    .map((sim) => ({ sim, fit: careerFitScore(sim, career) }))
    .sort((a, b) => b.fit - a.fit);

  // Nhãn cho cả phương diện gốc lẫn phương diện sâu dùng trong aspectWeights
  const deepLabels: Record<string, string> = {
    giai_han: 'Giải hạn · vượng khí',
    bao_an: 'Bảo an sức khỏe',
    can_bang: 'Cân bằng âm dương',
    tinh_duyen: 'Tình duyên',
    gia_dao: 'Gia đạo',
    con_cai: 'Con cái',
  };
  const aspectNames = Object.entries(career.aspectWeights)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([k]) =>
        ASPECT_LABELS[k as keyof typeof ASPECT_LABELS] ?? deepLabels[k] ?? k,
    );

  const otherCareers = SIM_CAREERS.filter((c) => c.id !== career.id);

  return (
    <main className="pt-20 pb-24 md:pt-24">
      {/* Hero */}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12">
          <nav className="text-xs text-white/50">
            <Link href="/" className="hover:text-white">Trang chủ</Link>
            <span className="mx-1.5">/</span>
            <Link href="/sim" className="hover:text-white">Kho sim</Link>
            <span className="mx-1.5">/</span>
            <span className="text-white/80">Nghề {career.label}</span>
          </nav>
          <p className="mt-4 text-[0.72rem] uppercase tracking-[0.3em] text-gilt">
            Sim theo ngành nghề · Hành {elementLabel(career.element)}
          </p>
          <h1 className="mt-2 font-display text-3xl leading-tight md:text-4xl">
            Sim phong thủy cho nghề {career.label}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65">
            {career.blurb}
          </p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1.5 text-[0.72rem] text-white/55">
            <span>Nghề cụ thể: {career.examples}</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 md:px-6">
        {/* Nguyên tắc chọn số cho nghề */}
        <section className="-mt-5 grid gap-3 md:grid-cols-3">
          <div className="border border-fog bg-paper p-4">
            <p className="text-[0.65rem] uppercase tracking-[0.25em]" style={{ color: primary }}>
              Ngũ hành
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink">
              Ưu tiên sim hành{' '}
              <span className="font-semibold">
                {elements.map((e) => elementLabel(e)).join(' hoặc ')}
              </span>{' '}
              — tương hợp / tương sinh với hành {elementLabel(career.element)} của nghề.
            </p>
          </div>
          <div className="border border-fog bg-paper p-4">
            <p className="text-[0.65rem] uppercase tracking-[0.25em]" style={{ color: primary }}>
              Phương diện cần mạnh
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink">
              {aspectNames.join(' · ')} — các sim dưới đây đã được cân trọng số đúng
              theo yêu cầu của nghề.
            </p>
          </div>
          <div className="border border-fog bg-paper p-4">
            <p className="text-[0.65rem] uppercase tracking-[0.25em]" style={{ color: primary }}>
              Cách chấm
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink">
              Điểm hợp nghề = 40% ngũ hành + 35% phương diện luận số + 25% điểm tổng.
              Bấm vào từng số để xem luận giải đầy đủ.
            </p>
          </div>
        </section>

        {/* Danh sách sim */}
        <div className="mt-8 flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm text-muted">
            <span className="font-semibold text-ink">{total}</span> sim hợp nghề{' '}
            {career.label} đang có trong kho
          </p>
          <Link
            href={`/sim?nghe=${career.id}`}
            className="text-[0.72rem] text-muted underline underline-offset-2 hover:text-ink"
          >
            Mở trong kho sim với đầy đủ bộ lọc →
          </Link>
        </div>

        {ranked.length === 0 ? (
          <div className="mt-4">
            <SimEmptyState
              advisorRole={contact.role}
              note={`Kho đang hết số hành ${elements.map((e) => elementLabel(e)).join('/')} — nhắn Zalo để ${contact.role} hỗ trợ tuyển số hợp nghề ${career.label}.`}
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {ranked.map(({ sim, fit }) => (
              <SimCard
                key={sim.id}
                sim={sim}
                matchPercent={fit}
                matchLabel={`hợp nghề ${career.label}`}
                primaryColor={primary}
                zaloUrl={contact.zaloUrl}
              />
            ))}
          </div>
        )}

        {/* CTA */}
        <section
          className="mt-12 flex flex-col items-center gap-4 px-6 py-10 text-center text-white md:flex-row md:justify-between md:text-left"
          style={{ backgroundColor: primary }}
        >
          <div>
            <p className="font-display text-2xl">
              Muốn được chọn đích danh một số cho nghề {career.label}?
            </p>
            <p className="mt-1 text-sm text-white/80">
              Gửi ngày giờ sinh qua Zalo — {contact.advisor} hỗ trợ lập Bát Tự, tìm
              dụng thần rồi tuyển số khớp cả mệnh lẫn nghề.
            </p>
          </div>
          <a
            href={contact.zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-white px-6 py-3 text-sm font-semibold"
            style={{ color: primary }}
          >
            Nhắn Zalo
            {contact.phoneDisplay ? ` ${contact.phoneDisplay}` : ''}
          </a>
        </section>

        {/* Ngành nghề khác */}
        <section className="mt-12">
          <h2 className="font-display text-2xl text-ink">Sim cho ngành nghề khác</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {otherCareers.map((c) => (
              <Link
                key={c.id}
                href={`/sim/nghe/${c.id}`}
                className="group border border-fog bg-paper px-4 py-3 transition-colors hover:border-ink/30"
              >
                <p className="text-sm font-medium text-ink group-hover:text-lacquer">
                  {c.label}
                </p>
                <p className="mt-0.5 truncate text-[0.7rem] text-muted">{c.examples}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
