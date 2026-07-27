'use client';

import { useState } from 'react';
import { goodYearsForChild } from '@/lib/fengshui/rules';
import { VerdictBadge } from '../VerdictBadge';
import { inputCls, labelCls } from '../FieldStyles';

interface Props {
  primaryColor: string;
}

const CURRENT_YEAR = new Date().getFullYear();

export function SinhCon({ primaryColor }: Props) {
  const [motherYear, setMotherYear] = useState<number>(1995);
  const [fromYear, setFromYear] = useState<number>(CURRENT_YEAR);
  const [submitted, setSubmitted] = useState(false);

  const results = goodYearsForChild(motherYear, fromYear, 6);

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className={labelCls()}>
          Năm sinh của mẹ
          <input
            type="number"
            min={1900}
            max={2100}
            value={motherYear}
            onChange={(e) => setMotherYear(Number(e.target.value))}
            className={`mt-1 ${inputCls}`}
          />
        </label>
        <label className={labelCls()}>
          Từ năm
          <input
            type="number"
            min={1900}
            max={2100}
            value={fromYear}
            onChange={(e) => setFromYear(Number(e.target.value))}
            className={`mt-1 ${inputCls}`}
          />
        </label>
      </div>
      <button
        onClick={() => setSubmitted(true)}
        className="mt-5 px-5 py-2.5 text-sm text-white"
        style={{ backgroundColor: primaryColor }}
      >
        Gợi ý năm sinh con
      </button>

      {submitted ? (
        <div className="mt-8 border-t border-fog pt-6">
          <ul className="grid sm:grid-cols-2 gap-3">
            {results.map((r) => (
              <li
                key={r.year}
                className="border border-fog p-4 bg-white flex items-center justify-between"
              >
                <div>
                  <p className="font-display text-xl text-ink">{r.year}</p>
                  <p className="text-xs text-muted mt-1">{r.note}</p>
                </div>
                <VerdictBadge verdict={r.verdict} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
