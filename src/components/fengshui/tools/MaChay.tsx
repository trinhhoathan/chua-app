'use client';

import { useMemo, useState } from 'react';
import {
  deathDayInfo,
  maiTangPersons,
} from '@/lib/fengshui/mai-tang';
import { NgayTotCalendar } from './NgayTotCalendar';
import { VerdictBadge } from '../VerdictBadge';
import { inputCls, labelCls } from '../FieldStyles';
import { AdvisorName } from '@/components/SitePersonaContext';
import { HeTrongAiPanel } from './HeTrongAiPanel';

interface Props {
  primaryColor: string;
}

export function MaChay({ primaryColor }: Props) {
  const today = new Date();
  const [name, setName] = useState('');
  const [date, setDate] = useState(today.toISOString().slice(0, 10));
  const [deceasedYear, setDeceasedYear] = useState('');
  const [eldestSonYear, setEldestSonYear] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [yy, mm, dd] = date.split('-').map((s) => Number(s));

  const info = useMemo(() => deathDayInfo(yy, mm, dd), [yy, mm, dd]);

  const persons = useMemo(
    () =>
      maiTangPersons({
        deceasedBirthYear: Number(deceasedYear) >= 1900 ? Number(deceasedYear) : null,
        eldestSonBirthYear:
          Number(eldestSonYear) >= 1900 ? Number(eldestSonYear) : null,
      }),
    [deceasedYear, eldestSonYear],
  );

  return (
    <div>
      <p className="text-sm text-muted leading-relaxed mb-4">
        Nhập thông tin người mất để xem ngày mất theo âm lịch, cảnh báo ngày
        Trùng tang / Trùng phục, rồi quét lịch tìm ngày giờ an táng · nhập
        liệm · di quan thuận.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className={`${labelCls()} sm:col-span-2`}>
          Họ tên người mất
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`mt-1 ${inputCls}`}
            placeholder="Cụ Nguyễn Văn A"
          />
        </label>
        <label className={labelCls()}>
          Ngày mất (dương lịch)
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`mt-1 ${inputCls}`}
          />
        </label>
        <label className={labelCls()}>
          Năm sinh người mất (âm lịch, tuỳ chọn)
          <input
            type="number"
            min={1900}
            max={2100}
            value={deceasedYear}
            onChange={(e) => setDeceasedYear(e.target.value)}
            placeholder="vd. 1945"
            className={`mt-1 ${inputCls}`}
          />
        </label>
        <label className={labelCls()}>
          Năm sinh trưởng nam (tuỳ chọn)
          <input
            type="number"
            min={1900}
            max={2100}
            value={eldestSonYear}
            onChange={(e) => setEldestSonYear(e.target.value)}
            placeholder="vd. 1970"
            className={`mt-1 ${inputCls}`}
          />
          <span className="mt-1 block text-[11px] text-muted font-normal">
            Để lọc ngày giờ an táng không xung tuổi người mất và trưởng nam.
          </span>
        </label>
      </div>

      <button
        onClick={() => setSubmitted(true)}
        className="mt-5 px-5 py-2.5 text-sm text-white"
        style={{ backgroundColor: primaryColor }}
      >
        Xem ngày mất · tìm ngày an táng
      </button>

      {submitted ? (
        <div className="mt-8 border-t border-fog pt-6 space-y-6">
          {name ? (
            <p className="text-sm text-muted">
              Người mất: <span className="text-ink font-medium">{name}</span>{' '}
              — mất ngày {dd}/{mm}/{yy}
            </p>
          ) : null}

          <div className="border border-fog bg-white">
            <div className="px-4 py-3 border-b border-fog flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink">
                  Ngày mất theo lịch âm
                </p>
                <p className="text-xs text-muted mt-1">
                  {info.weekLabel} · {info.lunarLabel} · ngày{' '}
                  {info.dayCanChi} · {info.daoType} · Trực {info.truc}
                </p>
              </div>
              <VerdictBadge verdict={info.verdict} />
            </div>
            <div className="px-4 py-4">
              <p className="text-xs text-muted leading-relaxed">{info.note}</p>
              {info.folkWarnings.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {info.folkWarnings.map((f) => (
                    <li key={f.key} className="flex items-start gap-3">
                      <VerdictBadge verdict={f.severity} className="mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-ink">{f.label}</p>
                        <p className="text-[11px] text-muted leading-relaxed">
                          {f.detail}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="mt-3 text-[11px] leading-relaxed" style={{ color: primaryColor }}>
                Kết hợp công cụ <b>Kiểm tra Trùng tang</b> (tính đủ 4 bàn theo
                tuổi, tháng, ngày, giờ mất) để có phương án đầy đủ.
              </p>
            </div>
          </div>

          <HeTrongAiPanel
            primaryColor={primaryColor}
            resetKey={`${date}-${deceasedYear}-${eldestSonYear}`}
            payload={{
              topic: 'mai_tang',
              deathYear: yy,
              deathMonth: mm,
              deathDay: dd,
              deceasedBirthYear:
                Number(deceasedYear) >= 1900 ? Number(deceasedYear) : null,
              eldestSonBirthYear:
                Number(eldestSonYear) >= 1900 ? Number(eldestSonYear) : null,
              burial: null,
            }}
          />

          <div>
            <p className="text-xs tracking-wide uppercase text-muted mb-2">
              Tìm ngày an táng · nhập liệm · di quan
            </p>
            <p className="text-xs text-muted leading-relaxed mb-3">
              Ngày tốt = nhật lịch nên An táng / Nhập liệm / Di quan, không
              phạm Trùng tang · Trùng phục · Sát chủ âm · Thọ tử · Dương công
              kỵ nhật, không xung tuổi người mất / trưởng nam. Giờ liệm, giờ
              hạ huyệt lấy theo giờ hoàng đạo đã lọc xung tuổi.
            </p>
            <NgayTotCalendar
              primaryColor={primaryColor}
              activityId="an_tang"
              persons={persons}
            />
          </div>

          <p className="text-xs text-muted leading-relaxed">
            Tang lễ là việc đại sự — luôn tham vấn <AdvisorName /> về khoa
            lễ, giờ liệm và giờ hạ huyệt trước khi quyết định.
          </p>
        </div>
      ) : null}
    </div>
  );
}
