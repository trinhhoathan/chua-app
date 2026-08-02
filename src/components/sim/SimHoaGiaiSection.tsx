/**
 * Section "Mẹo Hóa Giải Hung Tinh & Ép Hung Phát Cát" + kịch bản ứng dụng
 * thực tế. Server-safe — nhận kết quả từ buildHoaGiai (src/lib/sim/hoa-giai).
 */

import type { HoaGiaiResult } from '@/lib/sim/hoa-giai';

const GOOD = '#1B6B3A';
const WARN = '#C2701E';

export function SimHoaGiaiSection({
  hoaGiai,
  primaryColor,
  compact = false,
}: {
  hoaGiai: HoaGiaiResult;
  primaryColor: string;
  compact?: boolean;
}) {
  const { tips, scenarios, allCatMessage } = hoaGiai;

  return (
    <div>
      {!compact ? (
        <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted">
          Trong phong thủy học thuật, <span className="font-medium text-ink">&ldquo;vô hung thì bất cát&rdquo;</span>{' '}
          — dãy số toàn cát tinh đôi khi thiếu sức bật. Hung tinh giống như ớt cay nêm món ăn:
          biết cách chế hóa, đó lại chính là đòn bẩy giúp chủ nhân bứt phá.
        </p>
      ) : null}

      {allCatMessage ? (
        <div
          className="mt-4 border-l-2 bg-mist/50 px-4 py-3 text-sm leading-relaxed text-ink/85"
          style={{ borderColor: GOOD }}
        >
          {allCatMessage}
        </div>
      ) : (
        <div className={`mt-4 grid gap-4 ${tips.length > 1 && !compact ? 'lg:grid-cols-2' : ''}`}>
          {tips.map((tip) => (
            <div key={tip.starId} className="border border-fog bg-paper p-5">
              <p className="font-display text-lg leading-snug text-ink">{tip.title}</p>
              <p className="mt-0.5 text-[0.72rem] font-medium" style={{ color: primaryColor }}>
                {tip.subtitle}
              </p>

              <dl className="mt-3.5 space-y-3 text-sm leading-relaxed">
                <div>
                  <dt className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
                    Bản chất hung tinh
                  </dt>
                  <dd className="mt-0.5 text-ink/80">{tip.banChat}</dd>
                </div>
                {tip.cheHoa ? (
                  <div
                    className="border-l-2 bg-mist/50 px-3 py-2.5"
                    style={{ borderColor: tip.cheHoaStrong ? GOOD : WARN }}
                  >
                    <dt
                      className="text-[0.65rem] font-semibold uppercase tracking-wider"
                      style={{ color: tip.cheHoaStrong ? GOOD : WARN }}
                    >
                      {tip.cheHoaStrong
                        ? 'Cơ chế tự hóa giải của chính dãy số'
                        : 'Thế cục chung của dãy số'}
                    </dt>
                    <dd className="mt-0.5 text-ink/85">{tip.cheHoa}</dd>
                  </div>
                ) : null}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
                      Tâm pháp
                    </dt>
                    <dd className="mt-0.5 text-[0.8rem] text-ink/80">{tip.tamPhap}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
                      Thực hành
                    </dt>
                    <dd className="mt-0.5 text-[0.8rem] text-ink/80">{tip.thucHanh}</dd>
                  </div>
                </div>
              </dl>
            </div>
          ))}
        </div>
      )}

      {/* Kịch bản ứng dụng thực tế */}
      <div className="mt-5">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted">
          Sim này phát huy tác dụng tốt nhất khi nào?
        </p>
        <div className={`mt-2.5 grid gap-2.5 ${compact ? '' : 'sm:grid-cols-2'}`}>
          {scenarios.map((sc, i) => (
            <div key={i} className="flex gap-2.5 border border-fog bg-paper px-3.5 py-3">
              <span
                className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center text-[0.62rem] font-bold text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {i + 1}
              </span>
              <div>
                <p className="text-[0.82rem] font-semibold text-ink">{sc.title}</p>
                <p className="mt-0.5 text-[0.75rem] leading-relaxed text-ink/70">{sc.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
