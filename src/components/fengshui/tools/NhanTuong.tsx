'use client';

import { useMemo, useState } from 'react';
import {
  ASPECT_ORDER,
  NHAN_TUONG_FEATURES,
  THAP_NHI_CUNG,
  analyzeNhanTuong,
  type NhanTuongFeatureDef,
  type NhanTuongFeatureId,
  type NhanTuongGender,
  type NhanTuongInput,
  type NhanTuongResult,
} from '@/lib/fengshui/nhan-tuong';
import type { VisionAnalysis } from '@/lib/fengshui/nhan-tuong-vision';
import { HeTrongAiPanel } from './HeTrongAiPanel';
import { NhanTuongGuide } from './NhanTuongGuide';
import { NhanTuongPhoto } from './NhanTuongPhoto';

interface Props {
  primaryColor: string;
}

/** Lựa chọn mặc định — phương án "cân đối / trung tính" của từng bộ vị. */
const DEFAULT_SELECTION: Record<NhanTuongFeatureId, string> = {
  faceShape: 'tho',
  thuongDinh: 'can_doi',
  trungDinh: 'can_doi',
  haDinh: 'can_doi',
  longMay: 'thanh_tu',
  mat: 'den_trang_ro',
  mui: 'cao_thang_no',
  mieng: 'vuong_day',
  tai: 'day_to_chau',
  thanThai: 'an_dinh',
};

function OptionGroup({
  def,
  index,
  value,
  onChange,
  primaryColor,
  suggested,
}: {
  def: NhanTuongFeatureDef;
  index: number;
  value: string;
  onChange: (id: string) => void;
  primaryColor: string;
  /** true nếu lựa chọn hiện tại do máy gợi ý từ ảnh. */
  suggested?: boolean;
}) {
  const selected = def.options.find((o) => o.id === value) ?? def.options[0];

  return (
    <section className="border border-fog bg-white p-4 sm:p-5">
      <p
        className="text-[0.65rem] font-semibold uppercase tracking-[0.25em]"
        style={{ color: primaryColor }}
      >
        Bước {index}
        {def.quan ? ` · ${def.quan}` : ''}
      </p>
      <h3 className="mt-1.5 font-display text-lg text-ink">
        {def.title}
        {suggested ? (
          <span
            className="ml-2 align-middle border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide"
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            máy gợi ý từ ảnh — xem lại
          </span>
        ) : null}
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-muted">{def.intro}</p>
      <NhanTuongGuide
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

export function NhanTuong({ primaryColor }: Props) {
  const [gender, setGender] = useState<NhanTuongGender>('nam');
  const [selection, setSelection] =
    useState<Record<NhanTuongFeatureId, string>>(DEFAULT_SELECTION);
  const [result, setResult] = useState<NhanTuongResult | null>(null);
  const [suggestedIds, setSuggestedIds] = useState<Set<NhanTuongFeatureId>>(
    () => new Set(),
  );

  const input: NhanTuongInput = useMemo(
    () => ({ gender, ...selection }),
    [gender, selection],
  );
  const resetKey = useMemo(
    () => [gender, ...NHAN_TUONG_FEATURES.map((f) => selection[f.id])].join('|'),
    [gender, selection],
  );

  function setFeature(id: NhanTuongFeatureId, optionId: string) {
    setSelection((s) => ({ ...s, [id]: optionId }));
    // Người dùng tự chỉnh → không còn là "gợi ý máy" nữa
    setSuggestedIds((old) => {
      if (!old.has(id)) return old;
      const next = new Set(old);
      next.delete(id);
      return next;
    });
  }

  function applyVision(analysis: VisionAnalysis) {
    setSelection((s) => {
      const next = { ...s };
      for (const sug of analysis.suggestions) {
        next[sug.featureId] = sug.optionId;
      }
      return next;
    });
    setSuggestedIds(new Set(analysis.suggestions.map((s) => s.featureId)));
    // Gợi ý mới → kết quả cũ (nếu có) không còn khớp lựa chọn
    setResult(null);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(analyzeNhanTuong(input));
  }

  return (
    <div>
      <p className="mb-4 text-sm leading-relaxed text-muted">
        Nhân tướng học cổ truyền luận theo{' '}
        <span className="text-ink">Tam đình</span> (ba đoạn vận đời),{' '}
        <span className="text-ink">Ngũ quan</span> (mày · mắt · mũi · miệng ·
        tai), <span className="text-ink">Ngũ hành hình tướng</span> và{' '}
        <span className="text-ink">thần thái</span>. Quý vị đứng trước gương
        (hoặc nhìn ảnh chụp thẳng, đủ sáng), lần lượt chọn mô tả gần nhất với
        khuôn mặt mình — hệ thống sẽ luận chi tiết từng bộ vị và chấm 5 phương
        diện ngay trên máy. Muốn nhanh hơn, quý vị có thể để máy đo tỷ lệ từ
        ảnh chân dung rồi chỉ việc xem lại.
      </p>

      <div className="mb-4">
        <NhanTuongPhoto primaryColor={primaryColor} onApply={applyVision} />
      </div>

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
            Một số luật tướng cổ truyền luận khác nhau giữa nam và nữ (mũi, địa
            các, thần khí…).
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
                    active ? 'text-white' : 'border-fog bg-paper text-ink hover:bg-mist'
                  }`}
                  style={
                    active
                      ? { backgroundColor: primaryColor, borderColor: primaryColor }
                      : undefined
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        {NHAN_TUONG_FEATURES.map((def, i) => (
          <OptionGroup
            key={def.id}
            def={def}
            index={i + 1}
            value={selection[def.id]}
            onChange={(optionId) => setFeature(def.id, optionId)}
            primaryColor={primaryColor}
            suggested={suggestedIds.has(def.id)}
          />
        ))}

        <button
          type="submit"
          className="px-6 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: primaryColor }}
        >
          Luận nhân tướng
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
                  {result.faceElement.label} · hành{' '}
                  <span className="text-ink">{result.faceElement.element}</span>
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink">
              {result.overallNote}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              {result.faceElement.boTro}
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
                      <p className="text-sm font-semibold text-ink">{a.label}</p>
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

          {/* Tam đình */}
          <section className="border border-fog bg-white p-4 sm:p-5">
            <p
              className="text-[0.65rem] font-semibold uppercase tracking-[0.25em]"
              style={{ color: primaryColor }}
            >
              Tam đình — ba đoạn vận đời
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink">
              {result.tamDinhBalance}
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {result.tamDinh.map((d) => (
                <div key={d.featureId} className="border border-fog bg-paper/60 p-3">
                  <p className="text-[10px] uppercase tracking-wide text-muted">
                    {d.vanLabel}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-ink">
                    {d.title}
                  </p>
                  <p className="text-xs" style={{ color: primaryColor }}>
                    {d.option.label}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-ink">
                    {d.option.luan}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Ngũ quan + thần thái */}
          <section className="space-y-3">
            {result.nguQuan.map((q) => (
              <div key={q.featureId} className="border border-fog bg-white p-4 sm:p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-display text-lg text-ink">
                    {q.title}
                    {q.quan ? (
                      <span className="ml-2 text-xs font-normal text-muted">
                        {q.quan}
                      </span>
                    ) : null}
                  </p>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: primaryColor }}
                  >
                    {q.option.label}
                  </p>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink">
                  {q.option.luan}
                </p>
                {q.option.advice ? (
                  <p className="mt-2 border-l-2 pl-3 text-xs leading-relaxed text-muted" style={{ borderColor: primaryColor }}>
                    Bồi đắp: {q.option.advice}
                  </p>
                ) : null}
              </div>
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

          {/* Lời khuyên dưỡng tướng */}
          <section className="border border-fog bg-white p-4 sm:p-5">
            <p
              className="text-[0.65rem] font-semibold uppercase tracking-[0.25em]"
              style={{ color: primaryColor }}
            >
              Dưỡng tướng — dưỡng tâm
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
            endpoint="/api/nhan-tuong/luan-giai"
            resetKey={resetKey}
            payload={{ topic: 'nhan_tuong', ...input }}
            introNote="Kết quả bên trên do khung tướng pháp cổ truyền (Tam đình · Ngũ quan · Ngũ hành hình tướng) luận sẵn trên máy."
          />

          {/* Tư liệu tham khảo: Thập nhị cung */}
          <details className="border border-fog bg-white">
            <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-ink hover:bg-mist">
              Tư liệu thêm: Thập nhị cung trên khuôn mặt
            </summary>
            <div className="border-t border-fog px-4 py-4">
              <p className="text-xs leading-relaxed text-muted">
                Ngoài Tam đình và Ngũ quan, tướng pháp còn chia khuôn mặt thành
                12 cung — mỗi cung ứng một mặt đời sống. Quý vị có thể tự đối
                chiếu: cung nào đầy đặn, sáng nhuận, không sẹo vết cắt phá là
                cung ấy được thế.
              </p>
              <ul className="mt-3 space-y-2">
                {THAP_NHI_CUNG.map((c) => (
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
            Nhân tướng học là cổ học tham khảo, luận theo thiên hướng chứ không
            án định số phận — "hữu tâm vô tướng, tướng tự tâm sinh; hữu tướng vô
            tâm, tướng tùy tâm diệt". Kết quả dựa trên phần quý vị tự quan sát,
            nên xem trong điều kiện đủ sáng, tinh thần thư thái; việc hệ trọng
            xin thỉnh ý người có kinh nghiệm trực tiếp.
          </p>
        </div>
      ) : null}
    </div>
  );
}
