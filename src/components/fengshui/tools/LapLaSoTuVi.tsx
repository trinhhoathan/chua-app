'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  IZTRO_TIME_SLOTS,
  YEAR_DIVIDE_OPTIONS,
  buildIztroChart,
  buildIztroHoroscope,
  listBirthHourCandidates,
  nowContextValue,
  type BirthHourCandidate,
  type IztroChartInput,
  type IztroChartView,
  type IztroHoroscopeView,
  type YearDivideMethod,
} from '@/lib/fengshui/iztro-chart';
import { TimGioSinhPanel } from '@/components/fengshui/tools/TimGioSinhPanel';
import { HoroscopeContextBar } from '@/components/fengshui/tools/HoroscopeContextBar';
import { TuViChartBoard } from '@/components/fengshui/tools/TuViChartBoard';
import { TuViChatPanel } from '@/components/fengshui/tools/TuViChatPanel';
import { TuViDetailPanel } from '@/components/fengshui/tools/TuViDetailPanel';
import {
  buildTuViHtmlDocument,
  exportTuViHtml,
  type ChatEssay,
  type PalaceEssay,
} from '@/lib/fengshui/tuvi-html';

interface Props {
  primaryColor: string;
  templeId: string;
  templeName: string;
  templeAddress?: string | null;
  templeHotline?: string | null;
  templePhone?: string | null;
  templeZalo?: string | null;
  templeFacebook?: string | null;
}

type CalendarKind = 'solar' | 'lunar';
type ShareMode = 'chart' | 'full';

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const now = new Date();
const YEARS = Array.from({ length: 120 }, (_, i) => now.getFullYear() - i);

export function LapLaSoTuVi({
  primaryColor,
  templeId,
  templeName,
  templeAddress,
  templeHotline,
  templePhone,
  templeZalo,
  templeFacebook,
}: Props) {
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
  const [showFindHour, setShowFindHour] = useState(false);
  const [hourCandidates, setHourCandidates] = useState<BirthHourCandidate[]>(
    [],
  );
  const [findingHour, setFindingHour] = useState(false);

  const [chartInput, setChartInput] = useState<IztroChartInput | null>(null);
  const [result, setResult] = useState<IztroChartView | null>(null);
  const [contextDate, setContextDate] = useState(() => {
    const now = nowContextValue();
    return now.date;
  });
  const [contextTimeIndex, setContextTimeIndex] = useState(() => {
    return nowContextValue().timeIndex;
  });
  const [err, setErr] = useState<string | null>(null);
  const [chartFullscreen, setChartFullscreen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatSessionId, setChatSessionId] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [chatEssays, setChatEssays] = useState<ChatEssay[]>([]);
  const [palaceEssays, setPalaceEssays] = useState<PalaceEssay[]>([]);

  const templeInfo = useMemo(
    () => ({
      name: templeName,
      address: templeAddress,
      hotline: templeHotline,
      phone: templePhone,
      zalo: templeZalo,
      facebook: templeFacebook,
    }),
    [
      templeName,
      templeAddress,
      templeHotline,
      templePhone,
      templeZalo,
      templeFacebook,
    ],
  );

  const hasAnyInterpretation =
    chatEssays.length > 0 || palaceEssays.length > 0;

  const horoscope: IztroHoroscopeView | null = useMemo(() => {
    if (!chartInput) return null;
    try {
      return buildIztroHoroscope(chartInput, contextDate, contextTimeIndex);
    } catch {
      return null;
    }
  }, [chartInput, contextDate, contextTimeIndex]);

  useEffect(() => {
    if (!chartFullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setChartFullscreen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [chartFullscreen]);

  const requestExport = useCallback(
    async (mode: ShareMode) => {
      if (!result) return;
      setExporting(true);
      setExportError(null);
      try {
        const html = buildTuViHtmlDocument({
          primaryColor,
          chart: result,
          horoscope,
          temple: templeInfo,
          chatEssays,
          palaceEssays,
          includeInterpretation: mode === 'full',
        });
        const name = `La-so-Tu-Vi-${result.fullName || 'an-danh'}`;
        await exportTuViHtml(html, name);
        setShareOpen(false);
      } catch (e) {
        setExportError(
          e instanceof Error ? e.message : 'Không xuất được file HTML.',
        );
      } finally {
        setExporting(false);
      }
    },
    [
      result,
      primaryColor,
      horoscope,
      templeInfo,
      chatEssays,
      palaceEssays,
    ],
  );

  function currentInput(overrides?: Partial<IztroChartInput>): IztroChartInput {
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
      ...overrides,
    };
  }

  function runChart(input: IztroChartInput) {
    setErr(null);
    if (input.fullName.trim().length < 2) {
      setErr('Vui lòng nhập họ và tên.');
      return;
    }
    try {
      const chart = buildIztroChart(input);
      setChartInput(input);
      setResult(chart);
      const now = nowContextValue();
      setContextDate(now.date);
      setContextTimeIndex(now.timeIndex);
      setShowFindHour(false);
      setChatOpen(false);
      setChatSessionId((n) => n + 1);
      setChatEssays([]);
      setPalaceEssays([]);
      setShareOpen(false);
      setExportError(null);
    } catch {
      setErr(
        'Không lập được lá số. Vui lòng kiểm tra ngày tháng năm và thử lại.',
      );
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    runChart(currentInput());
  }

  function openFindHour() {
    setErr(null);
    setFindingHour(true);
    setShowFindHour(true);
    try {
      const rows = listBirthHourCandidates({
        calendar,
        year,
        month,
        day,
        gender,
        isLeapMonth,
        yearDivide,
        fullName,
      });
      setHourCandidates(rows);
    } catch {
      setErr('Không đối chiếu được các giờ sinh. Kiểm tra lại ngày tháng.');
      setHourCandidates([]);
    } finally {
      setFindingHour(false);
    }
  }

  function selectBirthHour(idx: number) {
    setTimeIndex(idx);
    runChart(currentInput({ timeIndex: idx }));
  }

  return (
    <div className="space-y-8 min-w-0 max-w-full">
      <form
        onSubmit={submit}
        className="border border-fog bg-white p-5 md:p-6 space-y-4 min-w-0 overflow-x-hidden"
      >
        <p
          className="text-[0.72rem] uppercase tracking-[0.25em]"
          style={{ color: primaryColor }}
        >
          Thông tin lập lá số
        </p>

        <label className="block text-xs text-muted">
          Họ và tên
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nguyễn Văn A"
            autoComplete="name"
            className="mt-1 w-full min-w-0 border border-fog px-3 py-2.5 text-ink text-base"
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

        <fieldset>
          <legend className="text-xs text-muted mb-1.5">
            Phương pháp lập lá số
          </legend>
          <div className="flex gap-2">
            {YEAR_DIVIDE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setYearDivide(opt.id)}
                className="flex-1 px-3 py-2 text-sm border text-left"
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
                <span className="block font-medium">{opt.label}</span>
                <span
                  className={`mt-0.5 block text-[0.7rem] leading-snug ${
                    yearDivide === opt.id ? 'text-white/80' : 'text-muted'
                  }`}
                >
                  {opt.hint}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-3 gap-2 min-w-0">
          <label className="block text-xs text-muted min-w-0">
            Ngày
            <select
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
              className="mt-1 w-full min-w-0 max-w-full border border-fog px-2 py-2 text-base bg-white"
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-muted min-w-0">
            Tháng
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="mt-1 w-full min-w-0 max-w-full border border-fog px-2 py-2 text-base bg-white"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-muted min-w-0">
            Năm
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="mt-1 w-full min-w-0 max-w-full border border-fog px-2 py-2 text-base bg-white"
            >
              {YEARS.map((y) => (
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
            Tháng nhuận (âm lịch)
          </label>
        ) : null}

        <label className="block text-xs text-muted min-w-0">
          Giờ sinh (theo địa chi)
          <select
            value={timeIndex}
            onChange={(e) => setTimeIndex(Number(e.target.value))}
            className="mt-1 w-full min-w-0 max-w-full border border-fog px-2 py-2 text-base bg-white"
          >
            {IZTRO_TIME_SLOTS.map((slot) => (
              <option key={slot.index} value={slot.index}>
                {slot.label} · {slot.range}
              </option>
            ))}
          </select>
        </label>

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

        {err ? <p className="text-sm text-lacquer">{err}</p> : null}

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="submit"
            className="flex-1 py-3 text-sm text-white uppercase tracking-[0.2em]"
            style={{ background: primaryColor }}
          >
            Lập lá số
          </button>
          <button
            type="button"
            onClick={openFindHour}
            className="flex-1 py-3 text-sm border border-fog text-ink hover:border-ink/30"
          >
            Không rõ giờ — Tìm giờ sinh
          </button>
        </div>
      </form>

      {showFindHour ? (
        <TimGioSinhPanel
          primaryColor={primaryColor}
          candidates={hourCandidates}
          selectedTimeIndex={timeIndex}
          loading={findingHour}
          onSelect={selectBirthHour}
        />
      ) : null}

      {result && chartInput ? (
        <div className="space-y-5 min-w-0 max-w-full">
          <div className="border border-fog bg-paper p-5 md:p-6">
            <p
              className="text-[0.7rem] uppercase tracking-[0.25em]"
              style={{ color: primaryColor }}
            >
              Kết quả lá số
            </p>
            <h3 className="mt-2 font-display text-2xl text-ink">
              {result.fullName}
              <span className="ml-2 text-base text-muted font-sans">
                ({result.gender})
              </span>
            </h3>

            <dl className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-xs text-muted">Loại lịch</dt>
                <dd className="text-ink">{result.calendarLabel}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Phương pháp</dt>
                <dd className="text-ink">{result.yearDivideLabel}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Giờ sinh</dt>
                <dd className="text-ink">
                  {result.time}
                  <span className="text-muted"> · {result.timeRange}</span>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Dương lịch</dt>
                <dd className="text-ink tabular-nums">{result.solarDate}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Âm lịch</dt>
                <dd className="text-ink tabular-nums">{result.lunarDate}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Con giáp / cung hoàng đạo</dt>
                <dd className="text-ink">
                  {result.zodiac} · {result.sign}
                </dd>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <dt className="text-xs text-muted">Tứ trụ</dt>
                <dd className="text-ink font-medium">{result.chineseDate}</dd>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <dt className="text-xs text-muted">Cục / Mệnh thân</dt>
                <dd className="text-ink">
                  {result.fiveElementsClass} · chủ {result.soul} · thân{' '}
                  {result.body}
                </dd>
              </div>
            </dl>
          </div>

          <div
            className={
              chartFullscreen
                ? 'fixed inset-0 z-[200] bg-paper overflow-auto p-3 md:p-5'
                : 'space-y-5'
            }
          >
            <div
              className={
                chartFullscreen
                  ? 'mx-auto max-w-6xl space-y-4'
                  : 'space-y-5'
              }
            >
              <HoroscopeContextBar
                primaryColor={primaryColor}
                date={contextDate}
                timeIndex={contextTimeIndex}
                isFullscreen={chartFullscreen}
                onToggleFullscreen={() => setChartFullscreen((v) => !v)}
                onOpenChat={() => setChatOpen(true)}
                onShare={() => {
                  setExportError(null);
                  setShareOpen(true);
                }}
                onChange={({ date, timeIndex: t }) => {
                  setContextDate(date);
                  setContextTimeIndex(t);
                }}
              />

              <TuViChartBoard
                primaryColor={primaryColor}
                chart={result}
                horoscope={horoscope}
                temple={templeInfo}
              />

              <p className="text-[0.65rem] text-muted leading-none whitespace-nowrap overflow-x-auto no-scrollbar">
                ĐH: Đại hạn · TS: Trường Sinh · BS: Bác Sĩ · TQ: Tướng Quân
              </p>

              {!chartFullscreen ? (
                <TuViDetailPanel
                  primaryColor={primaryColor}
                  templeName={templeName}
                  templeId={templeId}
                  chart={result}
                  horoscope={horoscope}
                  palaceEssays={palaceEssays}
                  onPalaceEssaysChange={setPalaceEssays}
                  onRequestFullShare={() => {
                    setShareOpen(true);
                    void requestExport('full');
                  }}
                />
              ) : null}
            </div>
          </div>

          <TuViChatPanel
            key={chatSessionId}
            open={chatOpen}
            onClose={() => setChatOpen(false)}
            primaryColor={primaryColor}
            templeName={templeName}
            chart={result}
            horoscope={horoscope}
            onEssaysChange={setChatEssays}
            onOpenDetail12={() => {
              setChatOpen(false);
              document
                .getElementById('tuvi-detail-12')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          />

          {shareOpen ? (
            <div className="fixed inset-0 z-[310] flex items-end sm:items-center justify-center bg-ink/40 p-0 sm:p-4">
              <div
                className="w-full sm:max-w-md border border-fog bg-white shadow-xl p-4 space-y-3"
                role="dialog"
                aria-label="Chia sẻ lá số HTML"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p
                      className="text-[0.65rem] uppercase tracking-[0.2em]"
                      style={{ color: primaryColor }}
                    >
                      Xuất HTML
                    </p>
                    <p className="text-sm font-medium text-ink">
                      Chia sẻ / tải lá số
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={exporting}
                    onClick={() => setShareOpen(false)}
                    className="px-2 py-1 text-xs border border-fog text-muted"
                  >
                    Đóng
                  </button>
                </div>
                <button
                  type="button"
                  disabled={exporting}
                  onClick={() => void requestExport('chart')}
                  className="w-full text-left border border-fog px-3 py-3 hover:border-ink/30 disabled:opacity-50"
                >
                  <p className="text-sm font-medium text-ink">Chỉ lá số</p>
                  <p className="text-[0.7rem] text-muted mt-0.5">
                    Bìa, bảng 12 cung đầy đủ và đại hạn — file .html nhẹ, mở mọi
                    trình duyệt
                  </p>
                </button>
                <button
                  type="button"
                  disabled={exporting || !hasAnyInterpretation}
                  onClick={() => void requestExport('full')}
                  className="w-full text-left border border-fog px-3 py-3 hover:border-ink/30 disabled:opacity-50"
                  title={
                    !hasAnyInterpretation
                      ? 'Chưa có luận giải để đính kèm'
                      : undefined
                  }
                >
                  <p className="text-sm font-medium text-ink">
                    Lá số + luận giải
                  </p>
                  <p className="text-[0.7rem] text-muted mt-0.5">
                    {hasAnyInterpretation
                      ? 'Gồm chat luận giải và/hoặc 12 cung (nếu có)'
                      : 'Chưa có luận giải — hỏi trụ trì hoặc mở khóa 12 cung trước'}
                  </p>
                </button>
                {exporting ? (
                  <p className="text-xs text-muted">Đang tạo file HTML…</p>
                ) : null}
                {exportError ? (
                  <p className="text-xs text-red-700">{exportError}</p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
