'use client';

import { useMemo, useState } from 'react';
import {
  HOROSCOPE_SCOPE_LABELS,
  IZTRO_TIME_SLOTS,
  YEAR_DIVIDE_OPTIONS,
  buildIztroChart,
  buildIztroHoroscope,
  formatCanChi,
  formatStarLabel,
  nowContextValue,
  type HoroscopeScopeKey,
  type IztroChartInput,
  type IztroChartView,
  type IztroHoroscopeView,
  type YearDivideMethod,
} from '@/lib/fengshui/iztro-chart';
import { buildHanNamPromptContext } from '@/lib/fengshui/tuvi-prompt';
import { TuViChatPanel } from '@/components/fengshui/tools/TuViChatPanel';
import { TuViEssaySection } from '@/components/fengshui/tools/TuViEssaySection';

interface Props {
  primaryColor: string;
  templeId: string;
  templeName: string;
  templeHotline?: string | null;
  templePhone?: string | null;
}

type CalendarKind = 'solar' | 'lunar';

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const now = new Date();
const BIRTH_YEARS = Array.from({ length: 120 }, (_, i) => now.getFullYear() - i);
const VIEW_YEARS = Array.from({ length: 21 }, (_, i) => now.getFullYear() - 5 + i);

const MUTAGEN_BADGE: Record<string, string> = {
  Lộc: '#C44A1F',
  Quyền: '#2F6FE0',
  Khoa: '#1B6B3A',
  Kỵ: '#1A1A1A',
};

const FOCUS_SCOPES: HoroscopeScopeKey[] = ['yearly', 'decadal', 'age'];

function mutagenColor(name: string): string {
  const key = Object.keys(MUTAGEN_BADGE).find((k) => name.includes(k));
  return key ? MUTAGEN_BADGE[key] : '#6B7280';
}

function viewDateForYear(year: number): string {
  const today = nowContextValue().date;
  const [, m, d] = today.split('-');
  // Giữ tháng/ngày hôm nay trong năm xem (ổn định hơn mốc 1/1).
  return `${year}-${m || '07'}-${d || '15'}`;
}

export function XemHanNam({
  primaryColor,
  templeId,
  templeName,
  templeHotline,
  templePhone,
}: Props) {
  const contactPhone = templeHotline || templePhone || null;

  const [fullName, setFullName] = useState('');
  const [calendar, setCalendar] = useState<CalendarKind>('solar');
  const [day, setDay] = useState(16);
  const [month, setMonth] = useState(8);
  const [year, setYear] = useState(2000);
  const [timeIndex, setTimeIndex] = useState(2);
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [gender, setGender] = useState<'nam' | 'nu'>('nam');
  const [yearDivide, setYearDivide] =
    useState<YearDivideMethod>('nong_lich');
  const [viewYear, setViewYear] = useState(now.getFullYear());

  const [chartInput, setChartInput] = useState<IztroChartInput | null>(null);
  const [result, setResult] = useState<IztroChartView | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatSessionId, setChatSessionId] = useState(0);

  const contextDate = useMemo(() => viewDateForYear(viewYear), [viewYear]);
  const contextTimeIndex = useMemo(() => nowContextValue().timeIndex, []);

  const horoscope: IztroHoroscopeView | null = useMemo(() => {
    if (!chartInput) return null;
    try {
      return buildIztroHoroscope(chartInput, contextDate, contextTimeIndex);
    } catch {
      return null;
    }
  }, [chartInput, contextDate, contextTimeIndex]);

  const chartContext = useMemo(() => {
    if (!result || !horoscope) return '';
    return buildHanNamPromptContext(result, horoscope);
  }, [result, horoscope]);


  function currentInput(): IztroChartInput {
    return {
      fullName,
      calendar,
      year,
      month,
      day,
      timeIndex,
      gender,
      isLeapMonth,
      yearDivide,
    };
  }

  function runChart(e?: React.FormEvent) {
    e?.preventDefault();
    setErr(null);
    const input = currentInput();
    if (input.fullName.trim().length < 2) {
      setErr('Vui lòng nhập họ và tên.');
      return;
    }
    try {
      const chart = buildIztroChart(input);
      setChartInput(input);
      setResult(chart);
      setChatOpen(false);
      setChatSessionId((n) => n + 1);
    } catch {
      setErr('Không lập được lá số. Kiểm tra ngày tháng năm rồi thử lại.');
    }
  }

  const yearly = horoscope?.scopes.yearly;
  const flowStars =
    yearly && yearly.index >= 0
      ? yearly.starsByPalaceIndex[yearly.index] ?? []
      : [];

  return (
    <div className="space-y-8 min-w-0 max-w-full">
      <form
        onSubmit={runChart}
        className="border border-fog bg-white p-5 md:p-6 space-y-4 min-w-0"
      >
        <p
          className="text-[0.72rem] uppercase tracking-[0.25em]"
          style={{ color: primaryColor }}
        >
          Thông tin để xem hạn năm
        </p>
        <p className="text-sm text-muted">
          Chỉ cần ngày giờ sinh để tính lưu niên — không hiển thị lại cả lá số
          hay danh sách sao mười hai cung.
        </p>

        <label className="block text-xs text-muted">
          Họ và tên
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nguyễn Văn A"
            className="mt-1 w-full border border-fog px-3 py-2.5 text-ink text-base"
          />
        </label>

        <div className="flex gap-2">
          {(
            [
              { v: 'solar' as const, l: 'Lịch dương' },
              { v: 'lunar' as const, l: 'Lịch âm' },
            ]
          ).map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => setCalendar(opt.v)}
              className="flex-1 px-3 py-2 text-sm border"
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

        <div className="flex gap-2">
          {YEAR_DIVIDE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setYearDivide(opt.id)}
              className="flex-1 px-3 py-2 text-sm border"
              style={
                yearDivide === opt.id
                  ? {
                      background: primaryColor,
                      borderColor: primaryColor,
                      color: '#fff',
                    }
                  : undefined
              }
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <label className="block text-xs text-muted">
            Ngày
            <select
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
              className="mt-1 w-full border border-fog px-2 py-2 text-base bg-white"
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
              className="mt-1 w-full border border-fog px-2 py-2 text-base bg-white"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-muted">
            Năm sinh
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="mt-1 w-full border border-fog px-2 py-2 text-base bg-white"
            >
              {BIRTH_YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        </div>

        {calendar === 'lunar' ? (
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={isLeapMonth}
              onChange={(e) => setIsLeapMonth(e.target.checked)}
            />
            Tháng nhuận
          </label>
        ) : null}

        <label className="block text-xs text-muted">
          Giờ sinh
          <select
            value={timeIndex}
            onChange={(e) => setTimeIndex(Number(e.target.value))}
            className="mt-1 w-full border border-fog px-2 py-2 text-base bg-white"
          >
            {IZTRO_TIME_SLOTS.map((slot) => (
              <option key={slot.index} value={slot.index}>
                {slot.label} · {slot.range}
              </option>
            ))}
          </select>
        </label>

        <div className="flex gap-2">
          {(
            [
              { v: 'nam' as const, l: 'Nam' },
              { v: 'nu' as const, l: 'Nữ' },
            ]
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

        {err ? <p className="text-sm text-lacquer">{err}</p> : null}

        <button
          type="submit"
          className="w-full py-3 text-sm text-white uppercase tracking-[0.2em]"
          style={{ background: primaryColor }}
        >
          Xem hạn năm
        </button>
      </form>

      {result && horoscope ? (
        <div className="space-y-5">
          <div className="border border-fog bg-paper p-4 md:p-5 space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p
                  className="text-[0.7rem] uppercase tracking-[0.25em]"
                  style={{ color: primaryColor }}
                >
                  Hạn năm · lưu niên
                </p>
                <h3 className="mt-1 font-display text-xl text-ink">
                  {result.fullName}
                  <span className="ml-2 text-base font-sans text-muted">
                    ({result.gender})
                  </span>
                </h3>
                <p className="mt-1 text-sm text-muted">
                  Sinh {result.solarDate} · {result.time}
                  {horoscope.nominalAge != null
                    ? ` · tuổi hư ${horoscope.nominalAge} tại năm xem`
                    : ''}
                </p>
              </div>
              <label className="block text-xs text-muted">
                Năm xem hạn
                <select
                  value={viewYear}
                  onChange={(e) => {
                    setViewYear(Number(e.target.value));
                    setChatSessionId((n) => n + 1);
                  }}
                  className="mt-1 block min-w-[7rem] border border-fog px-2 py-2 text-base bg-white text-ink"
                >
                  {VIEW_YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <p className="text-sm text-ink">
              Đang xem:{' '}
              <span className="font-medium">{horoscope.solarDate}</span>
              <span className="text-muted">
                {' '}
                · âm {horoscope.lunarDate} · {horoscope.timeLabel}
              </span>
            </p>
          </div>

          {yearly ? (
            <div
              className="border-2 bg-white p-4 md:p-5 space-y-3"
              style={{ borderColor: primaryColor }}
            >
              <p
                className="text-[0.7rem] uppercase tracking-[0.25em]"
                style={{ color: primaryColor }}
              >
                {HOROSCOPE_SCOPE_LABELS.yearly} · trọng tâm
              </p>
              <p className="text-lg font-medium text-ink">
                Cung {yearly.focusPalaceName || yearly.name}
                <span className="ml-2 text-sm font-normal text-muted">
                  {formatCanChi(yearly.heavenlyStem, yearly.earthlyBranch)}
                </span>
              </p>
              {yearly.mutagen?.length ? (
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-xs text-muted">Tứ hóa lưu niên:</span>
                  {yearly.mutagen.map((m) => (
                    <span
                      key={m}
                      className="inline-flex items-center justify-center px-1.5 h-5 text-[0.75rem] font-medium text-white"
                      style={{ backgroundColor: mutagenColor(m) }}
                    >
                      {m}
                    </span>
                  ))}
                </div>
              ) : null}
              {flowStars.length ? (
                <p className="text-sm text-ink leading-relaxed">
                  <span className="text-muted">Sao lưu tại cung hạn: </span>
                  {flowStars.map(formatStarLabel).join(', ')}
                </p>
              ) : (
                <p className="text-sm text-muted">
                  Không có sao lưu đặc biệt gắn cung hạn năm này.
                </p>
              )}
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {FOCUS_SCOPES.filter((k) => k !== 'yearly').map((key) => {
              const scope = horoscope.scopes[key];
              if (!scope) return null;
              return (
                <div
                  key={key}
                  className="border border-fog bg-paper px-3 py-3 text-sm"
                >
                  <p className="text-[0.7rem] text-muted">
                    {HOROSCOPE_SCOPE_LABELS[key]}
                  </p>
                  <p className="text-ink font-medium mt-0.5">
                    {scope.focusPalaceName || scope.name}
                    <span className="ml-1.5 font-normal text-muted">
                      {formatCanChi(scope.heavenlyStem, scope.earthlyBranch)}
                    </span>
                  </p>
                  {scope.mutagen?.length ? (
                    <p className="mt-1 text-[0.75rem] text-muted">
                      Tứ hóa: {scope.mutagen.join(', ')}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>

          <TuViEssaySection
            key={`essay-${chatSessionId}-${viewYear}`}
            chartContext={chartContext}
            templeName={templeName}
            primaryColor={primaryColor}
            contactPhone={contactPhone}
            title="Luận hạn năm (mẫu)"
            subtitle={`Xem thử miễn phí hạn năm (lưu niên) ${viewYear} — không liệt kê lại cả lá số.`}
            ctaTitle="Muốn luận hạn năm chuyên sâu hơn?"
            question={`Hãy luận hạn năm (lưu niên) tại thời điểm xem ${viewYear}. Tập trung: cung lưu niên chiếu, tứ hóa lưu niên, liên hệ đại hạn–tiểu hạn đang đi, thuận–nghịch và việc nên–tránh trong năm. Không liệt kê lại cả lá số.`}
            focusFlag="vanHanFocus"
            topic="han_nam"
            buttonLabel="Luận hạn năm"
            loadingLabel="Trụ trì đang luận hạn năm…"
            notePrefix="Hỏi sâu xem hạn năm"
            onAskMore={() => setChatOpen(true)}
          />

          <p className="text-[0.75rem] text-muted">
            Công cụ liên quan:{' '}
            <a
              href="/phong-thuy/luan-giai-tu-vi"
              className="underline underline-offset-2"
              style={{ color: primaryColor }}
            >
              Luận giải tử vi
            </a>
            .
          </p>

          <TuViChatPanel
            key={`${chatSessionId}-${viewYear}`}
            open={chatOpen}
            onClose={() => setChatOpen(false)}
            primaryColor={primaryColor}
            templeName={templeName}
            templeId={templeId}
            contactPhone={contactPhone}
            chart={result}
            horoscope={horoscope}
            vanHanFocus
            freeQuestionLimit={3}
          />
        </div>
      ) : null}
    </div>
  );
}
