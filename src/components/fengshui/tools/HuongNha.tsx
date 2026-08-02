'use client';

import { useMemo, useState } from 'react';
import { buildHuongNha } from '@/lib/fengshui/huong-nha';
import { inputCls, labelCls } from '../FieldStyles';
import { AdvisorName } from '@/components/SitePersonaContext';
import { HeTrongAiPanel } from './HeTrongAiPanel';

interface Props {
  primaryColor: string;
}

export function HuongNha({ primaryColor }: Props) {
  const [birthYear, setBirthYear] = useState<number>(1985);
  const [gender, setGender] = useState<'nam' | 'nu'>('nam');
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(
    () => buildHuongNha(birthYear, gender),
    [birthYear, gender],
  );

  return (
    <div>
      <p className="text-sm text-muted leading-relaxed mb-4">
        Tính cung phi bát trạch theo năm sinh âm lịch (kua số 5: nam ký Khôn,
        nữ ký Cấn) và trả đủ 8 hướng với du niên — Sinh Khí, Thiên Y, Diên
        Niên, Phục Vị (tốt) · Họa Hại, Lục Sát, Ngũ Quỷ, Tuyệt Mệnh (xấu).
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
          Giới tính
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as 'nam' | 'nu')}
            className={`mt-1 ${inputCls}`}
          >
            <option value="nam">Nam</option>
            <option value="nu">Nữ</option>
          </select>
        </label>
      </div>
      <button
        onClick={() => setSubmitted(true)}
        className="mt-5 px-5 py-2.5 text-sm text-white"
        style={{ backgroundColor: primaryColor }}
      >
        Tính hướng nhà
      </button>

      {submitted ? (
        <div className="mt-8 border-t border-fog pt-6 space-y-6">
          <div className="border border-fog bg-white p-4">
            <p className="text-sm text-ink">
              Sinh {result.birthYear} ({result.canChi}) ·{' '}
              {result.gender === 'nam' ? 'Nam' : 'Nữ'} — cung phi{' '}
              <b>{result.cungPhi}</b> ({result.nhomTrach})
            </p>
            <p className="mt-2 text-xs text-muted leading-relaxed">
              {result.summary}
            </p>
          </div>

          <div>
            <p className="text-xs tracking-wide uppercase text-muted mb-2">
              8 hướng theo du niên (xếp từ tốt nhất)
            </p>
            <ul className="grid sm:grid-cols-2 gap-3">
              {result.huongs.map((h) => (
                <li
                  key={h.huong}
                  className={`border p-4 ${
                    h.level === 'tot'
                      ? 'border-emerald-800/25 bg-emerald-50/50'
                      : 'border-stone-400/30 bg-stone-50'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-ink">
                      {h.rank}. Hướng {h.huong}{' '}
                      <span className="text-muted font-normal">
                        (quái {h.quai})
                      </span>
                    </p>
                    <p
                      className="text-xs font-medium"
                      style={
                        h.level === 'tot' ? { color: primaryColor } : undefined
                      }
                    >
                      {h.duNien}
                    </p>
                  </div>
                  <p className="mt-1.5 text-xs text-muted leading-relaxed">
                    {h.meaning}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <HeTrongAiPanel
            primaryColor={primaryColor}
            resetKey={`${birthYear}-${gender}`}
            payload={{ topic: 'huong_nha', birthYear, gender }}
          />

          <p className="text-xs text-muted leading-relaxed">
            Hướng nhà tính theo hướng cửa chính / hướng tọa nhà; nhà đã xây
            hướng xấu có thể hóa giải bằng bố trí nội thất, bếp, bàn thờ —
            nên hỏi <AdvisorName /> khi áp dụng thực tế.
          </p>
        </div>
      ) : null}
    </div>
  );
}
