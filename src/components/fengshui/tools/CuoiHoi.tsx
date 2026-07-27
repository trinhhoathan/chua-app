'use client';

import { useState } from 'react';
import {
  checkTuoiCuoi,
  checkKimLau,
  checkTamTai,
  combineVerdicts,
} from '@/lib/fengshui/rules';
import { VerdictBadge } from '../VerdictBadge';
import { inputCls, labelCls } from '../FieldStyles';

interface Props {
  primaryColor: string;
}

const CURRENT_YEAR = new Date().getFullYear();

export function CuoiHoi({ primaryColor }: Props) {
  const [brideYear, setBrideYear] = useState<number>(1995);
  const [groomYear, setGroomYear] = useState<number>(1993);
  const [targetYear, setTargetYear] = useState<number>(CURRENT_YEAR);
  const [submitted, setSubmitted] = useState(false);

  const results = [
    checkTuoiCuoi(brideYear, groomYear),
    { ...checkKimLau(brideYear, targetYear), label: 'Kim Lâu — cô dâu' },
    { ...checkKimLau(groomYear, targetYear), label: 'Kim Lâu — chú rể' },
    { ...checkTamTai(brideYear, targetYear), label: 'Tam Tai — cô dâu' },
    { ...checkTamTai(groomYear, targetYear), label: 'Tam Tai — chú rể' },
  ];
  const overall = combineVerdicts(results);

  return (
    <div>
      <div className="grid sm:grid-cols-3 gap-4">
        <label className={labelCls()}>
          Năm sinh cô dâu
          <input
            type="number"
            min={1900}
            max={2100}
            value={brideYear}
            onChange={(e) => setBrideYear(Number(e.target.value))}
            className={`mt-1 ${inputCls}`}
          />
        </label>
        <label className={labelCls()}>
          Năm sinh chú rể
          <input
            type="number"
            min={1900}
            max={2100}
            value={groomYear}
            onChange={(e) => setGroomYear(Number(e.target.value))}
            className={`mt-1 ${inputCls}`}
          />
        </label>
        <label className={labelCls()}>
          Năm dự định cưới
          <input
            type="number"
            min={1900}
            max={2100}
            value={targetYear}
            onChange={(e) => setTargetYear(Number(e.target.value))}
            className={`mt-1 ${inputCls}`}
          />
        </label>
      </div>
      <button
        onClick={() => setSubmitted(true)}
        className="mt-5 px-5 py-2.5 text-sm text-white"
        style={{ backgroundColor: primaryColor }}
      >
        Xem tuổi cưới
      </button>

      {submitted ? (
        <div className="mt-8 border-t border-fog pt-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs text-muted uppercase tracking-widest">
              Tổng quan
            </span>
            <VerdictBadge verdict={overall} />
          </div>
          <ul className="space-y-3">
            {results.map((r, idx) => (
              <li
                key={`${r.key}-${idx}`}
                className="border border-fog p-4 bg-white flex items-start gap-4"
              >
                <VerdictBadge verdict={r.verdict} className="mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-ink">{r.label}</p>
                  <p className="text-xs text-muted mt-1">{r.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
