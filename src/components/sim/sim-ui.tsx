/**
 * Mảnh UI dùng chung của Kho Sim (server-safe, không state).
 */

import Link from 'next/link';
import { SIM_TAG_LABELS, SIM_TAG_ORDER, NETWORK_LABELS } from '@/lib/sim/catalog';
import { elementLabel } from '@/lib/fengshui/bat-cuc';
import { verdictLabel } from '@/lib/fengshui/bat-cuc-contexts';
import { simQueBadge } from '@/lib/fengshui/sim-kinh-dich';
import { SimSaleCountdown } from '@/components/sim/SimSaleCountdown';
import { SimBuyModal } from '@/components/sim/SimBuyModal';
import type { SimListing } from '@/types/database';

export const VERDICT_COLORS: Record<string, string> = {
  tot: '#1B6B3A',
  kha: '#B08D42',
  trung_binh: '#8a6d3b',
  yeu: '#9b3535',
};

export const ELEMENT_BADGE: Record<string, { label: string; color: string }> = {
  kim: { label: 'Kim', color: '#8a8f98' },
  moc: { label: 'Mộc', color: '#1B6B3A' },
  thuy: { label: 'Thủy', color: '#2F6FE0' },
  hoa: { label: 'Hỏa', color: '#C44A1F' },
  tho: { label: 'Thổ', color: '#9a6b2f' },
};

/** Bản client-safe của formatVnd (không kéo theo next/headers từ lib/tenant). */
function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + '\u00a0đ';
}

export function simDetailHref(sim: Pick<SimListing, 'phone'>, extraQuery?: string) {
  return `/sim/${sim.phone}${extraQuery ? `?${extraQuery}` : ''}`;
}

export function discountPercent(sim: SimListing): number | null {
  if (!sim.original_price_vnd || sim.original_price_vnd <= sim.price_vnd) {
    return null;
  }
  return Math.round(
    ((sim.original_price_vnd - sim.price_vnd) / sim.original_price_vnd) * 100,
  );
}

export function primaryTag(sim: SimListing): string | null {
  for (const tag of SIM_TAG_ORDER) {
    if (sim.tags.includes(tag)) return SIM_TAG_LABELS[tag];
  }
  return null;
}

export function SimScoreRing({
  score,
  size = 44,
  color,
}: {
  score: number;
  size?: number;
  color?: string;
}) {
  const clamped = Math.max(0, Math.min(100, score));
  const ringColor =
    color ??
    (clamped >= 80 ? '#1B6B3A' : clamped >= 65 ? '#B08D42' : clamped >= 45 ? '#8a6d3b' : '#9b3535');
  return (
    <div
      className="relative grid shrink-0 place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${ringColor} ${clamped * 3.6}deg, rgba(0,0,0,0.08) 0deg)`,
      }}
      aria-label={`Điểm phong thủy ${clamped}/100`}
    >
      <div
        className="grid place-items-center rounded-full bg-paper font-semibold text-ink"
        style={{ width: size - 8, height: size - 8, fontSize: size * 0.32 }}
      >
        {clamped}
      </div>
    </div>
  );
}

export function SimCard({
  sim,
  matchPercent,
  matchLabel,
  birthQuery,
  primaryColor,
  zaloUrl,
}: {
  sim: SimListing;
  matchPercent?: number;
  matchLabel?: string;
  /** query string mang theo ngày sinh để trang chi tiết luận tiếp */
  birthQuery?: string;
  primaryColor?: string;
  zaloUrl?: string;
}) {
  const discount = discountPercent(sim);
  const tag = primaryTag(sim);
  const el = ELEMENT_BADGE[sim.element];
  const href = simDetailHref(sim, birthQuery);
  const que = simQueBadge(sim.phone);

  return (
    <div className="group relative flex h-full flex-col border border-fog bg-paper p-4 transition-shadow hover:shadow-[0_14px_40px_-18px_rgba(0,0,0,0.35)]">
      {/* Băng điểm góc trên phải — màu theo kết luận phong thủy */}
      <span
        className="absolute right-0 top-0 z-[1] flex h-10 min-w-[1.85rem] items-center justify-center px-2 text-[0.7rem] font-semibold leading-none tabular-nums text-white"
        style={{
          backgroundColor: VERDICT_COLORS[sim.verdict] ?? VERDICT_COLORS.trung_binh,
        }}
        aria-label={`Điểm phong thủy ${sim.overall_score}/100`}
      >
        {sim.overall_score}
      </span>

      <Link
        href={href}
        className="block pr-8 font-display text-[1.8rem] leading-tight tracking-wide text-ink tabular-nums hover:text-lacquer md:text-[1.65rem]"
      >
        {sim.phone_display}
      </Link>

      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[0.65rem]">
        <span className="border border-fog px-1.5 py-0.5 text-muted">
          {NETWORK_LABELS[sim.network] ?? sim.network}
        </span>
        {tag ? (
          <span
            className="px-1.5 py-0.5 font-medium text-white"
            style={{ backgroundColor: '#7A1F1F' }}
          >
            {tag}
          </span>
        ) : null}
        <span
          className="px-1.5 py-0.5 font-medium text-white"
          style={{ backgroundColor: el.color }}
        >
          Hành {el.label}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="text-lg font-semibold text-lacquer">
          {formatVnd(sim.price_vnd)}
        </span>
        {discount ? (
          <>
            <span className="text-xs text-muted line-through">
              {formatVnd(sim.original_price_vnd!)}
            </span>
            <span className="text-[0.65rem] font-semibold text-[#1B6B3A]">
              -{discount}%
            </span>
          </>
        ) : null}
      </div>

      {discount && sim.sale_ends_at ? (
        <div className="mt-1">
          <SimSaleCountdown endsAt={sim.sale_ends_at} />
        </div>
      ) : null}

      <p className="mt-1 text-[0.7rem] text-muted">
        Phong thủy: <span style={{ color: VERDICT_COLORS[sim.verdict] }}>{verdictLabel(sim.verdict)}</span>
        {' · '}Mệnh {elementLabel(sim.element)} · {sim.nut} nút
      </p>

      {que ? (
        <p className="mt-0.5 text-[0.7rem] text-muted">
          Quẻ dịch:{' '}
          <span className="font-medium" style={{ color: que.rankMeta.color }}>
            {que.hex.unicode} {que.hex.nameFull}
          </span>
          <span className="ml-1 text-[0.62rem]" style={{ color: que.rankMeta.color }}>
            · {que.rankMeta.label}
          </span>
        </p>
      ) : null}

      {matchPercent != null ? (
        <div className="mt-2 flex items-center gap-2 border border-[#1B6B3A]/25 bg-[#1B6B3A]/5 px-2 py-1.5">
          <span className="text-sm font-bold text-[#1B6B3A]">
            Hợp {matchPercent}%
          </span>
          {matchLabel ? (
            <span className="truncate text-[0.65rem] text-muted">{matchLabel}</span>
          ) : null}
        </div>
      ) : null}

      <div className="mt-auto flex gap-2 pt-4">
        <Link
          href={href}
          className="flex-1 border border-lacquer px-3 py-2 text-center text-xs font-medium text-lacquer transition-colors hover:bg-lacquer hover:text-white"
        >
          Luận giải
        </Link>
        {sim.status === 'sold' ? (
          <span className="flex-1 bg-fog px-3 py-2 text-center text-xs font-medium text-muted">
            Đã bán
          </span>
        ) : (
          <SimBuyModal
            simId={sim.id}
            phone={sim.phone}
            phoneDisplay={sim.phone_display}
            priceVnd={sim.price_vnd}
            birthQuery={birthQuery}
            primaryColor={primaryColor}
            zaloUrl={zaloUrl}
          />
        )}
      </div>

      {sim.status === 'reserved' ? (
        <div className="absolute inset-x-0 top-0 bg-[#B08D42] py-0.5 text-center text-[0.62rem] font-medium text-white">
          Đang có khách giữ chỗ — có thể đặt vượt lượt
        </div>
      ) : null}
    </div>
  );
}

export function SimEmptyState({
  note,
  advisorRole = 'trụ trì',
}: {
  note?: string;
  /** Viết thường giữa câu: "thầy" / "trụ trì" */
  advisorRole?: string;
}) {
  return (
    <div className="border border-dashed border-fog bg-mist/40 px-6 py-14 text-center">
      <p className="font-display text-xl text-ink">Chưa tìm thấy sim phù hợp</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">
        {note ??
          `Thử nới bộ lọc, đổi khoảng giá hoặc nhắn Zalo để ${advisorRole} tuyển số theo yêu cầu riêng của bạn.`}
      </p>
    </div>
  );
}
