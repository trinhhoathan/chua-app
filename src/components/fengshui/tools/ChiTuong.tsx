'use client';

import { useMemo, useState } from 'react';
import {
  ASPECT_ORDER,
  CHI_TUONG_FEATURES,
  DUONG_PHU,
  analyzeChiTuong,
  type ChiTuongFeatureDef,
  type ChiTuongFeatureId,
  type ChiTuongGender,
  type ChiTuongInput,
  type ChiTuongResult,
} from '@/lib/fengshui/chi-tuong';
import { ChiTuongGuide } from './ChiTuongGuide';
import { HeTrongAiPanel } from './HeTrongAiPanel';

interface Props {
  primaryColor: string;
}

/** Lựa chọn mặc định — phương án trung tính / phổ biến của từng bộ vị. */
const DEFAULT_SELECTION: Record<ChiTuongFeatureId, string> = {
  banTay: 'tho',
  ngonCai: 'can_doi',
  tamDao: 'dai_cong_len',
  triDao: 'ro_dai_hoi_cong',
  sinhDao: 'trung_binh',
  dinhMenh: 'ro_thang',
  honNhan: 'mot_sau_ro',
  goNoiBat: 'bang_phang',
};

function OptionGroup({
  def,
  index,
  value,
  onChange,
  primaryColor,
}: {
  def: ChiTuongFeatureDef;
  index: number;
  value: string;
  onChange: (id: string) => void;
  primaryColor: string;
}) {
  const selected = def.options.find((o) => o.id === value) ?? def.options[0];

  return (
    <section className="border border-fog bg-white p-4 sm:p-5">
      <p
        className="text-[0.65rem] font-semibold uppercase tracking-[0.25em]"
        style={{ color: primaryColor }}
      >
        Bước {index}
        {def.viTri ? ` · ${def.viTri}` : ''}
      </p>
      <h3 className="mt-1.5 font-display text-lg text-ink">{def.title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-muted">{def.intro}</p>
      <ChiTuongGuide
        featureId={def.id}
        optionId={selected.id}
        title={def.title}
        caption={`${selected.label} — ${selected.hint}`}
      />
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {def.options.map((opt) => {
          const active = opt.id === value;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              aria-pressed={active}
              className={`border p-3 text-left transition-colors ${
                active ? 'bg-mist' : 'border-fog bg-paper hover:bg-mist'
              }`}
              style={active ? { borderColor: primaryColor } : undefined}
            >
              <span
                className="block text-sm font-semibold"
                style={{ color: active ? primaryColor : undefined }}
              >
                <span className={active ? '' : 'text-ink'}>{opt.label}</span>
              </span>
              <span className="mt-1 block text-[11px] leading-relaxed text-muted">
                {opt.hint}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ScoreBar({
  score,
  primaryColor,
}: {
  score: number;
  primaryColor: string;
}) {
  return (
    <div className="h-2 w-full bg-mist">
      <div
        className="h-2 transition-all"
        style={{ width: `${score}%`, backgroundColor: primaryColor }}
      />
    </div>
  );
}

function ReadingCard({
  title,
  viTri,
  optionLabel,
  luan,
  advice,
  primaryColor,
}: {
  title: string;
  viTri?: string;
  optionLabel: string;
  luan: string;
  advice?: string;
  primaryColor: string;
}) {
  return (
    <div className="border border-fog bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-display text-lg text-ink">
          {title}
          {viTri ? (
            <span className="ml-2 text-xs font-normal text-muted">{viTri}</span>
          ) : null}
        </p>
        <p className="text-xs font-semibold" style={{ color: primaryColor }}>
          {optionLabel}
        </p>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink">{luan}</p>
      {advice ? (
        <p
          className="mt-2 border-l-2 pl-3 text-xs leading-relaxed text-muted"
          style={{ borderColor: primaryColor }}
        >
          Bồi đắp: {advice}
        </p>
      ) : null}
    </div>
  );
}

export function ChiTuong({ primaryColor }: Props) {
  const [gender, setGender] = useState<ChiTuongGender>('nam');
  const [selection, setSelection] =
    useState<Record<ChiTuongFeatureId, string>>(DEFAULT_SELECTION);
  const [result, setResult] = useState<ChiTuongResult | null>(null);

  const input: ChiTuongInput = useMemo(
    () => ({ gender, ...selection }),
    [gender, selection],
  );
  const resetKey = useMemo(
    () =>
      [gender, ...CHI_TUONG_FEATURES.map((f) => selection[f.id])].join('|'),
    [gender, selection],
  );

  function setFeature(id: ChiTuongFeatureId, optionId: string) {
    setSelection((s) => ({ ...s, [id]: optionId }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(analyzeChiTuong(input));
  }

  return (
    <div>
      <p className="mb-4 text-sm leading-relaxed text-muted">
        Chỉ tướng (thủ tướng học) luận theo{' '}
        <span className="text-ink">thủ hình ngũ hành</span>, ba đường chính{' '}
        <span className="text-ink">Tâm đạo · Trí đạo · Sinh đạo</span>, đường
        Định Mệnh, đường Hôn Nhân, các <span className="text-ink">gò</span> và
        ngón cái. Cách xem: ngửa <span className="text-ink">bàn tay thuận</span>{' '}
        dưới ánh sáng tốt (tay thuận là "hậu thiên" — hiện tại do mình gây
        dựng; tay kia là "tiên thiên" — vốn bẩm sinh, có thể đối chiếu thêm).
        Lần lượt chọn mô tả gần nhất — hệ thống luận chi tiết từng bộ vị và
        chấm 5 phương diện ngay trên máy.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <section className="border border-fog bg-white p-4 sm:p-5">
          <p
            className="text-[0.65rem] font-semibold uppercase tracking-[0.25em]"
            style={{ color: primaryColor }}
          >
            Người xem
          </p>
          <h3 className="mt-1.5 font-display text-lg text-ink">Giới tính</h3>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Cổ truyền có phép "nam tả nữ hữu" và vài luật luận riêng theo giới
            tính (gò Thủy Tinh, ngón cái…).
          </p>
          <div className="mt-3 flex gap-2">
            {(
              [
                ['nam', 'Nam'],
                ['nu', 'Nữ'],
              ] as const
            ).map(([id, label]) => {
              const active = gender === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setGender(id)}
                  aria-pressed={active}
                  className={`border px-5 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? 'text-white'
                      : 'border-fog bg-paper text-ink hover:bg-mist'
                  }`}
                  style={
                    active
                      ? {
                          backgroundColor: primaryColor,
                          borderColor: primaryColor,
                        }
                      : undefined
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        {CHI_TUONG_FEATURES.map((def, i) => (
          <OptionGroup
            key={def.id}
            def={def}
            index={i + 1}
            value={selection[def.id]}
            onChange={(optionId) => setFeature(def.id, optionId)}
            primaryColor={primaryColor}
          />
        ))}

        <button
          type="submit"
          className="px-6 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: primaryColor }}
        >
          Luận chỉ tướng
        </button>
      </form>

      {result ? (
        <div className="mt-10 space-y-5">
          {/* Tổng quan cách cục */}
          <section className="border border-fog bg-gradient-to-b from-[#faf6ef] to-white px-4 py-5 sm:px-6">
            <p className="text-[10px] uppercase tracking-wide text-muted">
              Cách cục tổng thể
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <span
                className="inline-flex size-16 items-center justify-center font-display text-2xl text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {result.overallScore}
              </span>
              <div className="min-w-0">
                <p className="font-display text-xl text-ink">
                  {result.overallLabel}
                </p>
                <p className="text-sm text-muted">
                  {result.handElement.label} · hành{' '}
                  <span className="text-ink">{result.handElement.element}</span>
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink">
              {result.overallNote}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              {result.handElement.boTro}
            </p>
          </section>

          {/* 5 phương diện */}
          <section className="border border-fog bg-white p-4 sm:p-5">
            <p
              className="text-[0.65rem] font-semibold uppercase tracking-[0.25em]"
              style={{ color: primaryColor }}
            >
              Năm phương diện
            </p>
            <div className="mt-3 space-y-4">
              {ASPECT_ORDER.map((id) => {
                const a = result.aspects.find((x) => x.aspect === id)!;
                return (
                  <div key={id}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-ink">
                        {a.label}
                      </p>
                      <p className="text-xs text-muted">
                        <span
                          className="font-semibold tabular-nums"
                          style={{ color: primaryColor }}
                        >
                          {a.score}
                        </span>
                        /100 · {a.bandLabel}
                      </p>
                    </div>
                    <div className="mt-1.5">
                      <ScoreBar score={a.score} primaryColor={primaryColor} />
                    </div>
                    {a.notes.length ? (
                      <ul className="mt-2 space-y-1">
                        {a.notes.map((n) => (
                          <li
                            key={n}
                            className="text-[11px] leading-relaxed text-muted"
                          >
                            · {n}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Ba đường chính */}
          <section className="border border-fog bg-white p-4 sm:p-5">
            <p
              className="text-[0.65rem] font-semibold uppercase tracking-[0.25em]"
              style={{ color: primaryColor }}
            >
              Ba đường chính — trục cách cục
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink">
              {result.baDuongNote}
            </p>
          </section>
          <section className="space-y-3">
            {result.baDuongChinh.map((d) => (
              <ReadingCard
                key={d.featureId}
                title={d.title}
                viTri={d.viTri}
                optionLabel={d.option.label}
                luan={d.option.luan}
                advice={d.option.advice}
                primaryColor={primaryColor}
              />
            ))}
          </section>

          {/* Các bộ vị khác */}
          <section className="space-y-3">
            {result.boViKhac.map((d) => (
              <ReadingCard
                key={d.featureId}
                title={d.title}
                viTri={d.viTri}
                optionLabel={d.option.label}
                luan={d.option.luan}
                advice={d.option.advice}
                primaryColor={primaryColor}
              />
            ))}
          </section>

          {/* Ghi chú giới tính */}
          {result.genderNotes.length ? (
            <section className="border border-fog bg-mist px-4 py-3">
              <p className="text-[10px] uppercase tracking-wide text-muted">
                Luật riêng theo giới tính
              </p>
              <ul className="mt-1 space-y-1">
                {result.genderNotes.map((n) => (
                  <li key={n} className="text-xs leading-relaxed text-ink">
                    · {n}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* Lời khuyên */}
          <section className="border border-fog bg-white p-4 sm:p-5">
            <p
              className="text-[0.65rem] font-semibold uppercase tracking-[0.25em]"
              style={{ color: primaryColor }}
            >
              Bồi đắp — tay làm nên tướng
            </p>
            <ul className="mt-2 space-y-2">
              {result.advices.map((a) => (
                <li key={a} className="text-sm leading-relaxed text-ink">
                  · {a}
                </li>
              ))}
            </ul>
          </section>

          {/* AI luận sâu thêm */}
          <HeTrongAiPanel
            primaryColor={primaryColor}
            endpoint="/api/chi-tuong/luan-giai"
            resetKey={resetKey}
            payload={{ topic: 'chi_tuong', ...input }}
            introNote="Kết quả bên trên do khung thủ tướng cổ truyền (thủ hình ngũ hành · ba đường chính · gò) luận sẵn trên máy."
          />

          {/* Tư liệu tham khảo */}
          <details className="border border-fog bg-white">
            <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-ink hover:bg-mist">
              Tư liệu thêm: các đường phụ và dấu hiệu thường hỏi
            </summary>
            <div className="border-t border-fog px-4 py-4">
              <ul className="space-y-2">
                {DUONG_PHU.map((c) => (
                  <li key={c.name} className="text-xs leading-relaxed">
                    <span className="font-semibold text-ink">{c.name}</span>{' '}
                    <span className="text-muted">({c.position})</span>
                    <span className="block text-muted">{c.meaning}</span>
                  </li>
                ))}
              </ul>
            </div>
          </details>

          <p className="border border-fog bg-white px-4 py-3 text-[11px] leading-relaxed text-muted">
            Thủ tướng học là cổ học tham khảo: đường chỉ tay đổi theo sức
            khỏe, tâm trạng và nếp sống — kết quả là tấm gương soi hiện trạng
            để tu sửa, không phải án định số phận, tuyệt đối không luận sinh
            tử. Kết quả dựa trên phần quý vị tự quan sát; việc hệ trọng xin
            thỉnh ý người có kinh nghiệm trực tiếp.
          </p>
        </div>
      ) : null}
    </div>
  );
}
