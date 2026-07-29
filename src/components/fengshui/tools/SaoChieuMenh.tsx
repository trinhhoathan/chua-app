'use client';

import { useMemo, useState } from 'react';
import {
  allCuuDieuStars,
  getSaoChieuMenh,
  toneLabel,
  type StarTone,
} from '@/lib/fengshui/sao-chieu-menh';
import { VerdictBadge } from '../VerdictBadge';
import { inputCls, labelCls } from '../FieldStyles';

interface Props {
  primaryColor: string;
}

const CURRENT_YEAR = new Date().getFullYear();

function toneClass(tone: StarTone): string {
  if (tone === 'cat') return 'border-emerald-800/20 bg-emerald-50/60';
  if (tone === 'hung') return 'border-stone-400/40 bg-stone-100';
  return 'border-amber-800/20 bg-amber-50/50';
}

export function SaoChieuMenh({ primaryColor }: Props) {
  const [birthYear, setBirthYear] = useState(1985);
  const [viewYear, setViewYear] = useState(CURRENT_YEAR);
  const [gender, setGender] = useState<'nam' | 'nu'>('nam');
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(
    () => getSaoChieuMenh(birthYear, viewYear, gender),
    [birthYear, viewYear, gender],
  );

  const catalog = useMemo(() => allCuuDieuStars(), []);

  return (
    <div>
      <p className="text-sm text-muted leading-relaxed mb-4">
        Tra sao chiếu mệnh Cửu Diệu theo tuổi mụ và giới tính — kết hợp Thái Tuế
        · Tam Tai. Hung tinh hoặc phạm Thái Tuế thường gắn với lễ dâng sao giải
        hạn tại chùa.
      </p>

      <div className="grid sm:grid-cols-3 gap-4">
        <label className={labelCls()}>
          Năm sinh (dương lịch)
          <input
            type="number"
            min={1900}
            max={2100}
            value={birthYear}
            onChange={(e) => {
              setBirthYear(Number(e.target.value));
              setSubmitted(false);
            }}
            className={`mt-1 ${inputCls}`}
          />
        </label>
        <label className={labelCls()}>
          Năm xem hạn
          <input
            type="number"
            min={1900}
            max={2100}
            value={viewYear}
            onChange={(e) => {
              setViewYear(Number(e.target.value));
              setSubmitted(false);
            }}
            className={`mt-1 ${inputCls}`}
          />
        </label>
        <label className={labelCls()}>
          Giới tính
          <select
            value={gender}
            onChange={(e) => {
              setGender(e.target.value as 'nam' | 'nu');
              setSubmitted(false);
            }}
            className={`mt-1 ${inputCls}`}
          >
            <option value="nam">Nam</option>
            <option value="nu">Nữ</option>
          </select>
        </label>
      </div>

      <button
        type="button"
        onClick={() => setSubmitted(true)}
        className="mt-5 px-5 py-2.5 text-sm text-white"
        style={{ backgroundColor: primaryColor }}
      >
        Xem sao chiếu mệnh
      </button>

      {submitted ? (
        <div className="mt-8 border-t border-fog pt-6 space-y-8">
          <section className="border border-fog bg-white">
            <div className="px-4 py-3 border-b border-fog flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-xl text-ink">
                  Năm {result.viewYear}
                </p>
                <p className="text-sm text-muted mt-0.5">
                  Sinh {result.birthYear} · {result.birthCanChi} ·{' '}
                  {result.gender === 'nam' ? 'Nam' : 'Nữ'} · tuổi mụ{' '}
                  {result.ageMu} (dư {result.remainder})
                </p>
                <p className="text-xs text-muted mt-1">
                  Năm {result.yearCanChi}
                </p>
              </div>
              <VerdictBadge verdict={result.overall} />
            </div>
            <div className="px-4 py-4">
              <p className="text-sm font-medium text-ink">
                {result.overallLabel}
              </p>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                {result.overallDetail}
              </p>
            </div>
          </section>

          <section
            className={`border p-4 ${toneClass(result.star.tone)}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-[11px] text-muted uppercase tracking-wide">
                  Sao chiếu mệnh
                </p>
                <p
                  className="font-display text-2xl text-ink mt-1"
                  style={
                    result.star.tone === 'cat'
                      ? { color: primaryColor }
                      : undefined
                  }
                >
                  {result.star.name}
                </p>
                <p className="text-xs text-muted mt-1">
                  {toneLabel(result.star.tone)} · {result.star.element}
                </p>
              </div>
              <VerdictBadge verdict={result.starVerdict} />
            </div>
            <p className="mt-3 text-sm text-ink leading-relaxed">
              {result.star.summary}
            </p>
            <p className="mt-2 text-xs text-muted leading-relaxed">
              {result.star.advice}
            </p>
            <p className="mt-2 text-xs text-muted leading-relaxed">
              {result.star.ritualHint}
            </p>
          </section>

          <section>
            <p className="text-xs tracking-wide uppercase text-muted mb-2">
              Thái Tuế · Tam Tai
            </p>
            <ul className="space-y-3">
              <li className="border border-fog bg-white p-4 flex items-start gap-3">
                <VerdictBadge
                  verdict={result.taiSui.verdict}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-ink">
                    {result.taiSui.label}
                  </p>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    {result.taiSui.detail}
                  </p>
                </div>
              </li>
              <li className="border border-fog bg-white p-4 flex items-start gap-3">
                <VerdictBadge
                  verdict={result.tamTai.verdict}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-ink">Tam Tai</p>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    {result.tamTai.detail}
                  </p>
                </div>
              </li>
            </ul>
          </section>

          {(result.star.tone === 'hung' ||
            result.taiSui.kind !== 'binh') && (
            <section
              className="border px-4 py-3 text-sm"
              style={{
                borderColor: `${primaryColor}55`,
                backgroundColor: `${primaryColor}0d`,
              }}
            >
              <p className="font-medium text-ink">Gợi ý tại chùa</p>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Năm có hung tinh hoặc phạm · xung Thái Tuế, Phật tử thường đăng
                ký lễ dâng sao giải hạn / cầu an theo lịch nhà chùa. Liên hệ trụ
                trì để chọn ngày khoa lễ phù hợp.
              </p>
            </section>
          )}

          <section>
            <p className="text-xs tracking-wide uppercase text-muted mb-2">
              Sao 9 năm tới
            </p>
            <ul className="grid sm:grid-cols-3 gap-2">
              {result.upcoming.map((u) => (
                <li
                  key={u.year}
                  className={`border px-3 py-2.5 ${
                    u.year === result.viewYear
                      ? 'border-ink/25'
                      : 'border-fog bg-white'
                  } ${toneClass(u.tone)}`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-ink tabular-nums">
                      {u.year}
                    </p>
                    <VerdictBadge verdict={u.verdict} />
                  </div>
                  <p className="mt-1 text-xs text-ink">{u.starName}</p>
                  <p className="text-[11px] text-muted">
                    Tuổi mụ {u.ageMu} · {toneLabel(u.tone)}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <p className="text-xs tracking-wide uppercase text-muted mb-2">
              Cửu Diệu — tham khảo
            </p>
            <ul className="grid sm:grid-cols-3 gap-2">
              {catalog.map((s) => (
                <li
                  key={s.name}
                  className={`border px-3 py-2.5 text-xs ${toneClass(s.tone)}`}
                >
                  <p className="font-medium text-ink text-sm">{s.name}</p>
                  <p className="text-muted mt-0.5">
                    {toneLabel(s.tone)} · {s.element}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}

      <p className="mt-6 text-xs text-muted leading-relaxed">
        Bảng Cửu Diệu dân gian (nam đếm thuận từ La Hầu, nữ đếm nghịch từ Kế
        Đô) theo tuổi mụ. Chỉ mang tính tham khảo; khoa lễ dâng sao do trụ trì
        hướng dẫn.
      </p>
    </div>
  );
}
