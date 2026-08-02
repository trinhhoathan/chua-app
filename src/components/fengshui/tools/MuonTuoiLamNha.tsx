'use client';

import { useMemo, useState } from 'react';
import {
  checkBorrowPerson,
  getMuonTuoiLamNha,
  type BorrowCandidate,
} from '@/lib/fengshui/muon-tuoi-lam-nha';
import { VerdictBadge } from '../VerdictBadge';
import { inputCls, labelCls } from '../FieldStyles';
import { AdvisorName } from '@/components/SitePersonaContext';
import { HeTrongAiPanel } from './HeTrongAiPanel';

interface Props {
  primaryColor: string;
}

const CURRENT_YEAR = new Date().getFullYear();

function CandidateCard({
  c,
  primaryColor,
  highlight,
}: {
  c: BorrowCandidate;
  primaryColor: string;
  highlight?: boolean;
}) {
  return (
    <li
      className={`border p-4 bg-white ${
        highlight ? 'border-ink/25' : 'border-fog'
      }`}
      style={
        highlight
          ? { boxShadow: `inset 3px 0 0 ${primaryColor}` }
          : undefined
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-ink">
            Sinh {c.birthYear} · {c.canChi} · {c.napAm}
          </p>
          <p className="text-xs text-muted mt-0.5">
            Tuổi mụ {c.ageMu} (năm làm nhà)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[0.65rem] uppercase tracking-wide"
            style={
              c.overall === 'good' ? { color: primaryColor } : undefined
            }
          >
            {c.badge}
          </span>
          <VerdictBadge verdict={c.overall} />
        </div>
      </div>
      <p className="mt-2 text-xs text-muted leading-relaxed">{c.note}</p>
      <ul className="mt-2 grid sm:grid-cols-2 gap-1 text-[11px] text-muted">
        <li>Kim Lâu: {c.kimLau.detail}</li>
        <li>Hoang Ốc: {c.hoangOc.detail}</li>
        <li>Tam Tai: {c.tamTai.detail}</li>
        <li>Xung năm: {c.xungNam.detail}</li>
        {c.ownerRelation ? (
          <li className="sm:col-span-2">
            Đối chiếu chủ nhà: {c.ownerRelation.detail}
          </li>
        ) : null}
      </ul>
    </li>
  );
}

export function MuonTuoiLamNha({ primaryColor }: Props) {
  const [ownerYear, setOwnerYear] = useState(1985);
  const [targetYear, setTargetYear] = useState(CURRENT_YEAR);
  const [personYear, setPersonYear] = useState(1960);
  const [submitted, setSubmitted] = useState(false);
  const [checkedPerson, setCheckedPerson] = useState(false);

  const result = useMemo(
    () => getMuonTuoiLamNha(ownerYear, targetYear),
    [ownerYear, targetYear],
  );

  const person = useMemo(
    () => checkBorrowPerson(personYear, targetYear, ownerYear),
    [personYear, targetYear, ownerYear],
  );

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className={labelCls()}>
          Năm sinh chủ nhà (dương lịch)
          <input
            type="number"
            min={1900}
            max={2100}
            value={ownerYear}
            onChange={(e) => {
              setOwnerYear(Number(e.target.value));
              setSubmitted(false);
            }}
            className={`mt-1 ${inputCls}`}
          />
        </label>
        <label className={labelCls()}>
          Năm dự định làm nhà
          <input
            type="number"
            min={1900}
            max={2100}
            value={targetYear}
            onChange={(e) => {
              setTargetYear(Number(e.target.value));
              setSubmitted(false);
              setCheckedPerson(false);
            }}
            className={`mt-1 ${inputCls}`}
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => setSubmitted(true)}
        className="mt-5 px-5 py-2.5 text-sm text-white"
        style={{ backgroundColor: primaryColor }}
      >
        Xem tuổi mượn
      </button>

      {submitted ? (
        <div className="mt-8 border-t border-fog pt-6 space-y-8">
          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs text-muted uppercase tracking-widest">
                Tuổi chủ nhà
              </span>
              <VerdictBadge verdict={result.owner.overall} />
            </div>
            <div className="border border-fog bg-white p-4">
              <p className="text-sm text-ink">
                Sinh {result.owner.birthYear} · {result.owner.canChi} · tuổi mụ{' '}
                {result.owner.ageMu} (năm {result.owner.targetYear})
              </p>
              <p className="mt-2 text-xs text-muted leading-relaxed">
                {result.owner.summary}
              </p>
              <ul className="mt-4 space-y-2">
                {result.owner.results.map((r) => (
                  <li
                    key={r.key}
                    className="flex items-start gap-3 text-sm"
                  >
                    <VerdictBadge verdict={r.verdict} className="mt-0.5" />
                    <div>
                      <p className="font-medium text-ink">{r.label}</p>
                      <p className="text-xs text-muted mt-0.5">{r.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <p className="text-xs tracking-wide uppercase text-muted mb-2">
              {result.owner.needsBorrow
                ? 'Gợi ý người mượn tuổi'
                : 'Tham khảo — tuổi thuận làm nhà (nếu vẫn muốn mượn)'}
            </p>
            <p className="text-xs text-muted mb-3 leading-relaxed">
              Ưu tiên người thân huyết thống (cha, chú, bác, anh…), tuổi mụ{' '}
              {28}–{72}, không phạm Kim Lâu / Hoang Ốc trong năm làm nhà,
              không lục xung · lục hại tuổi chủ nhà; cộng điểm khi tam hợp /
              lục hợp chi hoặc nạp âm tương sinh với chủ nhà.
            </p>

            {result.best.length === 0 ? (
              <p className="text-sm text-muted">
                Không tìm thấy ứng viên “nên mượn” trong khoảng tuổi phổ biến.
                Thử nới tiêu chí hoặc hỏi <AdvisorName />.
              </p>
            ) : (
              <ul className="space-y-3">
                {result.best.map((c, i) => (
                  <CandidateCard
                    key={c.birthYear}
                    c={c}
                    primaryColor={primaryColor}
                    highlight={i < 3}
                  />
                ))}
              </ul>
            )}

            {result.candidates.some((c) => c.overall === 'caution') ? (
              <div className="mt-4">
                <p className="text-xs tracking-wide uppercase text-muted mb-2">
                  Ứng viên tạm được
                </p>
                <ul className="space-y-3">
                  {result.candidates
                    .filter((c) => c.overall === 'caution')
                    .slice(0, 4)
                    .map((c) => (
                      <CandidateCard
                        key={c.birthYear}
                        c={c}
                        primaryColor={primaryColor}
                      />
                    ))}
                </ul>
              </div>
            ) : null}
          </section>

          <section className="border-t border-fog pt-6">
            <p className="text-xs tracking-wide uppercase text-muted mb-3">
              Kiểm tra người cụ thể
            </p>
            <p className="text-xs text-muted mb-3 leading-relaxed">
              Đã có người thân định mượn tuổi? Nhập năm sinh để kiểm tra có
              thuận năm {targetYear} không.
            </p>
            <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
              <label className={labelCls()}>
                Năm sinh người được mượn tuổi
                <input
                  type="number"
                  min={1900}
                  max={2100}
                  value={personYear}
                  onChange={(e) => {
                    setPersonYear(Number(e.target.value));
                    setCheckedPerson(false);
                  }}
                  className={`mt-1 ${inputCls}`}
                />
              </label>
              <button
                type="button"
                onClick={() => setCheckedPerson(true)}
                className="px-4 py-2.5 text-sm border border-fog text-ink hover:border-ink/30"
              >
                Kiểm tra
              </button>
            </div>

            {checkedPerson ? (
              <ul className="mt-4 space-y-3">
                <CandidateCard c={person} primaryColor={primaryColor} highlight />
              </ul>
            ) : null}
          </section>

          <HeTrongAiPanel
            primaryColor={primaryColor}
            resetKey={`${ownerYear}-${targetYear}-${checkedPerson ? personYear : ''}`}
            payload={{
              topic: 'muon_tuoi',
              ownerYear,
              targetYear,
              personYear: checkedPerson ? personYear : null,
            }}
          />
        </div>
      ) : null}

      <p className="mt-6 text-xs text-muted leading-relaxed">
        Mượn tuổi là tục dân gian khi phạm Kim Lâu / Hoang Ốc: người được mượn
        thường chủ trì động thổ hoặc đứng tên ngày lành. Việc hệ trọng nên hỏi
        thêm <AdvisorName fallback="trụ trì / thầy trong chùa" />.
      </p>
    </div>
  );
}
