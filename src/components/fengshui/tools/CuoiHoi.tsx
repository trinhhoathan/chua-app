'use client';

import { useMemo, useState } from 'react';
import { buildCuoiHoi } from '@/lib/fengshui/cuoi-hoi';
import type { ChonNgayPerson } from '@/lib/fengshui/chon-ngay';
import { NgayTotCalendar } from './NgayTotCalendar';
import { VerdictBadge } from '../VerdictBadge';
import { inputCls, labelCls } from '../FieldStyles';
import { AdvisorName } from '@/components/SitePersonaContext';
import { HeTrongAiPanel } from './HeTrongAiPanel';

interface Props {
  primaryColor: string;
}

const CURRENT_YEAR = new Date().getFullYear();

const LEVEL_BADGE: Record<'tot' | 'binh' | 'xau', 'good' | 'caution' | 'bad'> =
  {
    tot: 'good',
    binh: 'caution',
    xau: 'bad',
  };

export function CuoiHoi({ primaryColor }: Props) {
  const [brideYear, setBrideYear] = useState<number>(1995);
  const [groomYear, setGroomYear] = useState<number>(1993);
  const [targetYear, setTargetYear] = useState<number>(CURRENT_YEAR);
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(
    () => buildCuoiHoi(brideYear, groomYear, targetYear),
    [brideYear, groomYear, targetYear],
  );

  const persons: ChonNgayPerson[] = useMemo(
    () => [
      { birthYear: brideYear, label: 'cô dâu' },
      { birthYear: groomYear, label: 'chú rể' },
    ],
    [brideYear, groomYear],
  );

  return (
    <div>
      <p className="text-sm text-muted leading-relaxed mb-4">
        Đối chiếu tuổi cô dâu – chú rể theo 4 tiêu chí (mệnh nạp âm, thiên
        can, địa chi hình – hại – xung, cung phi bát trạch), xét Kim Lâu cô
        dâu và Tam Tai theo năm cưới, gợi ý tháng Đại lợi và quét ngày cưới
        tốt.
      </p>

      <div className="grid sm:grid-cols-3 gap-4">
        <label className={labelCls()}>
          Năm sinh cô dâu (âm lịch)
          <input
            type="number"
            min={1900}
            max={2100}
            value={brideYear}
            onChange={(e) => setBrideYear(Number(e.target.value))}
            className={`mt-1 ${inputCls}`}
          />
        </label>
        <label className={labelCls()}>
          Năm sinh chú rể (âm lịch)
          <input
            type="number"
            min={1900}
            max={2100}
            value={groomYear}
            onChange={(e) => setGroomYear(Number(e.target.value))}
            className={`mt-1 ${inputCls}`}
          />
        </label>
        <label className={labelCls()}>
          Năm dự định cưới
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
        Xem tuổi cưới
      </button>

      {submitted ? (
        <div className="mt-8 border-t border-fog pt-6 space-y-6">
          <section className="border border-fog bg-white">
            <div className="px-4 py-3 border-b border-fog flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink">
                  {result.overallLabel}
                </p>
                <p className="text-xs text-muted mt-1">
                  Cô dâu {result.brideCanChi} · chú rể {result.groomCanChi} ·
                  cưới năm {result.targetYear} (cô dâu {result.brideAgeMu}{' '}
                  tuổi mụ)
                </p>
              </div>
              <VerdictBadge verdict={result.overall} />
            </div>
            <p className="px-4 py-4 text-xs text-muted leading-relaxed">
              {result.overallDetail}
            </p>
          </section>

          <section>
            <p className="text-xs tracking-wide uppercase text-muted mb-2">
              Hợp tuổi hai người — {result.hopTuoi.totalScore}/
              {result.hopTuoi.maxScore} điểm ({result.hopTuoi.bandLabel})
            </p>
            <ul className="space-y-3">
              {result.hopTuoi.tieuChi.map((t) => (
                <li
                  key={t.key}
                  className="border border-fog p-4 bg-white flex items-start gap-4"
                >
                  <VerdictBadge
                    verdict={LEVEL_BADGE[t.level]}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {t.label}{' '}
                      <span className="text-muted font-normal text-xs">
                        ({t.detail})
                      </span>
                    </p>
                    <p className="text-xs text-muted mt-1 leading-relaxed">
                      {t.verdict}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <p className="text-xs tracking-wide uppercase text-muted mb-2">
              Luật năm cưới {result.targetYear}
            </p>
            <ul className="space-y-3">
              {result.yearRules.map((r) => (
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
          </section>

          <section
            className="border px-4 py-3"
            style={{
              borderColor: `${primaryColor}55`,
              backgroundColor: `${primaryColor}0d`,
            }}
          >
            <p className="text-sm font-medium text-ink">
              Tháng cưới theo tuổi cô dâu
            </p>
            <p className="mt-1 text-xs text-muted leading-relaxed">
              {result.monthNote}
            </p>
          </section>

          <HeTrongAiPanel
            primaryColor={primaryColor}
            resetKey={`${brideYear}-${groomYear}-${targetYear}`}
            payload={{ topic: 'cuoi_hoi', brideYear, groomYear, targetYear }}
          />

          <section>
            <p className="text-xs tracking-wide uppercase text-muted mb-2">
              Quét ngày cưới tốt
            </p>
            <p className="text-xs text-muted leading-relaxed mb-3">
              Ngày tốt = nhật lịch nên Cưới hỏi / Nạp thái, không Tam nương ·
              Nguyệt kỵ · Sát chủ, không xung tuổi cô dâu và chú rể.
            </p>
            <NgayTotCalendar
              primaryColor={primaryColor}
              activityId="cuoi_hoi"
              persons={persons}
            />
          </section>

          <p className="text-xs text-muted leading-relaxed">
            Phép xem dân gian theo năm sinh; muốn tinh cần so cả tứ trụ ngày
            giờ hai người — nên tham vấn <AdvisorName /> trước khi định ngày.
          </p>
        </div>
      ) : null}
    </div>
  );
}
