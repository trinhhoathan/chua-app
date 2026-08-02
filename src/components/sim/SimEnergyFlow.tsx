/**
 * Sơ đồ Dòng Chảy Từ Trường (Energy Flow) — timeline ngang các cặp quái số
 * từ trái qua phải: cát tinh xanh lá / vàng kim, hung tinh đỏ / cam.
 * Cặp đuôi (3 số cuối) được khoanh nổi bật là "giao điểm năng lượng".
 * Server-safe, dùng ở trang chi tiết sim và trang báo cáo.
 *
 * Mobile: cuộn ngang trong khối (không đẩy rộng cả trang — iOS Safari).
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
    <div className="w-full min-w-0 max-w-full">
      {/*
        width:100% + min-w-0 bắt buộc: iOS Safari nếu thiếu sẽ giãn cả document
        theo nội dung min-w-max bên trong thay vì cuộn trong khối.
      */}
      <div className="w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain pb-1 [-webkit-overflow-scrolling:touch]">
        <div className="flex w-max items-stretch gap-0 pr-0.5">
          {pairs.map((p, i) => {
            const c = colorsOf(p);
            const isCat = p.star.kind === 'cat';
            return (
              <div key={i} className="flex items-center">
                {i > 0 ? (
                  <svg
                    viewBox="0 0 22 12"
                    className="mx-0.5 shrink-0"
                    style={{ width: compact ? 14 : 18, height: 12 }}
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
                    compact
                      ? 'min-w-[3.15rem] px-1.5 py-1.5 sm:min-w-[4rem] sm:px-2'
                      : 'min-w-[3.35rem] px-2 py-2 sm:min-w-[4.75rem] sm:px-2.5'
                  }`}
                  style={{
                    borderColor: p.isTail ? '#B08D42' : `${c.border}55`,
                    borderWidth: p.isTail ? 2 : 1,
                    boxShadow: p.isTail
                      ? '0 6px 18px -8px rgba(176,141,66,0.55)'
                      : undefined,
                  }}
                >
                  {p.isTail ? (
                    <span className="mb-0.5 inline-flex max-w-full items-center justify-center bg-[#B08D42] px-[0.22rem] py-[0.1rem] text-[0.45rem] font-bold uppercase leading-none tracking-[0.04em] text-white">
                      Đuôi
                    </span>
                  ) : null}
                  <span
                    className={`font-mono font-bold tabular-nums text-ink ${
                      compact ? 'text-sm' : 'text-base'
                    }`}
                  >
                    {p.raw}
                  </span>
                  <span
                    className={`mt-0.5 max-w-full truncate font-medium leading-tight ${
                      compact ? 'text-[0.55rem]' : 'text-[0.62rem]'
                    }`}
                    style={{ color: c.text }}
                  >
                    {p.star.nameVi}
                  </span>
                  <span
                    className={`mt-1 px-1 py-px font-semibold text-white ${
                      compact ? 'text-[0.48rem]' : 'text-[0.52rem]'
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
      </div>
      {!compact ? (
        <p className="mt-2.5 text-[0.68rem] leading-relaxed text-muted">
          Dòng chảy từ trường đọc từ trái qua phải theo dãy số
          <span className="sm:hidden"> (vuốt ngang để xem hết)</span>. Cặp có viền vàng là{' '}
          <span className="font-medium text-ink">phần đuôi — giao điểm năng lượng mạnh nhất</span>{' '}
          quyết định 60–70% khí của sim theo sách; hung tinh (đỏ/cam) đứng trước cát tinh
          (xanh/vàng) là thế &ldquo;tiền hung hậu cát&rdquo; — càng về sau càng thuận.
        </p>
      ) : (
        <p className="mt-1.5 text-[0.62rem] text-muted sm:hidden">Vuốt ngang để xem hết dòng chảy →</p>
      )}
    </div>
  );
}
