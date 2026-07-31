'use client';

import { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  HOROSCOPE_SCOPE_LABELS,
  IZTRO_TIME_SLOTS,
  YEAR_DIVIDE_OPTIONS,
  buildIztroChart,
  buildIztroHoroscope,
  formatCanChi,
  formatStarLabel,
  nowContextValue,
  type IztroChartInput,
  type IztroChartView,
  type IztroHoroscopeView,
  type IztroPalaceView,
  type YearDivideMethod,
} from '@/lib/fengshui/iztro-chart';
import {
  buildDaiVanPromptContext,
  resolveEssayFollowUps,
  splitTuViReply,
} from '@/lib/fengshui/tuvi-prompt';
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
const VIEW_YEARS = Array.from({ length: 41 }, (_, i) => now.getFullYear() - 10 + i);

const MUTAGEN_BADGE: Record<string, string> = {
  Lộc: '#C44A1F',
  Quyền: '#2F6FE0',
  Khoa: '#1B6B3A',
  Kỵ: '#1A1A1A',
};

function mutagenColor(name: string): string {
  const key = Object.keys(MUTAGEN_BADGE).find((k) => name.includes(k));
  return key ? MUTAGEN_BADGE[key] : '#6B7280';
}

function viewDateForYear(year: number): string {
  const today = nowContextValue().date;
  const [, m, d] = today.split('-');
  return `${year}-${m || '07'}-${d || '15'}`;
}

const ScopeCard = memo(function ScopeCard({
  title,
  emphasis,
  primaryColor,
  scope,
  palace,
}: {
  title: string;
  emphasis?: boolean;
  primaryColor: string;
  scope: IztroHoroscopeView['scopes']['decadal'];
  palace?: IztroPalaceView;
}) {
  const majors = palace?.majorStars ?? [];
  const minors = palace?.minorStars ?? [];

  return (
    <div
      className={`bg-white p-4 md:p-5 space-y-2 ${
        emphasis ? 'border-2' : 'border border-fog'
      }`}
      style={emphasis ? { borderColor: primaryColor } : undefined}
    >
      <p
        className="text-[0.7rem] uppercase tracking-[0.25em]"
        style={{ color: primaryColor }}
      >
        {title}
      </p>
      <p className="text-lg font-medium text-ink">
        Cung {scope.focusPalaceName || scope.name}
        <span className="ml-2 text-sm font-normal text-muted">
          {formatCanChi(scope.heavenlyStem, scope.earthlyBranch)}
        </span>
      </p>
      {palace ? (
        <p className="text-sm text-muted">
          Đại hạn cung: {palace.decadal.range[0]}–{palace.decadal.range[1]}
          {palace.ages.length
            ? ` · tuổi tiểu hạn trong cung: ${palace.ages.join(', ')}`
            : ''}
        </p>
      ) : null}
      {scope.mutagen?.length ? (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-muted">Tứ hóa hạn:</span>
          {scope.mutagen.map((m) => (
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
      {majors.length || minors.length ? (
        <div className="text-sm text-ink leading-relaxed space-y-1">
          {majors.length ? (
            <p>
              <span className="text-muted">Chính tinh: </span>
              {majors.map(formatStarLabel).join(', ')}
            </p>
          ) : null}
          {minors.length ? (
            <p>
              <span className="text-muted">Phụ tinh: </span>
              {minors.map(formatStarLabel).join(', ')}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});

export function DaiVanHan({
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
    return buildDaiVanPromptContext(result, horoscope);
  }, [result, horoscope]);

  const byIndex = useMemo(() => {
    const map = new Map<number, IztroPalaceView>();
    if (!result) return map;
    for (const p of result.palaces) {
      if (p.index >= 0) map.set(p.index, p);
    }
    return map;
  }, [result]);

  const decadalCycle = useMemo(() => {
    if (!result) return [] as IztroPalaceView[];
    return [...result.palaces]
      .filter((p) => p.index >= 0)
      .sort((a, b) => a.decadal.range[0] - b.decadal.range[0]);
  }, [result]);

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

  const decadal = horoscope?.scopes.decadal;
  const age = horoscope?.scopes.age;
  const currentDecadalIdx = decadal?.index ?? -1;

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
          Thông tin để xem đại · tiểu vận
        </p>
        <p className="text-sm text-muted">
          Tập trung đại hạn (đại vận) và tiểu hạn (tiểu vận) đang đi — không
          hiển thị lại cả lá số hay danh sách sao mười hai cung.
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
          Xem đại · tiểu vận
        </button>
      </form>

      {result && horoscope && decadal && age ? (
        <div className="space-y-5">
          <div className="border border-fog bg-paper p-4 md:p-5 space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p
                  className="text-[0.7rem] uppercase tracking-[0.25em]"
                  style={{ color: primaryColor }}
                >
                  Đại vận · tiểu vận
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
                Năm xem vận
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ScopeCard
              title={`${HOROSCOPE_SCOPE_LABELS.decadal} · trọng tâm`}
              emphasis
              primaryColor={primaryColor}
              scope={decadal}
              palace={byIndex.get(decadal.index)}
            />
            <ScopeCard
              title={`${HOROSCOPE_SCOPE_LABELS.age} · trọng tâm`}
              emphasis
              primaryColor={primaryColor}
              scope={age}
              palace={byIndex.get(age.index)}
            />
          </div>

          <div className="border border-fog bg-white overflow-x-auto">
            <div className="px-4 pt-4 pb-2">
              <p
                className="text-[0.7rem] uppercase tracking-[0.25em]"
                style={{ color: primaryColor }}
              >
                Chu kỳ đại hạn theo tuổi
              </p>
            </div>
            <table className="w-full text-sm min-w-[28rem]">
              <thead>
                <tr className="border-y border-fog text-left text-xs text-muted">
                  <th className="px-4 py-2 font-medium">Tuổi</th>
                  <th className="px-3 py-2 font-medium">Cung</th>
                  <th className="px-3 py-2 font-medium">Can chi</th>
                  <th className="px-3 py-2 font-medium">Chính tinh</th>
                </tr>
              </thead>
              <tbody>
                {decadalCycle.map((p) => {
                  const current = p.index === currentDecadalIdx;
                  return (
                    <tr
                      key={p.index}
                      className={`border-b border-fog/70 ${
                        current ? 'bg-paper' : ''
                      }`}
                    >
                      <td className="px-4 py-2.5 tabular-nums text-ink whitespace-nowrap">
                        {p.decadal.range[0]}–{p.decadal.range[1]}
                        {current ? (
                          <span
                            className="ml-2 text-[0.65rem] uppercase tracking-wide"
                            style={{ color: primaryColor }}
                          >
                            đang đi
                          </span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2.5 text-ink font-medium">
                        {p.name}
                      </td>
                      <td className="px-3 py-2.5 text-muted whitespace-nowrap">
                        {formatCanChi(p.heavenlyStem, p.earthlyBranch)}
                      </td>
                      <td className="px-3 py-2.5 text-ink">
                        {p.majorStars.map((s) => s.name).join(', ') || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <TuViEssaySection
            key={`essay-${chatSessionId}-${viewYear}`}
            chartContext={chartContext}
            templeName={templeName}
            primaryColor={primaryColor}
            contactPhone={contactPhone}
            title="Luận đại · tiểu vận (mẫu)"
            subtitle={`Xem thử miễn phí đại hạn và tiểu hạn tại thời điểm ${viewYear} — không lấy lưu niên làm trọng tâm.`}
            ctaTitle="Muốn luận đại · tiểu vận chuyên sâu hơn?"
            question={`Hãy luận đại vận và tiểu vận tại thời điểm xem ${viewYear}. Tập trung: đại hạn đang đi (cung đóng, đoạn tuổi, sao chính phụ, tứ hóa hạn), tiểu hạn đang đi và mối liên hệ với đại hạn, thuận–nghịch và việc nên–tránh trong chu kỳ. Có thể nhắc ngắn đại hạn kế tiếp. Không liệt kê lại cả lá số; không lấy lưu niên làm trọng tâm.`}
            focusFlag="daiVanFocus"
            topic="dai_van"
            buttonLabel="Luận đại · tiểu vận"
            loadingLabel="Trụ trì đang luận đại · tiểu vận…"
            notePrefix="Hỏi sâu đại tiểu vận"
            onAskMore={() => setChatOpen(true)}
          />

          <p className="text-[0.75rem] text-muted">
            Công cụ liên quan:{' '}
            <a
              href="/phong-thuy/xem-han-nam"
              className="underline underline-offset-2"
              style={{ color: primaryColor }}
            >
              Xem hạn năm
            </a>
            {' · '}
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
            key={`chat-${chatSessionId}-${viewYear}`}
            open={chatOpen}
            onClose={() => setChatOpen(false)}
            primaryColor={primaryColor}
            templeName={templeName}
            templeId={templeId}
            contactPhone={contactPhone}
            chart={result}
            horoscope={horoscope}
            daiVanFocus
            freeQuestionLimit={3}
          />
        </div>
      ) : null}
    </div>
  );
}
