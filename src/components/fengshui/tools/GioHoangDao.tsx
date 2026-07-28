'use client';

import { useMemo, useState } from 'react';
import {
  dayCanChi,
  formatCanChi,
  formatLunarDate,
  hoursForDayChi,
  solarToLunar,
} from '@/lib/fengshui/lunar';
import { inputCls, labelCls } from '../FieldStyles';

interface Props {
  primaryColor: string;
}

function todayParts() {
  const n = new Date();
  return {
    y: n.getFullYear(),
    m: n.getMonth() + 1,
    d: n.getDate(),
  };
}

export function GioHoangDao({ primaryColor }: Props) {
  const t = todayParts();
  const [day, setDay] = useState(t.d);
  const [month, setMonth] = useState(t.m);
  const [year, setYear] = useState(t.y);

  const info = useMemo(() => {
    const lunar = solarToLunar(day, month, year);
    const dCc = dayCanChi(lunar.jd);
    const slots = hoursForDayChi(dCc.chi);
    return { lunar, dCc, slots };
  }, [day, month, year]);

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

      <div className="mt-6 border border-fog bg-white p-4">
        <p className="text-sm text-ink">
          {day}/{month}/{year} · {formatLunarDate(info.lunar)}
        </p>
        <p className="mt-1 text-xs text-muted">
          Ngày {formatCanChi(info.dCc)} — 6 giờ Hoàng đạo, 6 giờ Hắc đạo
        </p>
      </div>

      <ul className="mt-6 grid sm:grid-cols-2 gap-2">
        {info.slots.map((slot) => (
          <li
            key={slot.chi}
            className={`flex items-center justify-between gap-3 border px-3 py-2.5 text-sm ${
              slot.hoangDao
                ? 'border-ink/20 bg-white'
                : 'border-fog bg-mist/40 text-muted'
            }`}
          >
            <span>
              <span className="font-medium text-ink">{slot.chi}</span>
              <span className="ml-2 text-xs text-muted">{slot.range}</span>
            </span>
            <span
              className="text-[0.65rem] uppercase tracking-wide"
              style={slot.hoangDao ? { color: primaryColor } : undefined}
            >
              {slot.hoangDao ? 'Hoàng đạo' : 'Hắc đạo'}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-xs text-muted leading-relaxed">
        Tham khảo dân gian theo chi ngày. Việc hệ trọng nên hỏi thêm trụ trì /
        thầy trong chùa.
      </p>
    </div>
  );
}
