'use client';

import { useMemo, useState } from 'react';
import {
  analyzeLucHao,
  castLucHaoRandom,
  LUC_THAN_LABEL,
  QUESTION_OPTIONS,
  type LucHaoResult,
  type QuestionKind,
} from '@/lib/fengshui/luc-hao';
import {
  castLine,
  type LineValue,
} from '@/lib/fengshui/kinh-dich-64';
import { inputCls, labelCls } from '../FieldStyles';

interface Props {
  primaryColor: string;
}

type CastMode = 'auto' | 'tung' | 'manual';

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function todayParts() {
  const n = new Date();
  return {
    date: `${n.getFullYear()}-${pad2(n.getMonth() + 1)}-${pad2(n.getDate())}`,
  };
}

function YangBar({ changing }: { changing?: boolean }) {
  return (
    <div className="relative h-2.5 w-full max-w-[7rem]">
      <div className="absolute inset-0 rounded-[1px] bg-ink" />
      {changing ? (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] text-amber-800">
          ○
        </span>
      ) : null}
    </div>
  );
}

function YinBar({ changing }: { changing?: boolean }) {
  return (
    <div className="relative flex h-2.5 w-full max-w-[7rem] gap-1.5">
      <div className="flex-1 rounded-[1px] bg-ink" />
      <div className="flex-1 rounded-[1px] bg-ink" />
      {changing ? (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] text-amber-800">
          ×
        </span>
      ) : null}
    </div>
  );
}

function ResultView({
  result,
  primaryColor,
}: {
  result: LucHaoResult;
  primaryColor: string;
}) {
  const rows = [...result.lines].reverse();
  return (
    <div className="mt-8 space-y-5">
      <div className="border border-fog bg-gradient-to-b from-[#faf6ef] to-white px-4 py-5 sm:px-6">
        <p className="text-[10px] uppercase tracking-wide text-muted">
          Lục hào Nạp Giáp · cung {result.palaceName}
        </p>
        <p className="font-display text-2xl text-ink mt-1">
          <span className="mr-1.5" style={{ color: primaryColor }}>
            {result.primary.unicode}
          </span>
          {result.primary.nameFull}
        </p>
        <p className="text-sm text-muted mt-1">
          #{result.primary.number} · {result.generationLabel} · hành cung{' '}
          {result.palaceElementLabel}
          {result.secondary
            ? ` · biến ${result.secondary.unicode} ${result.secondary.nameFull}`
            : ' · không động'}
        </p>
        {result.question ? (
          <p className="mt-3 text-sm text-ink">
            <span className="text-muted">Việc hỏi: </span>
            {result.question}
          </p>
        ) : null}
        <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <dt className="text-[10px] uppercase tracking-wide text-muted">
              Dương lịch
            </dt>
            <dd className="mt-0.5 text-ink">{result.solarLabel}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wide text-muted">
              Âm lịch
            </dt>
            <dd className="mt-0.5 text-ink">{result.lunarLabel}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wide text-muted">
              Nhật · Nguyệt
            </dt>
            <dd className="mt-0.5 text-ink">
              {result.dayCanChi} · {result.monthCanChi}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wide text-muted">
              Không vong
            </dt>
            <dd className="mt-0.5 text-ink">
              {result.kongWang[0]} · {result.kongWang[1]}
            </dd>
          </div>
        </dl>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span
            className="px-2 py-1 text-white"
            style={{ backgroundColor: primaryColor }}
          >
            Thế hào {result.theLine}
          </span>
          <span className="px-2 py-1 border border-fog bg-paper">
            Ứng hào {result.ungLine}
          </span>
          <span className="px-2 py-1 border border-fog bg-paper">
            Dụng thần {result.dungThanLabel}
            {result.dungThanLines.length
              ? ` · hào ${result.dungThanLines.join(', ')}`
              : ' · phục'}
          </span>
        </div>
        <p className="mt-4 text-sm text-ink leading-relaxed">{result.summary}</p>
        <p className="mt-2 text-xs text-muted">{result.dungThanNote}</p>
        {result.phucThan ? (
          <p className="mt-2 text-xs text-ink">
            Phục thần {LUC_THAN_LABEL[result.phucThan.lucThan]} ẩn dưới hào{' '}
            {result.phucThan.line} bản cung ({result.phucThan.chi}).
          </p>
        ) : null}
      </div>

      <section className="border border-fog bg-white overflow-x-auto">
        <div className="px-4 py-3 border-b border-fog">
          <p className="text-[10px] uppercase tracking-wide text-muted">
            Bảng lục hào (từ trên xuống)
          </p>
        </div>
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead>
            <tr className="border-b border-fog text-[10px] uppercase tracking-wide text-muted">
              <th className="px-3 py-2 font-normal">Hào</th>
              <th className="px-3 py-2 font-normal">Hình</th>
              <th className="px-3 py-2 font-normal">Lục thú</th>
              <th className="px-3 py-2 font-normal">Lục thân</th>
              <th className="px-3 py-2 font-normal">Can Chi</th>
              <th className="px-3 py-2 font-normal">Vượng</th>
              <th className="px-3 py-2 font-normal">Ghi chú</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-fog">
            {rows.map((l) => (
              <tr
                key={l.line}
                className={
                  l.isThe
                    ? 'bg-paper/90'
                    : l.isChanging
                      ? 'bg-amber-50/50'
                      : ''
                }
              >
                <td className="px-3 py-2.5 tabular-nums text-ink">
                  {l.line}
                  {l.isThe ? (
                    <span className="ml-1 text-[10px]" style={{ color: primaryColor }}>
                      Thế
                    </span>
                  ) : null}
                  {l.isUng ? (
                    <span className="ml-1 text-[10px] text-muted">Ứng</span>
                  ) : null}
                </td>
                <td className="px-3 py-2.5">
                  {l.isYang ? (
                    <YangBar changing={l.isChanging} />
                  ) : (
                    <YinBar changing={l.isChanging} />
                  )}
                </td>
                <td className="px-3 py-2.5 text-ink">{l.lucThuLabel}</td>
                <td className="px-3 py-2.5 text-ink">{l.lucThanLabel}</td>
                <td className="px-3 py-2.5 text-ink">
                  {l.canChi}
                  <span className="text-muted"> · {l.elementLabel}</span>
                  {l.changed ? (
                    <span className="block text-[11px] text-amber-900 mt-0.5">
                      → {l.changed.canChi} · {l.changed.lucThanLabel}
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-2.5 text-ink">{l.vuongSuyLabel}</td>
                <td className="px-3 py-2.5 text-xs text-muted">
                  {l.isChanging ? 'Động · ' : ''}
                  {l.isKong ? 'Không vong' : l.label}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="grid sm:grid-cols-2 gap-4">
        <section className="border border-fog bg-white px-4 py-4">
          <p className="text-[10px] uppercase tracking-wide text-muted">
            Thoán từ quẻ chủ
          </p>
          <p className="mt-2 text-sm text-ink leading-relaxed">
            {result.primary.judgment}
          </p>
          <p className="mt-3 text-xs text-muted">{result.primary.summary}</p>
        </section>
        <section className="border border-fog bg-white px-4 py-4">
          <p className="text-[10px] uppercase tracking-wide text-muted">
            Đại tượng
          </p>
          <p className="mt-2 text-sm text-ink leading-relaxed">
            {result.primary.image}
          </p>
          {result.secondary ? (
            <p className="mt-3 text-xs text-muted">
              Biến {result.secondary.nameFull}: {result.secondary.summary}
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}

const LINE_CHOICES: { value: LineValue; label: string }[] = [
  { value: 9, label: '9 · Lão dương (động)' },
  { value: 7, label: '7 · Thiếu dương' },
  { value: 8, label: '8 · Thiếu âm' },
  { value: 6, label: '6 · Lão âm (động)' },
];

export function LucHao({ primaryColor }: Props) {
  const t0 = useMemo(() => todayParts(), []);
  const [mode, setMode] = useState<CastMode>('auto');
  const [date, setDate] = useState(t0.date);
  const [kind, setKind] = useState<QuestionKind>('ban_than');
  const [question, setQuestion] = useState('');
  const [manual, setManual] = useState<LineValue[]>([7, 7, 7, 7, 7, 7]);
  const [tossed, setTossed] = useState<LineValue[]>([]);
  const [tossing, setTossing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LucHaoResult | null>(null);

  function parseDate(): { d: number; m: number; y: number } {
    const [y, m, d] = date.split('-').map(Number);
    if (!y || !m || !d) throw new Error('Ngày không hợp lệ.');
    return { d, m, y };
  }

  function finish(lines: LineValue[]) {
    const { d, m, y } = parseDate();
    setResult(
      analyzeLucHao({
        lines,
        solarDay: d,
        solarMonth: m,
        solarYear: y,
        questionKind: kind,
        question,
      }),
    );
  }

  function onAuto(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const { d, m, y } = parseDate();
      setResult(
        castLucHaoRandom({
          solarDay: d,
          solarMonth: m,
          solarYear: y,
          questionKind: kind,
          question,
        }),
      );
      setTossed([]);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : 'Không lập được quẻ.');
    }
  }

  function onManual(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      finish(manual);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : 'Không lập được quẻ.');
    }
  }

  async function tossOne() {
    if (tossed.length >= 6 || tossing) return;
    setTossing(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 280));
    const next = [...tossed, castLine().value];
    setTossed(next);
    setTossing(false);
    if (next.length === 6) {
      try {
        finish(next);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không lập được quẻ.');
      }
    }
  }

  function resetToss() {
    setTossed([]);
    setResult(null);
  }

  return (
    <div>
      <p className="text-sm text-muted leading-relaxed max-w-2xl">
        Lục hào Nạp Giáp (Kinh Phòng) xếp Can Chi, Thế–Ứng, Lục thân và Lục thú
        lên 6 hào để tham khảo cát hung theo việc hỏi. Kết quả mang tính cổ học
        — dùng thận trọng trong môi trường chùa; việc hệ trọng nên thỉnh ý trực
        tiếp.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {(
          [
            ['auto', 'Gieo nhanh'],
            ['tung', 'Tung từng hào'],
            ['manual', 'Chọn tay'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setMode(id);
              setResult(null);
              setError(null);
              if (id !== 'tung') setTossed([]);
            }}
            className={`px-3 py-1.5 text-sm border transition-colors ${
              mode === id
                ? 'text-white border-transparent'
                : 'border-fog bg-white text-ink hover:bg-paper'
            }`}
            style={
              mode === id
                ? { backgroundColor: primaryColor, borderColor: primaryColor }
                : undefined
            }
          >
            {label}
          </button>
        ))}
      </div>

      <form
        onSubmit={mode === 'manual' ? onManual : onAuto}
        className="mt-5 space-y-4 max-w-xl"
      >
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls()} htmlFor="lh-date">
              Ngày gieo (dương lịch)
            </label>
            <input
              id="lh-date"
              type="date"
              className={inputCls}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelCls()} htmlFor="lh-kind">
              Loại việc (dụng thần)
            </label>
            <select
              id="lh-kind"
              className={inputCls}
              value={kind}
              onChange={(e) => setKind(e.target.value as QuestionKind)}
            >
              {QUESTION_OPTIONS.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls()} htmlFor="lh-q">
            Câu hỏi cụ thể (tuỳ chọn)
          </label>
          <textarea
            id="lh-q"
            rows={2}
            className={inputCls}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Một việc — nhất chiêm bất nhị chiêm"
          />
        </div>

        {mode === 'manual' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {manual.map((v, i) => (
              <div key={i}>
                <label className={labelCls()} htmlFor={`lh-l${i}`}>
                  Hào {i + 1} (dưới→trên)
                </label>
                <select
                  id={`lh-l${i}`}
                  className={inputCls}
                  value={v}
                  onChange={(e) => {
                    const next = [...manual];
                    next[i] = Number(e.target.value) as LineValue;
                    setManual(next);
                  }}
                >
                  {LINE_CHOICES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        ) : null}

        {mode === 'tung' ? (
          <div className="border border-fog bg-paper/50 px-4 py-4 space-y-3">
            <p className="text-sm text-ink">
              Đã tung {tossed.length}/6 hào (từ dưới lên).
            </p>
            <div className="flex flex-wrap gap-2">
              {tossed.map((v, i) => (
                <span
                  key={i}
                  className="px-2 py-1 text-xs border border-fog bg-white tabular-nums"
                >
                  Hào {i + 1}: {v}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={tossing || tossed.length >= 6}
                onClick={tossOne}
                className="px-4 py-2 text-sm text-white disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                {tossing
                  ? 'Đang tung…'
                  : tossed.length >= 6
                    ? 'Đủ 6 hào'
                    : `Tung hào ${tossed.length + 1}`}
              </button>
              <button
                type="button"
                onClick={resetToss}
                className="px-4 py-2 text-sm border border-fog bg-white text-ink"
              >
                Làm lại
              </button>
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="text-sm text-red-800 bg-red-50 border border-red-200 px-3 py-2">
            {error}
          </p>
        ) : null}

        {mode !== 'tung' ? (
          <button
            type="submit"
            className="px-5 py-2.5 text-sm text-white"
            style={{ backgroundColor: primaryColor }}
          >
            {mode === 'auto' ? 'Gieo lục hào' : 'Lập bảng lục hào'}
          </button>
        ) : null}
      </form>

      {result ? (
        <ResultView result={result} primaryColor={primaryColor} />
      ) : (
        <div className="mt-8 border border-fog bg-paper/60 px-4 py-4 text-sm text-muted leading-relaxed max-w-2xl space-y-2">
          <p className="text-[10px] uppercase tracking-wide text-muted">
            Gợi ý đọc quẻ
          </p>
          <p>
            <strong className="text-ink font-medium">Thế</strong> là phía mình;{' '}
            <strong className="text-ink font-medium">Ứng</strong> là đối phương /
            hoàn cảnh. Dụng thần theo loại việc; xem vượng suy theo tháng và
            không vong theo ngày.
          </p>
          <p>
            Hào động mang lực biến — nhìn hào biến sinh/khắc hào động để ước
            chiều hướng. Đây là khung nhập môn, chưa thay thế luận sư chuyên
            sâu.
          </p>
        </div>
      )}
    </div>
  );
}
