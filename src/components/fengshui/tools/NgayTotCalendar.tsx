'use client';

import { useMemo, useState } from 'react';
import {
  getChonNgayActivity,
  scanChonNgayMonth,
  todayParts,
  type ChonNgayActivityId,
  type ChonNgayDayCheck,
  type ChonNgayPerson,
} from '@/lib/fengshui/chon-ngay';
import { VerdictBadge } from '../VerdictBadge';
import { AdvisorName } from '@/components/SitePersonaContext';
import { HeTrongAiPanel } from './HeTrongAiPanel';

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
  primaryColor,
}: {
  check: ChonNgayDayCheck;
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
            {check.weekLabel} · {check.lunarLabel} · ngày {check.dayCanChi}
          </p>
          <p className="text-xs text-muted mt-1">
            {check.daoType} · Trực {check.truc} · Sao {check.xiu} (
            {check.xiuLuck.toLowerCase()})
          </p>
        </div>
        <div className="text-right">
          <VerdictBadge verdict={check.verdict} />
          <p className="mt-1 text-[11px] text-muted tabular-nums">
            Điểm {check.score}/100
          </p>
        </div>
      </div>

      <div className="px-4 py-4">
        <p className="text-sm font-medium text-ink">{check.verdictLabel}</p>
        <p className="text-xs text-muted mt-1 leading-relaxed">
          {check.detail}
        </p>
      </div>

      <div className="px-4 py-4 border-t border-fog">
        <p className="text-[10px] uppercase tracking-wide text-muted mb-2">
          Các tiêu chí đã xét
        </p>
        <ul className="space-y-2">
          {check.criteria.map((c) => (
            <li key={c.key} className="flex items-start gap-3">
              <VerdictBadge verdict={c.verdict} className="mt-0.5" />
              <div>
                <p className="text-xs font-medium text-ink">{c.label}</p>
                <p className="text-[11px] text-muted leading-relaxed">
                  {c.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-4 py-4 border-t border-fog">
        <p className="text-[10px] uppercase tracking-wide text-muted mb-2">
          Giờ hoàng đạo trong ngày{' '}
          {check.goodHours.length > 0 ? '(đã lọc giờ xung tuổi)' : ''}
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
            Không còn giờ hoàng đạo thuận (các giờ tốt đều xung tuổi người
            xem) — cân nhắc chọn ngày khác.
          </p>
        )}
        {check.hours.some((h) => h.luck === 'good' && !h.recommended) ? (
          <p className="mt-2 text-[11px] text-muted leading-relaxed">
            Giờ hoàng đạo nhưng xung tuổi:{' '}
            {check.hours
              .filter((h) => h.luck === 'good' && !h.recommended)
              .map((h) => `${h.chi} (${h.range} — xung ${h.xungPersons.join(', ')})`)
              .join(' · ')}
          </p>
        ) : null}
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
        Việc hệ trọng — nên tham vấn <AdvisorName /> trước khi ấn định ngày
        giờ.
      </p>
    </div>
  );
}

interface Props {
  primaryColor: string;
  activityId: ChonNgayActivityId;
  persons: ChonNgayPerson[];
}

export function NgayTotCalendar({ primaryColor, activityId, persons }: Props) {
  const t = todayParts();
  const [year, setYear] = useState(t.y);
  const [month, setMonth] = useState(t.m);
  const [selected, setSelected] = useState({ y: t.y, m: t.m, d: t.d });

  const activity = getChonNgayActivity(activityId);
  const personsKey = persons.map((p) => `${p.label}:${p.birthYear}`).join('|');

  const { cells, goodDays, badDays } = useMemo(
    () => scanChonNgayMonth(activityId, year, month, persons),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activityId, year, month, personsKey],
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

  return (
    <div>
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
          Ngày tốt
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block size-2 rounded-full bg-stone-400" />
          Nên tránh
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block size-2 rounded-full bg-stone-200" />
          Trung bình
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
        <span className="text-ink">{goodDays.length} ngày tốt</span>
        {' · '}
        <span className="text-ink">{badDays.length} ngày nên tránh</span>
        {' — "'}
        {activity.label}
        {'"'}
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
                onClick={() => {
                  setSelected({
                    y: cell.solarYear,
                    m: cell.solarMonth,
                    d: cell.solarDay,
                  });
                  if (!cell.inMonth) {
                    setYear(cell.solarYear);
                    setMonth(cell.solarMonth);
                  }
                }}
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
                    Tốt
                  </p>
                ) : isBad && cell.inMonth ? (
                  <p className="mt-0.5 text-[9px] leading-tight text-stone-500 truncate">
                    Tránh
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
            Ngày tốt trong tháng (xếp theo điểm)
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
                    <span className="ml-1 opacity-80">
                      {d.dayCanChi} · {d.score}đ
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-xs text-muted leading-relaxed">
          Tháng này không có ngày đạt mức "tốt" cho việc này — thử chuyển
          tháng khác, hoặc chọn ngày "trung bình" có nhiều tiêu chí thuận rồi
          hỏi thêm <AdvisorName />.
        </p>
      )}

      {selectedCheck ? (
        <>
          <DayPanel check={selectedCheck} primaryColor={primaryColor} />
          <HeTrongAiPanel
            primaryColor={primaryColor}
            className="mt-4"
            resetKey={`${activityId}-${selected.y}-${selected.m}-${selected.d}-${personsKey}`}
            payload={{
              topic: 'chon_ngay',
              activityId,
              year: selected.y,
              month: selected.m,
              day: selected.d,
              persons,
            }}
          />
        </>
      ) : null}
    </div>
  );
}
