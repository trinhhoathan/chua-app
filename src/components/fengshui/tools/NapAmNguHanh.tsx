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
  buildNapAmNguHanh,
  buildNapAmPromptContext,
  type NapAmNguHanhView,
} from '@/lib/fengshui/nap-am-ngu-hanh';
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

function HanhChip({ hanh }: { hanh: string }) {
  const color =
    NGU_HANH_COLOR[hanh as keyof typeof NGU_HANH_COLOR] ?? '#6B7280';
  return (
    <span
      className="inline-flex items-center justify-center px-1.5 h-5 text-[0.75rem] font-medium text-white shrink-0"
      style={{ backgroundColor: color }}
    >
      {hanh}
    </span>
  );
}

export function NapAmNguHanh({
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

  const [view, setView] = useState<NapAmNguHanhView | null>(null);
  const [chart, setChart] = useState<IztroChartView | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatSessionId, setChatSessionId] = useState(0);

  const chartContext = useMemo(
    () => (view ? buildNapAmPromptContext(view) : ''),
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
      setView(buildNapAmNguHanh(input));
      setChart(buildIztroChart(input));
      setChatOpen(false);
      setChatSessionId((n) => n + 1);
    } catch {
      setErr('Không lập được tứ trụ. Kiểm tra ngày tháng năm rồi thử lại.');
    }
  }

  const maxCount = view
    ? Math.max(1, ...NGU_HANH_ORDER.map((h) => view.counts[h]))
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
          Thông tin để xem nạp âm · ngũ hành
        </p>
        <p className="text-sm text-muted">
          Bấm tứ trụ từ ngày giờ sinh — xem nạp âm và ngũ hành bốn trụ, mệnh
          nạp âm, hành vượng–khuyết và cách bổ khuyết.
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
          {YEAR_DIVIDE_OPTIONS.find((o) => o.id === yearDivide)?.hint}
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
          Xem nạp âm · ngũ hành
        </button>
      </form>

      {view && chart ? (
        <div className="space-y-5">
          <div className="border border-fog bg-paper p-4 md:p-5 space-y-2">
            <p
              className="text-[0.7rem] uppercase tracking-[0.25em]"
              style={{ color: primaryColor }}
            >
              Nạp âm · ngũ hành tứ trụ
            </p>
            <h3 className="mt-1 font-display text-xl text-ink">
              {view.fullName}
              <span className="ml-2 text-base font-sans text-muted">
                ({view.gender})
              </span>
            </h3>
            <p className="text-sm text-muted">
              Sinh {view.solarDate} · âm {view.lunarDate} · {view.timeLabel} ·
              chia năm {view.yearDivideLabel.toLowerCase()}
            </p>
          </div>

          <div
            className="border-2 bg-white p-4 md:p-5 space-y-2"
            style={{ borderColor: primaryColor }}
          >
            <p
              className="text-[0.7rem] uppercase tracking-[0.25em]"
              style={{ color: primaryColor }}
            >
              Mệnh nạp âm (trụ năm)
            </p>
            <p className="text-lg font-medium text-ink flex items-center gap-2 flex-wrap">
              {view.menhNapAm}
              <HanhChip hanh={view.menhNapAmHanh} />
            </p>
            {view.menhNapAmMeaning ? (
              <p className="text-sm text-ink leading-relaxed">
                {view.menhNapAmMeaning}
              </p>
            ) : null}
            <p className="text-sm text-muted">
              Nhật chủ (can ngày): <span className="text-ink">{view.nhatChu}</span>{' '}
              — hành {view.nhatChuHanh} · Ngũ hành cục Tử Vi:{' '}
              <span className="text-ink">{view.fiveElementsClass}</span> · Chủ
              mệnh {view.soul} / chủ thân {view.body}
            </p>
          </div>

          <div className="border border-fog bg-white overflow-x-auto">
            <div className="px-4 pt-4 pb-2">
              <p
                className="text-[0.7rem] uppercase tracking-[0.25em]"
                style={{ color: primaryColor }}
              >
                Tứ trụ · can chi · ngũ hành · nạp âm
              </p>
            </div>
            <table className="w-full text-sm min-w-[34rem]">
              <thead>
                <tr className="border-y border-fog text-left text-xs text-muted">
                  <th className="px-4 py-2 font-medium">Trụ</th>
                  <th className="px-3 py-2 font-medium">Can chi</th>
                  <th className="px-3 py-2 font-medium">Hành can · chi</th>
                  <th className="px-3 py-2 font-medium">Nạp âm</th>
                </tr>
              </thead>
              <tbody>
                {view.trus.map((t) => (
                  <tr key={t.tru} className="border-b border-fog/70 align-top">
                    <td className="px-4 py-2.5 text-ink font-medium whitespace-nowrap">
                      {t.tru}
                    </td>
                    <td className="px-3 py-2.5 text-ink whitespace-nowrap">
                      {t.canChi}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <HanhChip hanh={t.nguHanhCan} />
                        <HanhChip hanh={t.nguHanhChi} />
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="text-ink flex items-center gap-1.5 flex-wrap">
                        {t.napAm}
                        <HanhChip hanh={t.napAmHanh} />
                      </p>
                      {t.napAmMeaning ? (
                        <p className="mt-0.5 text-[0.75rem] text-muted leading-snug">
                          {t.napAmMeaning}
                        </p>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="border border-fog bg-white p-4 md:p-5 space-y-2">
              <p
                className="text-[0.7rem] uppercase tracking-[0.25em]"
                style={{ color: primaryColor }}
              >
                Cân đo ngũ hành (8 chữ)
              </p>
              <div className="space-y-1.5">
                {NGU_HANH_ORDER.map((h) => (
                  <div key={h} className="flex items-center gap-2 text-sm">
                    <span className="w-10 shrink-0 text-ink">{h}</span>
                    <div className="flex-1 h-3 bg-mist">
                      <div
                        className="h-full"
                        style={{
                          width: `${(view.counts[h] / maxCount) * 100}%`,
                          backgroundColor: NGU_HANH_COLOR[h],
                        }}
                      />
                    </div>
                    <span className="w-5 text-right tabular-nums text-muted">
                      {view.counts[h]}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-ink">
                {view.vuong.length ? (
                  <>
                    Vượng: <strong>{view.vuong.join(', ')}</strong>.{' '}
                  </>
                ) : null}
                {view.khuyet.length ? (
                  <>
                    Khuyết: <strong>{view.khuyet.join(', ')}</strong>.
                  </>
                ) : (
                  'Không khuyết hành nào.'
                )}
              </p>
            </div>

            <div className="border border-fog bg-white p-4 md:p-5 space-y-2">
              <p
                className="text-[0.7rem] uppercase tracking-[0.25em]"
                style={{ color: primaryColor }}
              >
                Nạp âm bốn trụ sinh · khắc
              </p>
              <div className="space-y-1.5 text-sm">
                {view.napAmRelations.map((r) => (
                  <p key={r.label} className="leading-snug">
                    <span className="text-muted">{r.label}: </span>
                    <span className="text-ink font-medium">{r.relation}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>

          <TuViEssaySection
            key={`essay-${chatSessionId}`}
            chartContext={chartContext}
            templeName={templeName}
            primaryColor={primaryColor}
            contactPhone={contactPhone}
            title="Luận nạp âm · ngũ hành (mẫu)"
            subtitle="Xem thử miễn phí nạp âm bốn trụ và ngũ hành vượng–khuyết — không luận sao cung Tử Vi hay vận hạn."
            ctaTitle="Muốn luận nạp âm · ngũ hành chuyên sâu hơn?"
            question="Hãy luận giải chuyên sâu nạp âm và ngũ hành tứ trụ của tôi: hình tượng và tính chất mệnh nạp âm, ngũ hành vượng–khuyết ảnh hưởng thế nào, tương tác nạp âm giữa bốn trụ (gốc rễ – cha mẹ – bản thân – hậu vận), và cách bổ khuyết ngũ hành thiết thực (màu sắc, hướng, chất liệu, nghề nghiệp). Không luận sao cung Tử Vi hay vận hạn."
            focusFlag="napAmFocus"
            topic="nap_am"
            buttonLabel="Luận nạp âm · ngũ hành"
            loadingLabel="Trụ trì đang luận nạp âm · ngũ hành…"
            notePrefix="Hỏi sâu nạp âm ngũ hành"
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
            key={`chat-${chatSessionId}`}
            open={chatOpen}
            onClose={() => setChatOpen(false)}
            primaryColor={primaryColor}
            templeName={templeName}
            templeId={templeId}
            contactPhone={contactPhone}
            chart={chart}
            horoscope={null}
            napAmFocus
            contextOverride={chartContext}
            freeQuestionLimit={3}
          />
        </div>
      ) : null}
    </div>
  );
}
