'use client';

import { useMemo, useState } from 'react';
import {
  dayCanChi,
  formatCanChi,
  formatLunarDate,
  hourBranchLabel,
  hourCanChi,
  monthCanChiFromYear,
  solarToLunar,
  yearCanChi,
} from '@/lib/fengshui/lunar';
import { TU_VI_PALACES } from '@/lib/fengshui/tools';

interface Props {
  primaryColor: string;
}

type CalendarKind = 'solar' | 'lunar';

interface ChartResult {
  fullName: string;
  gender: 'nam' | 'nu';
  solarLabel: string;
  lunarLabel: string;
  hourLabel: string;
  viewYear: number;
  viewMonth: number;
  pillars: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const now = new Date();
const YEARS = Array.from({ length: 120 }, (_, i) => now.getFullYear() - i);
const VIEW_YEARS = Array.from({ length: 15 }, (_, i) => now.getFullYear() - 2 + i);

export function LapLaSoTuVi({ primaryColor }: Props) {
  const [fullName, setFullName] = useState('');
  const [calendar, setCalendar] = useState<CalendarKind>('solar');
  const [day, setDay] = useState(now.getDate());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(1990);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [gender, setGender] = useState<'nam' | 'nu'>('nam');
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(1);
  const [result, setResult] = useState<ChartResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const previewName = useMemo(
    () => fullName.trim() || 'Phật tử',
    [fullName],
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (fullName.trim().length < 2) {
      setErr('Vui lòng nhập họ và tên.');
      return;
    }

    // Phase 1: form nhận DL hoặc AL; nếu chọn AL thì tạm xem ngày đã nhập
    // như dương lịch để tính JD (đổi AL→DL đầy đủ sẽ bổ sung sau).
    // Khi chọn dương: chuẩn solarToLunar.
    let solarDay = day;
    let solarMonth = month;
    let solarYear = year;
    let noteLunarInput = false;

    if (calendar === 'lunar') {
      noteLunarInput = true;
      // Ước lượng sơ bộ: dùng chính số AL như DL để có JD gần đúng —
      // kết quả Can Chi ngày có thể lệch; UI sẽ ghi chú rõ.
      solarDay = day;
      solarMonth = month;
      solarYear = year;
    }

    try {
      const lunar = solarToLunar(solarDay, solarMonth, solarYear);
      const dcc = dayCanChi(lunar.jd);
      const ycc = yearCanChi(lunar.year);
      const mcc = monthCanChiFromYear(lunar.year, lunar.month);
      const hcc = hourCanChi(hour, dcc.can);

      setResult({
        fullName: fullName.trim(),
        gender,
        solarLabel: noteLunarInput
          ? `${day}/${month}/${year} (nhập âm — quy đổi DL chính xác sẽ bổ sung)`
          : `${solarDay}/${solarMonth}/${solarYear} (DL)`,
        lunarLabel: formatLunarDate(lunar),
        hourLabel: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} · ${hourBranchLabel(hour)}`,
        viewYear,
        viewMonth,
        pillars: {
          year: formatCanChi(ycc),
          month: formatCanChi(mcc),
          day: formatCanChi(dcc),
          hour: formatCanChi(hcc),
        },
      });
    } catch {
      setErr('Ngày sinh không hợp lệ. Vui lòng kiểm tra lại.');
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={submit} className="border border-fog bg-white p-5 md:p-6 space-y-4">
        <p className="text-[0.72rem] uppercase tracking-[0.25em]" style={{ color: primaryColor }}>
          Thông tin lập lá số
        </p>

        <label className="block text-xs text-muted">
          Họ và tên
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nguyễn Văn A"
            className="mt-1 w-full border border-fog px-3 py-2.5 text-ink text-sm"
          />
        </label>

        <div className="flex gap-2">
          {(
            [
              { v: 'solar', l: 'Lịch dương' },
              { v: 'lunar', l: 'Lịch âm' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => setCalendar(opt.v)}
              className="flex-1 px-3 py-2 text-sm border transition-colors"
              style={
                calendar === opt.v
                  ? {
                      background: primaryColor,
                      borderColor: primaryColor,
                      color: '#fff',
                    }
                  : undefined
              }
            >
              {opt.l}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <label className="block text-xs text-muted">
            Ngày
            <select
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
              className="mt-1 w-full border border-fog px-2 py-2 text-sm bg-white"
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-muted">
            Tháng
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="mt-1 w-full border border-fog px-2 py-2 text-sm bg-white"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-muted">
            Năm
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="mt-1 w-full border border-fog px-2 py-2 text-sm bg-white"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="block text-xs text-muted">
            Giờ sinh
            <select
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
              className="mt-1 w-full border border-fog px-2 py-2 text-sm bg-white"
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, '0')} giờ · {hourBranchLabel(h)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-muted">
            Phút
            <select
              value={minute}
              onChange={(e) => setMinute(Number(e.target.value))}
              className="mt-1 w-full border border-fog px-2 py-2 text-sm bg-white"
            >
              {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                <option key={m} value={m}>
                  {String(m).padStart(2, '0')} phút
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset>
          <legend className="text-xs text-muted mb-1.5">Giới tính</legend>
          <div className="flex gap-2">
            {(
              [
                { v: 'nam', l: 'Nam' },
                { v: 'nu', l: 'Nữ' },
              ] as const
            ).map((g) => (
              <button
                key={g.v}
                type="button"
                onClick={() => setGender(g.v)}
                className="flex-1 px-3 py-2 text-sm border"
                style={
                  gender === g.v
                    ? {
                        background: primaryColor,
                        borderColor: primaryColor,
                        color: '#fff',
                      }
                    : undefined
                }
              >
                {g.l}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-2 gap-2">
          <label className="block text-xs text-muted">
            Năm xem
            <select
              value={viewYear}
              onChange={(e) => setViewYear(Number(e.target.value))}
              className="mt-1 w-full border border-fog px-2 py-2 text-sm bg-white"
            >
              {VIEW_YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-muted">
            Tháng xem (âm)
            <select
              value={viewMonth}
              onChange={(e) => setViewMonth(Number(e.target.value))}
              className="mt-1 w-full border border-fog px-2 py-2 text-sm bg-white"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>
          </label>
        </div>

        {err ? <p className="text-sm text-lacquer">{err}</p> : null}

        <button
          type="submit"
          className="w-full py-3 text-sm text-white uppercase tracking-[0.2em]"
          style={{ background: primaryColor }}
        >
          Lập lá số
        </button>
      </form>

      {result ? (
        <div className="space-y-5">
          <div className="border border-fog bg-paper p-5 md:p-6">
            <p
              className="text-[0.7rem] uppercase tracking-[0.25em]"
              style={{ color: primaryColor }}
            >
              Kết quả sơ bộ
            </p>
            <h3 className="mt-2 font-display text-2xl text-ink">
              {result.fullName}
              <span className="ml-2 text-base text-muted font-sans">
                ({result.gender === 'nam' ? 'Nam' : 'Nữ'})
              </span>
            </h3>
            <dl className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-muted">Ngày sinh</dt>
                <dd className="text-ink">{result.solarLabel}</dd>
                <dd className="text-muted">{result.lunarLabel}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Giờ sinh</dt>
                <dd className="text-ink">{result.hourLabel}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Năm / tháng xem</dt>
                <dd className="text-ink">
                  {result.viewYear} · tháng {result.viewMonth} âm
                </dd>
              </div>
            </dl>

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  ['Năm', result.pillars.year],
                  ['Tháng', result.pillars.month],
                  ['Ngày', result.pillars.day],
                  ['Giờ', result.pillars.hour],
                ] as const
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="border border-fog bg-white px-3 py-3 text-center"
                >
                  <p className="text-[0.65rem] uppercase tracking-wide text-muted">
                    {label}
                  </p>
                  <p
                    className="mt-1 font-display text-lg"
                    style={{ color: primaryColor }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-fog bg-white p-5 md:p-6">
            <div className="flex items-end justify-between gap-3 mb-4">
              <div>
                <p
                  className="text-[0.7rem] uppercase tracking-[0.25em]"
                  style={{ color: primaryColor }}
                >
                  Lá số 12 cung
                </p>
                <p className="mt-1 text-sm text-muted">
                  Khung cho {previewName} — an sao đầy đủ sẽ bổ sung ở giai đoạn
                  tiếp.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {TU_VI_PALACES.map((name) => (
                <div
                  key={name}
                  className="aspect-square border border-fog bg-mist/40 flex flex-col items-center justify-center p-2 text-center"
                >
                  <span
                    className="text-[0.65rem] uppercase tracking-wide"
                    style={{ color: primaryColor }}
                  >
                    {name}
                  </span>
                  <span className="mt-1 text-[0.7rem] text-muted">…</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
