/**
 * Section "Quẻ Kinh Dịch của sim" — trang chi tiết sim (server-safe).
 * Trình bày trực quan: sơ đồ cách lập quẻ Mai Hoa Dịch Số từ dãy số,
 * hình quẻ 6 hào (đánh dấu hào động), bộ ba quẻ chủ → hỗ → biến,
 * luận giải quẻ cho người dùng sim và khối giới thiệu cho khách mới.
 */

import {
  analyzeSimKinhDich,
  QUE_RANK_META,
  TRIGRAM_UNICODE,
  type SimKinhDichResult,
} from '@/lib/fengshui/sim-kinh-dich';
import { TRIGRAMS } from '@/lib/fengshui/kinh-dich-64';
import type { Hexagram } from '@/lib/fengshui/kinh-dich-64';

const UPPER_COLOR = '#7A1F1F'; // nhóm số đầu / thượng quái
const LOWER_COLOR = '#B08D42'; // nhóm số cuối / hạ quái
const MOVING_COLOR = '#C2701E'; // hào động

/* ------------------------------------------------------------------ */
/* Hình quẻ 6 hào (vạch liền = dương, vạch đứt = âm), vẽ từ trên xuống  */
/* ------------------------------------------------------------------ */

export function HexagramFigure({
  hex,
  movingLine,
  size = 'md',
}: {
  hex: Hexagram;
  /** 1–6 từ dưới lên */
  movingLine?: number;
  size?: 'md' | 'sm';
}) {
  const barW = size === 'md' ? 68 : 52;
  const barH = size === 'md' ? 8 : 6;
  const gap = size === 'md' ? 7 : 5;
  const bits = hex.binary.split('').map(Number); // index 0 = hào 1 (dưới cùng)

  return (
    <div
      className="relative inline-flex flex-col-reverse items-center overflow-visible"
      style={{ width: barW, rowGap: gap }}
      aria-label={`Quẻ ${hex.nameFull}`}
    >
      {bits.map((bit, i) => {
        const lineNo = i + 1;
        const isMoving = movingLine === lineNo;
        const color = i < 3 ? LOWER_COLOR : UPPER_COLOR;
        return (
          <div key={i} className="relative flex justify-center" style={{ width: barW }}>
            <div className="flex" style={{ columnGap: barH }}>
              {bit === 1 ? (
                <span style={{ width: barW, height: barH, backgroundColor: color }} />
              ) : (
                <>
                  <span style={{ width: (barW - barH) / 2, height: barH, backgroundColor: color }} />
                  <span style={{ width: (barW - barH) / 2, height: barH, backgroundColor: color }} />
                </>
              )}
            </div>
            {isMoving ? (
              <span
                className="absolute top-1/2 left-full ml-1.5 flex -translate-y-1/2 items-center gap-0.5 whitespace-nowrap text-[0.55rem] font-semibold"
                style={{ color: MOVING_COLOR }}
                title={`Hào ${lineNo} động`}
              >
                <span
                  className="inline-block h-1.5 w-1.5 shrink-0 animate-pulse rounded-full"
                  style={{ backgroundColor: MOVING_COLOR }}
                />
                động
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sơ đồ cách tính: nhóm số → tổng → ÷8 → quái                          */
/* ------------------------------------------------------------------ */

function CalcRow({
  label,
  digits,
  sum,
  num,
  trigramId,
  color,
}: {
  label: string;
  digits: number[];
  sum: number;
  num: number;
  trigramId: keyof typeof TRIGRAMS;
  color: string;
}) {
  const t = TRIGRAMS[trigramId];
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="w-24 shrink-0 text-[0.68rem] uppercase tracking-wider text-muted">
        {label}
      </span>
      <span className="flex gap-1">
        {digits.map((d, i) => (
          <span
            key={i}
            className="grid h-7 w-6 place-items-center text-sm font-semibold text-white tabular-nums"
            style={{ backgroundColor: color }}
          >
            {d}
          </span>
        ))}
      </span>
      <span className="text-muted">→</span>
      <span className="text-sm text-ink">
        tổng <span className="font-semibold tabular-nums">{sum}</span>
      </span>
      <span className="text-muted">→</span>
      <span className="text-sm text-ink">
        ÷ 8 dư <span className="font-semibold tabular-nums">{num}</span>
      </span>
      <span className="text-muted">→</span>
      <span
        className="flex items-center gap-1.5 border px-2 py-1 text-sm font-medium"
        style={{ borderColor: `${color}55`, color }}
      >
        <span className="text-lg leading-none">{TRIGRAM_UNICODE[trigramId]}</span>
        {t.nameVi} ({t.element})
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Thẻ 1 quẻ trong bộ ba chủ → hỗ → biến                                */
/* ------------------------------------------------------------------ */

function TrioCard({
  title,
  subtitle,
  hex,
  movingLine,
  highlight,
}: {
  title: string;
  subtitle: string;
  hex: Hexagram;
  movingLine?: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center overflow-visible border bg-paper px-4 py-4 text-center ${
        highlight ? 'border-ink/30 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.4)]' : 'border-fog'
      }`}
    >
      <p className="text-[0.62rem] uppercase tracking-[0.2em] text-muted">{title}</p>
      <div className="relative mt-2.5 overflow-visible">
        <HexagramFigure hex={hex} movingLine={movingLine} size={highlight ? 'md' : 'sm'} />
      </div>
      <p className="mt-2.5 font-display text-base leading-snug text-ink">
        {hex.unicode} {hex.nameFull}
      </p>
      <p className="mt-0.5 text-[0.68rem] leading-relaxed text-muted">{subtitle}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section chính                                                       */
/* ------------------------------------------------------------------ */

export function SimKinhDichSection({
  phone,
  primaryColor,
}: {
  phone: string;
  primaryColor: string;
}) {
  const r: SimKinhDichResult | null = analyzeSimKinhDich(phone);
  if (!r) return null;

  const rank = QUE_RANK_META[r.interpretation.rank];
  const interp = r.interpretation;

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-2xl text-ink">
          Quẻ Kinh Dịch của sim — {r.primary.nameFull}
        </h2>
        <span
          className="px-2 py-0.5 text-[0.7rem] font-semibold"
          style={{ color: rank.color, backgroundColor: rank.bg, border: `1px solid ${rank.color}44` }}
        >
          {rank.label}
        </span>
      </div>
      <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted">
        Lập theo phép <span className="font-medium text-ink">Mai Hoa Dịch Số</span>: mỗi dãy số
        đều quy được về một quẻ trong 64 quẻ Kinh Dịch — dưới đây là cách tính minh bạch từng bước
        cho chính số {r.display}.
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        {/* Cột trái: cách tính + bộ ba quẻ */}
        <div className="space-y-5">
          {/* Sơ đồ cách lập quẻ */}
          <div className="border border-fog bg-paper p-5">
            <p className="text-[0.68rem] uppercase tracking-[0.25em] text-muted">
              Cách lập quẻ từ dãy số
            </p>
            <div className="mt-4 space-y-3.5">
              <CalcRow
                label="Thượng quái"
                digits={r.upperDigits}
                sum={r.upperSum}
                num={r.upperNum}
                trigramId={r.upper.id}
                color={UPPER_COLOR}
              />
              <CalcRow
                label="Hạ quái"
                digits={r.lowerDigits}
                sum={r.lowerSum}
                num={r.lowerNum}
                trigramId={r.lower.id}
                color={LOWER_COLOR}
              />
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-fog pt-3.5">
                <span className="w-24 shrink-0 text-[0.68rem] uppercase tracking-wider text-muted">
                  Hào động
                </span>
                <span className="text-sm text-ink">
                  tổng cả dãy <span className="font-semibold tabular-nums">{r.totalSum}</span>
                </span>
                <span className="text-muted">→</span>
                <span className="text-sm text-ink">
                  ÷ 6 dư <span className="font-semibold tabular-nums">{r.movingLine}</span>
                </span>
                <span className="text-muted">→</span>
                <span
                  className="border px-2 py-1 text-sm font-medium"
                  style={{ borderColor: `${MOVING_COLOR}55`, color: MOVING_COLOR }}
                >
                  hào {r.movingLine} động (đếm từ dưới lên)
                </span>
              </div>
            </div>
            <p className="mt-3.5 text-[0.68rem] leading-relaxed text-muted">
              Số dư tra theo Tiên thiên bát quái: 1 Càn ☰ · 2 Đoài ☱ · 3 Ly ☲ · 4 Chấn ☳ · 5 Tốn ☴
              · 6 Khảm ☵ · 7 Cấn ☶ · 8 Khôn ☷ (dư 0 tính là 8). Ghép Thượng quái trên, Hạ quái dưới
              thành quẻ kép.
            </p>
          </div>

          {/* Bộ ba quẻ chủ → hỗ → biến */}
          <div>
            <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-3">
              <TrioCard
                title="Quẻ chủ · Hiện tại"
                subtitle={r.primary.meaning}
                hex={r.primary}
                movingLine={r.movingLine}
                highlight
              />
              <TrioCard
                title="Hỗ quái · Diễn biến"
                subtitle={r.mutual.meaning}
                hex={r.mutual}
              />
              <TrioCard
                title="Quẻ biến · Kết cục"
                subtitle={r.secondary.meaning}
                hex={r.secondary}
              />
            </div>
            <p className="mt-2 text-[0.68rem] leading-relaxed text-muted">
              Quẻ chủ nói lên cục diện hiện tại của dãy số; hỗ quái (ghép hào 2·3·4 và 3·4·5) cho
              thấy diễn biến ở chặng giữa; hào {r.movingLine} động chuyển quẻ chủ thành quẻ biến —
              xu hướng về sau khi dùng sim lâu dài.
            </p>
          </div>

          {/* Hào động */}
          <div
            className="border-l-2 bg-mist/50 px-4 py-3 text-sm leading-relaxed text-ink/85"
            style={{ borderColor: MOVING_COLOR }}
          >
            <span className="font-medium" style={{ color: MOVING_COLOR }}>
              Hào {r.movingLine} động:
            </span>{' '}
            {r.movingLineText}
          </div>
        </div>

        {/* Cột phải: luận giải cho người dùng sim */}
        <div className="space-y-4">
          <div className="border border-fog bg-paper p-5">
            <div className="flex items-start gap-4">
              <span className="font-display text-5xl leading-none text-ink" aria-hidden>
                {r.primary.unicode}
              </span>
              <div>
                <p className="font-display text-xl text-ink">
                  {r.primary.nameFull}{' '}
                  <span className="text-base text-muted">({r.primary.nameHan})</span>
                </p>
                <p className="mt-0.5 text-[0.7rem] text-muted">
                  Quẻ số {r.primary.number}/64 · Thoán từ: {r.primary.judgment}
                </p>
              </div>
            </div>

            <dl className="mt-4 space-y-3.5 text-sm leading-relaxed">
              <div>
                <dt className="text-[0.68rem] font-semibold uppercase tracking-wider" style={{ color: primaryColor }}>
                  Quẻ này nghĩa là gì?
                </dt>
                <dd className="mt-1 text-ink/85">{interp.yNghia}</dd>
              </div>
              <div>
                <dt className="text-[0.68rem] font-semibold uppercase tracking-wider" style={{ color: primaryColor }}>
                  Hợp cho ai · việc gì?
                </dt>
                <dd className="mt-1 text-ink/85">{interp.phuHop}</dd>
              </div>
              <div>
                <dt className="text-[0.68rem] font-semibold uppercase tracking-wider" style={{ color: primaryColor }}>
                  Dùng sim này mang lại gì?
                </dt>
                <dd className="mt-1 text-ink/85">{interp.mangLai}</dd>
              </div>
              <div>
                <dt className="text-[0.68rem] font-semibold uppercase tracking-wider" style={{ color: primaryColor }}>
                  Tác động tới người dùng
                </dt>
                <dd className="mt-1 text-ink/85">{interp.tacDong}</dd>
              </div>
              {interp.luuY ? (
                <div className="border-t border-fog pt-3">
                  <dt className="text-[0.68rem] font-semibold uppercase tracking-wider" style={{ color: MOVING_COLOR }}>
                    Lưu ý
                  </dt>
                  <dd className="mt-1 text-ink/85">{interp.luuY}</dd>
                </div>
              ) : null}
            </dl>
          </div>

          {/* Vận về sau (quẻ biến) */}
          <div className="border border-fog bg-paper p-5">
            <p className="text-[0.68rem] uppercase tracking-[0.25em] text-muted">
              Vận về sau — quẻ biến {r.secondary.nameFull}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink/85">
              {r.secondaryInterpretation.yNghia}
            </p>
            <p className="mt-2 text-[0.72rem] leading-relaxed text-muted">
              Dùng sim lâu dài, trường khí chuyển dần từ{' '}
              <span className="font-medium text-ink">{r.primary.nameVi}</span> sang{' '}
              <span className="font-medium text-ink">{r.secondary.nameVi}</span> —{' '}
              {r.secondaryInterpretation.mangLai}
            </p>
          </div>

          {/* Giới thiệu cho khách mới */}
          <details className="group border border-fog bg-mist/40">
            <summary className="cursor-pointer list-none px-5 py-3.5 text-sm font-medium text-ink">
              <span className="mr-1.5 inline-block transition-transform group-open:rotate-90">›</span>
              Kinh Dịch &amp; Mai Hoa Dịch Số là gì? Vì sao số điện thoại có quẻ?
            </summary>
            <div className="space-y-2.5 border-t border-fog px-5 py-4 text-[0.8rem] leading-relaxed text-ink/75">
              <p>
                <span className="font-medium text-ink">Kinh Dịch</span> là bộ sách cổ hơn 3.000 năm
                của phương Đông, mô tả quy luật biến đổi của vạn vật qua 64 quẻ — mỗi quẻ gồm 6 hào
                (vạch liền là dương, vạch đứt là âm), ghép từ 2 quẻ đơn trong Bát quái: Càn (Trời),
                Đoài (Đầm), Ly (Lửa), Chấn (Sấm), Tốn (Gió), Khảm (Nước), Cấn (Núi), Khôn (Đất).
              </p>
              <p>
                <span className="font-medium text-ink">Mai Hoa Dịch Số</span> là phép lập quẻ do
                Thiệu Khang Tiết — bậc đại nho đời Tống — sáng lập, dựa trên triết lý
                &ldquo;vạn vật hữu số&rdquo;: mọi sự vật đều mang con số, và con số quy chiếu được
                về Bát quái. Bất kỳ dãy số nào cũng lập được quẻ: cộng nửa đầu chia 8 lấy Thượng
                quái, cộng nửa cuối chia 8 lấy Hạ quái, tổng chia 6 tìm hào động.
              </p>
              <p>
                Số điện thoại là dãy số gắn bó với chủ nhân mỗi ngày — theo Mai Hoa, nó mang một
                trường khí riêng ứng với quẻ của nó. Quẻ chủ nói lên hiện trạng, hỗ quái là diễn
                biến, quẻ biến là kết cục — cùng kể trọn &ldquo;câu chuyện vận số&rdquo; của dãy số
                bạn dùng. Luận quẻ mang tính tham khảo trường khí, không thay cho nỗ lực và phúc
                đức của chính mình.
              </p>
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}
