'use client';

import { useState } from 'react';
import {
  castByNumber,
  castByTrigrams,
  castByWords,
  castRandom,
  RANK_META,
  TRIGRAM_OPTIONS,
  type KhongMinhMode,
  type KhongMinhResult,
} from '@/lib/fengshui/khong-minh-than-toan';
import { inputCls, labelCls } from '../FieldStyles';

interface Props {
  primaryColor: string;
}

function toneClass(
  tone: (typeof RANK_META)[keyof typeof RANK_META]['tone'],
): string {
  if (tone === 'tot') return 'border-emerald-800/30 bg-emerald-50/80 text-emerald-950';
  if (tone === 'kha') return 'border-sky-800/25 bg-sky-50/70 text-sky-950';
  if (tone === 'trung') return 'border-stone-400/40 bg-stone-50 text-ink';
  if (tone === 'yeu') return 'border-amber-800/30 bg-amber-50/80 text-amber-950';
  return 'border-stone-500/40 bg-stone-200/70 text-ink';
}

function MiniHexBars({
  binary,
  changingLine,
}: {
  binary: string;
  changingLine?: number;
}) {
  const bits = binary.split('').map(Number);
  const rows = [...bits].reverse();
  return (
    <div className="w-11 space-y-1 shrink-0" aria-hidden>
      {rows.map((bit, i) => {
        const lineFromBottom = 6 - i;
        const changing = changingLine === lineFromBottom;
        return bit === 1 ? (
          <div
            key={i}
            className={`h-2 w-full rounded-[0.5px] ${
              changing ? 'bg-amber-800' : 'bg-ink'
            }`}
          />
        ) : (
          <div key={i} className="flex h-2 w-full gap-1.5">
            <div
              className={`flex-1 rounded-[0.5px] ${
                changing ? 'bg-amber-800' : 'bg-ink'
              }`}
            />
            <div
              className={`flex-1 rounded-[0.5px] ${
                changing ? 'bg-amber-800' : 'bg-ink'
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}

function ResultView({
  result,
  primaryColor,
}: {
  result: KhongMinhResult;
  primaryColor: string;
}) {
  const tone = RANK_META[result.rank].tone;
  return (
    <div className="mt-8 space-y-5">
      <div className="border border-fog bg-gradient-to-b from-[#faf6ef] to-white px-4 py-5 sm:px-6">
        <p className="text-[10px] uppercase tracking-wide text-muted">
          Khổng Minh thần toán · quẻ {result.id}/384
        </p>
        <div className="mt-2 flex flex-wrap items-start gap-4">
          <MiniHexBars
            binary={result.hex.binary}
            changingLine={result.line}
          />
          <div className="min-w-0 flex-1">
            <p className="font-display text-2xl text-ink">
              <span className="mr-1.5" style={{ color: primaryColor }}>
                {result.hex.unicode}
              </span>
              {result.hex.nameFull}
            </p>
            <p className="text-sm text-muted mt-0.5">
              #{result.hexNumber} · {result.lineName} động → biến{' '}
              {result.secondary.unicode} {result.secondary.nameFull}
            </p>
            <span
              className={`mt-3 inline-block px-2.5 py-1 text-xs border ${toneClass(tone)}`}
            >
              {result.rankLabel}
            </span>
          </div>
        </div>
        {result.question ? (
          <p className="mt-4 text-sm text-ink leading-relaxed">
            <span className="text-muted">Việc hỏi: </span>
            {result.question}
          </p>
        ) : null}
        <p className="mt-3 text-sm text-ink leading-relaxed">{result.omen}</p>
      </div>

      <section className="border border-fog bg-white px-4 py-4 sm:px-5">
        <p className="text-[10px] uppercase tracking-wide text-muted">
          Sấm hào · lời hào động
        </p>
        <p className="font-display text-lg text-ink mt-2 leading-relaxed">
          {result.poem}
        </p>
        <p className="mt-3 text-sm text-muted leading-relaxed">{result.advice}</p>
      </section>

      <div className="grid sm:grid-cols-2 gap-4">
        <section className="border border-fog bg-white px-4 py-4">
          <p className="text-[10px] uppercase tracking-wide text-muted">
            Thoán từ
          </p>
          <p className="mt-2 text-sm text-ink leading-relaxed">
            {result.judgment}
          </p>
        </section>
        <section className="border border-fog bg-white px-4 py-4">
          <p className="text-[10px] uppercase tracking-wide text-muted">
            Đại tượng
          </p>
          <p className="mt-2 text-sm text-ink leading-relaxed">{result.image}</p>
        </section>
      </div>

      <section className="border border-fog bg-white px-4 py-4">
        <p className="text-[10px] uppercase tracking-wide text-muted">
          Tóm tắt quẻ chủ
        </p>
        <p className="mt-2 text-sm text-ink leading-relaxed">{result.summary}</p>
        <p className="mt-2 text-xs text-muted">
          Quẻ biến {result.secondary.nameFull}: {result.secondary.summary}
        </p>
      </section>

      <section className="border border-fog bg-white">
        <div className="px-4 py-3 border-b border-fog">
          <p className="text-[10px] uppercase tracking-wide text-muted">
            Các bước lập quẻ
          </p>
        </div>
        <ol className="divide-y divide-fog">
          {result.steps.map((s, i) => (
            <li key={`${s.label}-${i}`} className="px-4 py-2.5 flex gap-3">
              <span
                className="shrink-0 size-6 flex items-center justify-center text-[11px] text-white tabular-nums"
                style={{ backgroundColor: primaryColor }}
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-ink">{s.label}</p>
                <p className="text-sm text-muted mt-0.5 leading-relaxed">
                  {s.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

const MODES: { id: KhongMinhMode; label: string }[] = [
  { id: 'ba_tu', label: 'Ba từ' },
  { id: 'ngau_nhien', label: 'Ngẫu nhiên' },
  { id: 'so_que', label: 'Số quẻ' },
  { id: 'quai_hao', label: 'Thượng · hạ · hào' },
];

export function KhongMinhThanToan({ primaryColor }: Props) {
  const [mode, setMode] = useState<KhongMinhMode>('ba_tu');
  const [w1, setW1] = useState('');
  const [w2, setW2] = useState('');
  const [w3, setW3] = useState('');
  const [lot, setLot] = useState('');
  const [upperNum, setUpperNum] = useState(1);
  const [lowerNum, setLowerNum] = useState(1);
  const [line, setLine] = useState(1);
  const [question, setQuestion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<KhongMinhResult | null>(null);

  function runCast(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    try {
      if (mode === 'ba_tu') {
        if (!w1.trim() || !w2.trim() || !w3.trim()) {
          throw new Error('Nhập đủ 3 từ động tâm.');
        }
        setResult(castByWords({ w1, w2, w3, question }));
      } else if (mode === 'ngau_nhien') {
        setResult(castRandom(question));
      } else if (mode === 'so_que') {
        const n = Number(lot);
        if (!Number.isFinite(n) || n < 1 || n > 384) {
          throw new Error('Số quẻ phải từ 1 đến 384.');
        }
        setResult(castByNumber({ lot: n, question }));
      } else {
        setResult(
          castByTrigrams({
            upperNum,
            lowerNum,
            line,
            question,
          }),
        );
      }
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : 'Không lập được quẻ.');
    }
  }

  return (
    <div>
      <p className="text-sm text-muted leading-relaxed max-w-2xl">
        Khổng Minh thần toán (Chư Cát thần số) gồm 384 quẻ — mỗi quẻ là một hào
        trong 64 quẻ Kinh Dịch. Thành tâm nghĩ việc hỏi, rồi chọn một cách lập
        số bên dưới. Mỗi việc chỉ nên hỏi một lần.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              setMode(m.id);
              setResult(null);
              setError(null);
            }}
            className={`px-3 py-1.5 text-sm border transition-colors ${
              mode === m.id
                ? 'text-white border-transparent'
                : 'border-fog bg-white text-ink hover:bg-paper'
            }`}
            style={
              mode === m.id
                ? { backgroundColor: primaryColor, borderColor: primaryColor }
                : undefined
            }
          >
            {m.label}
          </button>
        ))}
      </div>

      <form onSubmit={runCast} className="mt-5 space-y-4 max-w-xl">
        {mode === 'ba_tu' ? (
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {(
              [
                ['km-w1', w1, setW1, 'Từ 1'],
                ['km-w2', w2, setW2, 'Từ 2'],
                ['km-w3', w3, setW3, 'Từ 3'],
              ] as const
            ).map(([id, val, set, label]) => (
              <div key={id}>
                <label className={labelCls()} htmlFor={id}>
                  {label}
                </label>
                <input
                  id={id}
                  className={inputCls}
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  placeholder="VD: bình"
                  required
                />
              </div>
            ))}
          </div>
        ) : null}

        {mode === 'so_que' ? (
          <div>
            <label className={labelCls()} htmlFor="km-lot">
              Số quẻ (1–384)
            </label>
            <input
              id="km-lot"
              type="number"
              min={1}
              max={384}
              className={inputCls}
              value={lot}
              onChange={(e) => setLot(e.target.value)}
              placeholder="VD: 79"
              required
            />
          </div>
        ) : null}

        {mode === 'quai_hao' ? (
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls()} htmlFor="km-up">
                Thượng quái
              </label>
              <select
                id="km-up"
                className={inputCls}
                value={upperNum}
                onChange={(e) => setUpperNum(Number(e.target.value))}
              >
                {TRIGRAM_OPTIONS.map((t) => (
                  <option key={t.num} value={t.num}>
                    {t.num}. {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls()} htmlFor="km-lo">
                Hạ quái
              </label>
              <select
                id="km-lo"
                className={inputCls}
                value={lowerNum}
                onChange={(e) => setLowerNum(Number(e.target.value))}
              >
                {TRIGRAM_OPTIONS.map((t) => (
                  <option key={t.num} value={t.num}>
                    {t.num}. {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls()} htmlFor="km-line">
                Hào động
              </label>
              <select
                id="km-line"
                className={inputCls}
                value={line}
                onChange={(e) => setLine(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    Hào {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : null}

        {mode === 'ngau_nhien' ? (
          <p className="text-sm text-muted leading-relaxed">
            Hệ thống chọn ngẫu nhiên 1 trong 384 quẻ. Nên thành tâm nghĩ câu hỏi
            trước khi nhấn gieo.
          </p>
        ) : null}

        <div>
          <label className={labelCls()} htmlFor="km-q">
            Việc muốn hỏi (tuỳ chọn)
          </label>
          <textarea
            id="km-q"
            rows={2}
            className={inputCls}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="VD: Việc cầu công danh năm nay thế nào?"
          />
        </div>

        {error ? (
          <p className="text-sm text-red-800 bg-red-50 border border-red-200 px-3 py-2">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="px-5 py-2.5 text-sm text-white"
          style={{ backgroundColor: primaryColor }}
        >
          {mode === 'ngau_nhien' ? 'Gieo quẻ ngẫu nhiên' : 'Lập quẻ Khổng Minh'}
        </button>
      </form>

      {result ? (
        <ResultView result={result} primaryColor={primaryColor} />
      ) : (
        <div className="mt-8 border border-fog bg-paper/60 px-4 py-4 text-sm text-muted leading-relaxed max-w-2xl space-y-2">
          <p className="text-[10px] uppercase tracking-wide text-muted">
            Cách lập bằng ba từ
          </p>
          <p>
            Đếm chữ cái mỗi từ, lấy hàng đơn vị, ghép thành số ba chữ (trăm ·
            chục · đơn vị). Nếu lớn hơn 384 thì trừ 384 đến khi còn trong
            1–384 — đó là số quẻ.
          </p>
          <p>
            Ví dụ «Kiều Nguyệt Nga»: 4 · 6 · 3 → 463 − 384 ={' '}
            <span className="text-ink">79</span>.
          </p>
          <p>
            Số quẻ ánh xạ sang quẻ Văn Vương và hào động: quẻ = làm tròn lên
            (n÷6), hào = dư của (n−1) chia 6 rồi cộng 1.
          </p>
        </div>
      )}
    </div>
  );
}
