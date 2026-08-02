'use client';

import { useMemo, useState } from 'react';
import {
  CAI_TANG_STEPS,
  getCaiTangStep,
  scanCaiTangMonth,
  todayParts,
  type CaiTangDayCheck,
  type CaiTangStepId,
} from '@/lib/fengshui/cai-tang';
import { VerdictBadge } from '../VerdictBadge';
import { inputCls, labelCls } from '../FieldStyles';
import { AdvisorName, AdvisorText } from '@/components/SitePersonaContext';
import { HeTrongAiPanel } from './HeTrongAiPanel';

interface Props {
  primaryColor: string;
}

const WEEK_HEADERS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const;

function TagList({ items, tone }: { items: string[]; tone: 'good' | 'bad' }) {
  if (!items.length) {
    return <p className="text-xs text-muted">—</p>;
  }
  const cls =
    tone === 'good'
      ? 'border-emerald-800/25 bg-emerald-50 text-emerald-900'
      : 'border-stone-400/40 bg-stone-100 text-stone-700';
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((t, i) => (
        <li
          key={`${t}-${i}`}
          className={`px-2 py-0.5 text-[11px] border leading-relaxed ${cls}`}
        >
          {t}
        </li>
      ))}
    </ul>
  );
}

function DayPanel({
  check,
  stepLabel,
  stepHint,
  primaryColor,
}: {
  check: CaiTangDayCheck;
  stepLabel: string;
  stepHint: string;
  primaryColor: string;
}) {
  return (
    <div className="mt-6 border border-fog bg-white">
      <div className="px-4 py-3 border-b border-fog flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-xl text-ink">
            {check.solarDay}/{check.solarMonth}/{check.solarYear}
          </p>
          <p className="text-sm text-muted mt-0.5">
            {check.weekLabel} · {check.lunarLabel} · {check.dayCanChi}
          </p>
          <p className="text-xs text-muted mt-1">
            {check.daoType} · {check.luckLabel}
            {check.inYi ? ` · Nên ${stepLabel}` : ''}
            {check.inJi ? ` · Kiêng ${stepLabel}` : ''}
          </p>
        </div>
        <VerdictBadge verdict={check.verdict} />
      </div>

      <div className="px-4 py-4">
        <p className="text-sm font-medium text-ink">{check.verdictLabel}</p>
        <p className="text-xs text-muted mt-1 leading-relaxed">
          <AdvisorText text={check.detail} />
        </p>
        <p className="text-xs text-muted mt-2 leading-relaxed">{stepHint}</p>
        {check.xungNote ? (
          <p
            className={`mt-2 text-xs leading-relaxed ${
              check.xungDeceased ? 'text-stone-700' : 'text-muted'
            }`}
          >
            {check.xungNote}
          </p>
        ) : null}
      </div>

      {check.folkWarnings.length > 0 || check.xungDay.length > 0 ? (
        <div className="px-4 py-4 border-t border-fog">
          <p className="text-[10px] uppercase tracking-wide text-muted mb-2">
            Bách kỵ dân gian · xung tuổi trong ngày
          </p>
          <ul className="space-y-1.5">
            {check.folkWarnings.map((f) => (
              <li key={f.key} className="flex items-start gap-2.5">
                <VerdictBadge verdict={f.severity} className="mt-0.5" />
                <p className="text-[11px] text-muted leading-relaxed">
                  <b className="text-ink font-medium">{f.label}:</b> {f.detail}
                </p>
              </li>
            ))}
            {check.xungDay.map((x) => (
              <li key={x.person.label} className="flex items-start gap-2.5">
                <VerdictBadge verdict={x.verdict} className="mt-0.5" />
                <p className="text-[11px] text-muted leading-relaxed">
                  {x.detail}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="px-4 py-4 border-t border-fog">
        <p className="text-[10px] uppercase tracking-wide text-muted mb-2">
          Giờ hoàng đạo trong ngày (đã lọc giờ xung tuổi)
        </p>
        {check.goodHours.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {check.goodHours.map((h) => (
              <li
                key={`${h.chi}-${h.range}`}
                className="px-2.5 py-1 text-[11px] border border-emerald-800/25 bg-emerald-50 text-emerald-900"
              >
                Giờ {h.ganZhi} · {h.range} · {h.tianShen}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted">
            Không còn giờ hoàng đạo thuận trong ngày này.
          </p>
        )}
      </div>

      <div className="px-4 py-4 border-t border-fog grid sm:grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted mb-1.5">
            Nên làm trong ngày
          </p>
          <TagList items={check.yi} tone="good" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted mb-1.5">
            Kiêng trong ngày
          </p>
          <TagList items={check.ji} tone="bad" />
        </div>
      </div>

      <p
        className="px-4 py-3 border-t border-fog text-[11px]"
        style={{ color: primaryColor }}
      >
        Cải táng / bốc mộ là việc hệ trọng — nên tham vấn <AdvisorName /> trước
        khi ấn định ngày.
      </p>
    </div>
  );
}

export function CaiTang({ primaryColor }: Props) {
  const t = todayParts();
  const [stepId, setStepId] = useState<CaiTangStepId>('tong_quat');
  const [year, setYear] = useState(t.y);
  const [month, setMonth] = useState(t.m);
  const [selected, setSelected] = useState({ y: t.y, m: t.m, d: t.d });
  const [deceasedYear, setDeceasedYear] = useState<string>('');
  const [eldestSonYear, setEldestSonYear] = useState<string>('');

  const deceasedBirthYear = (() => {
    const n = Number(deceasedYear);
    return deceasedYear && n >= 1900 && n <= 2100 ? n : null;
  })();
  const eldestSonBirthYear = (() => {
    const n = Number(eldestSonYear);
    return eldestSonYear && n >= 1900 && n <= 2100 ? n : null;
  })();

  const step = getCaiTangStep(stepId);

  const { cells, goodDays, badDays } = useMemo(
    () =>
      scanCaiTangMonth(
        year,
        month,
        stepId,
        deceasedBirthYear,
        eldestSonBirthYear,
      ),
    [year, month, stepId, deceasedBirthYear, eldestSonBirthYear],
  );

  const selectedCheck = useMemo(() => {
    const cell = cells.find(
      (c) =>
        c.inMonth &&
        c.solarYear === selected.y &&
        c.solarMonth === selected.m &&
        c.solarDay === selected.d,
    );
    return cell?.check ?? null;
  }, [cells, selected]);

  function shiftMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    setYear(y);
    setMonth(m);
  }

  function selectCell(y: number, m: number, d: number, inMonth: boolean) {
    setSelected({ y, m, d });
    if (!inMonth) {
      setYear(y);
      setMonth(m);
    }
  }

  return (
    <div>
      <p className="text-sm text-muted leading-relaxed mb-4">
        Chọn bước nghi lễ và xem ngày nên · kiêng theo nhật lịch. Thường kết hợp
        Phá thổ / Khởi khoan (bốc) rồi An táng lại — hỏi <AdvisorName /> về
        khoa lễ cầu siêu.
      </p>

      <div className="mb-4">
        <p className="text-xs tracking-wide uppercase text-muted mb-2">
          Việc cần xem
        </p>
        <div className="flex flex-wrap gap-1.5">
          {CAI_TANG_STEPS.map((s) => {
            const active = s.id === stepId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setStepId(s.id)}
                className={`px-2.5 py-1 text-xs border transition-colors ${
                  active
                    ? 'border-ink/30 text-white'
                    : 'border-fog bg-white text-ink hover:border-ink/25'
                }`}
                style={active ? { backgroundColor: primaryColor } : undefined}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted leading-relaxed">{step.hint}</p>
      </div>

      <div className="mb-4 grid sm:grid-cols-2 gap-4">
        <label className={labelCls()}>
          Năm sinh người mất (tuỳ chọn)
          <input
            type="number"
            min={1900}
            max={2100}
            value={deceasedYear}
            onChange={(e) => setDeceasedYear(e.target.value)}
            placeholder="vd. 1945"
            className={`mt-1 ${inputCls}`}
          />
          <span className="mt-1 block text-[11px] text-muted font-normal">
            Kiểm tra năm và NGÀY cải táng có xung tuổi người mất không.
          </span>
        </label>
        <label className={labelCls()}>
          Năm sinh trưởng nam (tuỳ chọn)
          <input
            type="number"
            min={1900}
            max={2100}
            value={eldestSonYear}
            onChange={(e) => setEldestSonYear(e.target.value)}
            placeholder="vd. 1970"
            className={`mt-1 ${inputCls}`}
          />
          <span className="mt-1 block text-[11px] text-muted font-normal">
            Lọc ngày giờ không xung tuổi trưởng nam (người chủ lễ).
          </span>
        </label>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="px-3 py-1.5 text-xs border border-fog text-ink hover:border-ink/30"
        >
          ← Tháng trước
        </button>
        <p className="font-display text-lg text-ink tabular-nums">
          Tháng {month}/{year}
        </p>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="px-3 py-1.5 text-xs border border-fog text-ink hover:border-ink/30"
        >
          Tháng sau →
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block size-2 rounded-full"
            style={{ backgroundColor: primaryColor }}
          />
          Nên
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block size-2 rounded-full bg-stone-400" />
          Kiêng
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block size-2 rounded-full bg-stone-200" />
          Không nêu rõ
        </span>
        <button
          type="button"
          onClick={() => {
            setYear(t.y);
            setMonth(t.m);
            setSelected({ y: t.y, m: t.m, d: t.d });
          }}
          className="ml-auto text-xs underline-offset-2 hover:underline"
          style={{ color: primaryColor }}
        >
          Về hôm nay
        </button>
      </div>

      <p className="mt-2 text-xs text-muted">
        Tháng này:{' '}
        <span className="text-ink">{goodDays.length} ngày nên</span>
        {' · '}
        <span className="text-ink">{badDays.length} ngày kiêng rõ</span>
        {' · “'}
        {step.label}
        {'”'}
      </p>

      <div className="mt-3 border border-fog bg-white">
        <div className="grid grid-cols-7 border-b border-fog">
          {WEEK_HEADERS.map((h) => (
            <div
              key={h}
              className={`py-2 text-center text-[11px] tracking-wide ${
                h === 'CN' ? 'text-red-600 font-medium' : 'text-muted'
              }`}
            >
              {h}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((cell, index) => {
            const isSunday = index % 7 === 6;
            const isSelected =
              cell.solarYear === selected.y &&
              cell.solarMonth === selected.m &&
              cell.solarDay === selected.d;
            const isToday =
              cell.solarYear === t.y &&
              cell.solarMonth === t.m &&
              cell.solarDay === t.d;
            const check = cell.check;
            const isGood = check?.verdict === 'good';
            const isBad = check?.verdict === 'bad';

            return (
              <button
                key={`${cell.solarYear}-${cell.solarMonth}-${cell.solarDay}`}
                type="button"
                onClick={() =>
                  selectCell(
                    cell.solarYear,
                    cell.solarMonth,
                    cell.solarDay,
                    cell.inMonth,
                  )
                }
                className={`relative min-h-[3.75rem] p-1.5 text-left border-b border-r border-fog transition-colors ${
                  cell.inMonth ? 'bg-white' : 'bg-stone-50/80'
                } ${isSelected ? '' : 'hover:bg-stone-50'}`}
                style={
                  isSelected
                    ? { boxShadow: `inset 0 0 0 2px ${primaryColor}` }
                    : undefined
                }
              >
                <div className="flex items-start justify-between gap-1">
                  <span
                    className={`text-sm tabular-nums leading-none ${
                      !cell.inMonth
                        ? isSunday
                          ? 'text-red-600/40'
                          : 'text-muted/50'
                        : isSunday
                          ? 'text-red-600'
                          : 'text-ink'
                    } ${isToday ? 'font-semibold' : ''}`}
                    style={
                      isToday && cell.inMonth && !isSunday
                        ? { color: primaryColor }
                        : undefined
                    }
                  >
                    {cell.solarDay}
                  </span>
                  {cell.inMonth ? (
                    <span
                      className="mt-0.5 inline-block size-1.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: isGood
                          ? primaryColor
                          : isBad
                            ? '#9CA3AF'
                            : '#E5E7EB',
                      }}
                    />
                  ) : null}
                </div>
                <p
                  className={`mt-1 text-[10px] tabular-nums leading-tight ${
                    cell.inMonth ? 'text-muted' : 'text-muted/40'
                  }`}
                >
                  {cell.lunarDay}
                </p>
                {isGood && cell.inMonth ? (
                  <p
                    className="mt-0.5 text-[9px] leading-tight truncate"
                    style={{ color: primaryColor }}
                  >
                    Nên
                  </p>
                ) : isBad && cell.inMonth ? (
                  <p className="mt-0.5 text-[9px] leading-tight text-stone-500 truncate">
                    Kiêng
                  </p>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {goodDays.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs tracking-wide uppercase text-muted mb-2">
            Ngày nên · {step.label}
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {goodDays.map((d) => {
              const active =
                d.solarDay === selected.d &&
                d.solarMonth === selected.m &&
                d.solarYear === selected.y;
              return (
                <li key={`${d.solarYear}-${d.solarMonth}-${d.solarDay}`}>
                  <button
                    type="button"
                    onClick={() =>
                      setSelected({
                        y: d.solarYear,
                        m: d.solarMonth,
                        d: d.solarDay,
                      })
                    }
                    className={`px-2.5 py-1 text-xs border tabular-nums ${
                      active
                        ? 'text-white border-ink/30'
                        : 'bg-white border-fog text-ink hover:border-ink/25'
                    }`}
                    style={
                      active ? { backgroundColor: primaryColor } : undefined
                    }
                  >
                    {d.solarDay}/{d.solarMonth}
                    <span className="ml-1 opacity-80">{d.dayCanChi}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {selectedCheck ? (
        <>
          <DayPanel
            check={selectedCheck}
            stepLabel={step.label}
            stepHint={step.hint}
            primaryColor={primaryColor}
          />
          <HeTrongAiPanel
            primaryColor={primaryColor}
            className="mt-4"
            resetKey={`${stepId}-${selected.y}-${selected.m}-${selected.d}-${deceasedBirthYear ?? ''}-${eldestSonBirthYear ?? ''}`}
            payload={{
              topic: 'cai_tang',
              year: selected.y,
              month: selected.m,
              day: selected.d,
              stepId,
              deceasedBirthYear,
              eldestSonBirthYear,
            }}
          />
        </>
      ) : null}

      <p className="mt-5 text-xs text-muted leading-relaxed">
        Tham khảo nhật lịch dân gian (lunar-typescript). Phong tục cải táng /
        cát táng khác nhau theo vùng — luôn xin ý kiến <AdvisorName /> trước
        khi làm lễ.
      </p>
    </div>
  );
}
