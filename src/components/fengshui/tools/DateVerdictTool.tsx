'use client';

import { useState } from 'react';
import {
  checkKimLau,
  checkHoangOc,
  checkTamTai,
  checkXungNam,
  checkHoangDaoDay,
  combineVerdicts,
} from '@/lib/fengshui/rules';
import { VerdictBadge } from '../VerdictBadge';
import { inputCls, labelCls } from '../FieldStyles';

interface Props {
  primaryColor: string;
  actionLabel: string;
  yearRuleset: 'full' | 'basic';
}

export function DateVerdictTool({
  primaryColor,
  actionLabel,
  yearRuleset,
}: Props) {
  const today = new Date();
  const [birthYear, setBirthYear] = useState<number>(1985);
  const [date, setDate] = useState<string>(
    today.toISOString().slice(0, 10),
  );
  const [submitted, setSubmitted] = useState(false);

  const [yy, mm, dd] = date.split('-').map((s) => Number(s));

  const results = [
    ...(yearRuleset === 'full'
      ? [checkKimLau(birthYear, yy), checkHoangOc(birthYear, yy)]
      : []),
    checkTamTai(birthYear, yy),
    checkXungNam(birthYear, yy),
    checkHoangDaoDay(dd, mm, yy),
  ];
  const overall = combineVerdicts(results);

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className={labelCls()}>
          Năm sinh (dương lịch)
          <input
            type="number"
            min={1900}
            max={2100}
            value={birthYear}
            onChange={(e) => setBirthYear(Number(e.target.value))}
            className={`mt-1 ${inputCls}`}
          />
        </label>
        <label className={labelCls()}>
          Ngày dự định
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`mt-1 ${inputCls}`}
          />
        </label>
      </div>
      <button
        onClick={() => setSubmitted(true)}
        className="mt-5 px-5 py-2.5 text-sm text-white"
        style={{ backgroundColor: primaryColor }}
      >
        {actionLabel}
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
            {results.map((r) => (
              <li
                key={r.key}
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
