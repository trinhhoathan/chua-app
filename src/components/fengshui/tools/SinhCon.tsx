'use client';

import { useMemo, useState } from 'react';
import { goodYearsForChild } from '@/lib/fengshui/sinh-con';
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

export function SinhCon({ primaryColor }: Props) {
  const [motherYear, setMotherYear] = useState<number>(1995);
  const [fatherYear, setFatherYear] = useState<string>('');
  const [fromYear, setFromYear] = useState<number>(CURRENT_YEAR);
  const [submitted, setSubmitted] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  const father =
    Number(fatherYear) >= 1900 && Number(fatherYear) <= 2100
      ? Number(fatherYear)
      : null;

  const results = useMemo(
    () => goodYearsForChild(motherYear, father, fromYear, 8),
    [motherYear, father, fromYear],
  );

  return (
    <div>
      <p className="text-sm text-muted leading-relaxed mb-4">
        Xét con hợp cả cha lẫn mẹ: địa chi (tam hợp · lục hợp · lục xung ·
        lục hại · tương hình), mệnh nạp âm tương sinh, thiên can ngũ hợp —
        kết hợp Kim Lâu và Tam Tai của mẹ theo năm sinh con.
      </p>

      <div className="grid sm:grid-cols-3 gap-4">
        <label className={labelCls()}>
          Năm sinh của mẹ (âm lịch)
          <input
            type="number"
            min={1900}
            max={2100}
            value={motherYear}
            onChange={(e) => setMotherYear(Number(e.target.value))}
            className={`mt-1 ${inputCls}`}
          />
        </label>
        <label className={labelCls()}>
          Năm sinh của cha (tuỳ chọn)
          <input
            type="number"
            min={1900}
            max={2100}
            value={fatherYear}
            onChange={(e) => setFatherYear(e.target.value)}
            placeholder="vd. 1992"
            className={`mt-1 ${inputCls}`}
          />
        </label>
        <label className={labelCls()}>
          Xét từ năm
          <input
            type="number"
            min={1900}
            max={2100}
            value={fromYear}
            onChange={(e) => setFromYear(Number(e.target.value))}
            className={`mt-1 ${inputCls}`}
          />
        </label>
      </div>
      <button
        onClick={() => setSubmitted(true)}
        className="mt-5 px-5 py-2.5 text-sm text-white"
        style={{ backgroundColor: primaryColor }}
      >
        Gợi ý năm sinh con
      </button>

      {submitted ? (
        <div className="mt-8 border-t border-fog pt-6">
          <ul className="space-y-3">
            {results.map((r) => {
              const open = expanded === r.year;
              return (
                <li key={r.year} className="border border-fog bg-white">
                  <button
                    type="button"
                    onClick={() => setExpanded(open ? null : r.year)}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left"
                  >
                    <div>
                      <p className="font-display text-xl text-ink">
                        {r.year}{' '}
                        <span className="text-sm text-muted font-sans">
                          {r.canChi} · {r.napAm}
                        </span>
                      </p>
                      <p className="text-xs text-muted mt-1 leading-relaxed">
                        {r.note}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] text-muted tabular-nums">
                        {r.score}/{r.maxScore}đ
                      </span>
                      <VerdictBadge verdict={r.verdict} />
                    </div>
                  </button>

                  {open ? (
                    <div className="px-4 pb-4 border-t border-fog pt-3 space-y-3">
                      {r.matches.map((m) => (
                        <div key={m.parentLabel}>
                          <p className="text-[10px] uppercase tracking-wide text-muted mb-1.5">
                            Con ↔ {m.parentLabel} ({m.parentCanChi} ·{' '}
                            {m.parentNapAm})
                          </p>
                          <ul className="space-y-1.5">
                            {[m.chiRelation, m.napAmRelation, m.canRelation].map(
                              (rel, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2.5"
                                >
                                  <VerdictBadge
                                    verdict={LEVEL_BADGE[rel.level]}
                                    className="mt-0.5"
                                  />
                                  <p className="text-[11px] text-muted leading-relaxed">
                                    {rel.text}
                                  </p>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      ))}
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-muted mb-1.5">
                          Luật năm của mẹ
                        </p>
                        <ul className="space-y-1.5">
                          {r.motherNotes.map((n) => (
                            <li key={n.label} className="flex items-start gap-2.5">
                              <VerdictBadge
                                verdict={n.verdict}
                                className="mt-0.5"
                              />
                              <p className="text-[11px] text-muted leading-relaxed">
                                <b className="text-ink font-medium">
                                  {n.label}:
                                </b>{' '}
                                {n.detail}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <HeTrongAiPanel
            primaryColor={primaryColor}
            className="mt-5"
            resetKey={`${motherYear}-${father ?? ''}-${fromYear}`}
            payload={{
              topic: 'sinh_con',
              motherYear,
              fatherYear: father,
              fromYear,
            }}
          />

          <p className="mt-5 text-xs text-muted leading-relaxed">
            Bấm vào từng năm để xem chi tiết đối chiếu. Kết quả theo phép dân
            gian, chỉ mang tính tham khảo — sinh con là duyên lành, nên hỏi
            thêm <AdvisorName />.
          </p>
        </div>
      ) : null}
    </div>
  );
}
