import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentTemple, formatVnd } from '@/lib/tenant';
import { isLyGiaPhucAnSite, LY_GIA } from '@/lib/ly-gia-phuc-an';
import {
  getSimByPhone,
  NETWORK_LABELS,
  SIM_PURPOSE_GROUPS,
  SIM_PURPOSES,
} from '@/lib/sim/catalog';
import {
  buildSimDungThan,
  goalLabel,
  parseBirthParams,
  parseGoal,
  personalizeSimScore,
} from '@/lib/sim/bat-tu';
import { analyzeBoiSim } from '@/lib/fengshui/boi-sim';
import { ASPECT_ORDER, ASPECT_LABELS, elementLabel } from '@/lib/fengshui/bat-cuc';
import { verdictLabel } from '@/lib/fengshui/bat-cuc-contexts';
import { analyzeSimKinhDich, QUE_RANK_META } from '@/lib/fengshui/sim-kinh-dich';
import { buildHoaGiai } from '@/lib/sim/hoa-giai';
import { SimRadarChart } from '@/components/sim/SimRadarChart';
import { SimEnergyFlow } from '@/components/sim/SimEnergyFlow';
import { SimHoaGiaiSection } from '@/components/sim/SimHoaGiaiSection';
import { SimActivationHours } from '@/components/sim/SimActivationHours';
import { SealStamp, MasterSignature } from '@/components/sim/SealStamp';
import { HexagramFigure } from '@/components/sim/SimKinhDichSection';
import { SimScoreRing, ELEMENT_BADGE, VERDICT_COLORS } from '@/components/sim/sim-ui';
import { ReportActions } from './ReportActions';

interface Props {
  params: Promise<{ phone: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

const GOLD = '#B08D42';
const GOOD = '#1B6B3A';

/** Gợi ý "dẫn khí" theo hành của sim (bước 1 khai sim). */
const ELEMENT_ACTIVATION: Record<string, string> = {
  kim: 'Cài hình nền điện thoại tông trắng, ánh kim hoặc hình kim loại quý để "dẫn khí" Kim hòa nhập nhanh với năng lượng bản thể.',
  moc: 'Cài hình nền điện thoại tông xanh lá hoặc hình cây cối tươi tốt để "dẫn khí" Mộc hòa nhập nhanh với năng lượng bản thể.',
  thuy: 'Cài hình nền điện thoại tông xanh dương hoặc hình sông nước, biển cả để "dẫn khí" Thủy hòa nhập nhanh với năng lượng bản thể.',
  hoa: 'Cài hình nền điện thoại tông đỏ cam hoặc hình mặt trời, ánh lửa để "dẫn khí" Hỏa hòa nhập nhanh với năng lượng bản thể.',
  tho: 'Cài hình nền điện thoại tông vàng nâu hoặc hình núi non, gốm đất để "dẫn khí" Thổ hòa nhập nhanh với năng lượng bản thể.',
};

function vnDateLabel(): string {
  const d = new Date(Date.now() + 7 * 3600 * 1000);
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;
}

function reportCode(phone: string): string {
  const year = new Date(Date.now() + 7 * 3600 * 1000).getUTCFullYear();
  return `LGPA-${year}-${phone.slice(-4)}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { phone } = await params;
  return {
    title: `Báo cáo luận giải phong thủy sim ${phone} — có dấu thẩm định | Lý Gia Phúc An`,
    description: `Báo cáo chứng nhận luận giải phong thủy đầy đủ cho sim ${phone}: Bát Tự dụng thần, phổ điểm 5 phương diện, bảng Du Niên, quẻ Mai Hoa Dịch Số, mẹo hóa giải hung tinh và quy trình khai sim — có con dấu thẩm định của Lý Gia Phúc An.`,
  };
}

function SectionHeading({
  no,
  title,
  primary,
}: {
  no: string;
  title: string;
  primary: string;
}) {
  return (
    <div
      className="section-heading flex items-center gap-2.5 border-b-2 pb-1.5"
      style={{ borderColor: primary }}
    >
      <span
        className="grid h-6 w-6 shrink-0 place-items-center text-[0.72rem] font-bold text-white"
        style={{ backgroundColor: primary }}
      >
        {no}
      </span>
      <h2 className="font-display text-lg leading-tight text-ink">{title}</h2>
    </div>
  );
}

export default async function SimReportPage({ params, searchParams }: Props) {
  const temple = await getCurrentTemple();
  if (!temple || !isLyGiaPhucAnSite(temple)) notFound();

  const { phone } = await params;
  const sp = await searchParams;
  const primary = temple.primary_color || LY_GIA.primary;

  const sim = await getSimByPhone(temple.id, phone);
  if (!sim) notFound();

  const birth = parseBirthParams(sp);
  const goal = parseGoal(sp.mt);

  // Bắt buộc đã nhập Bát Tự + ấn Xem độ hợp (có ns trên URL) mới xem báo cáo
  if (!birth) {
    return (
      <main className="bg-mist/60 pt-20 pb-20">
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <p className="font-display text-2xl text-ink">Cần thông tin Bát Tự để mở báo cáo</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Vui lòng quay lại trang sim, nhập <span className="font-medium text-ink">ngày tháng năm sinh</span>{' '}
            rồi ấn <span className="font-medium text-ink">Xem độ hợp</span> — sau đó mới nhận được báo cáo
            chứng nhận đầy đủ có khớp mệnh và dấu thẩm định.
          </p>
          <Link
            href={`/sim/${sim.phone}`}
            className="mt-6 inline-flex h-11 items-center px-6 text-sm font-semibold text-white"
            style={{ backgroundColor: primary }}
          >
            Quay lại nhập ngày sinh — {sim.phone_display}
          </Link>
        </div>
      </main>
    );
  }

  const birthYear = Number(birth.date.slice(0, 4));

  const analysis = analyzeBoiSim(sim.phone, birthYear);
  if ('error' in analysis) notFound();

  const kd = analyzeSimKinhDich(sim.phone);
  const hoaGiai = buildHoaGiai(analysis);
  const dungThan = buildSimDungThan(birth);
  const personal = dungThan ? personalizeSimScore(sim, dungThan, goal) : null;

  const el = ELEMENT_BADGE[sim.element];
  const code = reportCode(sim.phone);
  const dateLabel = vnDateLabel();
  const perDay = Math.round(sim.price_vnd / (10 * 365) / 100) * 100;

  const radarAxes = ASPECT_ORDER.map((id) => ({
    label: ASPECT_LABELS[id],
    score: Number(sim.aspects?.[id] ?? 0),
  }));

  const goodCombos = analysis.combos.filter((c) => c.kind !== 'hung');
  const rank = kd ? QUE_RANK_META[kd.interpretation.rank] : null;

  return (
    <main className="overflow-x-hidden bg-mist/60 pt-20 pb-20 print:bg-white print:p-0 print:pt-0 print:pb-0">
      {/*
        In ấn: KHÔNG dùng khung viền bao cả báo cáo dài nhiều trang —
        Chrome cắt khung giữa trang → mất lề, trông xấu.
        Khi print chỉ giữ nội dung + lề A4 rộng; viền đỏ/vàng chỉ hiện trên màn hình.
      */}
      <style>{`
        .sim-report { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        @media print {
          @page { size: A4; margin: 16mm 14mm; }
          html, body {
            background: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          header, footer, [data-print-hide], .print\\:hidden { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; background: #fff !important; }
          .sim-report-wrap { max-width: none !important; padding: 0 !important; margin: 0 !important; }
          .sim-report {
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            max-width: none !important;
            background: #fff !important;
          }
          .sim-report-inner {
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Chỉ tránh cắt các khối nhỏ — section dài (phần 1) không avoid
             kẻo bị đẩy cả khối sang trang sau, để trống nửa trang. */
          .sim-report .section-heading {
            break-after: avoid;
            page-break-after: avoid;
          }
          .sim-report .print-keep {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            -webkit-column-break-inside: avoid;
          }
          /* Grid 3 quẻ: giữ hàng liền, không cắt giữa hình và tên */
          .sim-report .print-keep.grid {
            display: grid;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      <div className="sim-report-wrap mx-auto min-w-0 max-w-[820px] overflow-x-hidden px-3 md:px-0">
        {/* Thanh thao tác — không in */}
        <div className="mb-4 flex min-w-0 flex-wrap items-center justify-between gap-3 print:hidden">
          <nav className="min-w-0 text-xs text-muted">
            <Link href="/sim" className="hover:text-ink">Kho sim</Link>
            <span className="mx-1.5">/</span>
            <Link href={`/sim/${sim.phone}`} className="hover:text-ink">{sim.phone_display}</Link>
            <span className="mx-1.5">/</span>
            <span className="text-ink">Báo cáo chứng nhận</span>
          </nav>
          <ReportActions primaryColor={primary} zaloUrl={LY_GIA.zaloUrl} />
        </div>

        {/* ====== TỜ BÁO CÁO ====== */}
        <div
          className="sim-report min-w-0 overflow-x-hidden border-4 bg-paper shadow-[0_24px_60px_-24px_rgba(0,0,0,0.35)] print:border-0 print:shadow-none"
          style={{ borderColor: primary }}
        >
          <div
            className="sim-report-inner m-1.5 min-w-0 overflow-x-hidden border px-3.5 py-6 sm:px-6 md:px-9 md:py-7 print:m-0 print:border-0 print:px-0 print:py-0"
            style={{ borderColor: GOLD }}
          >
            {/* Banner header */}
            <header className="text-center print:break-inside-avoid">
              <div className="mx-auto mb-2.5 flex justify-center">
                <Image
                  src={LY_GIA.logoOrb}
                  alt={LY_GIA.name}
                  width={72}
                  height={72}
                  className="size-[72px] object-contain"
                  unoptimized
                  priority
                />
              </div>
              <p className="text-[0.62rem] uppercase tracking-[0.4em]" style={{ color: GOLD }}>
                Lý Gia Phúc An · Kiến tạo vận mệnh
              </p>
              <h1 className="mt-1.5 font-display text-2xl leading-tight text-ink md:text-[1.7rem]">
                BÁO CÁO LUẬN GIẢI PHONG THỦY SIM
              </h1>
              <p className="mt-1 text-[0.7rem] text-muted">
                Văn phòng tư vấn phong thủy — {LY_GIA.address} · {LY_GIA.phoneDisplay} · {LY_GIA.website}
              </p>
              <div
                className="mt-3.5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 border-y py-2 text-[0.72rem]"
                style={{ borderColor: `${GOLD}66` }}
              >
                <span className="text-muted">
                  Hồ sơ: <span className="font-semibold text-ink">{code}</span>
                </span>
                <span className="text-muted">
                  Ngày lập: <span className="font-semibold text-ink">{dateLabel}</span>
                </span>
                <span className="text-muted">
                  Nhà mạng:{' '}
                  <span className="font-semibold text-ink">
                    {NETWORK_LABELS[sim.network] ?? sim.network}
                  </span>
                </span>
                <span className="text-muted">
                  Ngũ hành: <span className="font-semibold" style={{ color: el.color }}>{el.label}</span>
                </span>
              </div>
            </header>

            {/* Tổng quan sim */}
            <section className="print-keep mt-5 flex flex-wrap items-center justify-between gap-4 border border-fog bg-mist/40 px-5 py-4">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.25em] text-muted">Số thẩm định</p>
                <p className="mt-0.5 font-display text-3xl tracking-wide text-ink md:text-4xl">
                  {sim.phone_display}
                </p>
                <p className="mt-1 text-[0.72rem] text-muted">
                  Giá niêm yết {formatVnd(sim.price_vnd)} · chỉ ≈{' '}
                  <span className="font-semibold text-ink">{perDay.toLocaleString('vi-VN')}đ/ngày</span>{' '}
                  khi dùng 10 năm
                </p>
              </div>
              <div className="flex items-center gap-3">
                <SimScoreRing score={sim.overall_score} size={72} />
                <div>
                  <p className="font-display text-xl" style={{ color: VERDICT_COLORS[sim.verdict] }}>
                    {verdictLabel(sim.verdict)}
                  </p>
                  <p className="text-[0.7rem] text-muted">{sim.overall_score}/100 điểm tổng hợp</p>
                  {rank && kd ? (
                    <p className="mt-0.5 text-[0.7rem] font-medium" style={{ color: rank.color }}>
                      Quẻ {kd.primary.nameVi} · {rank.label}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>

            {/* ===== Phần 1: Bát Tự + phổ điểm ===== */}
            <section className="mt-6">
              <SectionHeading no="1" title="Bát Tự Dụng Thần & Phổ Điểm 5 Phương Diện" primary={primary} />
              <div className="mt-4 grid gap-5 md:grid-cols-[1fr_1.1fr]">
                <div className="flex items-center justify-center">
                  <SimRadarChart axes={radarAxes} color={primary} size={280} />
                </div>
                <div className="space-y-3 text-sm leading-relaxed">
                  {dungThan && personal && birth ? (
                    <>
                      <div
                        className="border px-4 py-3"
                        style={{ borderColor: `${GOOD}55`, backgroundColor: `${GOOD}0a` }}
                      >
                        <p className="text-[0.65rem] font-semibold uppercase tracking-wider" style={{ color: GOOD }}>
                          Đánh giá theo Bát Tự của quý khách
                        </p>
                        {/* Hồ sơ sinh khách đã chọn — gắn với báo cáo */}
                        <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[0.72rem] leading-snug">
                          <div className="flex gap-1">
                            <dt className="shrink-0 text-muted">Ngày sinh:</dt>
                            <dd className="font-medium text-ink">
                              {birth.date.split('-').reverse().join('/')}
                            </dd>
                          </div>
                          <div className="flex gap-1">
                            <dt className="shrink-0 text-muted">Giờ sinh:</dt>
                            <dd className="font-medium text-ink">
                              {birth.hour != null
                                ? `${String(birth.hour).padStart(2, '0')}:00`
                                : 'Không rõ'}
                            </dd>
                          </div>
                          <div className="flex gap-1">
                            <dt className="shrink-0 text-muted">Giới tính:</dt>
                            <dd className="font-medium text-ink">
                              {birth.gender === 'nu' ? 'Nữ' : 'Nam'}
                            </dd>
                          </div>
                          <div className="flex gap-1">
                            <dt className="shrink-0 text-muted">Loại lịch:</dt>
                            <dd className="font-medium text-ink">
                              {birth.calendar === 'lunar' ? 'Âm lịch' : 'Dương lịch'}
                            </dd>
                          </div>
                          <div className="col-span-2 flex gap-1">
                            <dt className="shrink-0 text-muted">Ưu tiên:</dt>
                            <dd className="font-medium text-ink">{goalLabel(goal)}</dd>
                          </div>
                        </dl>
                        <p className="mt-2.5 border-t pt-2 text-ink/85" style={{ borderColor: `${GOOD}33` }}>
                          Nhật chủ <span className="font-semibold">{dungThan.nhatChu}</span> (
                          {dungThan.nhatChuHanh}) · {dungThan.verdictLabel}. Dụng thần{' '}
                          <span className="font-semibold">{dungThan.dungThan}</span>, hỷ thần{' '}
                          {dungThan.hyThan.join(' – ')}, kỵ {dungThan.kyThan.join(' – ')}.
                        </p>
                        <p className="mt-1.5 font-display text-lg" style={{ color: GOOD }}>
                          Khớp mệnh {personal.matchPercent}% — {personal.menhFit.label}
                        </p>
                        <p className="mt-0.5 text-[0.75rem] text-ink/70">{personal.menhFit.detail}</p>
                      </div>
                      <p className="text-[0.72rem] leading-relaxed text-muted">
                        Sim mang hành {elementLabel(sim.element)} — như mảnh ghép năng lượng bổ vào
                        bức tranh vận mệnh: dùng hằng ngày để trường khí của số dẫn khí cho bản mệnh.
                      </p>
                    </>
                  ) : (
                    <div className="border border-fog bg-mist/40 px-4 py-3 text-[0.8rem] leading-relaxed text-ink/75">
                      Báo cáo này luận theo bản thể dãy số. Để chấm thêm{' '}
                      <span className="font-medium text-ink">độ khớp Dụng thần Bát Tự</span> của riêng
                      quý khách, mở trang sim và nhập ngày sinh — báo cáo sẽ tự cập nhật phần này.
                    </div>
                  )}
                  <div className="space-y-1.5">
                    {radarAxes.map((a) => (
                      <div key={a.label}>
                        <div className="flex justify-between text-[0.7rem]">
                          <span className="text-muted">{a.label}</span>
                          <span className="font-semibold text-ink tabular-nums">{Math.round(a.score)}/100</span>
                        </div>
                        <div className="h-1.5 bg-mist">
                          <div
                            className="h-full"
                            style={{
                              width: `${Math.min(100, a.score)}%`,
                              backgroundColor: a.score >= 75 ? GOOD : a.score >= 55 ? GOLD : '#9b3535',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hợp mục đích sâu — giống trang chi tiết sim */}
              <div className="print-keep mt-5 border border-fog bg-mist/30 px-4 py-4">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted">
                  Hợp mục đích sâu
                </p>
                <div className="mt-3 grid gap-5 sm:grid-cols-2">
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
                                <span className="shrink-0 font-semibold text-ink tabular-nums">
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
                                        ? GOOD
                                        : score >= 55
                                          ? GOLD
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

            {/* ===== Phần 2: Du Niên + mật mã tài phú ===== */}
            <section className="mt-7">
              <SectionHeading no="2" title="Bảng Bát Cực Du Niên & Dòng Chảy Từ Trường" primary={primary} />
              <div className="mt-4">
                <SimEnergyFlow pairs={analysis.pairs} compact />
              </div>
              <div className="mt-4 w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain border border-fog [-webkit-overflow-scrolling:touch]">
                <table className="w-full min-w-[28rem] text-left text-[0.72rem]">
                  <thead className="bg-mist text-muted">
                    <tr>
                      <th className="p-2">Cặp số</th>
                      <th className="p-2">Sao</th>
                      <th className="p-2">Cát / Hung</th>
                      <th className="p-2">Chủ về</th>
                      <th className="p-2 text-right">Điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.pairs.map((p, i) => (
                      <tr key={i} className={`border-t border-fog ${p.isTail ? 'bg-[#B08D42]/10' : ''}`}>
                        <td className="p-2 font-mono font-semibold text-ink">
                          {p.label}
                          {p.isTail ? <span className="ml-1 text-[0.58rem] text-[#B08D42]">đuôi</span> : null}
                        </td>
                        <td className="p-2 text-ink">
                          {p.star.nameVi} <span className="text-muted">({p.star.nameHan})</span>
                        </td>
                        <td className="p-2">
                          <span
                            className="px-1.5 py-0.5 text-[0.58rem] font-semibold text-white"
                            style={{ backgroundColor: p.star.kind === 'cat' ? GOOD : '#9b3535' }}
                          >
                            {p.star.kind === 'cat' ? 'Cát' : 'Hung'}
                          </span>
                        </td>
                        <td className="p-2 text-muted">{p.star.chuVe}</td>
                        <td className="p-2 text-right font-semibold text-ink">{Math.round(p.effectiveScore)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {goodCombos.length > 0 ? (
                <div className="mt-3.5 border px-4 py-3" style={{ borderColor: `${GOLD}88`, backgroundColor: `${GOLD}0d` }}>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wider" style={{ color: GOLD }}>
                    Mật mã tài phú của dãy số
                  </p>
                  <ul className="mt-1.5 space-y-1.5 text-[0.78rem] leading-relaxed text-ink/85">
                    {goodCombos.map((c, i) => (
                      <li key={i}>
                        <span className="font-semibold" style={{ color: GOOD }}>
                          {c.title.split('—')[0].trim()}
                        </span>{' '}
                        <span className="text-muted">({c.pairs})</span> — {c.detail}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>

            {/* ===== Phần 3: Quẻ Mai Hoa ===== */}
            {kd ? (
              <section className="print-keep mt-7">
                <SectionHeading no="3" title="Lập Quẻ Mai Hoa Dịch Số (Kinh Dịch 64 Quẻ)" primary={primary} />
                {/* Giữ 3 thẻ quẻ + tên liền khối khi in — tránh cắt đôi sang trang */}
                <div className="print-keep mt-4 grid gap-4 sm:grid-cols-3">
                  {[
                    { title: 'Quẻ chủ · Hiện tại', hex: kd.primary, moving: kd.movingLine },
                    { title: 'Hỗ quái · Diễn biến', hex: kd.mutual, moving: undefined },
                    { title: 'Quẻ biến · Kết cục', hex: kd.secondary, moving: undefined },
                  ].map((q) => (
                    <div
                      key={q.title}
                      className="print-keep flex flex-col items-center border border-fog bg-paper px-3 py-3.5 text-center"
                    >
                      <p className="text-[0.6rem] uppercase tracking-[0.18em] text-muted">{q.title}</p>
                      <div className="mt-2">
                        <HexagramFigure hex={q.hex} movingLine={q.moving} size="sm" />
                      </div>
                      <p className="mt-2 font-display text-[0.95rem] leading-snug text-ink">
                        {q.hex.unicode} {q.hex.nameFull}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="print-keep mt-3.5 space-y-2 text-[0.8rem] leading-relaxed text-ink/85">
                  <p>
                    <span className="font-semibold text-ink">Quẻ chủ {kd.primary.nameFull}:</span>{' '}
                    {kd.interpretation.yNghia}
                  </p>
                  <p>
                    <span className="font-semibold text-ink">
                      Hào {kd.movingLine} động chuyển sang quẻ biến {kd.secondary.nameFull}:
                    </span>{' '}
                    {kd.secondaryInterpretation.yNghia}
                  </p>
                  <p className="text-[0.72rem] text-muted">
                    Lập theo phép Mai Hoa Dịch Số: cộng nhóm số đầu ÷ 8 lấy Thượng quái, nhóm số cuối
                    ÷ 8 lấy Hạ quái, tổng cả dãy ÷ 6 tìm hào động. Xem cách tính minh bạch từng bước
                    tại trang luận giải sim.
                  </p>
                </div>
              </section>
            ) : null}

            {/* ===== Phần 4: Hóa giải hung tinh ===== */}
            <section className="mt-7">
              <SectionHeading no="4" title="Mẹo Hóa Giải Hung Tinh & Ép Hung Phát Cát" primary={primary} />
              <SimHoaGiaiSection hoaGiai={hoaGiai} primaryColor={primary} compact />
            </section>

            {/* ===== Phần 5: Khai sim + chứng nhận ===== */}
            <section className="mt-7">
              <SectionHeading no="5" title="Quy Trình 3 Bước Khai Sim & Chứng Nhận Thẩm Định" primary={primary} />

              <ol className="mt-4 space-y-2.5 text-[0.8rem] leading-relaxed text-ink/85">
                <li className="flex gap-2.5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center text-[0.62rem] font-bold text-white" style={{ backgroundColor: primary }}>1</span>
                  <span>
                    <span className="font-semibold text-ink">Dẫn khí {elementLabel(sim.element)}:</span>{' '}
                    {ELEMENT_ACTIVATION[sim.element]}
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center text-[0.62rem] font-bold text-white" style={{ backgroundColor: primary }}>2</span>
                  <span>
                    <span className="font-semibold text-ink">Khai sim giờ hoàng đạo:</span>{' '}
                    thực hiện cuộc gọi đầu tiên vào khung giờ hoàng đạo bên dưới (thầy chọn lại đích danh
                    theo Bát Tự khi giao sim — miễn phí).
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center text-[0.62rem] font-bold text-white" style={{ backgroundColor: primary }}>3</span>
                  <span>
                    <span className="font-semibold text-ink">Luân chuyển trường khí:</span>{' '}
                    đuôi sim ({analysis.tail.last3}) đóng{' '}
                    {analysis.tail.star ? `${analysis.tail.star.nameVi} — ${analysis.tail.star.chuVe.toLowerCase()}` : 'phần khí quyết định'}
                    ; ưu tiên dùng số này cho các cuộc gọi giao dịch lớn, đối tác quan trọng để nhận trợ lực tốt nhất.
                  </span>
                </li>
              </ol>

              <div className="mt-4">
                <SimActivationHours birthYear={birthYear} primaryColor={primary} compact />
              </div>

              {/* Khối chứng nhận + con dấu — ngày & chữ ký/dấu bên phải */}
              <div
                className="print-keep mt-6 flex flex-wrap items-end justify-between gap-5 border-2 px-5 py-5"
                style={{ borderColor: `${primary}66` }}
              >
                <div className="max-w-sm">
                  <p className="font-display text-lg text-ink">Dấu Ấn Thẩm Định</p>
                  <p className="mt-1 text-[0.75rem] leading-relaxed text-muted">
                    Báo cáo được lập tự động theo đúng phép luận Âm Dương Ngũ Hành — Du Niên, 81 Số Lý
                    và Mai Hoa Dịch Số áp dụng thống nhất cho toàn kho sim, được{' '}
                    {LY_GIA.name} rà soát và bảo chứng nội dung.
                  </p>
                  <p
                    className="mt-3 inline-block border-2 px-3 py-1 text-[0.72rem] font-bold tracking-[0.2em]"
                    style={{ borderColor: GOOD, color: GOOD, transform: 'rotate(-9deg)' }}
                  >
                    ✓ VERIFIED {new Date().getFullYear()}
                  </p>
                </div>
                <div className="ml-auto flex flex-col items-end">
                  <p className="mb-1 text-right text-[0.7rem] text-muted">
                    Hà Nội, ngày {dateLabel} · Hồ sơ {code}
                  </p>
                  <div className="relative flex items-end gap-2">
                    <div className="relative z-10 -mr-14 mb-2">
                      <MasterSignature width={175} />
                    </div>
                    <SealStamp size={135} />
                  </div>
                </div>
              </div>
            </section>

            {/* Footer báo cáo */}
            <footer className="mt-6 border-t pt-3.5 text-center text-[0.65rem] leading-relaxed text-muted" style={{ borderColor: `${GOLD}66` }}>
              <p>
                {LY_GIA.name} — {LY_GIA.address} · Hotline/Zalo {LY_GIA.phoneDisplay} · {LY_GIA.website}
              </p>
              <p className="mt-1">
                Luận giải phong thủy mang tính tham khảo trường khí, không thay cho nỗ lực và phúc đức
                của chính mình. Xem luận giải đầy đủ tại {temple.domain}/sim/{sim.phone}
              </p>
            </footer>
          </div>
        </div>

        {/* CTA dưới tờ báo cáo — không in */}
        <div className="mt-5 flex flex-col items-center gap-3 print:hidden">
          <p className="text-sm text-muted">
            Ưng số này? Mỗi số chỉ có duy nhất một sim — người đặt trước được ưu tiên.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href={`/sim/${sim.phone}?dat=1`}
              className="inline-flex h-11 items-center px-6 text-sm font-semibold text-white"
              style={{ backgroundColor: primary }}
            >
              Đặt sim {sim.phone_display} — {formatVnd(sim.price_vnd)}
            </Link>
            <Link
              href={`/sim/${sim.phone}`}
              className="inline-flex h-11 items-center border border-fog bg-paper px-6 text-sm font-medium text-ink"
            >
              Xem luận giải đầy đủ
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
