'use client';

import { useMemo, useState } from 'react';
import {
  IZTRO_TIME_SLOTS,
  YEAR_DIVIDE_OPTIONS,
  type IztroChartInput,
  type YearDivideMethod,
} from '@/lib/fengshui/iztro-chart';
import {
  buildBatTuHaLac,
  buildHaLacPromptContext,
  type HaLacView,
} from '@/lib/fengshui/bat-tu-ha-lac';
import type { Hexagram } from '@/lib/fengshui/kinh-dich-64';
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

/** Vẽ 6 hào (hiển thị từ trên xuống, binary tính từ dưới lên). */
function HexFigure({
  hex,
  highlight,
  primaryColor,
}: {
  hex: Hexagram;
  highlight?: number;
  primaryColor: string;
}) {
  const bits = hex.binary.split('').map(Number);
  return (
    <div className="flex flex-col gap-1 w-16 shrink-0" aria-hidden>
      {[...bits].reverse().map((b, i) => {
        const pos = 6 - i; // vị trí hào 1–6 từ dưới lên
        const isHighlight = highlight === pos;
        const color = isHighlight ? primaryColor : '#2b2b2b';
        return b === 1 ? (
          <div
            key={pos}
            className="h-1.5"
            style={{ backgroundColor: color }}
          />
        ) : (
          <div key={pos} className="flex gap-2">
            <div
              className="h-1.5 flex-1"
              style={{ backgroundColor: color }}
            />
            <div
              className="h-1.5 flex-1"
              style={{ backgroundColor: color }}
            />
          </div>
        );
      })}
    </div>
  );
}

function HexCard({
  title,
  hex,
  highlight,
  primaryColor,
  children,
}: {
  title: string;
  hex: Hexagram;
  highlight?: number;
  primaryColor: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="border border-fog bg-white p-4 md:p-5 space-y-2">
      <p
        className="text-[0.7rem] uppercase tracking-[0.25em]"
        style={{ color: primaryColor }}
      >
        {title}
      </p>
      <div className="flex items-start gap-4">
        <HexFigure hex={hex} highlight={highlight} primaryColor={primaryColor} />
        <div className="min-w-0">
          <p className="text-lg font-medium text-ink">
            {hex.unicode} {hex.nameFull}
          </p>
          <p className="text-sm text-muted">
            Quẻ số {hex.number} · {hex.nameHan}
          </p>
          <p className="mt-1 text-sm text-ink leading-relaxed">{hex.meaning}</p>
        </div>
      </div>
      <p className="text-sm text-ink leading-relaxed">
        <span className="text-muted">Thoán từ: </span>
        {hex.judgment}
      </p>
      {children}
    </div>
  );
}

export function BatTuHaLac({
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
  const [yearDivide, setYearDivide] = useState<YearDivideMethod>('nong_lich');

  const [view, setView] = useState<HaLacView | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [sessionId, setSessionId] = useState(0);

  const chartContext = useMemo(
    () => (view ? buildHaLacPromptContext(view) : ''),
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
      setView(buildBatTuHaLac(input));
      setChatOpen(false);
      setSessionId((n) => n + 1);
    } catch {
      setErr('Không lập được quẻ Hà Lạc. Kiểm tra ngày tháng năm rồi thử lại.');
    }
  }

  const essayQuestion =
    'Hãy luận giải chuyên sâu Bát tự Hà Lạc của tôi: quẻ Tiên thiên (tượng quẻ, thoán từ) nói gì về tính cách và nửa đời trước; hào nguyên đường và lời hào ứng vào điều gì; quẻ Hậu thiên báo nửa đời sau chuyển hướng ra sao; thiên số – địa số mạnh yếu thế nào và nên ứng xử, chọn hướng đi ra sao cho thuận quẻ. Không luận sao Tử Vi hay vận hạn từng năm.';

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
          Thông tin để lập Bát tự Hà Lạc
        </p>
        <p className="text-sm text-muted">
          Đổi can chi tứ trụ thành số Hà Đồ – Lạc thư, cộng thiên số · địa số
          rồi hóa quẻ: quẻ Tiên thiên (nửa đời trước), hào nguyên đường và quẻ
          Hậu thiên (nửa đời sau).
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
          Giờ sinh (quan trọng — định hào nguyên đường)
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
          Lập quẻ Hà Lạc
        </button>
      </form>

      {view ? (
        <div className="space-y-5">
          <div className="border border-fog bg-paper p-4 md:p-5 space-y-2">
            <p
              className="text-[0.7rem] uppercase tracking-[0.25em]"
              style={{ color: primaryColor }}
            >
              Bát tự Hà Lạc
            </p>
            <h3 className="mt-1 font-display text-xl text-ink">
              {view.fullName}
              <span className="ml-2 text-base font-sans text-muted">
                ({view.gender} · {view.amDuongLabel})
              </span>
            </h3>
            <p className="text-sm text-muted">
              Sinh {view.solarDate} · âm {view.lunarDate} · {view.timeLabel} ·
              chia năm {view.yearDivideLabel.toLowerCase()}
            </p>
          </div>

          <div className="border border-fog bg-white overflow-x-auto">
            <div className="px-4 pt-4 pb-2">
              <p
                className="text-[0.7rem] uppercase tracking-[0.25em]"
                style={{ color: primaryColor }}
              >
                Tứ trụ · số Hà Lạc (can theo Lạc thư, chi theo Hà Đồ)
              </p>
            </div>
            <table className="w-full text-sm min-w-[30rem]">
              <thead>
                <tr className="border-y border-fog text-left text-xs text-muted">
                  <th className="px-4 py-2 font-medium">Trụ</th>
                  <th className="px-3 py-2 font-medium">Can chi</th>
                  <th className="px-3 py-2 font-medium">Số của can</th>
                  <th className="px-3 py-2 font-medium">Số của chi</th>
                </tr>
              </thead>
              <tbody>
                {view.trus.map((t) => (
                  <tr key={t.tru} className="border-b border-fog/70">
                    <td className="px-4 py-2.5 text-ink font-medium whitespace-nowrap">
                      {t.tru}
                    </td>
                    <td className="px-3 py-2.5 text-ink whitespace-nowrap">
                      {t.canChi}
                    </td>
                    <td className="px-3 py-2.5 tabular-nums text-ink">
                      {t.canSo}
                    </td>
                    <td className="px-3 py-2.5 tabular-nums text-ink">
                      {t.chiSo[0]} · {t.chiSo[1]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            className="border-2 bg-white p-4 md:p-5 space-y-1.5"
            style={{ borderColor: primaryColor }}
          >
            <p
              className="text-[0.7rem] uppercase tracking-[0.25em]"
              style={{ color: primaryColor }}
            >
              Thiên số · địa số → quái số
            </p>
            <p className="text-sm text-ink">
              Thiên số (tổng số lẻ): <strong>{view.thienSo}</strong> → trừ 25
              (hoặc bội) còn <strong>{view.thienQuaiSo}</strong> · Địa số (tổng
              số chẵn): <strong>{view.diaSo}</strong> → trừ 30 (hoặc bội) còn{' '}
              <strong>{view.diaQuaiSo}</strong>
            </p>
            <p className="text-sm text-muted">
              {view.amDuongLabel}: {view.thienTrenLabel}.
              {view.kyCungNote ? ` ${view.kyCungNote}` : ''}
            </p>
          </div>

          <HexCard
            title="Quẻ Tiên thiên · nửa đời trước"
            hex={view.tienThien}
            highlight={view.nguyenDuong.position}
            primaryColor={primaryColor}
          >
            <div className="border-t border-fog pt-2 mt-1 space-y-1">
              <p className="text-sm text-ink">
                <span className="text-muted">Nguyên đường: </span>
                {view.nguyenDuong.gioLabel} → hào{' '}
                <strong>{view.nguyenDuong.position}</strong> (
                {view.nguyenDuong.isYang ? 'hào dương' : 'hào âm'}) — tô màu
                trên hình quẻ.
              </p>
              <p className="text-sm text-ink leading-relaxed">
                <span className="text-muted">Lời hào: </span>
                {view.nguyenDuong.lineText}
              </p>
            </div>
          </HexCard>

          <HexCard
            title="Quẻ Hậu thiên · nửa đời sau"
            hex={view.hauThien}
            primaryColor={primaryColor}
          >
            <p className="text-[0.78rem] text-muted">
              Lập bằng cách biến hào nguyên đường rồi đảo thượng – hạ quái của
              quẻ tiên thiên.
            </p>
          </HexCard>

          <TuViEssaySection
            key={`essay-${sessionId}`}
            chartContext={chartContext}
            templeName={templeName}
            primaryColor={primaryColor}
            contactPhone={contactPhone}
            title="Luận quẻ Hà Lạc (mẫu)"
            subtitle="Xem thử miễn phí quẻ Tiên thiên – Hậu thiên theo Hà Lạc lý số — không luận sao Tử Vi hay vận hạn từng năm."
            ctaTitle="Muốn luận quẻ Hà Lạc chuyên sâu hơn?"
            question={essayQuestion}
            focusFlag="haLacFocus"
            topic="ha_lac"
            buttonLabel="Luận quẻ Hà Lạc"
            loadingLabel={`Trụ trì ${templeName} đang luận quẻ Hà Lạc…`}
            notePrefix="Hỏi sâu Bát tự Hà Lạc"
            onAskMore={() => setChatOpen(true)}
          />

          <p className="text-[0.75rem] text-muted">
            Công cụ liên quan:{' '}
            <a
              href="/phong-thuy/nap-am-ngu-hanh"
              className="underline underline-offset-2"
              style={{ color: primaryColor }}
            >
              Nạp âm · ngũ hành
            </a>
            .
          </p>

          <TuViChatPanel
            key={`chat-${sessionId}`}
            open={chatOpen}
            onClose={() => setChatOpen(false)}
            primaryColor={primaryColor}
            templeName={templeName}
            templeId={templeId}
            contactPhone={contactPhone}
            chart={null}
            horoscope={null}
            haLacFocus
            contextOverride={chartContext}
            freeQuestionLimit={3}
          />
        </div>
      ) : null}
    </div>
  );
}
