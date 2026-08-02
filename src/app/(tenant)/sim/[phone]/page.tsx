import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { after } from 'next/server';
import { Suspense } from 'react';
import { getCurrentTemple, formatVnd } from '@/lib/tenant';
import { isLyGiaPhucAnSite, LY_GIA } from '@/lib/ly-gia-phuc-an';
import {
  getSimByPhone,
  recordSimView,
  NETWORK_LABELS,
  SIM_PURPOSE_GROUPS,
  SIM_PURPOSES,
} from '@/lib/sim/catalog';
import {
  SimSimilarSection,
  SimSimilarSkeleton,
} from '@/components/sim/SimSimilarSection';
import {
  buildSimDungThan,
  parseBirthParams,
  parseGoal,
  personalizeSimScore,
  goalLabel,
} from '@/lib/sim/bat-tu';
import { SIM_CAREERS, careerFitScore } from '@/lib/sim/careers';
import { analyzeBoiSim } from '@/lib/fengshui/boi-sim';
import { elementLabel, ASPECT_LABELS, ASPECT_ORDER } from '@/lib/fengshui/bat-cuc';
import { verdictLabel } from '@/lib/fengshui/bat-cuc-contexts';
import { buildHoaGiai } from '@/lib/sim/hoa-giai';
import { SimBirthPanel } from '@/components/sim/SimBirthPanel';
import { SimKinhDichSection } from '@/components/sim/SimKinhDichSection';
import { SimRadarChart } from '@/components/sim/SimRadarChart';
import { SimEnergyFlow } from '@/components/sim/SimEnergyFlow';
import { SimHoaGiaiSection } from '@/components/sim/SimHoaGiaiSection';
import { SimActivationHours } from '@/components/sim/SimActivationHours';
import { SimOrderForm } from '@/components/sim/SimOrderForm';
import { SimSaleCountdown } from '@/components/sim/SimSaleCountdown';
import {
  SimScoreRing,
  VERDICT_COLORS,
  ELEMENT_BADGE,
  discountPercent,
  primaryTag,
} from '@/components/sim/sim-ui';

interface Props {
  params: Promise<{ phone: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { phone } = await params;
  return {
    title: `Sim ${phone} — luận giải phong thủy & đặt mua | Lý Gia Phúc An`,
    description: `Luận giải phong thủy chi tiết sim ${phone} theo nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận: cặp quái số, đuôi sim, 81 số lý, ngũ hành, ngành nghề phù hợp. Đặt mua online.`,
  };
}

export default async function SimDetailPage({ params, searchParams }: Props) {
  const temple = await getCurrentTemple();
  if (!temple || !isLyGiaPhucAnSite(temple)) notFound();

  const { phone } = await params;
  const sp = await searchParams;
  const primary = temple.primary_color || LY_GIA.primary;

  const sim = await getSimByPhone(temple.id, phone);
  if (!sim) notFound();

  // Đếm view không chặn TTFB — chạy sau khi response đã gửi
  after(() => {
    void recordSimView(temple.id, sim.phone);
  });

  const birth = parseBirthParams(sp);
  const goal = parseGoal(sp.mt);
  const birthYear = birth ? Number(birth.date.slice(0, 4)) : undefined;

  const analysis = analyzeBoiSim(sim.phone, birthYear);
  const dungThan = birth ? buildSimDungThan(birth) : null;
  const personal = dungThan ? personalizeSimScore(sim, dungThan, goal) : null;

  const discount = discountPercent(sim);
  const tag = primaryTag(sim);
  const el = ELEMENT_BADGE[sim.element];
  const sold = sim.status === 'sold';

  const careerFits = SIM_CAREERS.map((c) => ({
    career: c,
    score: careerFitScore(sim, c),
  }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const dungThanSummary = dungThan
    ? `Nhật chủ ${dungThan.nhatChu} (${dungThan.nhatChuHanh}) · ${dungThan.verdictLabel} · Dụng thần ${dungThan.dungThan}, hỷ ${dungThan.hyThan.join(' – ')}, kỵ ${dungThan.kyThan.join(' – ')}.`
    : null;

  const hoaGiai = !('error' in analysis) ? buildHoaGiai(analysis) : null;

  // Giá quy ra mỗi ngày khi dùng 10 năm (làm tròn trăm đồng)
  const perDay = Math.round(sim.price_vnd / (10 * 365) / 100) * 100;

  // Link báo cáo chứng nhận — giữ nguyên tham số bát tự nếu có
  const reportQuery = new URLSearchParams();
  for (const key of ['ns', 'gio', 'gt', 'lich', 'mt'] as const) {
    if (sp[key]) reportQuery.set(key, sp[key]!);
  }
  const reportHref = `/sim/${sim.phone}/bao-cao${reportQuery.size ? `?${reportQuery.toString()}` : ''}`;

  // JSON-LD: Product + Offer + BreadcrumbList cho SEO
  const siteBase = `https://${temple.domain}`;
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: `Sim phong thủy ${sim.phone_display}`,
      description: `Sim ${sim.phone_display} (${NETWORK_LABELS[sim.network] ?? sim.network}) — điểm phong thủy ${sim.overall_score}/100, hành ${elementLabel(sim.element)}, luận theo nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận.`,
      sku: sim.phone,
      brand: {
        '@type': 'Brand',
        name: NETWORK_LABELS[sim.network] ?? sim.network,
      },
      offers: {
        '@type': 'Offer',
        url: `${siteBase}/sim/${sim.phone}`,
        priceCurrency: 'VND',
        price: sim.price_vnd,
        availability:
          sim.status === 'available'
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        seller: { '@type': 'Organization', name: temple.name },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Trang chủ',
          item: siteBase,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Kho sim phong thủy',
          item: `${siteBase}/sim`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: sim.phone_display,
          item: `${siteBase}/sim/${sim.phone}`,
        },
      ],
    },
  ];

  return (
    <main className="overflow-x-hidden pt-20 pb-24 md:pt-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto min-w-0 max-w-6xl px-4 md:px-6">
        {/* Breadcrumb */}
        <nav className="py-4 text-xs text-muted">
          <Link href="/" className="hover:text-ink">Trang chủ</Link>
          <span className="mx-1.5">/</span>
          <Link href="/sim" className="hover:text-ink">Kho sim phong thủy</Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink">{sim.phone_display}</span>
        </nav>

        {/* Header sim */}
        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="border border-fog bg-paper p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2 text-[0.68rem]">
              <span className="border border-fog px-2 py-0.5 text-muted">
                {NETWORK_LABELS[sim.network] ?? sim.network}
              </span>
              {tag ? (
                <span className="px-2 py-0.5 font-medium text-white" style={{ backgroundColor: primary }}>
                  {tag}
                </span>
              ) : null}
              <span className="px-2 py-0.5 font-medium text-white" style={{ backgroundColor: el.color }}>
                Hành {el.label}
              </span>
              <span
                className="px-2 py-0.5 font-medium text-white"
                style={{ backgroundColor: VERDICT_COLORS[sim.verdict] }}
              >
                Phong thủy: {verdictLabel(sim.verdict)}
              </span>
            </div>

            <h1 className="mt-4 font-display text-4xl tracking-wide text-ink md:text-5xl">
              {sim.phone_display}
            </h1>

            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <span className="text-2xl font-bold" style={{ color: primary }}>
                {formatVnd(sim.price_vnd)}
              </span>
              {discount ? (
                <>
                  <span className="text-sm text-muted line-through">
                    {formatVnd(sim.original_price_vnd!)}
                  </span>
                  <span className="bg-[#1B6B3A] px-2 py-0.5 text-xs font-semibold text-white">
                    Tiết kiệm {discount}%
                  </span>
                </>
              ) : null}
            </div>

            {discount && sim.sale_ends_at ? (
              <div className="mt-3">
                <SimSaleCountdown endsAt={sim.sale_ends_at} size="lg" />
              </div>
            ) : null}

            {perDay > 0 ? (
              <p className="mt-2.5 inline-flex flex-wrap items-baseline gap-1 border border-fog bg-mist/50 px-2.5 py-1.5 text-[0.72rem] text-ink/75">
                Chỉ ≈{' '}
                <span className="font-bold text-ink">
                  {perDay.toLocaleString('vi-VN')}đ/ngày
                </span>{' '}
                khi dùng 10 năm — rẻ hơn một ly trà đá cho trợ thủ kích vượng tài lộc mang theo mỗi ngày.
              </p>
            ) : null}

            <p className="mt-2 text-[0.72rem] text-muted">
              Mỗi số chỉ có duy nhất 1 sim — người đặt trước được ưu tiên.
              {sim.view_count > 5 ? (
                <>
                  {' '}
                  <span className="font-medium text-ink">
                    {sim.view_count.toLocaleString('vi-VN')} người đã xem số này.
                  </span>
                </>
              ) : null}
            </p>

            {sold ? (
              <div className="mt-5 border border-fog bg-mist px-4 py-3 text-sm text-ink">
                Sim này <span className="font-semibold">đã có chủ</span>. Xem các số
                tương đương bên dưới hoặc nhắn Zalo để thầy tuyển số tương tự.
              </div>
            ) : (
              <div className="mt-6">
                <SimOrderForm
                  simId={sim.id}
                  phoneDisplay={sim.phone_display}
                  priceVnd={sim.price_vnd}
                  primaryColor={primary}
                  defaultBirthDate={birth?.date}
                  defaultGender={birth?.gender}
                  autoOpen={sp.dat === '1'}
                  zaloUrl={LY_GIA.zaloUrl}
                />
              </div>
            )}

            <ul className="mt-6 grid gap-2 text-[0.78rem] text-ink/75 sm:grid-cols-2">
              <li>✓ Sim chính chủ — đăng ký tên bạn ngay khi giao</li>
              <li>✓ Giao sim tận nơi, kiểm tra xong mới thanh toán phần còn lại</li>
              <li>✓ Thầy chọn ngày hoàng đạo kích sim miễn phí</li>
              <li>✓ Hỗ trợ giữ số & tư vấn 1-1 qua Zalo</li>
            </ul>
          </div>

          {/* Điểm tổng quan */}
          <div className="border border-fog bg-paper p-6">
            <p className="text-[0.68rem] uppercase tracking-[0.25em] text-muted">
              Điểm phong thủy
            </p>
            <div className="mt-4 flex items-center gap-4">
              <SimScoreRing score={sim.overall_score} size={84} />
              <div>
                <p className="font-display text-2xl" style={{ color: VERDICT_COLORS[sim.verdict] }}>
                  {verdictLabel(sim.verdict)}
                </p>
                <p className="text-xs text-muted">
                  {sim.overall_score}/100 điểm tổng hợp
                </p>
              </div>
            </div>
            <dl className="mt-5 space-y-2 text-[0.78rem]">
              <div className="flex justify-between border-b border-fog pb-1.5">
                <dt className="text-muted">Du Niên</dt>
                <dd className="font-medium text-ink">{sim.du_nien_score}/100</dd>
              </div>
              <div className="flex justify-between border-b border-fog pb-1.5">
                <dt className="text-muted">Ngũ hành sim</dt>
                <dd className="font-medium text-ink">{elementLabel(sim.element)}</dd>
              </div>
              <div className="flex justify-between border-b border-fog pb-1.5">
                <dt className="text-muted">81 số lý (4 số cuối)</dt>
                <dd className="font-medium text-ink">Số {sim.so_ly_81}</dd>
              </div>
              <div className="flex justify-between border-b border-fog pb-1.5">
                <dt className="text-muted">Tổng nút</dt>
                <dd className="font-medium text-ink">{sim.nut} nút</dd>
              </div>
            </dl>

            {/* 5 phương diện gốc — bảng thanh điểm (giữ như cũ, dưới Tổng nút) */}
            <div className="mt-5 space-y-2.5">
              {Object.entries(ASPECT_LABELS).map(([id, label]) => {
                const score = Number(sim.aspects?.[id] ?? 0);
                return (
                  <div key={id}>
                    <div className="flex justify-between text-[0.7rem]">
                      <span className="text-muted">{label as string}</span>
                      <span className="font-medium text-ink">{score}</span>
                    </div>
                    <div className="mt-0.5 h-1.5 bg-mist">
                      <div
                        className="h-full"
                        style={{
                          width: `${score}%`,
                          backgroundColor:
                            score >= 75 ? '#1B6B3A' : score >= 55 ? '#B08D42' : '#9b3535',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Phổ điểm mạng nhện — vẽ thêm để nhìn nhanh điểm mạnh/yếu */}
            <div className="mt-5 flex justify-center border-t border-fog pt-4">
              <SimRadarChart
                axes={ASPECT_ORDER.map((id) => ({
                  label: ASPECT_LABELS[id],
                  score: Number(sim.aspects?.[id] ?? 0),
                }))}
                color={primary}
                size={250}
              />
            </div>
            <p className="mt-1 text-center text-[0.65rem] text-muted">
              Phổ điểm 5 phương diện — sim mạnh ở đỉnh nào, đỉnh đó vươn xa tâm.
            </p>

            {/* Mục đích sâu (nhóm 2 + 3) */}
            <div className="mt-6 space-y-4 border-t border-fog pt-4">
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted">
                Hợp mục đích sâu
              </p>
              {SIM_PURPOSE_GROUPS.filter(
                (g) => g.id !== 'tai_van' && g.id !== 'kinh_dich',
              ).map((g) => (
                <div key={g.id}>
                  <p className="mb-2 text-[0.72rem] font-medium text-ink">{g.label}</p>
                  <div className="space-y-2">
                    {SIM_PURPOSES.filter(
                      (p) =>
                        p.group === g.id &&
                        p.aspect != null &&
                        !['suc_khoe', 'tinh_cam', 'xuat_hanh'].includes(p.id),
                    ).map((p) => {
                      const score = Number(sim.aspects?.[p.aspect ?? ''] ?? 0);
                      return (
                        <div key={p.id}>
                          <div className="flex justify-between gap-2 text-[0.7rem]">
                            <span className="text-muted">{p.label}</span>
                            <span className="shrink-0 font-medium text-ink tabular-nums">
                              {score}
                            </span>
                          </div>
                          <div className="mt-0.5 h-1.5 bg-mist">
                            <div
                              className="h-full"
                              style={{
                                width: `${Math.max(0, Math.min(100, score))}%`,
                                backgroundColor:
                                  score >= 75
                                    ? '#1B6B3A'
                                    : score >= 55
                                      ? '#B08D42'
                                      : '#9b3535',
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hợp mệnh cá nhân */}
        <section className="mt-8">
          <h2 className="font-display text-2xl text-ink">
            Sim này có hợp với bạn không?
          </h2>
          <div className="mt-3">
            <SimBirthPanel primaryColor={primary} compact dungThanSummary={dungThanSummary} />
          </div>

          {/* Kết quả độ hợp — nằm trên nút nhận báo cáo */}
          {personal && dungThan ? (
            <div
              className="mt-3 border p-5"
              style={{
                borderColor: personal.matchPercent >= 75 ? '#1B6B3A55' : personal.matchPercent >= 55 ? '#B08D4255' : '#9b353555',
                backgroundColor: personal.matchPercent >= 75 ? '#1B6B3A0a' : personal.matchPercent >= 55 ? '#B08D420a' : '#9b35350a',
              }}
            >
              <div className="flex flex-wrap items-center gap-4">
                <SimScoreRing
                  score={personal.matchPercent}
                  size={72}
                  color={personal.matchPercent >= 75 ? '#1B6B3A' : personal.matchPercent >= 55 ? '#B08D42' : '#9b3535'}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-xl text-ink">
                    Hợp {personal.matchPercent}% — {personal.menhFit.label}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-ink/75">
                    {personal.menhFit.detail}
                  </p>
                  <p className="mt-1.5 text-[0.72rem] text-muted">
                    Mục tiêu {goalLabel(goal)}: phương diện liên quan của sim đạt{' '}
                    {personal.goalScore}/100 · Công thức: 45% điểm phong thủy gốc + 35%
                    hợp dụng thần + 20% phương diện mục tiêu.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Báo cáo chứng nhận — chỉ mở khi đã nhập Bát Tự + ấn Xem độ hợp */}
          <div className="mt-3 border border-fog bg-paper px-4 py-3.5">
            {birth ? (
              <Link
                href={reportHref}
                className="flex h-11 items-center justify-center gap-2 text-[0.85rem] font-semibold text-white"
                style={{ backgroundColor: primary }}
              >
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" />
                  <path d="M14 2v6h6M9 15l2 2 4-4" />
                </svg>
                Nhận báo cáo chứng nhận (PDF có dấu thẩm định)
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 text-[0.85rem] font-semibold text-white/80"
                style={{ backgroundColor: primary, opacity: 0.45 }}
                title="Nhập ngày sinh và ấn Xem độ hợp trước"
              >
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" />
                  <path d="M14 2v6h6M9 15l2 2 4-4" />
                </svg>
                Nhận báo cáo chứng nhận (PDF có dấu thẩm định)
              </button>
            )}
            <p className="mt-2 text-center text-[0.72rem] leading-relaxed text-muted">
              {birth ? (
                <>
                  Đã có Bát Tự — bấm nút trên để nhận báo cáo đầy đủ
                  (khớp mệnh, giờ kích sim và dấu thẩm định).
                </>
              ) : (
                <>
                  Bắt buộc: nhập <span className="font-medium text-ink">ngày tháng năm sinh</span>, ấn{' '}
                  <span className="font-medium text-ink">Xem độ hợp</span> ở ô trên — sau đó mới mở được
                  nút nhận báo cáo chứng nhận đầy đủ.
                </>
              )}
            </p>
          </div>

          {/* Giờ hoàng đạo kích sim */}
          <div className="mt-3">
            <SimActivationHours birthYear={birthYear} primaryColor={primary} />
          </div>
        </section>

        {/* Luận giải Âm Dương Ngũ Hành chi tiết */}
        {!('error' in analysis) ? (
          <section className="mt-10 grid min-w-0 gap-6 lg:grid-cols-[1.3fr_1fr]">
            <div className="min-w-0 space-y-5">
              <div className="min-w-0 border border-fog bg-paper px-4 py-4 md:px-5 md:py-5">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted">
                  Luận giải tổng hợp
                </p>
                <h2 className="mt-1.5 break-words font-display text-xl leading-snug text-ink md:text-2xl">
                  Nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận
                </h2>
                <div className="mt-4 space-y-3 break-words text-sm leading-relaxed text-ink/85">
                  {analysis.luanGiai.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
                <div
                  className="mt-5 break-words border-l-2 bg-mist/50 px-4 py-3 text-sm leading-relaxed text-ink/85"
                  style={{ borderColor: primary }}
                >
                  <span className="font-medium" style={{ color: primary }}>
                    Lời thầy:
                  </span>{' '}
                  {analysis.advice}
                </div>
              </div>

              {/* Dòng chảy từ trường */}
              <div className="min-w-0 border border-fog bg-paper px-4 py-4 md:px-5">
                <h3 className="font-display text-xl text-ink">
                  Sơ đồ dòng chảy từ trường
                </h3>
                <div className="mt-4 min-w-0">
                  <SimEnergyFlow pairs={analysis.pairs} />
                </div>
              </div>

              {/* Cặp quái số */}
              <div className="min-w-0 border border-fog bg-paper px-4 py-4 md:px-5">
                <h3 className="font-display text-xl text-ink">
                  Cấu trúc cặp quái số
                </h3>
                <div className="mt-3 w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain border border-fog [-webkit-overflow-scrolling:touch]">
                  <table className="w-full min-w-[28rem] text-left text-xs">
                    <thead className="bg-mist text-muted">
                      <tr>
                        <th className="p-2.5">Cặp số</th>
                        <th className="p-2.5">Sao</th>
                        <th className="p-2.5">Cát / Hung</th>
                        <th className="p-2.5">Chủ về</th>
                        <th className="p-2.5 text-right">Điểm</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.pairs.map((p, i) => (
                        <tr key={i} className={`border-t border-fog ${p.isTail ? 'bg-[#B08D42]/8' : ''}`}>
                          <td className="p-2.5 font-mono text-sm font-semibold text-ink">
                            {p.label}
                            {p.isTail ? (
                              <span className="ml-1 text-[0.6rem] font-normal text-[#B08D42]">đuôi</span>
                            ) : null}
                          </td>
                          <td className="p-2.5 text-ink">
                            {p.star.nameVi}{' '}
                            <span className="text-muted">({p.star.nameHan})</span>
                          </td>
                          <td className="p-2.5">
                            <span
                              className="px-1.5 py-0.5 text-[0.62rem] font-medium text-white"
                              style={{
                                backgroundColor: p.star.kind === 'cat' ? '#1B6B3A' : '#9b3535',
                              }}
                            >
                              {p.star.kind === 'cat' ? 'Cát' : 'Hung'}
                            </span>
                          </td>
                          <td className="p-2.5 text-muted">{p.star.chuVe}</td>
                          <td className="p-2.5 text-right font-medium text-ink">
                            {Math.round(p.effectiveScore)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {analysis.combos.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    {analysis.combos.map((c, i) => (
                      <div
                        key={i}
                        className="border border-fog bg-mist/40 px-3 py-2.5 text-xs leading-relaxed"
                      >
                        <span
                          className="mr-1.5 font-semibold"
                          style={{ color: c.kind === 'hung' ? '#9b3535' : '#1B6B3A' }}
                        >
                          {c.title}
                        </span>
                        <span className="text-muted">{c.detail}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="min-w-0 space-y-5">
              {/* 81 số lý */}
              <div className="border border-fog bg-paper p-5">
                <p className="text-[0.68rem] uppercase tracking-[0.25em] text-muted">
                  81 số lý · 4 số cuối
                </p>
                <p className="mt-2 font-display text-xl text-ink">
                  Số {analysis.soLy81} — {analysis.soLyMeta.title}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/75">
                  {analysis.soLyMeta.summary}
                </p>
              </div>

              {/* Âm dương + nút */}
              <div className="border border-fog bg-paper p-5 text-sm">
                <p className="text-[0.68rem] uppercase tracking-[0.25em] text-muted">
                  Âm dương · Tổng nút
                </p>
                <p className="mt-2 text-ink/80">
                  {analysis.duongCount} số dương · {analysis.amCount} số âm — cân bằng{' '}
                  {analysis.amDuongScore}/100. Tổng nút{' '}
                  <span className="font-semibold text-ink">{analysis.tongNut}</span>
                  {analysis.tongNut === 8
                    ? ' — nút phát, dân gian rất chuộng.'
                    : analysis.tongNut === 6 || analysis.tongNut === 1
                      ? ' — nút đẹp theo quan niệm dân gian.'
                      : '.'}
                </p>
                {analysis.patterns.length > 0 ? (
                  <p className="mt-2 text-xs text-muted">
                    Kiểu số: {analysis.patterns.join(' · ')}
                  </p>
                ) : null}
              </div>

              {/* Ngành nghề hợp */}
              <div className="border border-fog bg-paper p-5">
                <p className="text-[0.68rem] uppercase tracking-[0.25em] text-muted">
                  Sim này hợp ngành nghề nào?
                </p>
                <div className="mt-3 space-y-3">
                  {careerFits.map(({ career, score }) => (
                    <div key={career.id}>
                      <div className="flex items-baseline justify-between gap-2">
                        <Link
                          href={`/sim?nghe=${career.id}`}
                          className="text-sm font-medium text-ink hover:text-lacquer"
                        >
                          {career.label}
                        </Link>
                        <span className="text-xs font-semibold" style={{ color: score >= 75 ? '#1B6B3A' : '#B08D42' }}>
                          {score}/100
                        </span>
                      </div>
                      <p className="mt-0.5 text-[0.7rem] leading-relaxed text-muted">
                        {career.examples}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 border-t border-fog pt-3 text-[0.72rem] leading-relaxed text-muted">
                  {analysis.careers[0]}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* Mẹo hóa giải hung tinh & kịch bản ứng dụng */}
        {hoaGiai ? (
          <section className="mt-10">
            <h2 className="font-display text-2xl text-ink">
              Mẹo hóa giải hung tinh — ép hung phát cát
            </h2>
            <SimHoaGiaiSection hoaGiai={hoaGiai} primaryColor={primary} />
          </section>
        ) : null}

        {/* Quẻ Kinh Dịch của sim */}
        <SimKinhDichSection phone={sim.phone} primaryColor={primary} />

        {/* Sim tương tự — stream riêng, không chặn phần luận giải phía trên */}
        <Suspense fallback={<SimSimilarSkeleton />}>
          <SimSimilarSection sim={sim} />
        </Suspense>
      </div>
    </main>
  );
}
