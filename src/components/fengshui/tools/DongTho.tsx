'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  checkKimLau,
  checkHoangOc,
  checkTamTai,
  checkXungNam,
  combineVerdicts,
  type Verdict,
} from '@/lib/fengshui/rules';
import { formatCanChi, tuoiMu, yearCanChi } from '@/lib/fengshui/lunar';
import { VerdictBadge } from '../VerdictBadge';
import { inputCls, labelCls } from '../FieldStyles';
import { AdvisorName } from '@/components/SitePersonaContext';
import { HeTrongAiPanel } from './HeTrongAiPanel';

interface Props {
  primaryColor: string;
}

const CURRENT_YEAR = new Date().getFullYear();

interface YearRow {
  year: number;
  canChi: string;
  ageMu: number;
  verdict: Verdict;
  issues: string[];
}

function scanYears(birthYear: number, fromYear: number, count: number): YearRow[] {
  const rows: YearRow[] = [];
  for (let i = 0; i < count; i++) {
    const y = fromYear + i;
    const results = [
      checkKimLau(birthYear, y),
      checkHoangOc(birthYear, y),
      checkTamTai(birthYear, y),
      checkXungNam(birthYear, y),
    ];
    const issues = results
      .filter((r) => r.verdict !== 'good')
      .map((r) => r.label);
    rows.push({
      year: y,
      canChi: formatCanChi(yearCanChi(y)),
      ageMu: tuoiMu(birthYear, y),
      verdict: combineVerdicts(results),
      issues,
    });
  }
  return rows;
}

export function DongTho({ primaryColor }: Props) {
  const [birthYear, setBirthYear] = useState<number>(1985);
  const [targetYear, setTargetYear] = useState<number>(CURRENT_YEAR);
  const [submitted, setSubmitted] = useState(false);

  const results = useMemo(
    () => [
      checkKimLau(birthYear, targetYear),
      checkHoangOc(birthYear, targetYear),
      checkTamTai(birthYear, targetYear),
      checkXungNam(birthYear, targetYear),
    ],
    [birthYear, targetYear],
  );
  const overall = combineVerdicts(results);
  const violated = results.some(
    (r) =>
      (r.key === 'kim_lau' || r.key === 'hoang_oc') && r.verdict === 'bad',
  );

  const upcoming = useMemo(
    () => scanYears(birthYear, targetYear, 8),
    [birthYear, targetYear],
  );

  return (
    <div>
      <p className="text-sm text-muted leading-relaxed mb-4">
        Xét 4 luật tuổi làm nhà cổ truyền: Kim Lâu (tuổi mụ), Hoang Ốc, Tam
        Tai và xung năm — tính trên tuổi mụ theo năm âm lịch.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className={labelCls()}>
          Năm sinh (âm lịch)
          <input
            type="number"
            min={1900}
            max={2100}
            value={birthYear}
            onChange={(e) => setBirthYear(Number(e.target.value))}
            className={`mt-1 ${inputCls}`}
          />
          <span className="mt-1 block text-[11px] text-muted font-normal">
            Sinh trước Tết âm tính năm trước.
          </span>
        </label>
        <label className={labelCls()}>
          Năm dự định làm nhà
          <input
            type="number"
            min={1900}
            max={2100}
            value={targetYear}
            onChange={(e) => setTargetYear(Number(e.target.value))}
            className={`mt-1 ${inputCls}`}
          />
        </label>
      </div>
      <button
        onClick={() => setSubmitted(true)}
        className="mt-5 px-5 py-2.5 text-sm text-white"
        style={{ backgroundColor: primaryColor }}
      >
        Xem kết quả
      </button>

      {submitted ? (
        <div className="mt-8 border-t border-fog pt-6 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs text-muted uppercase tracking-widest">
                Năm {targetYear} — tuổi mụ {tuoiMu(birthYear, targetYear)}
              </span>
              <VerdictBadge verdict={overall} />
            </div>
            <ul className="space-y-3">
              {results.map((r) => (
                <li
                  key={r.key}
                  className="border border-fog p-4 bg-white flex items-start gap-4"
                >
                  <VerdictBadge verdict={r.verdict} className="mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-ink">{r.label}</p>
                    <p className="text-xs text-muted mt-1">{r.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {violated ? (
            <div
              className="border px-4 py-3 text-sm"
              style={{
                borderColor: `${primaryColor}55`,
                backgroundColor: `${primaryColor}0d`,
              }}
            >
              <p className="font-medium text-ink">
                Phạm Kim Lâu / Hoang Ốc — có thể mượn tuổi
              </p>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Nếu vẫn cần làm nhà năm {targetYear}, dân gian dùng cách mượn
                tuổi người thân thuận (không Kim Lâu, Hoang Ốc, hợp tuổi chủ
                nhà) để chủ trì động thổ.{' '}
                <Link
                  href="/phong-thuy/muon-tuoi-lam-nha"
                  className="underline underline-offset-2"
                  style={{ color: primaryColor }}
                >
                  Mở công cụ Mượn tuổi làm nhà →
                </Link>
              </p>
            </div>
          ) : null}

          <div>
            <p className="text-xs tracking-wide uppercase text-muted mb-2">
              8 năm tới — năm nào đẹp tuổi?
            </p>
            <ul className="grid sm:grid-cols-2 gap-2">
              {upcoming.map((row) => (
                <li
                  key={row.year}
                  className="border border-fog bg-white px-3 py-2.5"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-ink tabular-nums">
                      {row.year}{' '}
                      <span className="text-xs text-muted font-normal">
                        {row.canChi} · tuổi mụ {row.ageMu}
                      </span>
                    </p>
                    <VerdictBadge verdict={row.verdict} />
                  </div>
                  <p className="mt-1 text-[11px] text-muted leading-relaxed">
                    {row.issues.length === 0
                      ? 'Không phạm Kim Lâu, Hoang Ốc, Tam Tai, xung năm.'
                      : `Vướng: ${row.issues.join(', ')}.`}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <HeTrongAiPanel
            primaryColor={primaryColor}
            resetKey={`${birthYear}-${targetYear}`}
            payload={{ topic: 'dong_tho', birthYear, targetYear }}
          />

          <p className="text-xs text-muted leading-relaxed">
            Chọn được năm thuận rồi, dùng tiếp công cụ{' '}
            <Link
              href="/phong-thuy/khoi-cong"
              className="underline underline-offset-2"
              style={{ color: primaryColor }}
            >
              Khởi công động thổ
            </Link>{' '}
            để tìm ngày giờ tốt trong năm. Việc hệ trọng nên hỏi thêm{' '}
            <AdvisorName />.
          </p>
        </div>
      ) : null}
    </div>
  );
}
