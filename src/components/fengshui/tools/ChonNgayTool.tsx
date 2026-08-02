'use client';

import { useMemo, useState } from 'react';
import {
  getChonNgayActivity,
  type ChonNgayActivityId,
  type ChonNgayPerson,
} from '@/lib/fengshui/chon-ngay';
import {
  checkHoangOc,
  checkKimLau,
  checkTamTai,
  checkXungNam,
  type RuleResult,
} from '@/lib/fengshui/rules';
import { NgayTotCalendar } from './NgayTotCalendar';
import { VerdictBadge } from '../VerdictBadge';
import { inputCls, labelCls } from '../FieldStyles';

export interface ChonNgayPersonField {
  key: string;
  label: string;
  /** Năm sinh mặc định; để trống chuỗi = không dùng */
  defaultYear?: number;
  optional?: boolean;
}

interface Props {
  primaryColor: string;
  activityId: ChonNgayActivityId;
  /** Luật năm áp cho người đầu tiên (chủ sự) */
  yearRuleset: 'full' | 'basic' | 'none';
  persons: ChonNgayPersonField[];
  intro?: string;
}

const CURRENT_YEAR = new Date().getFullYear();

export function ChonNgayTool({
  primaryColor,
  activityId,
  yearRuleset,
  persons: personFields,
  intro,
}: Props) {
  const activity = getChonNgayActivity(activityId);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      personFields.map((p) => [p.key, p.defaultYear ? String(p.defaultYear) : '']),
    ),
  );
  const [viewYear, setViewYear] = useState(CURRENT_YEAR);

  const persons: ChonNgayPerson[] = useMemo(
    () =>
      personFields
        .map((f) => ({ f, n: Number(values[f.key]) }))
        .filter(({ n }) => Number.isFinite(n) && n >= 1900 && n <= 2100)
        .map(({ f, n }) => ({ birthYear: n, label: f.label })),
    [personFields, values],
  );

  const chief = persons[0] ?? null;

  const yearRules: RuleResult[] = useMemo(() => {
    if (!chief || yearRuleset === 'none') return [];
    if (yearRuleset === 'full') {
      return [
        checkKimLau(chief.birthYear, viewYear),
        checkHoangOc(chief.birthYear, viewYear),
        checkTamTai(chief.birthYear, viewYear),
        checkXungNam(chief.birthYear, viewYear),
      ];
    }
    return [
      checkTamTai(chief.birthYear, viewYear),
      checkXungNam(chief.birthYear, viewYear),
    ];
  }, [chief, viewYear, yearRuleset]);

  return (
    <div>
      {intro ? (
        <p className="text-sm text-muted leading-relaxed mb-4">{intro}</p>
      ) : null}

      <div className="grid sm:grid-cols-2 gap-4">
        {personFields.map((f) => (
          <label key={f.key} className={labelCls()}>
            {f.label}
            {f.optional ? ' (tuỳ chọn)' : ''}
            <input
              type="number"
              min={1900}
              max={2100}
              value={values[f.key] ?? ''}
              placeholder="vd. 1985"
              onChange={(e) =>
                setValues((v) => ({ ...v, [f.key]: e.target.value }))
              }
              className={`mt-1 ${inputCls}`}
            />
            <span className="mt-1 block text-[11px] text-muted font-normal">
              Năm sinh ÂM LỊCH (sinh trước Tết tính năm trước).
            </span>
          </label>
        ))}
        {yearRuleset !== 'none' ? (
          <label className={labelCls()}>
            Năm dự định tiến hành
            <input
              type="number"
              min={1900}
              max={2100}
              value={viewYear}
              onChange={(e) => setViewYear(Number(e.target.value))}
              className={`mt-1 ${inputCls}`}
            />
            <span className="mt-1 block text-[11px] text-muted font-normal">
              Để xét luật năm (Kim Lâu, Hoang Ốc, Tam Tai…) của{' '}
              {personFields[0]?.label.toLowerCase() || 'chủ sự'}.
            </span>
          </label>
        ) : null}
      </div>

      {chief && yearRules.length > 0 ? (
        <div className="mt-6 border border-fog bg-white p-4">
          <p className="text-xs tracking-wide uppercase text-muted mb-3">
            Luật năm {viewYear} — {personFields[0].label}
          </p>
          <ul className="space-y-2">
            {yearRules.map((r) => (
              <li key={r.key} className="flex items-start gap-3">
                <VerdictBadge verdict={r.verdict} className="mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-ink">{r.label}</p>
                  <p className="text-[11px] text-muted leading-relaxed">
                    {r.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          {yearRules.some((r) => r.verdict === 'bad') ? (
            <p className="mt-3 text-[11px] leading-relaxed" style={{ color: primaryColor }}>
              Phạm luật năm nặng — với làm nhà có thể dùng công cụ{' '}
              <a href="/phong-thuy/muon-tuoi-lam-nha" className="underline underline-offset-2">
                Mượn tuổi làm nhà
              </a>{' '}
              hoặc lùi sang năm thuận.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6">
        <p className="text-xs tracking-wide uppercase text-muted mb-2">
          Tìm ngày tốt — {activity.label}
        </p>
        <p className="text-xs text-muted leading-relaxed mb-3">{activity.hint}</p>
        <NgayTotCalendar
          primaryColor={primaryColor}
          activityId={activityId}
          persons={persons}
        />
      </div>

      <p className="mt-5 text-xs text-muted leading-relaxed">
        Ngày tốt xấu tính từ nhật lịch (thần sát Hoàng đạo, 12 Trực, Nhị thập
        bát tú, nên · kiêng) kết hợp bảng bách kỵ dân gian Việt (Tam nương,
        Nguyệt kỵ, Sát chủ, Thọ tử, Dương công kỵ nhật, Vãng vong) và đối
        chiếu xung tuổi. Kết quả mang tính tham khảo truyền thống.
      </p>
    </div>
  );
}
