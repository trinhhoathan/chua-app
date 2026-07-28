'use client';

import { useMemo, useState } from 'react';
import {
  formatLunarDate,
  lunarToSolar,
  solarToLunar,
} from '@/lib/fengshui/lunar';
import {
  BUDDHIST_OBSERVANCES,
  observancesInLunarYear,
} from '@/lib/fengshui/buddhist-calendar';
import { inputCls, labelCls } from '../FieldStyles';

interface Props {
  primaryColor: string;
}

export function NgayViaPhat({ primaryColor }: Props) {
  const now = new Date();
  const thisLunar = solarToLunar(
    now.getDate(),
    now.getMonth() + 1,
    now.getFullYear(),
  );
  const [year, setYear] = useState(thisLunar.year);

  const rows = useMemo(() => {
    return observancesInLunarYear(BUDDHIST_OBSERVANCES).map((obs) => {
      const solar = lunarToSolar(obs.lunarDay, obs.lunarMonth, year, false);
      return { obs, solar };
    });
  }, [year]);

  const todayL = formatLunarDate(thisLunar);

  return (
    <div>
      <p className="text-sm text-muted leading-relaxed mb-5">
        Hôm nay âm lịch: <span className="text-ink">{todayL}</span>. Danh sách
        vía / đại lễ thường niên — đối chiếu dương lịch theo năm âm bạn chọn.
      </p>

      <label className={`${labelCls()} max-w-[12rem]`}>
        Năm âm lịch
        <input
          type="number"
          min={1900}
          max={2100}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className={`mt-1 ${inputCls}`}
        />
      </label>

      <ul className="mt-8 divide-y divide-fog border border-fog bg-white">
        {rows.map(({ obs, solar }) => (
          <li
            key={`${obs.lunarMonth}-${obs.lunarDay}-${obs.title}`}
            className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="font-display text-base text-ink">{obs.title}</p>
              {obs.note ? (
                <p className="mt-0.5 text-xs text-muted">{obs.note}</p>
              ) : null}
            </div>
            <div className="text-right shrink-0 text-sm">
              <p className="tabular-nums text-ink">
                {obs.lunarDay}/{obs.lunarMonth} ÂL
              </p>
              <p className="text-xs text-muted tabular-nums">
                {solar
                  ? `${solar.day}/${solar.month}/${solar.year} DL`
                  : '—'}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-xs text-muted leading-relaxed">
        Một số vía có thể lệch theo hệ phái / địa phương. Ngày Tất niên phụ
        thuộc tháng đủ hay thiếu.
        <span className="block mt-1" style={{ color: primaryColor }}>
          Nhà chùa có thể bổ sung lịch riêng sau.
        </span>
      </p>
    </div>
  );
}
