import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentTemple } from '@/lib/tenant';
import { isLyGiaPhucAnSite, LY_GIA } from '@/lib/ly-gia-phuc-an';
import {
  querySims,
  priceRangeById,
  purposeById,
  SIM_TAG_LABELS,
  type SimPurposeId,
  type SimQueryFilters,
} from '@/lib/sim/catalog';
import {
  buildSimDungThan,
  parseBirthParams,
  parseGoal,
  personalizeSimScore,
  goalLabel,
} from '@/lib/sim/bat-tu';
import { careerById, careerCompatibleElements } from '@/lib/sim/careers';
import {
  queFilterOptions,
  QUE_RANK_META,
  SIM_QUE_INTERPRETATIONS,
} from '@/lib/fengshui/sim-kinh-dich';
import { getHexagram } from '@/lib/fengshui/kinh-dich-64';
import { SimFilterBar } from '@/components/sim/SimFilterBar';
import { SimBirthPanel } from '@/components/sim/SimBirthPanel';
import { SimCard, SimEmptyState } from '@/components/sim/sim-ui';
import { SimRecentOrdersTicker } from '@/components/sim/SimRecentOrdersTicker';
import type { SimElement } from '@/types/database';

export const metadata: Metadata = {
  title: 'Kho Sim Phong Thủy — chọn sim hợp mệnh, hợp tuổi | Lý Gia Phúc An',
  description:
    'Kho sim phong thủy do thầy Lý Gia Phúc An tuyển chọn theo nguyên lý Âm Dương Ngũ Hành, kinh dịch diệu luận và Bát Tự — lọc theo mệnh ngũ hành, ngày giờ sinh, ngành nghề. Đặt mua online, thanh toán QR.',
};

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

const PAGE_SIZE = 24;

export default async function KhoSimPage({ searchParams }: Props) {
  const temple = await getCurrentTemple();
  if (!temple || !isLyGiaPhucAnSite(temple)) notFound();

  const sp = await searchParams;
  const primary = temple.primary_color || LY_GIA.primary;

  // --- Bộ lọc từ URL ---
  const range = priceRangeById(sp.gia);
  const career = careerById(sp.nghe);
  const purpose = purposeById(sp.mucdich);
  const filters: SimQueryFilters = {
    q: sp.q,
    network: sp.mang,
    tag: sp.loai,
    element: !career ? (sp.menh as SimElement | undefined) : undefined,
    elements: career ? careerCompatibleElements(career) : undefined,
    priceMin: range?.min,
    priceMax: range?.max,
    minScore: sp.diem ? Number(sp.diem) : undefined,
    tailYear: sp.namsinh && /^\d{4}$/.test(sp.namsinh) ? sp.namsinh : undefined,
    nut:
      sp.nut != null && sp.nut !== '' && /^\d{1,2}$/.test(sp.nut)
        ? Number(sp.nut) % 10
        : undefined,
    que:
      sp.que && /^\d{1,2}$/.test(sp.que) && Number(sp.que) >= 1 && Number(sp.que) <= 64
        ? Number(sp.que)
        : undefined,
    avoid47: sp.tranh47 === '1',
    purpose: purpose?.id as SimPurposeId | undefined,
    sort: (sp.sap as SimQueryFilters['sort']) ?? 'score',
    page: sp.trang ? Math.max(1, Number(sp.trang) || 1) : 1,
    pageSize: PAGE_SIZE,
  };

  // --- Cá nhân hóa theo Bát Tự ---
  const birth = parseBirthParams(sp);
  const goal = parseGoal(sp.mt);
  const dungThan = birth ? buildSimDungThan(birth) : null;

  const { sims, total, page } = await querySims(temple.id, filters);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Bộ lọc quẻ Kinh Dịch (Mai Hoa Dịch Số)
  const queOptions = queFilterOptions().map((q) => ({
    number: q.number,
    label: q.label,
    unicode: q.unicode,
    rankLabel: QUE_RANK_META[q.rank].label,
  }));
  const activeQue = filters.que ? getHexagram(filters.que) : undefined;
  const activeQueInterp = filters.que ? SIM_QUE_INTERPRETATIONS[filters.que] : undefined;

  // Query giữ lại khi bấm vào chi tiết sim (mang theo ngày sinh)
  const birthQueryParts: string[] = [];
  if (birth) {
    birthQueryParts.push(`ns=${birth.date}`);
    if (birth.hour != null) birthQueryParts.push(`gio=${birth.hour}`);
    birthQueryParts.push(`gt=${birth.gender}`);
    if (birth.calendar === 'lunar') birthQueryParts.push('lich=am');
    birthQueryParts.push(`mt=${goal}`);
  }
  const birthQuery = birthQueryParts.join('&') || undefined;

  const dungThanSummary = dungThan
    ? `Nhật chủ ${dungThan.nhatChu} (${dungThan.nhatChuHanh}) · ${dungThan.verdictLabel} · Dụng thần ${dungThan.dungThan}, hỷ ${dungThan.hyThan.join(' – ')}, kỵ ${dungThan.kyThan.join(' – ')} — ưu tiên mục tiêu ${goalLabel(goal)}. Sim gắn nhãn "Hợp %" bên dưới đã đối chiếu với mệnh của bạn.`
    : null;

  // Link phân trang giữ nguyên query
  function pageHref(p: number): string {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (v != null && v !== '' && k !== 'trang') params.set(k, v);
    }
    if (p > 1) params.set('trang', String(p));
    const qs = params.toString();
    return qs ? `/sim?${qs}` : '/sim';
  }

  return (
    <main className="pt-20 pb-24 md:pt-24">
      {/* Hero */}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12">
          <p className="text-[0.72rem] uppercase tracking-[0.3em] text-gilt">
            Sim phong thủy · Thầy tuyển chọn
          </p>
          <h1 className="mt-2 font-display text-3xl leading-tight md:text-4xl">
            Kho Sim Phong Thủy Lý Gia Phúc An
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65">
            Mỗi số trong kho đều được chấm điểm theo nguyên lý Âm Dương Ngũ Hành, kinh
            dịch diệu luận (cặp quái, đuôi số, 81 số lý, âm dương, tổng nút) và đối chiếu
            Bát Tự — không bán số đẹp đại trà, chỉ chọn số đúng người, đúng mệnh, đúng
            nghề.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1.5 text-[0.72rem] text-white/55">
            <span>✓ Sim chính chủ, sang tên tận nơi</span>
            <span>✓ Kiểm tra sim xong mới thanh toán</span>
            <span>✓ Thầy chọn ngày tốt kích sim miễn phí</span>
            <span>✓ Hoàn tiền nếu số không đúng cam kết</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 md:px-6">
        {/* Bộ lọc + cá nhân hóa */}
        <div className="-mt-5 space-y-3">
          <SimFilterBar primaryColor={primary} queOptions={queOptions} />
          <SimBirthPanel primaryColor={primary} dungThanSummary={dungThanSummary} />
        </div>

        <SimRecentOrdersTicker templeId={temple.id} />

        {/* Kết quả */}
        <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm text-muted">
            Tìm thấy <span className="font-semibold text-ink">{total}</span> sim
            {sp.loai ? ` · ${SIM_TAG_LABELS[sp.loai] ?? ''}` : ''}
            {purpose ? ` · ${purpose.label}` : ''}
            {career ? ` hợp ngành ${career.label}` : ''}
            {activeQue ? ` · quẻ ${activeQue.nameFull}` : ''}
          </p>
          <div className="flex items-center gap-3">
            {dungThan ? (
              <p className="text-[0.7rem] text-[#1B6B3A]">
                Đang chấm % hợp mệnh theo ngày sinh của bạn
              </p>
            ) : null}
            <Link
              href="/sim/so-sanh"
              className="text-[0.72rem] text-muted underline underline-offset-2 hover:text-ink"
            >
              So sánh 2–4 số cạnh nhau →
            </Link>
          </div>
        </div>

        {purpose ? (
          <div className="mt-3 border-l-2 bg-mist/50 px-4 py-3 text-[0.78rem] leading-relaxed text-ink/80" style={{ borderColor: primary }}>
            <span className="font-medium text-ink">Sim {purpose.label}:</span>{' '}
            {purpose.blurb}
          </div>
        ) : null}

        {career ? (
          <div className="mt-3 border-l-2 bg-mist/50 px-4 py-3 text-[0.78rem] leading-relaxed text-ink/80" style={{ borderColor: primary }}>
            <span className="font-medium text-ink">{career.label}:</span> {career.blurb}
          </div>
        ) : null}

        {activeQue && activeQueInterp ? (
          <div
            className="mt-3 border-l-2 bg-mist/50 px-4 py-3 text-[0.78rem] leading-relaxed text-ink/80"
            style={{ borderColor: QUE_RANK_META[activeQueInterp.rank].color }}
          >
            <span className="font-medium text-ink">
              {activeQue.unicode} Quẻ {activeQue.nameFull}
            </span>{' '}
            <span
              className="mr-1 px-1.5 py-0.5 text-[0.65rem] font-semibold"
              style={{
                color: QUE_RANK_META[activeQueInterp.rank].color,
                backgroundColor: QUE_RANK_META[activeQueInterp.rank].bg,
              }}
            >
              {QUE_RANK_META[activeQueInterp.rank].label}
            </span>
            — {activeQueInterp.yNghia} {activeQueInterp.phuHop}
          </div>
        ) : null}

        {sims.length === 0 ? (
          <div className="mt-6">
            <SimEmptyState
              note={
                purpose
                  ? `Chưa có sim đạt điểm ${purpose.label} đủ cao trong kho — thử bỏ bớt bộ lọc hoặc nhắn Zalo để thầy tuyển số.`
                  : undefined
              }
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sims.map((sim) => {
              const personal = dungThan
                ? personalizeSimScore(sim, dungThan, goal)
                : null;
              const purposeScore =
                !personal && purpose?.aspect
                  ? Math.round(Number(sim.aspects?.[purpose.aspect] ?? 0))
                  : null;
              return (
                <SimCard
                  key={sim.id}
                  sim={sim}
                  matchPercent={personal?.matchPercent ?? purposeScore ?? undefined}
                  matchLabel={
                    personal?.menhFit.label ??
                    (purposeScore != null && purpose
                      ? `điểm ${purpose.label}`
                      : undefined)
                  }
                  birthQuery={birthQuery}
                />
              );
            })}
          </div>
        )}

        {/* Phân trang */}
        {totalPages > 1 ? (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
            {page > 1 ? (
              <Link
                href={pageHref(page - 1)}
                className="border border-fog px-3 py-1.5 text-xs text-ink hover:border-lacquer"
              >
                ← Trước
              </Link>
            ) : null}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 || p === totalPages || Math.abs(p - page) <= 2,
              )
              .map((p, idx, arr) => (
                <span key={p} className="flex items-center gap-1.5">
                  {idx > 0 && arr[idx - 1] !== p - 1 ? (
                    <span className="text-xs text-muted">…</span>
                  ) : null}
                  <Link
                    href={pageHref(p)}
                    className={`border px-3 py-1.5 text-xs ${
                      p === page
                        ? 'border-lacquer bg-lacquer text-white'
                        : 'border-fog text-ink hover:border-lacquer'
                    }`}
                  >
                    {p}
                  </Link>
                </span>
              ))}
            {page < totalPages ? (
              <Link
                href={pageHref(page + 1)}
                className="border border-fog px-3 py-1.5 text-xs text-ink hover:border-lacquer"
              >
                Sau →
              </Link>
            ) : null}
          </div>
        ) : null}

        {/* Khối uy tín */}
        <section className="mt-14 grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'Chấm điểm bằng học thuật, không cảm tính',
              body: 'Từng sim được chấm điểm theo nguyên lý Âm Dương Ngũ Hành, kinh dịch diệu luận — phân tích cặp quái, tổ hợp chế hóa, đuôi số và 81 số lý, cùng thuật toán với công cụ Bói Sim của thầy.',
            },
            {
              title: 'Đúng mệnh mới bán',
              body: 'Nhập ngày giờ sinh, hệ thống lập tứ trụ Bát Tự tìm dụng thần rồi đối chiếu với hành của sim. Sim phạm kỵ thần sẽ được cảnh báo rõ.',
            },
            {
              title: 'Quy trình kích sim theo ngày tốt',
              body: 'Sau khi nhận sim, thầy chọn ngày giờ hoàng đạo hợp tuổi để kích hoạt — nghi thức khai số truyền thống của Lý Gia Phúc An.',
            },
          ].map((b) => (
            <div key={b.title} className="border border-fog bg-paper p-5">
              <div className="section-rule mb-4" />
              <p className="font-display text-lg leading-snug text-ink">{b.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{b.body}</p>
            </div>
          ))}
        </section>

        {/* CTA cuối trang */}
        <section
          className="mt-10 flex flex-col items-center gap-4 px-6 py-10 text-center text-white md:flex-row md:justify-between md:text-left"
          style={{ backgroundColor: primary }}
        >
          <div>
            <p className="font-display text-2xl">Chưa tìm được số ưng ý?</p>
            <p className="mt-1 text-sm text-white/80">
              Nhắn Zalo ngày giờ sinh — thầy tuyển số theo yêu cầu riêng trong 24h, miễn phí.
            </p>
          </div>
          <a
            href={LY_GIA.zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-white px-6 py-3 text-sm font-semibold"
            style={{ color: primary }}
          >
            Nhắn Zalo {LY_GIA.phoneDisplay}
          </a>
        </section>
      </div>
    </main>
  );
}
