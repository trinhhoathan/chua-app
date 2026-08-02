'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  IZTRO_PALACE_ORDER,
  IZTRO_TIME_SLOTS,
  YEAR_DIVIDE_OPTIONS,
  buildIztroChart,
  formatCanChi,
  type IztroChartInput,
  type IztroChartView,
  type IztroPalaceView,
  type IztroStarView,
  type YearDivideMethod,
} from '@/lib/fengshui/iztro-chart';
import {
  TUVI_SCHOOL_LABELS,
  buildTuViPromptContext,
  type TuViSchool,
  type TuViSchoolOption,
} from '@/lib/fengshui/tuvi-prompt';
import {
  buildPalacePhiTinh,
  buildPhiTinhPromptBlock,
  palacePhiByName,
  type PhiFlight,
  type PhiMutagen,
} from '@/lib/fengshui/tuvi-phi-tinh';
import { TuViChatPanel } from '@/components/fengshui/tools/TuViChatPanel';
import { TuViMarkdown } from '@/components/fengshui/tools/TuViMarkdown';
import { TuViTeaserFollowUps } from '@/components/fengshui/tools/TuViTeaserFollowUps';
import { resolveEssayFollowUps } from '@/lib/fengshui/tuvi-prompt';
import { openWaterDonateForm } from '@/lib/water-merit-prompt';
import { useSitePersona } from '@/components/SitePersonaContext';

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

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const now = new Date();
const YEARS = Array.from({ length: 120 }, (_, i) => now.getFullYear() - i);

const SCHOOL_OPTIONS: {
  id: TuViSchoolOption;
  hint: string;
}[] = [
  {
    id: 'bac_phai',
    hint: 'Cách cục · Tứ hóa · Tam hợp (không luận vận hạn)',
  },
  {
    id: 'nam_phai',
    hint: 'Cung và sao (không luận vận hạn)',
  },
  {
    id: 'phi_tinh',
    hint: 'Bay tinh theo can khung áp vào đương số',
  },
];

const MUTAGEN_BADGE: Record<string, string> = {
  Lộc: '#C44A1F',
  Quyền: '#2F6FE0',
  Khoa: '#1B6B3A',
  Kỵ: '#1A1A1A',
};

function mutagenBadgeColor(mutagen: string): string {
  const key = Object.keys(MUTAGEN_BADGE).find((k) => mutagen.includes(k));
  return key ? MUTAGEN_BADGE[key] : '#6B7280';
}

function MutagenChip({ mutagen }: { mutagen: PhiMutagen | string }) {
  return (
    <span
      className="inline-flex items-center justify-center w-[2.15rem] h-[0.95rem] text-[0.78em] font-medium leading-none text-white shrink-0"
      style={{ backgroundColor: mutagenBadgeColor(mutagen) }}
    >
      {mutagen}
    </span>
  );
}

function PhiFlightsLine({ flights }: { flights: PhiFlight[] }) {
  if (!flights.length) return null;
  return (
    <div className="mt-1 space-y-0.5 text-[0.72rem] leading-snug">
      <p className="text-[0.65rem] uppercase tracking-wide text-muted">
        Phi xuất
      </p>
      {flights.map((f) => (
        <p key={`${f.mutagen}-${f.starName}`} className="text-ink">
          <MutagenChip mutagen={f.mutagen} />
          <span className="ml-1">
            {f.starName}
            <span className="text-muted"> → </span>
            {f.self ? `${f.toPalaceName} (hồi)` : f.toPalaceName}
          </span>
        </p>
      ))}
    </div>
  );
}

function StarWithMutagen({
  star,
  showMutagen,
}: {
  star: IztroStarView;
  showMutagen: boolean;
}) {
  return (
    <span className="inline">
      {star.name}
      {star.brightness ? (
        <span className="ml-0.5 text-[0.85em] italic font-normal text-muted">
          {star.brightness}
        </span>
      ) : null}
      {showMutagen && star.mutagen ? (
        <span
          className="ml-1 inline-flex items-center justify-center align-middle w-[2.15rem] h-[0.95rem] text-[0.78em] font-medium leading-none text-white"
          style={{ backgroundColor: mutagenBadgeColor(star.mutagen) }}
          title={`Hóa ${star.mutagen}`}
        >
          {star.mutagen}
        </span>
      ) : null}
    </span>
  );
}

function StarList({
  stars,
  showMutagen,
  emptyLabel,
  muted,
}: {
  stars: IztroStarView[];
  showMutagen: boolean;
  emptyLabel?: string;
  muted?: boolean;
}) {
  if (!stars.length) {
    return emptyLabel ? (
      <p className={`text-[0.8rem] ${muted ? 'text-muted' : 'text-ink'}`}>
        <span className="text-muted">{emptyLabel}</span>
      </p>
    ) : null;
  }
  return (
    <p
      className={`text-[0.8rem] leading-snug ${
        muted ? 'text-muted' : 'text-ink'
      }`}
    >
      {stars.map((star, i) => (
        <span key={`${star.name}-${i}`}>
          {i > 0 ? ', ' : null}
          <StarWithMutagen star={star} showMutagen={showMutagen} />
        </span>
      ))}
    </p>
  );
}

function PalaceStarsBlock({
  palace,
  showMutagen,
}: {
  palace: IztroPalaceView;
  showMutagen: boolean;
}) {
  const majors = palace.majorStars;
  const minors = [...palace.minorStars, ...palace.adjectiveStars];
  return (
    <div className="space-y-1">
      <StarList
        stars={majors}
        showMutagen={showMutagen}
        emptyLabel="Không có chính tinh"
      />
      <StarList stars={minors} showMutagen={showMutagen} muted />
    </div>
  );
}

export function LuanGiaiTuVi({
  primaryColor,
  templeId,
  templeName,
  templeHotline,
  templePhone,
}: Props) {
  const persona = useSitePersona();
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

  const [chartInput, setChartInput] = useState<IztroChartInput | null>(null);
  const [result, setResult] = useState<IztroChartView | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [school, setSchool] = useState<TuViSchool>('bac_phai');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatSessionId, setChatSessionId] = useState(0);

  const [menhText, setMenhText] = useState('');
  const [menhLoading, setMenhLoading] = useState(false);
  const [menhError, setMenhError] = useState<string | null>(null);
  const [menhTeasers, setMenhTeasers] = useState<string[]>([]);
  const menhAbort = useRef<AbortController | null>(null);

  const chartContext = useMemo(() => {
    if (!result) return '';
    const base = buildTuViPromptContext(result, null, { noVanHan: true });
    if (school !== 'phi_tinh') return base;
    const phi = buildPhiTinhPromptBlock(result);
    return phi ? `${base}\n\n${phi}` : base;
  }, [result, school]);

  const menhPalace = useMemo(
    () => result?.palaces.find((p) => p.isSoulPalace || p.name === 'Mệnh'),
    [result],
  );

  const orderedPalaces = useMemo(() => {
    if (!result) return [] as IztroPalaceView[];
    const byName = new Map(result.palaces.map((p) => [p.name, p]));
    return IZTRO_PALACE_ORDER.map((name) => byName.get(name)).filter(
      Boolean,
    ) as IztroPalaceView[];
  }, [result]);

  const phiByPalace = useMemo(() => {
    if (!result || school !== 'phi_tinh') {
      return new Map<string, ReturnType<typeof buildPalacePhiTinh>[number]>();
    }
    return palacePhiByName(buildPalacePhiTinh(result));
  }, [result, school]);

  useEffect(() => {
    return () => {
      menhAbort.current?.abort();
    };
  }, []);

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
      setChatOpen(false);
      setChatSessionId((k) => k + 1);
      setMenhText('');
      setMenhError(null);
      setMenhTeasers([]);
      menhAbort.current?.abort();
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

  function selectSchool(id: TuViSchoolOption) {
    if (id === school) return;
    setSchool(id);
    setMenhText('');
    setMenhError(null);
    setMenhTeasers([]);
    setChatSessionId((k) => k + 1);
    setChatOpen(false);
  }

  async function runMenh() {
    if (!menhPalace || !chartContext || menhLoading) return;
    menhAbort.current?.abort();
    const controller = new AbortController();
    menhAbort.current = controller;
    setMenhLoading(true);
    setMenhError(null);
    setMenhText('');
    setMenhTeasers([]);
    const menhQuestion = 'Luận giải chuyên sâu cung Mệnh trên lá số này.';
    try {
      const res = await fetch('/api/tuvi/luan-giai-cung', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          palaceName: menhPalace.name,
          palaceIndex: menhPalace.index,
          chartContext,
          templeName,
          freeTeaser: true,
          school,
          noVanHan: true,
          stream: true,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error || 'Không luận được cung Mệnh.');
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error('Không nhận được phản hồi luận giải.');
      const decoder = new TextDecoder();
      let acc = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMenhText(acc);
      }
      if (!acc.trim()) {
        throw new Error('Phản hồi luận giải trống.');
      }
      const resolved = resolveEssayFollowUps(acc, menhQuestion, 'menh', 5);
      setMenhText(resolved.body || acc);
      setMenhTeasers(resolved.suggestions);
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      setMenhError(
        e instanceof Error ? e.message : 'Không luận thử được cung Mệnh.',
      );
    } finally {
      setMenhLoading(false);
      menhAbort.current = null;
    }
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
          Thông tin lập lá số để luận giải
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

        <button
          type="submit"
          className="w-full py-3 text-sm text-white uppercase tracking-[0.2em]"
          style={{ background: primaryColor }}
        >
          Lập lá số & luận giải
        </button>
      </form>

      {result && chartInput ? (
        <div className="space-y-5 min-w-0 max-w-full">
          <div className="border border-fog bg-paper p-5 md:p-6">
            <p
              className="text-[0.7rem] uppercase tracking-[0.25em]"
              style={{ color: primaryColor }}
            >
              Lá số · luận giải
            </p>
            <h3 className="mt-2 font-display text-2xl text-ink">
              {result.fullName}
              <span className="ml-2 text-base text-muted font-sans">
                ({result.gender})
              </span>
            </h3>
            <dl className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-xs text-muted">Dương lịch</dt>
                <dd className="text-ink tabular-nums">{result.solarDate}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Âm lịch</dt>
                <dd className="text-ink tabular-nums">{result.lunarDate}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Giờ sinh</dt>
                <dd className="text-ink">
                  {result.time}
                  <span className="text-muted"> · {result.timeRange}</span>
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

          <div className="border border-fog bg-white p-4 md:p-5 space-y-3">
            <div>
              <p
                className="text-[0.7rem] uppercase tracking-[0.25em]"
                style={{ color: primaryColor }}
              >
                Hướng luận
              </p>
              <p className="mt-1 text-sm text-muted">
                Chọn phương pháp xem. Phần này không luận vận hạn — chỉ luận
                cung / sao / cách cục hoặc phi tinh tùy hướng.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SCHOOL_OPTIONS.map((opt) => {
                const active = school === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    title={TUVI_SCHOOL_LABELS[opt.id]}
                    onClick={() => selectSchool(opt.id)}
                    className="text-left border px-3 py-2.5"
                    style={
                      active
                        ? {
                            background: primaryColor,
                            borderColor: primaryColor,
                            color: '#fff',
                          }
                        : undefined
                    }
                  >
                    <span className="block text-sm font-medium">
                      {TUVI_SCHOOL_LABELS[opt.id]}
                    </span>
                    <span
                      className={`mt-0.5 block text-[0.7rem] leading-snug ${
                        active ? 'text-white/85' : 'text-muted'
                      }`}
                    >
                      {opt.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border border-fog bg-white p-4 md:p-5 space-y-3">
            <div>
              <p
                className="text-[0.7rem] uppercase tracking-[0.25em]"
                style={{ color: primaryColor }}
              >
                12 cung · sao
              </p>
              <p className="mt-1 text-sm text-muted">
                Tóm tắt cung và sao để đối chiếu khi đọc luận giải. Xem bảng lá
                số đầy đủ tại{' '}
                <a
                  href="/phong-thuy/lap-la-so-tu-vi"
                  className="underline underline-offset-2"
                  style={{ color: primaryColor }}
                >
                  Lập lá số tử vi
                </a>
                .
              </p>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {orderedPalaces.map((palace) => {
                const isMenh = palace.isSoulPalace;
                const isThan = palace.isBodyPalace;
                const accent = isMenh
                  ? '#c41e3a'
                  : isThan
                    ? '#0284c7'
                    : undefined;
                return (
                  <li
                    key={palace.name}
                    className={`bg-paper px-3 py-2.5 text-sm min-w-0 flex flex-col gap-1.5 ${
                      accent ? 'border-2' : 'border border-fog'
                    }`}
                    style={accent ? { borderColor: accent } : undefined}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-ink leading-tight">
                          {palace.name}
                        </p>
                        <p className="text-[0.65rem] text-muted leading-tight mt-0.5">
                          {formatCanChi(
                            palace.heavenlyStem,
                            palace.earthlyBranch,
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 shrink-0">
                        {isMenh ? (
                          <span
                            className="text-[0.65rem] leading-none px-1.5 py-0.5 text-white"
                            style={{ background: '#c41e3a' }}
                          >
                            Mệnh
                          </span>
                        ) : null}
                        {isThan ? (
                          <span
                            className="text-[0.65rem] leading-none px-1.5 py-0.5 text-white"
                            style={{ background: '#0284c7' }}
                          >
                            Thân
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <PalaceStarsBlock
                      palace={palace}
                      showMutagen={school === 'bac_phai'}
                    />
                    {school === 'phi_tinh' ? (
                      <PhiFlightsLine
                        flights={phiByPalace.get(palace.name)?.flights ?? []}
                      />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="border border-fog bg-paper p-4 md:p-5 space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p
                  className="text-[0.7rem] uppercase tracking-[0.25em]"
                  style={{ color: primaryColor }}
                >
                  Luận cung Mệnh (mẫu)
                </p>
                <p className="mt-1 text-sm text-muted">
                  {menhPalace
                    ? `Xem thử miễn phí cung ${menhPalace.name} theo ${TUVI_SCHOOL_LABELS[school]} — không luận vận hạn.`
                    : 'Không tìm thấy cung Mệnh trên lá số.'}
                </p>
              </div>
              <button
                type="button"
                disabled={!menhPalace || menhLoading}
                onClick={() => void runMenh()}
                className="px-3 py-2 text-sm text-white disabled:opacity-50"
                style={{ background: primaryColor }}
              >
                {menhLoading ? 'Đang luận…' : 'Luận cung Mệnh'}
              </button>
            </div>
            {menhPalace ? (
              <div className="space-y-1">
                <p className="text-sm text-muted">
                  {formatCanChi(
                    menhPalace.heavenlyStem,
                    menhPalace.earthlyBranch,
                  )}
                </p>
                <PalaceStarsBlock
                  palace={menhPalace}
                  showMutagen={school === 'bac_phai'}
                />
                {school === 'phi_tinh' ? (
                  <PhiFlightsLine
                    flights={phiByPalace.get(menhPalace.name)?.flights ?? []}
                  />
                ) : null}
              </div>
            ) : null}
            {menhError ? (
              <p className="text-sm text-lacquer">{menhError}</p>
            ) : null}
            {menhText || menhLoading ? (
              <div className="border border-fog bg-white p-3 md:p-4">
                {menhLoading && !menhText ? (
                  <p className="text-sm text-muted">
                    {persona.thinkingLabel} cung Mệnh…
                  </p>
                ) : (
                  <>
                    <TuViMarkdown
                      text={menhText}
                      primaryColor={primaryColor}
                      className="text-ink"
                    />
                    {menhLoading ? (
                      <span
                        className="inline-block w-[0.45em] h-[1em] ml-0.5 align-[-0.1em] animate-pulse"
                        style={{ backgroundColor: primaryColor }}
                        aria-hidden
                      />
                    ) : null}
                    {!menhLoading && menhTeasers.length > 0 ? (
                      <TuViTeaserFollowUps
                        suggestions={menhTeasers}
                        primaryColor={primaryColor}
                        notePrefix="Hỏi sâu luận giải tử vi"
                        contactPhone={contactPhone}
                      />
                    ) : null}
                  </>
                )}
              </div>
            ) : null}

            {persona.upsell === 'sim' ? (
              <div className="border border-fog bg-white p-3 space-y-2 text-sm">
                <p className="font-medium text-ink">
                  Muốn luận 12 cung hoặc chuyên sâu hơn?
                </p>
                <ul className="text-[0.8rem] text-muted space-y-1 list-disc pl-4">
                  <li>
                    Gọi {persona.displayName} tư vấn trực tiếp
                    {contactPhone ? (
                      <>
                        {' '}
                        qua{' '}
                        <a
                          href={`tel:${contactPhone.replace(/\s+/g, '')}`}
                          className="underline underline-offset-2"
                          style={{ color: primaryColor }}
                        >
                          {contactPhone}
                        </a>
                      </>
                    ) : null}
                  </li>
                  <li>
                    Chọn số trong Kho Sim Phong Thủy — từng sim đã được chấm
                    điểm hợp mệnh sẵn
                  </li>
                </ul>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href="/sim"
                    className="px-3 py-2 text-sm text-white"
                    style={{ background: primaryColor }}
                  >
                    Xem kho sim hợp mệnh
                  </a>
                  {contactPhone ? (
                    <a
                      href={`tel:${contactPhone.replace(/\s+/g, '')}`}
                      className="px-3 py-2 text-sm border border-fog text-ink"
                    >
                      {persona.callLabel}
                    </a>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="border border-fog bg-white p-3 space-y-2 text-sm">
                <p className="font-medium text-ink">
                  Muốn luận 12 cung hoặc chuyên sâu hơn?
                </p>
                <ul className="text-[0.8rem] text-muted space-y-1 list-disc pl-4">
                  <li>
                    Thỉnh nước ủng hộ chùa để mở khóa luận đầy đủ
                  </li>
                  <li>
                    Liên hệ hỏi trụ trì trực tiếp
                    {contactPhone ? (
                      <>
                        {' '}
                        qua{' '}
                        <a
                          href={`tel:${contactPhone.replace(/\s+/g, '')}`}
                          className="underline underline-offset-2"
                          style={{ color: primaryColor }}
                        >
                          {contactPhone}
                        </a>
                      </>
                    ) : (
                      ' qua số điện thoại nhà chùa'
                    )}
                  </li>
                  <li>
                    Hỏi trụ trì thêm trong chat — miễn phí 3 câu; từ câu thứ 4
                    cần thỉnh nước để hỏi tiếp
                  </li>
                </ul>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      openWaterDonateForm({
                        note: 'Mở khóa luận giải 12 cung tử vi',
                        qty: 10,
                      })
                    }
                    className="px-3 py-2 text-sm text-white"
                    style={{ background: primaryColor }}
                  >
                    Thỉnh nước
                  </button>
                  {contactPhone ? (
                    <a
                      href={`tel:${contactPhone.replace(/\s+/g, '')}`}
                      className="px-3 py-2 text-sm border border-fog text-ink"
                    >
                      Gọi trụ trì
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setChatOpen(true)}
                    className="px-3 py-2 text-sm border border-fog text-ink"
                  >
                    Hỏi trụ trì thêm
                  </button>
                </div>
              </div>
            )}
          </div>

          <TuViChatPanel
            key={`${chatSessionId}-${school}`}
            open={chatOpen}
            onClose={() => setChatOpen(false)}
            primaryColor={primaryColor}
            templeName={templeName}
            templeId={templeId}
            contactPhone={contactPhone}
            chart={result}
            horoscope={null}
            school={school}
            noVanHan
            freeQuestionLimit={3}
          />
        </div>
      ) : null}
    </div>
  );
}
