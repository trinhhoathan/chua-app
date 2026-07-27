'use client';

import { useState } from 'react';
import { checkHuongNha } from '@/lib/fengshui/rules';
import { VerdictBadge } from '../VerdictBadge';
import { inputCls, labelCls } from '../FieldStyles';

interface Props {
  primaryColor: string;
}

export function HuongNha({ primaryColor }: Props) {
  const [birthYear, setBirthYear] = useState<number>(1985);
  const [gender, setGender] = useState<'nam' | 'nu'>('nam');
  const [submitted, setSubmitted] = useState(false);

  const result = checkHuongNha(birthYear, gender);

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
          Giới tính
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as 'nam' | 'nu')}
            className={`mt-1 ${inputCls}`}
          >
            <option value="nam">Nam</option>
            <option value="nu">Nữ</option>
          </select>
        </label>
      </div>
      <button
        onClick={() => setSubmitted(true)}
        className="mt-5 px-5 py-2.5 text-sm text-white"
        style={{ backgroundColor: primaryColor }}
      >
        Tính hướng nhà
      </button>

      {submitted ? (
        <div className="mt-8 border-t border-fog pt-6">
          <div className="border border-fog p-4 bg-white flex items-start gap-4">
            <VerdictBadge verdict={result.verdict} className="mt-0.5" />
            <div>
              <p className="text-sm font-medium text-ink">{result.label}</p>
              <p className="text-xs text-muted mt-1">{result.detail}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
