'use client';

import { useState } from 'react';
import {
  dayCanChi,
  formatCanChi,
  formatLunarDate,
  lunarToSolar,
  solarToLunar,
  yearCanChi,
} from '@/lib/fengshui/lunar';
import { inputCls, labelCls } from '../FieldStyles';

interface Props {
  primaryColor: string;
}

type Mode = 'solar_to_lunar' | 'lunar_to_solar';

function todayParts() {
  const n = new Date();
  return {
    y: n.getFullYear(),
    m: n.getMonth() + 1,
    d: n.getDate(),
  };
}

export function DoiAmDuong({ primaryColor }: Props) {
  const t = todayParts();
  const [mode, setMode] = useState<Mode>('solar_to_lunar');
  const [day, setDay] = useState(t.d);
  const [month, setMonth] = useState(t.m);
  const [year, setYear] = useState(t.y);
  const [leap, setLeap] = useState(false);
  const [done, setDone] = useState(false);

  let result: {
    solar: string;
    lunar: string;
    dayCc: string;
    yearCc: string;
  } | null = null;
  let error: string | null = null;

  if (done) {
    try {
      if (mode === 'solar_to_lunar') {
        const lunar = solarToLunar(day, month, year);
        const dCc = dayCanChi(lunar.jd);
        const yCc = yearCanChi(lunar.year);
        result = {
          solar: `${day}/${month}/${year} (DL)`,
          lunar: formatLunarDate(lunar),
          dayCc: formatCanChi(dCc),
          yearCc: formatCanChi(yCc),
        };
      } else {
        const solar = lunarToSolar(day, month, year, leap);
        if (!solar) {
          error = 'Ngày âm lịch không hợp lệ (kiểm tra tháng nhuận).';
        } else {
          const lunar = solarToLunar(solar.day, solar.month, solar.year);
          const dCc = dayCanChi(lunar.jd);
          const yCc = yearCanChi(lunar.year);
          result = {
            solar: `${solar.day}/${solar.month}/${solar.year} (DL)`,
            lunar: formatLunarDate(lunar),
            dayCc: formatCanChi(dCc),
            yearCc: formatCanChi(yCc),
          };
        }
      }
    } catch {
      error = 'Không đổi được ngày — vui lòng kiểm tra lại.';
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        {(
          [
            ['solar_to_lunar', 'Dương → Âm'],
            ['lunar_to_solar', 'Âm → Dương'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setMode(id);
              setDone(false);
            }}
            className={`px-3 py-1.5 text-xs border transition-colors ${
              mode === id
                ? 'text-white border-transparent'
                : 'border-fog text-ink hover:border-ink/30'
            }`}
            style={mode === id ? { backgroundColor: primaryColor } : undefined}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <label className={labelCls()}>
          Ngày
          <input
            type="number"
            min={1}
            max={31}
            value={day}
            onChange={(e) => {
              setDay(Number(e.target.value));
              setDone(false);
            }}
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
            onChange={(e) => {
              setMonth(Number(e.target.value));
              setDone(false);
            }}
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
            onChange={(e) => {
              setYear(Number(e.target.value));
              setDone(false);
            }}
            className={`mt-1 ${inputCls}`}
          />
        </label>
      </div>

      {mode === 'lunar_to_solar' ? (
        <label className={`mt-4 flex items-center gap-2 text-sm text-ink`}>
          <input
            type="checkbox"
            checked={leap}
            onChange={(e) => {
              setLeap(e.target.checked);
              setDone(false);
            }}
          />
          Tháng nhuận
        </label>
      ) : null}

      <button
        type="button"
        onClick={() => setDone(true)}
        className="mt-5 px-5 py-2.5 text-sm text-white"
        style={{ backgroundColor: primaryColor }}
      >
        Đổi ngày
      </button>

      {error ? (
        <p className="mt-6 text-sm text-red-800">{error}</p>
      ) : null}

      {result ? (
        <div className="mt-8 border-t border-fog pt-6 space-y-3">
          <div className="border border-fog bg-white p-4">
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted mb-1">
              Dương lịch
            </p>
            <p className="font-display text-xl text-ink">{result.solar}</p>
          </div>
          <div className="border border-fog bg-white p-4">
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted mb-1">
              Âm lịch
            </p>
            <p className="font-display text-xl text-ink">{result.lunar}</p>
          </div>
          <p className="text-sm text-muted">
            Ngày {result.dayCc} · Năm {result.yearCc}
          </p>
        </div>
      ) : null}
    </div>
  );
}
