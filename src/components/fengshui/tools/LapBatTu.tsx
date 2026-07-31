'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  IZTRO_TIME_SLOTS,
  YEAR_DIVIDE_OPTIONS,
  buildIztroChart,
  type IztroChartInput,
  type IztroChartView,
  type YearDivideMethod,
} from '@/lib/fengshui/iztro-chart';
import {
  NGU_HANH_COLOR,
  NGU_HANH_ORDER,
} from '@/lib/fengshui/nap-am-ngu-hanh';
import {
  buildBatTu,
  buildBatTuPromptContext,
  type BatTuView,
} from '@/lib/fengshui/bat-tu';
import {
  resolveEssayFollowUps,
  splitTuViReply,
} from '@/lib/fengshui/tuvi-prompt';
import { TuViChatPanel } from '@/components/fengshui/tools/TuViChatPanel';
import { TuViMarkdown } from '@/components/fengshui/tools/TuViMarkdown';
import { TuViTeaserFollowUps } from '@/components/fengshui/tools/TuViTeaserFollowUps';
import { openWaterDonateForm } from '@/lib/water-merit-prompt';

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

function hanhColor(hanh: string): string {
  return NGU_HANH_COLOR[hanh as keyof typeof NGU_HANH_COLOR] ?? '#6B7280';
}

function HanhChip({ hanh }: { hanh: string }) {
  return (
    <span
      className="inline-flex items-center justify-center px-1.5 h-5 text-[0.72rem] font-medium text-white shrink-0"
      style={{ backgroundColor: hanhColor(hanh) }}
    >
      {hanh}
    </span>
  );
}

/** Tách khỏi trang chính — stream không re-render form/bảng. */
function BatTuEssaySection({
  chartContext,
  templeName,
  primaryColor,
  onAskMore,
}: {
  chartContext: string;
  templeName: string;
  primaryColor: string;
  onAskMore: () => void;
}) {
  const [essay, setEssay] = useState('');
  const [essayLoading, setEssayLoading] = useState(false);
  const [essayError, setEssayError] = useState<string | null>(null);
  const [teasers, setTeasers] = useState<string[]>([]);
  const [cooldownSec, setCooldownSec] = useState(0);
  const essayAbort = useRef<AbortController | null>(null);
  const rafRef = useRef(0);
  const pendingRef = useRef('');
  const questionRef = useRef('');

  useEffect(() => {
    return () => {
      essayAbort.current?.abort();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (cooldownSec <= 0) return;
    const t = window.setTimeout(() => setCooldownSec((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldownSec]);

  function paintEssay(raw: string) {
    pendingRef.current = raw;
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      setEssay(splitTuViReply(pendingRef.current).body);
    });
  }

  async function runEssay() {
    if (!chartContext || essayLoading || cooldownSec > 0) return;
    essayAbort.current?.abort();
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    const controller = new AbortController();
    essayAbort.current = controller;
    setEssayLoading(true);
    setEssayError(null);
    setEssay('');
    setTeasers([]);
    pendingRef.current = '';

    const question =
      'Hãy luận giải chuyên sâu lá số Bát tự Tứ trụ của tôi: nhật chủ và lệnh tháng (được lệnh hay thất lệnh), tổ hợp thập thần nổi bật trên can và tàng can ảnh hưởng gì tới tính cách – công danh – tài lộc – hôn nhân – lục thân, thần sát và không vong điểm xuyết, thân cường nhược với dụng – hỷ – kỵ thần, rồi luận đại vận đang đi và lưu niên năm nay, kèm lời khuyên ứng dụng thực tế. Không luận sao cung Tử Vi đẩu số.';
    questionRef.current = question;

    try {
      const res = await fetch('/api/tuvi/luan-giai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          question,
          chartContext,
          history: [],
          templeName,
          batTuFocus: true,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
          retryAfterSec?: number;
        } | null;
        if (res.status === 429) {
          setCooldownSec(Math.max(3, data?.retryAfterSec ?? 12));
        }
        throw new Error(data?.error || 'Không luận được lá số Bát tự.');
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error('Không nhận được phản hồi luận giải.');
      const decoder = new TextDecoder();
      let acc = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        paintEssay(acc);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      const resolved = resolveEssayFollowUps(
        acc,
        questionRef.current,
        'bat_tu',
        5,
      );
      setEssay(resolved.body || acc);
      setTeasers(resolved.suggestions);
      if (!acc.trim()) throw new Error('Phản hồi luận giải trống.');
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      setEssayError(
        e instanceof Error
          ? e.message
          : 'Không kết nối được để luận lá số Bát tự.',
      );
    } finally {
      setEssayLoading(false);
      essayAbort.current = null;
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={essayLoading || cooldownSec > 0}
          onClick={() => void runEssay()}
          className="px-4 py-2.5 text-sm text-white disabled:opacity-50"
          style={{ background: primaryColor }}
        >
          {essayLoading
            ? 'Đang luận…'
            : cooldownSec > 0
              ? `Chờ ${cooldownSec}s`
              : 'Luận giải lá số Bát tự'}
        </button>
        <button
          type="button"
          onClick={onAskMore}
          className="px-4 py-2.5 text-sm border border-fog text-ink"
        >
          Hỏi trụ trì thêm
        </button>
        <button
          type="button"
          onClick={() =>
            openWaterDonateForm({
              note: 'Hỏi sâu lá số Bát tự',
              qty: 10,
            })
          }
          className="px-4 py-2.5 text-sm border border-fog text-ink"
        >
          Thỉnh nước hỏi sâu
        </button>
      </div>

      {essayError ? (
        <p className="text-sm text-lacquer">{essayError}</p>
      ) : null}
      {essay || essayLoading ? (
        <div className="border border-fog bg-white p-4 md:p-5">
          {essayLoading && !essay ? (
            <p className="text-sm text-muted">
              Trụ trì đang luận lá số Bát tự…
            </p>
          ) : (
            <>
              <TuViMarkdown
                text={essay}
                primaryColor={primaryColor}
                className="text-ink"
              />
              {essayLoading ? (
                <span
                  className="inline-block w-[0.45em] h-[1em] ml-0.5 align-[-0.1em] animate-pulse"
                  style={{ backgroundColor: primaryColor }}
                  aria-hidden
                />
              ) : null}
              {!essayLoading && teasers.length > 0 ? (
                <TuViTeaserFollowUps
                  suggestions={teasers}
                  primaryColor={primaryColor}
                  notePrefix="Hỏi sâu lá số Bát tự"
                />
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

function SectionLabel({
  children,
  primaryColor,
}: {
  children: React.ReactNode;
  primaryColor: string;
}) {
  return (
    <p
      className="text-[0.7rem] uppercase tracking-[0.25em]"
      style={{ color: primaryColor }}
    >
      {children}
    </p>
  );
}

export function LapBatTu({
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
    useState<YearDivideMethod>('tiet_khi');

  const [view, setView] = useState<BatTuView | null>(null);
  const [chart, setChart] = useState<IztroChartView | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatSessionId, setChatSessionId] = useState(0);
  const [selectedDv, setSelectedDv] = useState(0);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const chartContext = useMemo(
    () => (view ? buildBatTuPromptContext(view) : ''),
    [view],
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (fullName.trim().length < 2) {
      setErr('Vui lòng nhập họ và tên.');
      return;
    }
    const input: IztroChartInput = {
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
    try {
      const v = buildBatTu(input);
      setView(v);
      setChart(buildIztroChart(input));
      const dvIdx =
        v.currentDaiVanIndex >= 0
          ? v.currentDaiVanIndex
          : v.daiVans.findIndex((dv) => Boolean(dv.canChi));
      setSelectedDv(Math.max(0, dvIdx));
      setSelectedYear(
        v.currentDaiVanIndex >= 0 && dvIdx === v.currentDaiVanIndex
          ? v.currentYear
          : (v.daiVans[Math.max(0, dvIdx)]?.luuNiens[0]?.year ?? null),
      );
      setChatOpen(false);
      setChatSessionId((n) => n + 1);
    } catch {
      setErr('Không lập được lá số. Kiểm tra ngày tháng năm rồi thử lại.');
    }
  }

  const dv = view?.daiVans[selectedDv] ?? null;
  const luuNien =
    dv?.luuNiens.find((ln) => ln.year === selectedYear) ?? null;

  const thanSatByTru = useMemo(() => {
    const map: Record<string, string[]> = {
      Năm: [], Tháng: [], Ngày: [], Giờ: [],
    };
    for (const ts of view?.thanSats ?? []) {
      for (const tru of ts.viTri) map[tru]?.push(ts.name);
    }
    return map;
  }, [view]);

  const maxPercent = view
    ? Math.max(1, ...NGU_HANH_ORDER.map((h) => view.percent[h]))
    : 1;

  return (
    <div className="space-y-8 min-w-0 max-w-full">
      <form
        onSubmit={submit}
        className="border border-fog bg-white p-5 md:p-6 space-y-4 min-w-0"
      >
        <p
          className="text-[0.72rem] uppercase tracking-[0.25em]"
          style={{ color: primaryColor }}
        >
          Thông tin để lập lá số Bát tự
        </p>
        <p className="text-sm text-muted">
          Lập Tứ trụ Tử Bình từ ngày giờ sinh — đầy đủ thập thần, tàng can,
          nạp âm, trường sinh, không vong, thần sát, đại vận · lưu niên · lưu
          nguyệt, kèm luận giải.
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
              title={opt.hint}
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
        <p className="text-[0.75rem] text-muted -mt-2">
          {YEAR_DIVIDE_OPTIONS.find((o) => o.id === yearDivide)?.hint} — Bát
          tự Tử Bình chuẩn dùng tiết khí.
        </p>

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
          Lập lá số Bát tự
        </button>
      </form>

      {view ? (
        <div className="space-y-5">
          {/* Header */}
          <div className="border border-fog bg-paper p-4 md:p-5 space-y-2">
            <SectionLabel primaryColor={primaryColor}>
              Lá số Bát tự Tứ trụ
            </SectionLabel>
            <h3 className="mt-1 font-display text-xl text-ink">
              {view.fullName}
              <span className="ml-2 text-base font-sans text-muted">
                ({view.gender})
              </span>
            </h3>
            <p className="text-sm text-muted">
              Sinh {view.solarDate} · âm {view.lunarDate} · {view.timeLabel} ·
              tuổi {view.zodiac} · chia năm{' '}
              {view.yearDivideLabel.toLowerCase()}
            </p>
            <p className="text-sm text-ink">
              Nhật chủ{' '}
              <strong>
                {view.nhatChu} ({view.nhatChuHanh} {view.nhatChuAmDuong})
              </strong>{' '}
              · sinh tháng {view.pillars[1].chi} mùa {view.cuongNhuoc.mua} —
              lệnh tháng {view.cuongNhuoc.lenhThang} · mệnh nạp âm{' '}
              <strong>{view.menhNapAm}</strong>
            </p>
          </div>

          {/* Lệnh bài tứ trụ */}
          <div className="border border-fog bg-white overflow-x-auto">
            <div className="px-4 pt-4 pb-2">
              <SectionLabel primaryColor={primaryColor}>
                Tứ trụ · thập thần · tàng can · nạp âm
              </SectionLabel>
            </div>
            <table className="w-full text-sm text-center min-w-[36rem]">
              <thead>
                <tr className="border-y border-fog text-xs text-muted">
                  <th className="px-2 py-2 font-medium text-left w-24">
                    Trụ
                  </th>
                  {view.pillars.map((p) => (
                    <th
                      key={p.tru}
                      className="px-2 py-2 font-medium"
                      style={
                        p.tru === 'Ngày'
                          ? { color: primaryColor }
                          : undefined
                      }
                    >
                      {p.tru === 'Ngày' ? 'Ngày (Nhật chủ)' : p.tru}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-fog/70">
                  <td className="px-2 py-2 text-left text-xs text-muted">
                    Thập thần
                  </td>
                  {view.pillars.map((p) => (
                    <td key={p.tru} className="px-2 py-2 text-xs text-ink">
                      {p.thapThanCan}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-fog/70">
                  <td className="px-2 py-2 text-left text-xs text-muted">
                    Thiên can
                  </td>
                  {view.pillars.map((p) => (
                    <td key={p.tru} className="px-2 py-2">
                      <span
                        className="font-display text-2xl"
                        style={{ color: hanhColor(p.canHanh) }}
                      >
                        {p.can}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-fog/70">
                  <td className="px-2 py-2 text-left text-xs text-muted">
                    Địa chi
                  </td>
                  {view.pillars.map((p) => (
                    <td key={p.tru} className="px-2 py-2">
                      <span
                        className="font-display text-2xl"
                        style={{ color: hanhColor(p.chiHanh) }}
                      >
                        {p.chi}
                      </span>
                      {p.isKhongVong ? (
                        <span className="block text-[0.65rem] text-muted">
                          Không vong
                        </span>
                      ) : null}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-fog/70 align-top">
                  <td className="px-2 py-2 text-left text-xs text-muted">
                    Tàng can
                  </td>
                  {view.pillars.map((p) => (
                    <td key={p.tru} className="px-2 py-2">
                      {p.tangCan.map((tc) => (
                        <p
                          key={tc.can}
                          className="text-[0.72rem] leading-snug"
                        >
                          <span
                            className="font-medium"
                            style={{ color: hanhColor(tc.hanh) }}
                          >
                            {tc.can}
                          </span>{' '}
                          <span className="text-muted">{tc.thapThan}</span>
                        </p>
                      ))}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-fog/70">
                  <td className="px-2 py-2 text-left text-xs text-muted">
                    Nạp âm
                  </td>
                  {view.pillars.map((p) => (
                    <td key={p.tru} className="px-2 py-2 text-xs text-ink">
                      {p.napAm}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-fog/70">
                  <td className="px-2 py-2 text-left text-xs text-muted">
                    Trường sinh
                  </td>
                  {view.pillars.map((p) => (
                    <td key={p.tru} className="px-2 py-2 text-xs text-ink">
                      {p.truongSinh}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-2 py-2 text-left text-xs text-muted">
                    Thần sát
                  </td>
                  {view.pillars.map((p) => (
                    <td
                      key={p.tru}
                      className="px-2 py-2 text-[0.7rem] text-ink"
                    >
                      {thanSatByTru[p.tru].length
                        ? thanSatByTru[p.tru].join(' · ')
                        : '—'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            <p className="px-4 py-2 text-[0.72rem] text-muted border-t border-fog/70">
              Không vong (tuần không trụ ngày): {view.khongVong.join(', ')} —
              chi nào trong tứ trụ rơi vào đây được đánh dấu ở trên.
            </p>
          </div>

          {/* Thai nguyên · mệnh cung · thân cung */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(
              [
                {
                  label: 'Thai nguyên',
                  value: view.thaiNguyen,
                  napAm: view.thaiNguyenNapAm,
                  hint: 'Can chi tháng thụ thai — gốc rễ bẩm sinh.',
                },
                {
                  label: 'Mệnh cung',
                  value: view.menhCung,
                  napAm: view.menhCungNapAm,
                  hint: 'Cung an mệnh — nơi tinh thần nương náu.',
                },
                {
                  label: 'Thân cung',
                  value: view.thanCung,
                  napAm: view.thanCungNapAm,
                  hint: 'Cung an thân — chủ nửa đời sau.',
                },
              ]
            ).map((c) => (
              <div
                key={c.label}
                className="border border-fog bg-white p-4 space-y-1"
              >
                <SectionLabel primaryColor={primaryColor}>
                  {c.label}
                </SectionLabel>
                <p className="text-lg font-medium text-ink">{c.value}</p>
                <p className="text-xs text-muted">{c.napAm}</p>
                <p className="text-[0.72rem] text-muted leading-snug">
                  {c.hint}
                </p>
              </div>
            ))}
          </div>

          {/* Cân ngũ hành + thân cường nhược */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="border border-fog bg-white p-4 md:p-5 space-y-2">
              <SectionLabel primaryColor={primaryColor}>
                Cân ngũ hành (có trọng số tàng can)
              </SectionLabel>
              <div className="space-y-1.5">
                {NGU_HANH_ORDER.map((h) => (
                  <div key={h} className="flex items-center gap-2 text-sm">
                    <span className="w-10 shrink-0 text-ink">{h}</span>
                    <div className="flex-1 h-3 bg-mist">
                      <div
                        className="h-full"
                        style={{
                          width: `${(view.percent[h] / maxPercent) * 100}%`,
                          backgroundColor: NGU_HANH_COLOR[h],
                        }}
                      />
                    </div>
                    <span className="w-12 text-right tabular-nums text-muted">
                      {view.percent[h]}%
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-ink">
                Vượng nhất: <strong>{view.vuongNhat}</strong>.{' '}
                {view.khuyet.length ? (
                  <>
                    Khuyết hẳn: <strong>{view.khuyet.join(', ')}</strong>.
                  </>
                ) : (
                  'Không khuyết hành nào.'
                )}
              </p>
            </div>

            <div
              className="border-2 bg-white p-4 md:p-5 space-y-2"
              style={{ borderColor: primaryColor }}
            >
              <SectionLabel primaryColor={primaryColor}>
                Thân cường nhược · dụng thần
              </SectionLabel>
              <p className="text-lg font-medium text-ink">
                {view.cuongNhuoc.verdictLabel}
              </p>
              <p className="text-[0.8rem] text-muted leading-snug">
                {view.cuongNhuoc.verdictReason}
              </p>
              <p className="text-sm text-ink flex items-center gap-1.5 flex-wrap">
                Dụng thần: <HanhChip hanh={view.cuongNhuoc.dungThan} />
                <span className="text-muted text-xs">
                  ({view.cuongNhuoc.dungThanNhom})
                </span>
              </p>
              <p className="text-sm text-ink flex items-center gap-1.5 flex-wrap">
                Hỷ thần:{' '}
                {view.cuongNhuoc.hyThan.map((h) => (
                  <HanhChip key={h} hanh={h} />
                ))}
                <span className="mx-1 text-muted">·</span>
                Kỵ thần:{' '}
                {view.cuongNhuoc.kyThan.map((h) => (
                  <HanhChip key={h} hanh={h} />
                ))}
              </p>
              {view.cuongNhuoc.dieuHau ? (
                <p className="text-[0.75rem] text-muted leading-snug">
                  {view.cuongNhuoc.dieuHau}
                </p>
              ) : null}
              <p className="text-[0.75rem] text-muted">
                Xem ứng dụng chi tiết (màu, hướng, nghề) tại{' '}
                <a
                  href="/phong-thuy/tim-dung-than"
                  className="underline underline-offset-2"
                  style={{ color: primaryColor }}
                >
                  Tìm dụng thần
                </a>
                .
              </p>
            </div>
          </div>

          {/* Đại vận */}
          <div className="border border-fog bg-white">
            <div className="px-4 pt-4 pb-2 space-y-1">
              <SectionLabel primaryColor={primaryColor}>
                Đại vận (10 năm một vận)
              </SectionLabel>
              <p className="text-[0.8rem] text-muted">
                Khởi vận sau {view.khoiVan.years} năm {view.khoiVan.months}{' '}
                tháng {view.khoiVan.days} ngày (khoảng{' '}
                {view.khoiVan.solarDate}) · chiều{' '}
                {view.khoiVan.forward ? 'thuận' : 'nghịch'} · vận trình tính
                theo tiết khí. Bấm vào một vận để xem lưu niên.
              </p>
            </div>
            <div className="overflow-x-auto">
              <div className="flex min-w-max gap-0 px-4 pb-4 pt-1">
                {view.daiVans.map((d, i) => {
                  const active = i === selectedDv;
                  const current = i === view.currentDaiVanIndex;
                  return (
                    <button
                      key={d.index}
                      type="button"
                      onClick={() => {
                        setSelectedDv(i);
                        setSelectedYear(
                          current &&
                            view.currentYear >= d.startYear &&
                            view.currentYear <= d.endYear
                            ? view.currentYear
                            : (d.luuNiens[0]?.year ?? null),
                        );
                      }}
                      className="w-24 shrink-0 border px-1.5 py-2 text-center space-y-0.5"
                      style={{
                        borderColor: active ? primaryColor : 'var(--fog)',
                        background: active ? `${primaryColor}0d` : '#fff',
                        marginLeft: i === 0 ? 0 : -1,
                      }}
                    >
                      <span className="block text-[0.68rem] text-muted">
                        {d.startYear}
                        {current ? ' ●' : ''}
                      </span>
                      <span className="block text-[0.68rem] text-muted">
                        {d.startAge}–{d.endAge} tuổi
                      </span>
                      {d.canChi ? (
                        <>
                          <span className="block text-sm font-medium text-ink">
                            {d.canChi}
                          </span>
                          <span
                            className="block text-[0.68rem]"
                            style={{ color: primaryColor }}
                          >
                            {d.thapThanCan}
                          </span>
                          <span className="block text-[0.65rem] text-muted">
                            {d.truongSinh}
                          </span>
                        </>
                      ) : (
                        <span className="block text-[0.7rem] text-muted leading-snug">
                          Trước
                          <br />
                          khởi vận
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Lưu niên của đại vận đang chọn */}
          {dv ? (
            <div className="border border-fog bg-white">
              <div className="px-4 pt-4 pb-2">
                <SectionLabel primaryColor={primaryColor}>
                  Lưu niên {dv.canChi ? `· đại vận ${dv.canChi}` : '· trước khởi vận'}{' '}
                  ({dv.startYear}–{dv.endYear})
                </SectionLabel>
              </div>
              <div className="overflow-x-auto">
                <div className="flex min-w-max gap-0 px-4 pb-4 pt-1">
                  {dv.luuNiens.map((ln, i) => {
                    const active = ln.year === selectedYear;
                    const current = ln.year === view.currentYear;
                    return (
                      <button
                        key={ln.year}
                        type="button"
                        onClick={() => setSelectedYear(ln.year)}
                        className="w-20 shrink-0 border px-1 py-2 text-center space-y-0.5"
                        style={{
                          borderColor: active
                            ? primaryColor
                            : 'var(--fog)',
                          background: active ? `${primaryColor}0d` : '#fff',
                          marginLeft: i === 0 ? 0 : -1,
                        }}
                      >
                        <span className="block text-[0.68rem] text-muted">
                          {ln.year}
                          {current ? ' ●' : ''}
                        </span>
                        <span className="block text-sm font-medium text-ink">
                          {ln.canChi}
                        </span>
                        <span
                          className="block text-[0.68rem]"
                          style={{ color: primaryColor }}
                        >
                          {ln.thapThanCan}
                        </span>
                        <span className="block text-[0.65rem] text-muted">
                          {ln.age} tuổi mụ
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          {/* Lưu nguyệt của năm đang chọn */}
          {luuNien ? (
            <div className="border border-fog bg-white overflow-x-auto">
              <div className="px-4 pt-4 pb-2">
                <SectionLabel primaryColor={primaryColor}>
                  Lưu nguyệt năm {luuNien.canChi} ({luuNien.year}) — tháng âm
                  theo tiết khí
                </SectionLabel>
              </div>
              <table className="w-full text-sm text-center min-w-[30rem]">
                <thead>
                  <tr className="border-y border-fog text-xs text-muted">
                    {luuNien.luuNguyets.map((ly) => (
                      <th key={ly.thang} className="px-1 py-1.5 font-medium">
                        Th. {ly.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {luuNien.luuNguyets.map((ly) => (
                      <td key={ly.thang} className="px-1 py-2">
                        <span className="block text-[0.8rem] text-ink whitespace-nowrap">
                          {ly.canChi}
                        </span>
                        <span className="block text-[0.65rem] text-muted whitespace-nowrap">
                          {ly.thapThan}
                        </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : null}

          {/* Thần sát chi tiết */}
          {view.thanSats.length ? (
            <div className="border border-fog bg-white p-4 md:p-5 space-y-2">
              <SectionLabel primaryColor={primaryColor}>
                Thần sát trong tứ trụ
              </SectionLabel>
              <div className="space-y-1.5 text-sm">
                {view.thanSats.map((ts) => (
                  <p key={ts.name} className="leading-snug">
                    <span className="font-medium text-ink">{ts.name}</span>
                    <span className="text-muted">
                      {' '}
                      (trụ {ts.viTri.join(', ')}) — {ts.nghia}
                    </span>
                  </p>
                ))}
              </div>
              <p className="text-[0.72rem] text-muted">
                Thần sát tra theo bảng cổ truyền (can ngày · can năm · tam
                hợp chi năm/ngày · chi tháng) — dùng để điểm xuyết, không thay
                được toàn cục thập thần.
              </p>
            </div>
          ) : null}

          <BatTuEssaySection
            key={`essay-${chatSessionId}`}
            chartContext={chartContext}
            templeName={templeName}
            primaryColor={primaryColor}
            onAskMore={() => setChatOpen(true)}
          />

          <p className="text-[0.75rem] text-muted">
            Chat hỏi thêm: miễn phí 3 câu về lá số Bát tự; từ câu 4 cần thỉnh
            nước. Công cụ liên quan:{' '}
            <a
              href="/phong-thuy/tim-dung-than"
              className="underline underline-offset-2"
              style={{ color: primaryColor }}
            >
              Tìm dụng thần
            </a>
            {' · '}
            <a
              href="/phong-thuy/nap-am-ngu-hanh"
              className="underline underline-offset-2"
              style={{ color: primaryColor }}
            >
              Nạp âm ngũ hành
            </a>
            {' · '}
            <a
              href="/phong-thuy/bat-tu-ha-lac"
              className="underline underline-offset-2"
              style={{ color: primaryColor }}
            >
              Bát tự Hà Lạc
            </a>
            .
          </p>

          <TuViChatPanel
            key={`chat-${chatSessionId}`}
            open={chatOpen}
            onClose={() => setChatOpen(false)}
            primaryColor={primaryColor}
            templeName={templeName}
            templeId={templeId}
            contactPhone={contactPhone}
            chart={chart}
            horoscope={null}
            batTuFocus
            contextOverride={chartContext}
            freeQuestionLimit={3}
          />
        </div>
      ) : null}
    </div>
  );
}
