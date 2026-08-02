'use client';

import { useState } from 'react';
import { checkTrungTang, type TrungTangKind } from '@/lib/fengshui/rules';
import { inputCls, labelCls } from '../FieldStyles';
import { AdvisorName } from '@/components/SitePersonaContext';
import { HeTrongAiPanel } from './HeTrongAiPanel';

interface Props {
  primaryColor: string;
}

const KIND_CLASS: Record<TrungTangKind, string> = {
  'Trùng Tang': 'bg-lacquer text-white',
  'Nhập Mộ': 'bg-jade text-white',
  'Thiên Di': 'bg-gilt text-ink',
};

const HOUR_OPTIONS = [
  { value: '', label: 'Không rõ giờ mất' },
  { value: '0', label: 'Tý (23h–1h)' },
  { value: '2', label: 'Sửu (1h–3h)' },
  { value: '4', label: 'Dần (3h–5h)' },
  { value: '6', label: 'Mão (5h–7h)' },
  { value: '8', label: 'Thìn (7h–9h)' },
  { value: '10', label: 'Tỵ (9h–11h)' },
  { value: '12', label: 'Ngọ (11h–13h)' },
  { value: '14', label: 'Mùi (13h–15h)' },
  { value: '16', label: 'Thân (15h–17h)' },
  { value: '18', label: 'Dậu (17h–19h)' },
  { value: '20', label: 'Tuất (19h–21h)' },
  { value: '22', label: 'Hợi (21h–23h)' },
];

export function TrungTang({ primaryColor }: Props) {
  const today = new Date();
  const [birthYear, setBirthYear] = useState(1950);
  const [date, setDate] = useState(today.toISOString().slice(0, 10));
  const [hour, setHour] = useState('');
  const [gender, setGender] = useState<'nam' | 'nu'>('nam');
  const [submitted, setSubmitted] = useState(false);

  const [yy, mm, dd] = date.split('-').map((s) => Number(s));
  const report = checkTrungTang({
    birthYear,
    deathDay: dd,
    deathMonth: mm,
    deathYear: yy,
    deathHour: hour === '' ? null : Number(hour),
    gender,
  });

  return (
    <div>
      <p className="text-sm text-muted leading-relaxed mb-4">
        Tính theo phương pháp đầy đủ 4 bàn: nam khởi cung Dần đếm thuận, nữ
        khởi cung Thân đếm nghịch — lần lượt bàn tuổi → bàn tháng → bàn ngày
        → bàn giờ. Cung Dần · Thân · Tỵ · Hợi là Trùng Tang; Tý · Ngọ · Mão ·
        Dậu là Thiên Di; Thìn · Tuất · Sửu · Mùi là Nhập Mộ (một Nhập Mộ hóa
        giải được Trùng Tang).
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className={labelCls()}>
          Năm sinh (âm lịch)
          <input
            type="number"
            min={1900}
            max={2100}
            value={birthYear}
            onChange={(e) => setBirthYear(Number(e.target.value))}
            className={`mt-1 ${inputCls}`}
          />
          <span className="mt-1 block text-[11px] text-muted font-normal">
            Sinh trước Tết âm tính năm trước.
          </span>
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
        <label className={labelCls()}>
          Ngày mất (dương lịch)
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`mt-1 ${inputCls}`}
          />
        </label>
        <label className={labelCls()}>
          Giờ mất (theo canh giờ)
          <select
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className={`mt-1 ${inputCls}`}
          >
            {HOUR_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-[11px] text-muted font-normal">
            Có giờ mất mới tính được bàn giờ (bàn nặng nhất theo dân gian).
          </span>
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
              Hưởng thọ (tuổi mụ, theo năm âm):{' '}
              <span className="text-ink font-medium">{report.ageAtDeath}</span>
              {' · '}
              {report.gender === 'nam'
                ? 'nam — khởi Dần, đếm thuận'
                : 'nữ — khởi Thân, đếm nghịch'}
            </p>
            <p className="text-sm text-muted mt-1">
              Ngày mất ÂL: <span className="text-ink">{report.dayLunar}</span>
              {' — '}ngày <b>{report.deathDayCanChi}</b>
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {report.bans.map((ban) => (
              <div key={ban.key} className="border border-fog p-4 bg-white">
                <p className="text-[10px] uppercase tracking-widest text-muted">
                  {ban.label}
                </p>
                <p className="text-xs text-muted mt-1">
                  {ban.value} → cung <b>{ban.cungChi}</b>
                </p>
                <p
                  className={`mt-2 inline-block px-2 py-1 text-xs ${KIND_CLASS[ban.kind]}`}
                >
                  {ban.kind}
                </p>
              </div>
            ))}
            {!report.hourProvided ? (
              <div className="border border-dashed border-fog p-4 bg-stone-50/60">
                <p className="text-[10px] uppercase tracking-widest text-muted">
                  Bàn giờ
                </p>
                <p className="text-xs text-muted mt-2 leading-relaxed">
                  Chưa nhập giờ mất — chọn canh giờ ở trên để tính đủ 4 bàn.
                </p>
              </div>
            ) : null}
          </div>

          <div className="p-4" style={{ backgroundColor: primaryColor }}>
            <p className="text-[10px] uppercase tracking-widest text-white/70">
              Kết luận
            </p>
            <p className="text-white font-display text-2xl mt-1">
              {report.overallLabel}
            </p>
            <p className="text-white/85 text-sm mt-2 leading-relaxed">
              {report.suggestion}
            </p>
          </div>

          <HeTrongAiPanel
            primaryColor={primaryColor}
            resetKey={`${birthYear}-${date}-${hour}-${gender}`}
            payload={{
              topic: 'trung_tang',
              birthYear,
              deathDay: dd,
              deathMonth: mm,
              deathYear: yy,
              deathHour: hour === '' ? null : Number(hour),
              gender,
            }}
          />

          <p className="text-xs text-muted leading-relaxed">
            Phép tính theo Ngọc Hạp Thông Thư lưu truyền; mỗi vùng có dị bản.
            Kết quả chỉ để tham khảo — việc trấn Trùng tang, lễ cầu siêu nên
            theo hướng dẫn của <AdvisorName />.
          </p>
        </div>
      ) : null}
    </div>
  );
}
