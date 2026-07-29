'use client';

import { useMemo, useState } from 'react';
import {
  getXuatHanh,
  todayParts,
  type TravelPurpose,
} from '@/lib/fengshui/xuat-hanh';
import { VerdictBadge } from '../VerdictBadge';
import { inputCls, labelCls } from '../FieldStyles';

interface Props {
  primaryColor: string;
}

const PURPOSES: { value: TravelPurpose; label: string }[] = [
  { value: 'chung', label: 'Xuất hành chung' },
  { value: 'le_chua', label: 'Đi lễ / vào chùa' },
  { value: 'cong_viec', label: 'Công việc / cầu tài' },
];

function toneClass(tone: 'good' | 'caution' | 'avoid'): string {
  if (tone === 'good') return 'border-emerald-800/20 bg-emerald-50/60';
  if (tone === 'avoid') return 'border-stone-400/35 bg-stone-100';
  return 'border-amber-800/20 bg-amber-50/50';
}

export function XuatHanh({ primaryColor }: Props) {
  const t = todayParts();
  const [day, setDay] = useState(t.d);
  const [month, setMonth] = useState(t.m);
  const [year, setYear] = useState(t.y);
  const [purpose, setPurpose] = useState<TravelPurpose>('chung');

  const result = useMemo(
    () => getXuatHanh(year, month, day, purpose),
    [year, month, day, purpose],
  );

  return (
    <div>
      <div className="grid sm:grid-cols-3 gap-4">
        <label className={labelCls()}>
          Ngày (dương)
          <input
            type="number"
            min={1}
            max={31}
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
            className={`mt-1 ${inputCls}`}
          />
        </label>
        <label className={labelCls()}>
          Tháng
          <input
            type="number"
            min={1}
            max={12}
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className={`mt-1 ${inputCls}`}
          />
        </label>
        <label className={labelCls()}>
          Năm
          <input
            type="number"
            min={1900}
            max={2100}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className={`mt-1 ${inputCls}`}
          />
        </label>
      </div>

      <div className="mt-4">
        <p className={`${labelCls()} mb-2`}>Mục đích</p>
        <div className="flex flex-wrap gap-2">
          {PURPOSES.map((p) => {
            const active = purpose === p.value;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => setPurpose(p.value)}
                className={`px-3 py-1.5 text-xs border transition-colors ${
                  active
                    ? 'border-ink/30 text-white'
                    : 'border-fog bg-white text-ink hover:border-ink/25'
                }`}
                style={active ? { backgroundColor: primaryColor } : undefined}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 border border-fog bg-white">
        <div className="px-4 py-3 border-b border-fog flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-display text-xl text-ink">{result.solarLabel}</p>
            <p className="text-sm text-muted mt-0.5">
              {result.weekLabel} · {result.lunarLabel} · {result.dayCanChi}
            </p>
            <p className="text-xs text-muted mt-1">
              {result.daoType} · {result.luckLabel}
              {result.travelInYi ? ' · Nhật lịch nên xuất hành' : ''}
              {result.travelInJi ? ' · Nhật lịch kiêng xuất hành' : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setYear(t.y);
              setMonth(t.m);
              setDay(t.d);
            }}
            className="text-xs underline-offset-2 hover:underline shrink-0"
            style={{ color: primaryColor }}
          >
            Về hôm nay
          </button>
        </div>

        <div className="px-4 py-4 flex items-start gap-3">
          <VerdictBadge verdict={result.verdict} className="mt-0.5" />
          <div>
            <p className="text-sm font-medium text-ink">{result.verdictLabel}</p>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              {result.verdictDetail}
            </p>
            <p className="text-xs text-muted mt-2 leading-relaxed">
              {result.purposeHint}
            </p>
          </div>
        </div>
      </div>

      <section className="mt-6">
        <p className="text-xs tracking-wide uppercase text-muted mb-2.5">
          Hướng nên ưu tiên
        </p>
        <ul className="grid sm:grid-cols-3 gap-2">
          {result.prefer.map((d) => (
            <li
              key={d.key}
              className={`border px-3 py-3 ${toneClass(d.tone)}`}
            >
              <p className="text-[11px] text-muted">{d.label}</p>
              <p
                className="mt-1 font-display text-lg text-ink"
                style={{ color: primaryColor }}
              >
                {d.direction}
              </p>
              <p className="mt-1.5 text-[11px] text-muted leading-relaxed">
                {d.hint}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <p className="text-xs tracking-wide uppercase text-muted mb-2.5">
          Hướng nên tránh
        </p>
        <ul className="grid sm:grid-cols-2 gap-2">
          {result.avoid.map((d) => (
            <li
              key={d.key}
              className={`border px-3 py-3 ${toneClass(d.tone)}`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[11px] text-muted">{d.label}</p>
                <p className="text-sm font-medium text-ink">{d.direction}</p>
              </div>
              <p className="mt-1 text-[11px] text-muted leading-relaxed">
                {d.hint}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <p className="text-xs tracking-wide uppercase text-muted mb-2.5">
          Tất cả phương vị trong ngày
        </p>
        <div className="border border-fog bg-white divide-y divide-fog">
          {result.positions.map((d) => (
            <div
              key={d.key}
              className="px-3 py-2.5 flex flex-wrap items-baseline justify-between gap-2 text-sm"
            >
              <span className="text-muted text-xs">{d.label}</span>
              <span className="text-ink">{d.direction}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <p className="text-xs tracking-wide uppercase text-muted mb-2.5">
          Giờ Hoàng đạo / nên xuất hành
        </p>
        {result.goodHours.length === 0 ? (
          <p className="text-xs text-muted">Không có giờ Hoàng đạo nổi bật.</p>
        ) : (
          <ul className="grid sm:grid-cols-2 gap-2">
            {result.goodHours.map((h) => (
              <li
                key={`${h.ganZhi}-${h.range}`}
                className="border border-fog bg-white px-3 py-2.5 flex items-center justify-between gap-3 text-sm"
              >
                <span>
                  <span className="font-medium text-ink">{h.chi}</span>
                  <span className="ml-1.5 text-xs text-muted">
                    {h.ganZhi} · {h.range}
                  </span>
                </span>
                <span
                  className="text-[0.65rem] uppercase tracking-wide shrink-0"
                  style={{ color: primaryColor }}
                >
                  {h.recommendsTravel ? 'Nên xuất hành' : h.daoType}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-5 text-xs text-muted leading-relaxed">
        Tham khảo dân gian theo nhật lịch (lunar-typescript). Việc hệ trọng —
        đi xa, khởi sự lớn — nên hỏi thêm trụ trì / thầy trong chùa.
      </p>
    </div>
  );
}
