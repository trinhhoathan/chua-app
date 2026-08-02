/**
 * Sơ đồ Dòng Chảy Từ Trường (Energy Flow) — timeline ngang các cặp quái số
 * từ trái qua phải: cát tinh xanh lá / vàng kim, hung tinh đỏ / cam.
 * Cặp đuôi (3 số cuối) được khoanh nổi bật là "giao điểm năng lượng".
 * Server-safe, dùng ở trang chi tiết sim và trang báo cáo.
 */

import type { PairAnalysis } from '@/lib/fengshui/boi-sim';

const KIND_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  dai_cat: { bg: '#1B6B3A', border: '#1B6B3A', text: '#1B6B3A' },
  cat: { bg: '#B08D42', border: '#B08D42', text: '#8a6d2e' },
  hung: { bg: '#C2701E', border: '#C2701E', text: '#a35c14' },
  dai_hung: { bg: '#9b3535', border: '#9b3535', text: '#9b3535' },
};

function colorsOf(p: PairAnalysis) {
  return KIND_COLORS[p.star.rank] ?? KIND_COLORS.cat;
}

export function SimEnergyFlow({
  pairs,
  compact = false,
}: {
  pairs: PairAnalysis[];
  compact?: boolean;
}) {
  if (pairs.length === 0) return null;

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-max items-stretch gap-0">
        {pairs.map((p, i) => {
          const c = colorsOf(p);
          const isCat = p.star.kind === 'cat';
          return (
            <div key={i} className="flex items-center">
              {i > 0 ? (
                <svg
                  viewBox="0 0 22 12"
                  className="mx-0.5 shrink-0"
                  style={{ width: compact ? 16 : 22, height: 12 }}
                  aria-hidden
                >
                  <path
                    d="M0 6h16m0 0-5-4.5M16 6l-5 4.5"
                    stroke="#b6ab94"
                    strokeWidth="1.4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : null}
              <div
                className={`relative flex flex-col items-center border bg-paper text-center ${
                  compact ? 'px-2 py-1.5' : 'px-2.5 py-2'
                }`}
                style={{
                  borderColor: p.isTail ? '#B08D42' : `${c.border}55`,
                  borderWidth: p.isTail ? 2 : 1,
                  boxShadow: p.isTail
                    ? '0 6px 18px -8px rgba(176,141,66,0.55)'
                    : undefined,
                  minWidth: compact ? 64 : 76,
                }}
              >
                {p.isTail ? (
                  <span className="absolute top-1.5 left-1/2 z-10 inline-flex w-max -translate-x-1/2 items-center justify-center whitespace-nowrap bg-[#B08D42] px-[0.28rem] py-[0.12rem] text-[0.48rem] font-bold uppercase leading-none tracking-[0.04em] text-white text-center">
                    Đuôi sim
                  </span>
                ) : null}
                <span
                  className={`font-mono font-bold tabular-nums text-ink ${
                    compact ? 'text-sm' : 'text-base'
                  } ${p.isTail ? 'mt-3' : ''}`}
                >
                  {p.raw}
                </span>
                <span
                  className={`mt-0.5 font-medium leading-tight ${
                    compact ? 'text-[0.58rem]' : 'text-[0.64rem]'
                  }`}
                  style={{ color: c.text }}
                >
                  {p.star.nameVi}
                </span>
                <span
                  className={`mt-1 px-1.5 py-px font-semibold text-white ${
                    compact ? 'text-[0.5rem]' : 'text-[0.55rem]'
                  }`}
                  style={{ backgroundColor: c.bg }}
                >
                  {isCat ? 'Cát' : 'Hung'} · {Math.round(p.effectiveScore)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {!compact ? (
        <p className="mt-2.5 text-[0.68rem] leading-relaxed text-muted">
          Dòng chảy từ trường đọc từ trái qua phải theo dãy số. Cặp có viền vàng là{' '}
          <span className="font-medium text-ink">phần đuôi — giao điểm năng lượng mạnh nhất</span>{' '}
          quyết định 60–70% khí của sim theo sách; hung tinh (đỏ/cam) đứng trước cát tinh
          (xanh/vàng) là thế &ldquo;tiền hung hậu cát&rdquo; — càng về sau càng thuận.
        </p>
      ) : null}
    </div>
  );
}
