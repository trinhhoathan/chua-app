'use client';

import { useMemo, useState } from 'react';
import {
  activitiesByCategory,
  getActivity,
  scanDungSuMonth,
  todayParts,
  type DayActivityCheck,
  type DungSuActivity,
} from '@/lib/fengshui/lich-dung-su';
import { VerdictBadge } from '../VerdictBadge';
import { AdvisorName, AdvisorText } from '@/components/SitePersonaContext';

interface Props {
  primaryColor: string;
}

const WEEK_HEADERS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const;

const GROUPS = activitiesByCategory();

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
  activity,
  primaryColor,
}: {
  check: DayActivityCheck;
  activity: DungSuActivity;
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
            {check.inYi ? ` · Nên ${activity.label}` : ''}
            {check.inJi ? ` · Kiêng ${activity.label}` : ''}
          </p>
        </div>
        <VerdictBadge verdict={check.verdict} />
      </div>

      <div className="px-4 py-4">
        <p className="text-sm font-medium text-ink">{check.verdictLabel}</p>
        <p className="text-xs text-muted mt-1 leading-relaxed">
          <AdvisorText text={check.detail} />
        </p>
        <p className="text-xs text-muted mt-2 leading-relaxed">{activity.hint}</p>
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
        Việc hệ trọng nên hỏi thêm <AdvisorName fallback="trụ trì / thầy trong chùa" />.
      </p>
    </div>
  );
}

export function LichDungSu({ primaryColor }: Props) {
  const t = todayParts();
  const [activityId, setActivityId] = useState('cau-phuc');
  const [year, setYear] = useState(t.y);
  const [month, setMonth] = useState(t.m);
  const [selected, setSelected] = useState({ y: t.y, m: t.m, d: t.d });

  const activity = getActivity(activityId) ?? GROUPS[0].activities[0];

  const { cells, goodDays, badDays } = useMemo(
    () => scanDungSuMonth(year, month, activity),
    [year, month, activity],
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

  function selectCell(
    y: number,
    m: number,
    d: number,
    inMonth: boolean,
  ) {
    setSelected({ y, m, d });
    if (!inMonth) {
      setYear(y);
      setMonth(m);
    }
  }

  return (
    <div>
      <div className="space-y-4">
        {GROUPS.map((g) => (
          <div key={g.category}>
            <p className="text-xs tracking-wide uppercase text-muted mb-2">
              {g.label}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {g.activities.map((a) => {
                const active = a.id === activity.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setActivityId(a.id)}
                    className={`px-2.5 py-1 text-xs border transition-colors ${
                      active
                        ? 'border-ink/30 text-white'
                        : 'border-fog bg-white text-ink hover:border-ink/25'
                    }`}
                    style={
                      active ? { backgroundColor: primaryColor } : undefined
                    }
                  >
                    {a.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
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
          Nên {activity.label}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block size-2 rounded-full bg-stone-400" />
          Kiêng {activity.label}
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
        {' · việc “'}
        {activity.label}
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
            const isBad = Boolean(check?.inJi);

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
            Ngày nên · {activity.label}
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
                    <span className="ml-1 text-muted opacity-80">
                      {d.dayCanChi}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {selectedCheck ? (
        <DayPanel
          check={selectedCheck}
          activity={activity}
          primaryColor={primaryColor}
        />
      ) : null}

      <p className="mt-5 text-xs text-muted leading-relaxed">
        Dựa trên nhật lịch nên · kiêng (lunar-typescript). Chỉ mang tính tham
        khảo dân gian; việc hệ trọng nên hỏi <AdvisorName />.
      </p>
    </div>
  );
}
