'use client';

/**
 * Các khối hiển thị kết quả Bát Cực Linh Số dùng chung
 * cho BoiSim.tsx và BatCucTool.tsx (14 trang).
 */

import {
  STAR_ORDER,
  STARS,
  type DigitMeaning,
  type PairAnalysis,
  type StarId,
} from '@/lib/fengshui/bat-cuc';

export function kindBadge(kind: 'cat' | 'hung') {
  return kind === 'cat' ? (
    <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 bg-emerald-800 text-white">
      Cát
    </span>
  ) : (
    <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 bg-stone-600 text-white">
      Hung
    </span>
  );
}

export function LevelDots({
  level,
  kind,
}: {
  level: number;
  kind: 'cat' | 'hung';
}) {
  return (
    <span
      className="inline-flex gap-0.5 items-center"
      title={`Cường độ ${level}/4`}
    >
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${
            i <= level
              ? kind === 'cat'
                ? 'bg-emerald-700'
                : 'bg-stone-600'
              : 'bg-stone-200'
          }`}
        />
      ))}
    </span>
  );
}

export function EnergyChain({ pairs }: { pairs: PairAnalysis[] }) {
  return (
    <div className="flex flex-wrap items-stretch gap-1.5">
      {pairs.map((p, i) => (
        <div key={`${p.raw}-${i}`} className="flex items-center gap-1.5">
          <div
            className={`px-2.5 py-1.5 border text-center min-w-[4.5rem] ${
              p.star.kind === 'cat'
                ? 'border-emerald-800/30 bg-emerald-50/70'
                : 'border-stone-400/40 bg-stone-100'
            } ${p.isTail ? 'ring-1 ring-offset-1 ring-stone-400/60' : ''}`}
          >
            <p className="font-display text-lg text-ink tabular-nums leading-none">
              {p.raw.length > 2 ? (
                <>
                  {p.raw[0]}
                  <span className="text-muted text-sm">
                    {p.raw.slice(1, -1)}
                  </span>
                  {p.raw[p.raw.length - 1]}
                </>
              ) : (
                p.raw
              )}
            </p>
            <p className="text-[10px] text-ink mt-1 leading-none">
              {p.star.nameVi}
            </p>
            <div className="mt-1 flex justify-center">
              <LevelDots level={p.level} kind={p.star.kind} />
            </div>
          </div>
          {i < pairs.length - 1 ? (
            <span className="text-muted text-xs select-none">›</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function AspectBars({
  aspects,
  primaryColor,
  highlight,
}: {
  aspects: { id: string; label: string; score: number }[];
  primaryColor: string;
  /** phương diện nhấn mạnh của chủ đề — in đậm nhãn */
  highlight?: string[];
}) {
  return (
    <ul className="space-y-2.5">
      {aspects.map((a) => (
        <li key={a.id}>
          <div className="flex justify-between text-xs mb-1">
            <span
              className={
                highlight?.includes(a.id)
                  ? 'text-ink font-semibold'
                  : 'text-ink'
              }
            >
              {a.label}
              {highlight?.includes(a.id) ? ' ★' : ''}
            </span>
            <span className="text-muted tabular-nums">{a.score}/100</span>
          </div>
          <div className="h-2 bg-stone-100 border border-fog">
            <div
              className="h-full"
              style={{
                width: `${a.score}%`,
                backgroundColor: a.score >= 65 ? primaryColor : '#78716c',
                opacity: a.score >= 65 ? 1 : 0.7,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function PairDetail({
  pair,
  primaryColor,
}: {
  pair: PairAnalysis;
  primaryColor: string;
}) {
  const s = pair.star;
  return (
    <details className={`group ${pair.isTail ? 'bg-paper/80' : ''}`}>
      <summary className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="font-display text-lg tabular-nums w-12 shrink-0"
            style={{ color: primaryColor }}
          >
            {pair.raw}
          </span>
          <div className="min-w-0">
            <p className="text-sm text-ink">
              {s.nameVi}{' '}
              <span className="text-muted text-xs">({s.nameHan})</span>
              <span className="ml-2 text-[10px] text-muted">
                {pair.levelLabel} · {pair.dongTinh}
              </span>
              {pair.isTail ? (
                <span className="ml-1.5 text-[10px] uppercase tracking-wide text-stone-500">
                  đuôi
                </span>
              ) : null}
            </p>
            <p className="text-[11px] text-muted leading-snug">{s.tagline}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted tabular-nums">
            {pair.effectiveScore}/100
          </span>
          {kindBadge(s.kind)}
          <span className="text-muted text-xs group-open:rotate-90 transition-transform">
            ›
          </span>
        </div>
      </summary>
      <div className="px-4 pb-4 pt-1 text-sm text-ink space-y-2 border-t border-fog/60">
        <p className="leading-relaxed">{s.meaning}</p>
        {pair.modifierNote ? (
          <p className="leading-relaxed text-[13px] border-l-2 border-stone-400 pl-2.5 text-stone-700">
            {pair.modifierNote}
          </p>
        ) : null}
        <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[13px]">
          <p>
            <span className="text-muted">Tài lộc:</span> {s.taiLoc}
          </p>
          <p>
            <span className="text-muted">Sự nghiệp:</span> {s.suNghiep}
          </p>
          <p>
            <span className="text-muted">Tình cảm:</span> {s.tinhCam}
          </p>
          <p>
            <span className="text-muted">Sức khỏe:</span> {s.sucKhoe}
          </p>
        </div>
      </div>
    </details>
  );
}

export function StarLibrary() {
  return (
    <div className="divide-y divide-fog">
      {STAR_ORDER.map((id: StarId) => {
        const s = STARS[id];
        return (
          <details key={id} className="group">
            <summary className="px-4 py-2.5 flex items-center justify-between gap-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <div>
                <p className="text-sm text-ink font-medium">
                  {s.nameVi}{' '}
                  <span className="text-muted font-normal text-xs">
                    {s.nameHan}
                  </span>
                </p>
                <p className="text-[11px] text-muted">{s.chuVe}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {kindBadge(s.kind)}
                <span className="text-muted text-xs group-open:rotate-90 transition-transform">
                  ›
                </span>
              </div>
            </summary>
            <div className="px-4 pb-4 text-[13px] text-ink space-y-2">
              <p className="leading-relaxed">{s.meaning}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted mb-1">
                    Ưu điểm
                  </p>
                  <ul className="space-y-0.5">
                    {s.uuDiem.map((u) => (
                      <li key={u}>· {u}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted mb-1">
                    Nhược điểm
                  </p>
                  <ul className="space-y-0.5">
                    {s.nhuocDiem.map((n) => (
                      <li key={n}>· {n}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </details>
        );
      })}
    </div>
  );
}

/** Bảng luận từng chữ số — chế độ dãy ngắn (số nhà, phòng, ghế). */
export function DigitMeaningTable({
  meanings,
  primaryColor,
}: {
  meanings: DigitMeaning[];
  primaryColor: string;
}) {
  return (
    <ul className="divide-y divide-fog">
      {meanings.map((m, i) => (
        <li key={`${m.digit}-${i}`} className="px-4 py-3 flex gap-3">
          <span
            className="font-display text-2xl tabular-nums w-8 shrink-0 text-center"
            style={{ color: primaryColor }}
          >
            {m.digit}
          </span>
          <div className="min-w-0">
            <p className="text-sm text-ink">
              {m.quai} · hành {m.elementLabel}
            </p>
            <p className="text-[13px] text-muted leading-relaxed">{m.nature}</p>
            <p className="text-[12px] text-muted/80 leading-relaxed mt-0.5">
              Dân gian: {m.folk}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Ghi chú phương pháp cuối trang. */
export function MethodNote() {
  return (
    <p className="text-[11px] text-muted leading-relaxed border border-fog bg-white px-4 py-3">
      Phương pháp luận theo bộ sách{' '}
      <em>Số Tự Năng Lượng Học — Bát Cực Linh Số</em> (Thẩm Lập Minh): 8 từ
      trường Du Niên Hậu Thiên Bát Quái, biến số 0·5, tổ hợp chế hóa và nguyên
      tắc trọng phần đuôi dãy số. Kết quả mang tính tham khảo trường khí — việc
      hệ trọng nên kết hợp chánh kiến và thỉnh ý tại chùa.
    </p>
  );
}

export const BAT_CUC_TABLE_NOTE =
  'Sinh Khí 14·67·39·28 — Thiên Y 13·68·49·27 — Diên Niên 19·78·34·26 — Phục Vị 11…99 — Họa Hại 17·89·46·23 — Lục Sát 16·47·38·29 — Ngũ Quỷ 18·79·36·24 — Tuyệt Mệnh 12·69·48·37';
