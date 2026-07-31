'use client';

import { useMemo, useState } from 'react';
import {
  IZTRO_TIME_SLOTS,
  YEAR_DIVIDE_OPTIONS,
  type IztroChartInput,
  type YearDivideMethod,
} from '@/lib/fengshui/iztro-chart';
import {
  NGU_HANH_COLOR,
  NGU_HANH_ORDER,
} from '@/lib/fengshui/nap-am-ngu-hanh';
import {
  buildDungThan,
  buildDungThanPromptContext,
  type DungThanView,
} from '@/lib/fengshui/dung-than';
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

export function TimDungThan({
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

  const [view, setView] = useState<DungThanView | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [sessionId, setSessionId] = useState(0);

  const chartContext = useMemo(
    () => (view ? buildDungThanPromptContext(view) : ''),
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
      setView(buildDungThan(input));
      setChatOpen(false);
      setSessionId((n) => n + 1);
    } catch {
      setErr('Không cân được bát tự. Kiểm tra ngày tháng năm rồi thử lại.');
    }
  }

  const essayQuestion =
    'Hãy luận giải chuyên sâu dụng thần bát tự của tôi: vì sao thân vượng / thân nhược / trung hòa như kết luận (dẫn lệnh tháng và điểm cân lực); dụng thần – hỷ thần – kỵ thần từng hành nghĩa là gì với tính cách, sức khỏe, công việc, quan hệ; và ứng dụng cụ thể vào đời sống (màu sắc, phương hướng, con số, môi trường, nghề nghiệp, nết sống cần bồi dưỡng). Nhắc điều hậu mùa sinh nếu có. Không luận sao Tử Vi hay vận hạn từng năm.';

  const maxLuc = view ? Math.max(view.scoreTro, view.scoreKhacTiet, 1) : 1;
  const maxCount = view
    ? Math.max(1, ...NGU_HANH_ORDER.map((h) => view.countsRaw[h]))
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
          Thông tin để tìm dụng thần
        </p>
        <p className="text-sm text-muted">
          Cân bát tự theo lệnh tháng và thập thần: nhật chủ vượng hay nhược, từ
          đó tìm dụng thần – hỷ thần – kỵ thần và cách ứng dụng vào màu sắc,
          hướng, con số, nghề nghiệp.
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
          Tìm dụng thần
        </button>
      </form>

      {view ? (
        <div className="space-y-5">
          <div className="border border-fog bg-paper p-4 md:p-5 space-y-2">
            <p
              className="text-[0.7rem] uppercase tracking-[0.25em]"
              style={{ color: primaryColor }}
            >
              Bát tự · dụng thần
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

          <div className="border border-fog bg-white overflow-x-auto">
            <div className="px-4 pt-4 pb-2">
              <p
                className="text-[0.7rem] uppercase tracking-[0.25em]"
                style={{ color: primaryColor }}
              >
                Tứ trụ · thập thần · tàng can
              </p>
            </div>
            <table className="w-full text-sm min-w-[36rem]">
              <thead>
                <tr className="border-y border-fog text-left text-xs text-muted">
                  <th className="px-4 py-2 font-medium">Trụ</th>
                  <th className="px-3 py-2 font-medium">Can chi</th>
                  <th className="px-3 py-2 font-medium">Thập thần (can)</th>
                  <th className="px-3 py-2 font-medium">Tàng can trong chi</th>
                </tr>
              </thead>
              <tbody>
                {view.trus.map((t) => (
                  <tr key={t.tru} className="border-b border-fog/70 align-top">
                    <td className="px-4 py-2.5 text-ink font-medium whitespace-nowrap">
                      {t.tru}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-ink">
                        {t.canChi}
                        <HanhChip hanh={t.canHanh} />
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-ink whitespace-nowrap">
                      {t.canThapThan}
                    </td>
                    <td className="px-3 py-2.5 text-ink">
                      {t.tangCan
                        .map((tc) => `${tc.can} (${tc.thapThan})`)
                        .join(' · ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            className="border-2 bg-white p-4 md:p-5 space-y-2"
            style={{ borderColor: primaryColor }}
          >
            <p
              className="text-[0.7rem] uppercase tracking-[0.25em]"
              style={{ color: primaryColor }}
            >
              Kết luận cân cường nhược
            </p>
            <p className="text-lg font-medium text-ink flex items-center gap-2 flex-wrap">
              Nhật chủ {view.nhatChu}
              <HanhChip hanh={view.nhatChuHanh} />
              <span className="text-base font-normal text-muted">
                ({view.nhatChuAmDuong}) — {view.verdictLabel}
              </span>
            </p>
            <p className="text-sm text-ink leading-relaxed">
              {view.verdictReason}
            </p>
            <div className="space-y-1.5 pt-1">
              {(
                [
                  {
                    label: 'Sinh trợ (tỷ kiếp + ấn)',
                    value: view.scoreTro,
                    color: '#1B6B3A',
                  },
                  {
                    label: 'Khắc · tiết · hao (quan sát, thực thương, tài)',
                    value: view.scoreKhacTiet,
                    color: '#B3362B',
                  },
                ]
              ).map((row) => (
                <div key={row.label} className="text-sm">
                  <div className="flex justify-between text-[0.78rem] text-muted">
                    <span>{row.label}</span>
                    <span className="tabular-nums">{row.value}</span>
                  </div>
                  <div className="h-3 bg-mist">
                    <div
                      className="h-full"
                      style={{
                        width: `${(row.value / maxLuc) * 100}%`,
                        backgroundColor: row.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="border border-fog bg-white p-4 md:p-5 space-y-2">
              <p
                className="text-[0.7rem] uppercase tracking-[0.25em]"
                style={{ color: primaryColor }}
              >
                Ngũ hành 8 chữ · lệnh tháng
              </p>
              <div className="space-y-1.5">
                {NGU_HANH_ORDER.map((h) => (
                  <div key={h} className="flex items-center gap-2 text-sm">
                    <span className="w-10 shrink-0 text-ink">{h}</span>
                    <div className="flex-1 h-3 bg-mist">
                      <div
                        className="h-full"
                        style={{
                          width: `${(view.countsRaw[h] / maxCount) * 100}%`,
                          backgroundColor: NGU_HANH_COLOR[h],
                        }}
                      />
                    </div>
                    <span className="w-5 text-right tabular-nums text-muted">
                      {view.countsRaw[h]}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-ink">
                Sinh tháng <strong>{view.chiThang}</strong> (mùa {view.mua}) —
                nhật chủ ở trạng thái <strong>{view.lenhThang}</strong>.
              </p>
            </div>

            <div className="border border-fog bg-white p-4 md:p-5 space-y-2">
              <p
                className="text-[0.7rem] uppercase tracking-[0.25em]"
                style={{ color: primaryColor }}
              >
                Nhóm thập thần (can + tàng can)
              </p>
              <div className="space-y-1 text-sm">
                {Object.entries(view.thapThanCounts).map(([k, n]) => (
                  <p key={k} className="flex justify-between">
                    <span className="text-muted">{k}</span>
                    <span className="tabular-nums text-ink">{n}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="border border-fog bg-white p-4 md:p-5 space-y-3">
            <p
              className="text-[0.7rem] uppercase tracking-[0.25em]"
              style={{ color: primaryColor }}
            >
              Dụng thần · hỷ thần · kỵ thần
            </p>
            <div className="space-y-1.5 text-sm">
              <p className="flex items-center gap-1.5 flex-wrap text-ink">
                <span className="text-muted w-24 shrink-0">Dụng thần:</span>
                <HanhChip hanh={view.dungThan} />
                <span>— {view.dungThanNhom}</span>
              </p>
              <p className="flex items-center gap-1.5 flex-wrap text-ink">
                <span className="text-muted w-24 shrink-0">Hỷ thần:</span>
                {view.hyThan.map((h) => (
                  <HanhChip key={h} hanh={h} />
                ))}
              </p>
              <p className="flex items-center gap-1.5 flex-wrap text-ink">
                <span className="text-muted w-24 shrink-0">Kỵ thần:</span>
                {view.kyThan.map((h) => (
                  <HanhChip key={h} hanh={h} />
                ))}
              </p>
            </div>
            {view.dieuHau ? (
              <p className="text-sm text-ink border-t border-fog pt-2">
                {view.dieuHau}
              </p>
            ) : null}
            <div className="border-t border-fog pt-2 text-sm text-ink space-y-1">
              <p>
                <span className="text-muted">Màu hợp: </span>
                {view.ungDung.mau}
              </p>
              <p>
                <span className="text-muted">Hướng hợp: </span>
                {view.ungDung.huong}
              </p>
              <p>
                <span className="text-muted">Con số: </span>
                {view.ungDung.so}
              </p>
              <p>
                <span className="text-muted">Nghề gợi ý: </span>
                {view.ungDung.nghe}
              </p>
            </div>
            <p className="text-[0.75rem] text-muted">
              Phép cân cường nhược phổ thông — bát tự thiên lệch cực đoan (tòng
              cách, hóa khí…) cần thầy xem trực tiếp.
            </p>
          </div>

          <TuViEssaySection
            key={`essay-${sessionId}`}
            chartContext={chartContext}
            templeName={templeName}
            primaryColor={primaryColor}
            question={essayQuestion}
            focusFlag="dungThanFocus"
            topic="dung_than"
            buttonLabel="Luận dụng thần chuyên sâu"
            loadingLabel={`Trụ trì ${templeName} đang cân bát tự tìm dụng thần…`}
            notePrefix="Hỏi sâu dụng thần bát tự"
            onAskMore={() => setChatOpen(true)}
          />

          <p className="text-[0.75rem] text-muted">
            Chat hỏi thêm: miễn phí 3 câu về dụng thần; từ câu 4 cần thỉnh
            nước. Muốn xem nạp âm bốn trụ, dùng{' '}
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
            dungThanFocus
            contextOverride={chartContext}
            freeQuestionLimit={3}
          />
        </div>
      ) : null}
    </div>
  );
}
