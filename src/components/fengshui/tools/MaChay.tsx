'use client';

import { useState } from 'react';
import { solarToLunar, dayCanChi, formatLunarDate } from '@/lib/fengshui/lunar';
import { checkHoangDaoDay } from '@/lib/fengshui/rules';
import { VerdictBadge } from '../VerdictBadge';
import { inputCls, labelCls } from '../FieldStyles';

interface Props {
  primaryColor: string;
}

export function MaChay({ primaryColor }: Props) {
  const today = new Date();
  const [name, setName] = useState('');
  const [date, setDate] = useState(today.toISOString().slice(0, 10));
  const [time, setTime] = useState('12:00');
  const [submitted, setSubmitted] = useState(false);

  const [yy, mm, dd] = date.split('-').map((s) => Number(s));
  const lunar = solarToLunar(dd, mm, yy);
  const day = dayCanChi(lunar.jd);
  const hoangDao = checkHoangDaoDay(dd, mm, yy);

  return (
    <div>
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
          Giờ mất
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={`mt-1 ${inputCls}`}
          />
        </label>
      </div>
      <button
        onClick={() => setSubmitted(true)}
        className="mt-5 px-5 py-2.5 text-sm text-white"
        style={{ backgroundColor: primaryColor }}
      >
        Xem ngày âm lịch
      </button>

      {submitted ? (
        <div className="mt-8 border-t border-fog pt-6 space-y-4">
          {name ? (
            <p className="text-sm text-muted">
              Người mất: <span className="text-ink font-medium">{name}</span> —{' '}
              {date} {time}
            </p>
          ) : null}
          <div className="border border-fog p-4 bg-white">
            <p className="text-sm font-medium text-ink">
              Ngày mất theo lịch âm
            </p>
            <p className="text-xs text-muted mt-1">
              {formatLunarDate(lunar)} — Chi ngày: <b>{day.chi}</b> (Can chi:{' '}
              {day.can} {day.chi})
            </p>
          </div>
          <div className="border border-fog p-4 bg-white flex items-start gap-4">
            <VerdictBadge verdict={hoangDao.verdict} className="mt-0.5" />
            <div>
              <p className="text-sm font-medium text-ink">{hoangDao.label}</p>
              <p className="text-xs text-muted mt-1">{hoangDao.detail}</p>
            </div>
          </div>
          <p className="text-xs text-muted">
            Gợi ý: nên tiến hành mai táng vào giờ Hoàng đạo cùng ngày hoặc
            ngày kế tiếp có chi thuộc Hoàng đạo. Kết hợp xem cùng công cụ{' '}
            <b>Kiểm tra Trùng tang</b> để có phương án đầy đủ.
          </p>
        </div>
      ) : null}
    </div>
  );
}
