'use client';

import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  getAlmanacDay,
  getMonthGrid,
  todayParts,
  type AlmanacDay,
  type DayLuck,
  type NineStarInfo,
} from '@/lib/fengshui/lunar-almanac';

interface Props {
  primaryColor: string;
}

const WEEK_HEADERS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const;

function luckDot(luck: DayLuck, primary: string): string {
  if (luck === 'good') return primary;
  if (luck === 'bad') return '#6B7280';
  return '#D1D5DB';
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="px-4 py-4 border-b border-fog last:border-b-0">
      <p className="text-xs tracking-wide uppercase text-muted mb-2.5">{title}</p>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  if (value == null || value === '' || value === false) return null;
  if (Array.isArray(value) && value.length === 0) return null;
  return (
    <p className="text-sm">
      <span className="text-xs text-muted block">{label}</span>
      <span className="text-ink">{value}</span>
    </p>
  );
}

function TagList({
  items,
  tone,
}: {
  items: string[];
  tone: 'good' | 'bad' | 'neutral';
}) {
  if (!items.length) {
    return <p className="text-xs text-muted">—</p>;
  }
  const cls =
    tone === 'good'
      ? 'border-emerald-800/25 bg-emerald-50 text-emerald-900'
      : tone === 'bad'
        ? 'border-stone-400/40 bg-stone-100 text-stone-700'
        : 'border-fog bg-paper text-ink';
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((t, i) => (
        <li
          key={`${t}-${i}`}
          className={`px-2 py-0.5 text-[11px] border leading-relaxed ${cls}`}
        >
          {t}
        </li>
      ))}
    </ul>
  );
}

function NineStarBlock({
  label,
  info,
}: {
  label: string;
  info: NineStarInfo;
}) {
  return (
    <div className="space-y-1.5 text-sm">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-ink">
        {info.name} {info.position}
      </p>
      <p className="text-ink">
        {info.beiDou} · Huyền Không [{info.xuanKong}]
      </p>
      <p className="text-muted text-[13px]">
        Kỳ Môn [{info.qiMen}]
      </p>
      <p className="text-muted text-[13px]">
        Thái Ất [{info.taiYi}]
      </p>
      {info.song ? (
        <p className="text-xs text-muted leading-relaxed pt-1">{info.song}</p>
      ) : null}
    </div>
  );
}

function DayDetail({
  day,
  primaryColor,
}: {
  day: AlmanacDay;
  primaryColor: string;
}) {
  const allFestivals = [
    ...day.festivals,
    ...day.otherFestivals,
    ...day.solarFestivals,
    ...day.taoFestivals,
  ];

  return (
    <div className="mt-6 border border-fog bg-white">
      <div className="px-4 py-3 border-b border-fog flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="font-display text-xl text-ink">
            {day.solarDay}/{day.solarMonth}/{day.solarYear}
          </p>
          <p className="text-sm text-muted mt-0.5">
            {day.weekLabel} · {day.lunarLabel} · {day.xingZuo}
          </p>
          <p className="text-[11px] text-muted mt-0.5">
            Julian day {day.julianDay}
          </p>
        </div>
        <div className="text-right">
          <p
            className="text-sm font-medium"
            style={{
              color: day.luck === 'good' ? primaryColor : undefined,
            }}
          >
            {day.daoType} · {day.luckLabel}
          </p>
          <p className="text-xs text-muted mt-0.5">
            {day.tianShen} · Trực {day.zhiXing}
          </p>
        </div>
      </div>

      <Section title="Can Chi · Nạp âm · Con giáp">
        <div className="grid sm:grid-cols-3 gap-3">
          <Field
            label="Năm"
            value={`${day.yearCanChi} · ${day.yearAnimal} · ${day.yearNaYin}`}
          />
          <Field
            label="Tháng"
            value={`${day.monthCanChi} · ${day.monthAnimal} · ${day.monthNaYin}`}
          />
          <Field
            label="Ngày"
            value={`${day.dayCanChi} · ${day.dayAnimal} · ${day.dayNaYin}`}
          />
          <Field label="Năm (Lập Xuân)" value={day.yearCanChiLiChun} />
          <Field label="Năm (chính xác)" value={day.yearCanChiExact} />
          <Field label="Tháng (chính xác)" value={day.monthCanChiExact} />
          <Field label="Ngày (chính xác)" value={day.dayCanChiExact} />
        </div>
      </Section>

      <Section title="Tứ trụ (Bát tự)">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          {(['Năm', 'Tháng', 'Ngày', 'Giờ'] as const).map((lab, i) => (
            <div key={lab}>
              <p className="text-xs text-muted">{lab}</p>
              <p className="text-ink">{day.baZi[i]}</p>
              <p className="text-[11px] text-muted">
                {day.baZiWuXing[i]} · {day.baZiNaYin[i]}
              </p>
              <p className="text-[11px] text-muted">
                {day.baZiShiShenGan[i]} / {day.baZiShiShenZhi[i]}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-3 grid sm:grid-cols-2 gap-3 text-[12px] text-muted">
          <Field
            label="Thập thần địa chi năm"
            value={day.baZiShiShenYearZhi.join(' · ')}
          />
          <Field
            label="Thập thần địa chi tháng"
            value={day.baZiShiShenMonthZhi.join(' · ')}
          />
          <Field
            label="Thập thần địa chi ngày"
            value={day.baZiShiShenDayZhi.join(' · ')}
          />
          <Field
            label="Thập thần địa chi giờ"
            value={day.baZiShiShenTimeZhi.join(' · ')}
          />
        </div>
      </Section>

      <Section title="Nên làm">
        <TagList items={day.yi} tone="good" />
      </Section>

      <Section title="Kiêng">
        <TagList items={day.ji} tone="bad" />
      </Section>

      <Section title="Thần tốt · Hung sát">
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted mb-1.5">Thần tốt</p>
            <TagList items={day.jiShen} tone="neutral" />
          </div>
          <div>
            <p className="text-xs text-muted mb-1.5">Hung sát</p>
            <TagList items={day.xiongSha} tone="bad" />
          </div>
        </div>
      </Section>

      <Section title="Xung · Sát · Phương vị">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Xung" value={day.chong} />
          <Field label="Con giáp xung" value={day.chongAnimal} />
          <Field label="Sát" value={day.sha} />
          <Field
            label="Hỷ thần"
            value={`${day.positionXi} (${day.positionXiBagua})`}
          />
          <Field label="Dương quý" value={day.positionYangGui} />
          <Field label="Âm quý" value={day.positionYinGui} />
          <Field label="Phúc thần" value={day.positionFu} />
          <Field label="Tài thần" value={day.positionCai} />
          <Field label="Thai thần (ngày)" value={day.positionTai} />
          <Field label="Thai thần (tháng)" value={day.positionTaiMonth} />
          <Field label="Thái Tuế năm" value={day.positionTaiSuiYear} />
          <Field label="Thái Tuế tháng" value={day.positionTaiSuiMonth} />
          <Field label="Thái Tuế ngày" value={day.positionTaiSuiDay} />
        </div>
      </Section>

      <Section title="Tinh tú · Nhị thập bát tú">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field
            label="Tú"
            value={`${day.xiu} (${day.xiuAnimal}) · ${day.xiuLuck}`}
          />
          <Field
            label="Cung · Thú · Chính"
            value={`${day.xiuGong} · ${day.xiuShou} · ${day.xiuZheng}`}
          />
        </div>
        {day.xiuSong ? (
          <p className="mt-2 text-xs text-muted leading-relaxed">{day.xiuSong}</p>
        ) : null}
      </Section>

      <Section title="Bành Tổ bách kỵ">
        <div className="space-y-2 text-sm text-ink">
          <p>{day.pengZuGan}</p>
          <p>{day.pengZuZhi}</p>
        </div>
      </Section>

      <Section title="Nguyệt tướng · Hậu · Lục diệu · Lộc">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Nguyệt tướng" value={day.yueXiang} />
          <Field label="Mùa" value={day.season} />
          <Field label="Hậu" value={day.hou} />
          <Field label="Ngũ hậu" value={day.wuHou} />
          <Field label="Lục diệu" value={day.liuYao} />
          <Field label="Nhật lộc" value={day.dayLu} />
        </div>
      </Section>

      <Section title="Tuần · Không vong">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field
            label="Tuần ngày"
            value={`${day.dayXun} · không ${day.dayXunKong}`}
          />
          <Field
            label="Tuần tháng"
            value={`${day.monthXun} · không ${day.monthXunKong}`}
          />
          <Field
            label="Tuần năm"
            value={`${day.yearXun} · không ${day.yearXunKong}`}
          />
        </div>
      </Section>

      <Section title="Cửu tinh">
        <div className="space-y-5">
          <NineStarBlock label="Cửu tinh ngày" info={day.nineStarDay} />
          <NineStarBlock label="Cửu tinh tháng" info={day.nineStarMonth} />
          <NineStarBlock label="Cửu tinh năm" info={day.nineStarYear} />
        </div>
      </Section>

      <Section title="Tiết khí · Phục · Số cửu">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Tiết khí hôm nay" value={day.jieQi} />
          <Field label="Tiết trước" value={day.prevJie} />
          <Field label="Tiết sau" value={day.nextJie} />
          <Field label="Khí trước" value={day.prevQi} />
          <Field label="Khí sau" value={day.nextQi} />
          <Field label="Tiết khí trước" value={day.prevJieQi} />
          <Field label="Tiết khí sau" value={day.nextJieQi} />
          <Field label="Tam phục" value={day.fu} />
          <Field label="Số cửu" value={day.shuJiu} />
        </div>
      </Section>

      {allFestivals.length > 0 ? (
        <Section title="Ngày lễ / hội (theo Lunar)">
          <TagList items={allFestivals} tone="neutral" />
        </Section>
      ) : null}

      <Section title="Phật lịch · Đạo lịch">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Phật lịch" value={day.fotoYear} />
          <Field label="Đạo lịch" value={day.taoYear} />
        </div>
        {day.fotoNotes.length ? (
          <div className="mt-3">
            <p className="text-xs text-muted mb-1.5">Ngày trai / Phật lịch</p>
            <TagList items={day.fotoNotes} tone="neutral" />
          </div>
        ) : null}
        {day.taoNotes.length ? (
          <div className="mt-3">
            <p className="text-xs text-muted mb-1.5">Đạo lịch đặc biệt</p>
            <TagList items={day.taoNotes} tone="neutral" />
          </div>
        ) : null}
      </Section>

      <Section title="Giờ trong ngày">
        <div className="space-y-2">
          {day.hours.map((h) => (
            <div
              key={`${h.ganZhi}-${h.range}`}
              className="border border-fog px-3 py-2"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm text-ink">
                  <span className="font-medium">{h.chi}</span>
                  <span className="text-muted">
                    {' '}
                    · {h.ganZhi} · {h.animal}
                  </span>
                  <span className="text-muted text-xs"> · {h.range}</span>
                </p>
                <p
                  className="text-xs"
                  style={{
                    color: h.luck === 'good' ? primaryColor : undefined,
                  }}
                >
                  {h.tianShen} · {h.daoType} · {h.luckLabel}
                </p>
              </div>
              <p className="mt-1 text-[11px] text-muted">
                Nạp âm {h.naYin} · Xung {h.chong} · Sát {h.sha} · Tuần{' '}
                {h.xun} (không {h.xunKong}) · {h.nineStar}
              </p>
              <p className="text-[11px] text-muted">
                Hỷ {h.positionXi} · Phúc {h.positionFu} · Tài {h.positionCai}
              </p>
              <div className="mt-2 grid sm:grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted mb-1">
                    Nên
                  </p>
                  <TagList items={h.yi} tone="good" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted mb-1">
                    Kiêng
                  </p>
                  <TagList items={h.ji} tone="bad" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

export function LichVanNien({ primaryColor }: Props) {
  const t = todayParts();
  const [year, setYear] = useState(t.y);
  const [month, setMonth] = useState(t.m);
  const [selected, setSelected] = useState({ y: t.y, m: t.m, d: t.d });

  const grid = useMemo(() => getMonthGrid(year, month), [year, month]);
  const detail = useMemo(
    () => getAlmanacDay(selected.y, selected.m, selected.d),
    [selected],
  );

  function shiftMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    setYear(y);
    setMonth(m);
  }

  function selectCell(y: number, m: number, d: number, inMonth: boolean) {
    setSelected({ y, m, d });
    if (!inMonth) {
      setYear(y);
      setMonth(m);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="px-3 py-1.5 text-xs border border-fog text-ink hover:border-ink/30"
        >
          ← Tháng trước
        </button>
        <p className="font-display text-lg text-ink tabular-nums">
          Tháng {month}/{year}
        </p>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="px-3 py-1.5 text-xs border border-fog text-ink hover:border-ink/30"
        >
          Tháng sau →
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-3 text-[11px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block size-2 rounded-full"
            style={{ backgroundColor: primaryColor }}
          />
          Hoàng đạo (tốt)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block size-2 rounded-full bg-stone-400" />
          Hắc đạo (xấu)
        </span>
        <button
          type="button"
          onClick={() => {
            setYear(t.y);
            setMonth(t.m);
            setSelected({ y: t.y, m: t.m, d: t.d });
          }}
          className="ml-auto text-xs underline-offset-2 hover:underline"
          style={{ color: primaryColor }}
        >
          Về hôm nay
        </button>
      </div>

      <div className="border border-fog bg-white">
        <div className="grid grid-cols-7 border-b border-fog">
          {WEEK_HEADERS.map((h) => (
            <div
              key={h}
              className="py-2 text-center text-[11px] text-muted tracking-wide"
            >
              {h}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {grid.map((cell) => {
            const isSelected =
              cell.solarYear === selected.y &&
              cell.solarMonth === selected.m &&
              cell.solarDay === selected.d;
            const isToday =
              cell.solarYear === t.y &&
              cell.solarMonth === t.m &&
              cell.solarDay === t.d;
            return (
              <button
                key={`${cell.solarYear}-${cell.solarMonth}-${cell.solarDay}`}
                type="button"
                onClick={() =>
                  selectCell(
                    cell.solarYear,
                    cell.solarMonth,
                    cell.solarDay,
                    cell.inMonth,
                  )
                }
                className={`relative min-h-[4.25rem] p-1.5 text-left border-b border-r border-fog transition-colors ${
                  cell.inMonth ? 'bg-white' : 'bg-stone-50/80'
                } ${isSelected ? '' : 'hover:bg-stone-50'}`}
                style={
                  isSelected
                    ? ({
                        boxShadow: `inset 0 0 0 2px ${primaryColor}`,
                      } satisfies CSSProperties)
                    : undefined
                }
              >
                <div className="flex items-start justify-between gap-1">
                  <span
                    className={`text-sm tabular-nums leading-none ${
                      cell.inMonth ? 'text-ink' : 'text-muted/50'
                    } ${isToday ? 'font-semibold' : ''}`}
                    style={isToday ? { color: primaryColor } : undefined}
                  >
                    {cell.solarDay}
                  </span>
                  <span
                    className="mt-0.5 inline-block size-1.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: luckDot(cell.luck, primaryColor),
                      opacity: cell.inMonth ? 1 : 0.35,
                    }}
                  />
                </div>
                <p
                  className={`mt-1 text-[10px] tabular-nums leading-tight ${
                    cell.inMonth ? 'text-muted' : 'text-muted/40'
                  }`}
                >
                  {cell.lunarDay}
                  {cell.lunarDay === 1
                    ? `/${cell.lunarMonth}${cell.lunarLeap ? 'n' : ''}`
                    : ''}
                </p>
                {cell.jieQi ? (
                  <p
                    className="mt-0.5 text-[9px] leading-tight truncate"
                    style={{
                      color: cell.inMonth ? primaryColor : undefined,
                      opacity: cell.inMonth ? 1 : 0.4,
                    }}
                  >
                    {cell.jieQi}
                  </p>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <DayDetail day={detail} primaryColor={primaryColor} />
    </div>
  );
}
