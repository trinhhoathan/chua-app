'use client';

import { useMemo, useState } from 'react';
import {
  castByTime,
  castByTwoNumbers,
  type MaiHoaMode,
  type MaiHoaResult,
} from '@/lib/fengshui/mai-hoa-dich-so';
import type { Hexagram } from '@/lib/fengshui/kinh-dich-64';
import { inputCls, labelCls } from '../FieldStyles';

interface Props {
  primaryColor: string;
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function todayParts() {
  const n = new Date();
  return {
    date: `${n.getFullYear()}-${pad2(n.getMonth() + 1)}-${pad2(n.getDate())}`,
    time: `${pad2(n.getHours())}:${pad2(n.getMinutes())}`,
  };
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
            className={`relative h-2 w-full rounded-[0.5px] ${
              changing ? 'bg-amber-800' : 'bg-ink'
            }`}
          />
        ) : (
          <div
            key={i}
            className={`relative flex h-2 w-full gap-1.5 ${
              changing ? '' : ''
            }`}
          >
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

function HexCard({
  title,
  hex,
  primaryColor,
  changingLine,
  footnote,
}: {
  title: string;
  hex: Hexagram;
  primaryColor: string;
  changingLine?: number;
  footnote?: string;
}) {
  return (
    <section className="border border-fog bg-white">
      <div className="px-4 py-3 border-b border-fog flex items-start gap-3">
        <MiniHexBars binary={hex.binary} changingLine={changingLine} />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wide text-muted">
            {title}
          </p>
          <p className="font-display text-xl text-ink mt-0.5">
            <span className="mr-1.5" style={{ color: primaryColor }}>
              {hex.unicode}
            </span>
            {hex.nameFull}
          </p>
          <p className="text-xs text-muted mt-0.5">
            #{hex.number} · {hex.nameHan} · {hex.meaning}
          </p>
          {footnote ? (
            <p className="text-[11px] text-muted mt-1">{footnote}</p>
          ) : null}
        </div>
      </div>
      <div className="px-4 py-4 space-y-3 text-sm leading-relaxed text-ink">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted mb-1">
            Thoán từ
          </p>
          <p>{hex.judgment}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted mb-1">
            Đại tượng
          </p>
          <p>{hex.image}</p>
        </div>
        <p className="text-xs text-muted">{hex.summary}</p>
      </div>
    </section>
  );
}

function ResultView({
  result,
  primaryColor,
}: {
  result: MaiHoaResult;
  primaryColor: string;
}) {
  return (
    <div className="mt-8 space-y-5">
      <div className="border border-fog bg-gradient-to-b from-[#faf6ef] to-white px-4 py-5 sm:px-6">
        <p className="text-[10px] uppercase tracking-wide text-muted">
          Mai Hoa Dịch Số ·{' '}
          {result.mode === 'thoi_gian' ? 'theo thời gian' : 'theo hai số'}
        </p>
        <p className="font-display text-2xl text-ink mt-1">
          {result.primary.unicode} {result.primary.nameFull}
        </p>
        <p className="text-sm text-muted mt-1">
          Hào {result.movingLine} động → {result.secondary.unicode}{' '}
          {result.secondary.nameFull}
        </p>
        {result.question ? (
          <p className="mt-3 text-sm text-ink leading-relaxed">
            <span className="text-muted">Việc hỏi: </span>
            {result.question}
          </p>
        ) : null}
        <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <dt className="text-muted uppercase tracking-wide text-[10px]">
              Dương lịch
            </dt>
            <dd className="text-ink mt-0.5">{result.timeLabel}</dd>
          </div>
          <div>
            <dt className="text-muted uppercase tracking-wide text-[10px]">
              Âm lịch
            </dt>
            <dd className="text-ink mt-0.5">{result.lunarLabel}</dd>
          </div>
          <div>
            <dt className="text-muted uppercase tracking-wide text-[10px]">
              Năm can chi
            </dt>
            <dd className="text-ink mt-0.5">{result.yearCanChi}</dd>
          </div>
          <div>
            <dt className="text-muted uppercase tracking-wide text-[10px]">
              Giờ chi
            </dt>
            <dd className="text-ink mt-0.5">{result.hourLabel}</dd>
          </div>
        </dl>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 border border-fog bg-paper">
            Thượng {result.upperNum} · {result.upper.nameVi}
          </span>
          <span className="px-2 py-1 border border-fog bg-paper">
            Hạ {result.lowerNum} · {result.lower.nameVi}
          </span>
          <span
            className="px-2 py-1 border text-white"
            style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
          >
            Hào động {result.movingLine}
          </span>
        </div>
        <p className="mt-4 text-sm text-ink leading-relaxed">{result.advice}</p>
      </div>

      <section className="border border-fog bg-white px-4 py-4">
        <p className="text-[10px] uppercase tracking-wide text-muted">
          Hào động — lời hào
        </p>
        <p className="font-display text-lg text-ink mt-1">
          Hào {result.movingLine}
        </p>
        <p className="mt-2 text-sm text-ink leading-relaxed">
          {result.changingLineText}
        </p>
      </section>

      <HexCard
        title="Quẻ chủ (bản quẻ)"
        hex={result.primary}
        primaryColor={primaryColor}
        changingLine={result.movingLine}
        footnote={`Thượng ${result.upper.nameVi} · Hạ ${result.lower.nameVi}`}
      />
      <HexCard
        title="Quẻ biến"
        hex={result.secondary}
        primaryColor={primaryColor}
        footnote={`Đổi hào ${result.movingLine} của quẻ chủ`}
      />
      <HexCard
        title="Hỗ quái"
        hex={result.mutual}
        primaryColor={primaryColor}
        footnote="Hào 2·3·4 làm hạ · hào 3·4·5 làm thượng"
      />

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

export function MaiHoaDichSo({ primaryColor }: Props) {
  const t0 = useMemo(() => todayParts(), []);
  const [mode, setMode] = useState<MaiHoaMode>('thoi_gian');
  const [date, setDate] = useState(t0.date);
  const [time, setTime] = useState(t0.time);
  const [upperRaw, setUpperRaw] = useState('');
  const [lowerRaw, setLowerRaw] = useState('');
  const [question, setQuestion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MaiHoaResult | null>(null);

  function parseHourMinute(value: string): number {
    const [hh, mm] = value.split(':').map(Number);
    if (!Number.isFinite(hh)) return new Date().getHours();
    // Dùng phút để chọn đúng canh nếu sát biên; chủ yếu lấy giờ
    void mm;
    return hh;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const [y, m, d] = date.split('-').map(Number);
      if (!y || !m || !d) throw new Error('Ngày không hợp lệ.');
      const hour = parseHourMinute(time);

      if (mode === 'thoi_gian') {
        setResult(
          castByTime({
            solarDay: d,
            solarMonth: m,
            solarYear: y,
            hour,
            question,
          }),
        );
      } else {
        const u = Number(upperRaw);
        const l = Number(lowerRaw);
        if (!Number.isFinite(u) || !Number.isFinite(l) || u < 1 || l < 1) {
          throw new Error('Nhập hai số nguyên dương (ví dụ số nhìn thấy lúc động tâm).');
        }
        setResult(
          castByTwoNumbers({
            upperRaw: u,
            lowerRaw: l,
            hour,
            solarDay: d,
            solarMonth: m,
            solarYear: y,
            question,
          }),
        );
      }
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : 'Không lập được quẻ.');
    }
  }

  function useNow() {
    const t = todayParts();
    setDate(t.date);
    setTime(t.time);
  }

  return (
    <div>
      <p className="text-sm text-muted leading-relaxed max-w-2xl">
        Mai Hoa Dịch Số lập quẻ từ năm–tháng–ngày–giờ âm lịch (hoặc hai số động
        tâm), suy ra thượng quái, hạ quái, hào động, rồi quẻ biến và hỗ quái —
        cùng hệ Kinh Dịch 64 quẻ.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {(
          [
            ['thoi_gian', 'Theo thời gian'],
            ['hai_so', 'Theo hai số'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setMode(id);
              setResult(null);
              setError(null);
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

      <form onSubmit={onSubmit} className="mt-5 space-y-4 max-w-xl">
        {mode === 'hai_so' ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls()} htmlFor="mh-upper">
                Số thượng (động tâm)
              </label>
              <input
                id="mh-upper"
                type="number"
                min={1}
                inputMode="numeric"
                className={inputCls}
                value={upperRaw}
                onChange={(e) => setUpperRaw(e.target.value)}
                placeholder="VD: 7"
                required
              />
            </div>
            <div>
              <label className={labelCls()} htmlFor="mh-lower">
                Số hạ (động tâm)
              </label>
              <input
                id="mh-lower"
                type="number"
                min={1}
                inputMode="numeric"
                className={inputCls}
                value={lowerRaw}
                onChange={(e) => setLowerRaw(e.target.value)}
                placeholder="VD: 13"
                required
              />
            </div>
          </div>
        ) : null}

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls()} htmlFor="mh-date">
              Ngày động tâm (dương lịch)
            </label>
            <input
              id="mh-date"
              type="date"
              className={inputCls}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelCls()} htmlFor="mh-time">
              Giờ động tâm
            </label>
            <div className="flex gap-2">
              <input
                id="mh-time"
                type="time"
                className={inputCls}
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={useNow}
                className="shrink-0 px-3 py-2 text-xs border border-fog bg-white text-ink hover:bg-paper"
              >
                Hiện tại
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className={labelCls()} htmlFor="mh-q">
            Việc muốn hỏi (tuỳ chọn)
          </label>
          <textarea
            id="mh-q"
            rows={2}
            className={inputCls}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="VD: Việc giao dịch này có thuận không?"
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
          Lập quẻ Mai Hoa
        </button>
      </form>

      {result ? (
        <ResultView result={result} primaryColor={primaryColor} />
      ) : (
        <div className="mt-8 border border-fog bg-paper/60 px-4 py-4 text-sm text-muted leading-relaxed max-w-2xl space-y-2">
          <p className="text-[10px] uppercase tracking-wide text-muted">
            Cách lập (tóm tắt)
          </p>
          <p>
            <strong className="text-ink font-medium">Theo thời gian:</strong>{' '}
            Thượng = (số chi năm + tháng ÂL + ngày ÂL) ÷ 8; Hạ &amp; hào động =
            cộng thêm số chi giờ, chia 8 và 6 (dư 0 lấy 8 / 6).
          </p>
          <p>
            <strong className="text-ink font-medium">Theo hai số:</strong> Mỗi số
            chia 8 lấy dư làm thượng / hạ; tổng hai số + giờ chia 6 lấy hào
            động.
          </p>
          <p>
            Quẻ đơn: 1 Càn · 2 Đoài · 3 Ly · 4 Chấn · 5 Tốn · 6 Khảm · 7 Cấn · 8
            Khôn.
          </p>
        </div>
      )}
    </div>
  );
}
