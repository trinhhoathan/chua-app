'use client';

import { useState } from 'react';
import { checkTrungTang } from '@/lib/fengshui/rules';
import { inputCls, labelCls } from '../FieldStyles';

interface Props {
  primaryColor: string;
}

const KIND_CLASS: Record<string, string> = {
  'Trùng Tang': 'bg-lacquer text-white',
  'Nhập Mộ': 'bg-jade text-white',
  'Thiên Di': 'bg-gilt text-ink',
  'Cần cẩn trọng': 'bg-fog text-ink',
};

export function TrungTang({ primaryColor }: Props) {
  const today = new Date();
  const [birthYear, setBirthYear] = useState(1950);
  const [date, setDate] = useState(today.toISOString().slice(0, 10));
  const [gender, setGender] = useState<'nam' | 'nu'>('nam');
  const [submitted, setSubmitted] = useState(false);

  const [yy, mm, dd] = date.split('-').map((s) => Number(s));
  const report = checkTrungTang({
    birthYear,
    deathDay: dd,
    deathMonth: mm,
    deathYear: yy,
    gender,
  });

  return (
    <div>
      <div className="grid sm:grid-cols-3 gap-4">
        <label className={labelCls()}>
          Năm sinh
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
          Ngày mất
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
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
        Kiểm tra Trùng tang
      </button>

      {submitted ? (
        <div className="mt-8 border-t border-fog pt-6 space-y-4">
          <div className="border border-fog p-4 bg-white">
            <p className="text-sm text-muted">
              Tuổi thọ (tuổi mụ):{' '}
              <span className="text-ink font-medium">
                {report.ageAtDeath}
              </span>
            </p>
            <p className="text-sm text-muted mt-1">
              Ngày mất ÂL: <span className="text-ink">{report.dayLunar}</span>
              , chi ngày: <b>{report.dayChi}</b>
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="border border-fog p-4 bg-white">
              <p className="text-[10px] uppercase tracking-widest text-muted">
                Cung tháng
              </p>
              <p
                className={`mt-2 inline-block px-2 py-1 text-xs ${KIND_CLASS[report.monthCung]}`}
              >
                {report.monthCung}
              </p>
            </div>
            <div className="border border-fog p-4 bg-white">
              <p className="text-[10px] uppercase tracking-widest text-muted">
                Cung ngày
              </p>
              <p
                className={`mt-2 inline-block px-2 py-1 text-xs ${KIND_CLASS[report.dayCung]}`}
              >
                {report.dayCung}
              </p>
            </div>
            <div className="border border-fog p-4 bg-white">
              <p className="text-[10px] uppercase tracking-widest text-muted">
                Cung năm
              </p>
              <p
                className={`mt-2 inline-block px-2 py-1 text-xs ${KIND_CLASS[report.yearCung]}`}
              >
                {report.yearCung}
              </p>
            </div>
          </div>
          <div className="p-4" style={{ backgroundColor: primaryColor }}>
            <p className="text-[10px] uppercase tracking-widest text-white/70">
              Kết luận
            </p>
            <p className="text-white font-display text-2xl mt-1">
              {report.overall}
            </p>
            <p className="text-white/85 text-sm mt-2 leading-relaxed">
              {report.suggestion}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
