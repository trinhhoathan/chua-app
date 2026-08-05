'use client';

import { useMemo, useState } from 'react';
import {
  analyzeBoiSim,
  elementLabel,
  type BoiSimResult,
} from '@/lib/fengshui/boi-sim';
import {
  analyzeBatCucTopic,
  buildBatCucPromptContext,
  parseBatCucInput,
} from '@/lib/fengshui/bat-cuc-contexts';
import {
  AspectBars,
  BAT_CUC_TABLE_NOTE,
  EnergyChain,
  MethodNote,
  PairDetail,
  StarLibrary,
  kindBadge,
} from '@/components/fengshui/tools/BatCucResultBlocks';
import { BatCucEssaySection } from '@/components/fengshui/tools/BatCucEssaySection';
import { BatCucChatPanel } from '@/components/fengshui/tools/BatCucChatPanel';
import { SimBetterUpsell } from '@/components/sim/SimBetterUpsell';
import { inputCls, labelCls } from '../FieldStyles';

interface Props {
  primaryColor: string;
  templeId?: string;
  templeName?: string;
  templeHotline?: string | null;
  templePhone?: string | null;
}

const VERDICT_LABELS: Record<BoiSimResult['verdict'], string> = {
  tot: 'Sim đẹp — nên giữ dùng',
  kha: 'Khá — dùng tốt',
  trung_binh: 'Trung bình — cát hung đan xen',
  yeu: 'Yếu — nên cân nhắc đổi',
};

function ResultView({
  result,
  primaryColor,
}: {
  result: BoiSimResult;
  primaryColor: string;
}) {
  return (
    <div className="space-y-5">
      {/* Kết luận tổng */}
      <div className="border border-fog bg-gradient-to-b from-[#faf6ef] to-white px-4 py-5 sm:px-6">
        <p className="text-[10px] uppercase tracking-wide text-muted">
          nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận · luận giải số điện thoại
        </p>
        <p className="font-display text-2xl text-ink mt-1 tabular-nums">
          {result.display}
        </p>
        <div className="mt-3 flex flex-wrap items-end gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted">
              Điểm tổng
            </p>
            <p
              className="font-display text-4xl tabular-nums"
              style={{ color: primaryColor }}
            >
              {result.overallScore}
              <span className="text-base text-muted">/100</span>
            </p>
          </div>
          <p className="text-sm text-ink pb-1 font-medium">
            {VERDICT_LABELS[result.verdict]}
          </p>
        </div>
        <p className="mt-3 text-sm text-ink leading-relaxed">{result.advice}</p>
        <p className="mt-2 text-xs text-muted">
          Cát {result.catPairs}/{result.pairs.length} cặp · Hung{' '}
          {result.hungPairs}/{result.pairs.length} cặp · Điểm luận số{' '}
          {result.duNienScore}/100
        </p>
        {result.tail.warning ? (
          <p className="mt-3 text-[13px] leading-relaxed border border-red-800/30 bg-red-50/70 text-red-900 px-3 py-2">
            {result.tail.warning}
          </p>
        ) : null}
      </div>

      {/* Chuỗi năng lượng */}
      <section className="border border-fog bg-white px-4 py-4">
        <p className="text-[10px] uppercase tracking-wide text-muted">
          Chuỗi năng lượng của dãy số
        </p>
        <p className="text-xs text-muted mt-0.5 mb-3">
          Số 0 · 5 không thuộc quái — hiển thị nhỏ, đóng vai trò biến số. Ô
          viền đậm là vùng đuôi (ảnh hưởng mạnh nhất).
        </p>
        <EnergyChain pairs={result.pairs} />
      </section>

      {/* Luận giải tổng hợp */}
      <section className="border border-fog bg-white px-4 py-4">
        <p className="text-[10px] uppercase tracking-wide text-muted mb-2">
          Luận giải tổng hợp
        </p>
        <div className="space-y-3">
          {result.luanGiai.map((p, i) => (
            <p key={i} className="text-sm text-ink leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* 5 phương diện + 3 số cuối */}
      <div className="grid sm:grid-cols-2 gap-3">
        <section className="border border-fog bg-white px-4 py-4">
          <p className="text-[10px] uppercase tracking-wide text-muted mb-3">
            Năm phương diện
          </p>
          <AspectBars aspects={result.aspects} primaryColor={primaryColor} />
        </section>

        <section className="border border-fog bg-white px-4 py-4">
          <p className="text-[10px] uppercase tracking-wide text-muted">
            Ba số cuối — phần quyết định
          </p>
          <p className="font-display text-3xl text-ink mt-1 tabular-nums">
            {result.tail.last3}
          </p>
          {result.tail.star ? (
            <p className="text-sm text-ink mt-1">
              Sao đóng đuôi:{' '}
              <span className="font-medium">{result.tail.star.nameVi}</span>{' '}
              <span className="text-muted text-xs">
                ({result.tail.star.nameHan})
              </span>{' '}
              {kindBadge(result.tail.star.kind)}
            </p>
          ) : null}
          <ul className="mt-2 space-y-1.5">
            {result.tail.notes.map((n) => (
              <li key={n} className="text-[13px] text-ink leading-relaxed">
                · {n}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Tổ hợp đặc biệt */}
      {result.combos.length > 0 ? (
        <section className="border border-fog bg-white">
          <div className="px-4 py-3 border-b border-fog">
            <p className="text-[10px] uppercase tracking-wide text-muted">
              Tổ hợp năng lượng đặc biệt
            </p>
            <p className="text-sm text-ink mt-0.5">
              Các sao liền kề chế hóa / cộng hưởng lẫn nhau
            </p>
          </div>
          <ul className="divide-y divide-fog">
            {result.combos.map((c, i) => (
              <li key={`${c.title}-${i}`} className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] uppercase tracking-wide px-2 py-0.5 text-white ${
                      c.kind === 'hung' ? 'bg-stone-600' : 'bg-emerald-800'
                    }`}
                  >
                    {c.kind === 'cat'
                      ? 'Cát'
                      : c.kind === 'che_hoa'
                        ? 'Chế hóa'
                        : 'Lưu ý'}
                  </span>
                  <p className="text-sm text-ink font-medium">{c.title}</p>
                  <span className="text-xs text-muted tabular-nums">
                    ({c.pairs})
                  </span>
                </div>
                <p className="text-[13px] text-muted mt-1 leading-relaxed">
                  {c.detail}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Chi tiết từng cặp */}
      <section className="border border-fog bg-white">
        <div className="px-4 py-3 border-b border-fog">
          <p className="text-[10px] uppercase tracking-wide text-muted">
            Chi tiết từng cặp quái số
          </p>
          <p className="text-sm text-ink mt-0.5">
            Bấm vào từng cặp để xem luận giải đầy đủ · 4 chấm là cường độ nội
            bộ sao
          </p>
        </div>
        <div className="divide-y divide-fog">
          {result.pairs.map((p, i) => (
            <PairDetail
              key={`${p.raw}-${i}`}
              pair={p}
              primaryColor={primaryColor}
            />
          ))}
        </div>
      </section>

      {/* Nghề nghiệp */}
      <section className="border border-fog bg-white px-4 py-4">
        <p className="text-[10px] uppercase tracking-wide text-muted mb-2">
          Cấu trúc sao hợp với nghề
        </p>
        <ul className="space-y-1.5">
          {result.careers.map((c) => (
            <li key={c} className="text-sm text-ink leading-relaxed">
              · {c}
            </li>
          ))}
        </ul>
      </section>

      {/* Tham khảo phụ */}
      <div className="grid sm:grid-cols-2 gap-3">
        <section className="border border-fog bg-white px-4 py-4 space-y-1.5">
          <p className="text-[10px] uppercase tracking-wide text-muted">
            81 Số Lý (4 số cuối) — hệ tham khảo phụ
          </p>
          <p className="font-display text-xl text-ink">
            Số {result.soLy81} — {result.soLyMeta.title}
          </p>
          <p className="text-xs text-muted">
            {result.soLyMeta.tone === 'cat'
              ? 'Cát'
              : result.soLyMeta.tone === 'hung'
                ? 'Hung'
                : 'Bán cát–hung'}{' '}
            · {result.soLyMeta.score}/10 · Hành sim{' '}
            {elementLabel(result.soLyElement)}
          </p>
          <p className="text-sm text-ink leading-relaxed">
            {result.soLyMeta.summary}
          </p>
        </section>

        <section className="border border-fog bg-white px-4 py-4 space-y-1.5">
          <p className="text-[10px] uppercase tracking-wide text-muted">
            Âm Dương · Tổng nút · Cách cục
          </p>
          <p className="text-sm text-ink">
            Âm (chẵn) {result.amCount} · Dương (lẻ) {result.duongCount} —{' '}
            {Math.abs(result.amCount - result.duongCount) <= 1
              ? 'cân bằng tốt'
              : Math.abs(result.amCount - result.duongCount) <= 3
                ? 'tương đối cân'
                : 'lệch nhiều, khí thiên lệch'}
          </p>
          <p className="text-sm text-ink">
            Tổng nút: <strong>{result.tongNut}</strong>
            {result.tongNut === 8
              ? ' — phát lộc (dân gian)'
              : result.tongNut === 6
                ? ' — lộc (dân gian)'
                : result.tongNut === 1
                  ? ' — khởi đầu, nhất quán'
                  : ''}
          </p>
          <ul className="text-sm text-ink space-y-0.5">
            {result.patterns.map((p) => (
              <li key={p}>· {p}</li>
            ))}
          </ul>
        </section>
      </div>

      {/* Hợp mệnh */}
      {result.napAm && result.elementRelation ? (
        <section className="border border-fog bg-white px-4 py-4 space-y-1.5">
          <p className="text-[10px] uppercase tracking-wide text-muted">
            Hợp mệnh (Nạp Âm năm sinh)
          </p>
          <p className="text-sm text-ink">
            Năm {result.birthYear}: {result.napAm.name} —{' '}
            {elementLabel(result.napAm.element)}
          </p>
          <p className="text-sm text-ink">
            Sim {elementLabel(result.elementRelation.sim)} ↔ Mệnh{' '}
            {elementLabel(result.elementRelation.menh)}:{' '}
            <strong>{result.elementRelation.relation}</strong>
          </p>
        </section>
      ) : null}
    </div>
  );
}

export function BoiSim({
  primaryColor,
  templeId = '',
  templeName = 'chùa',
  templeHotline,
  templePhone,
}: Props) {
  const contactPhone = templeHotline || templePhone || null;
  const [phone, setPhone] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BoiSimResult | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  // Ngữ cảnh AI: dùng chung engine + builder với 13 trang Âm Dương Ngũ Hành còn lại
  const analysisContext = useMemo(() => {
    if (!result) return '';
    const parsed = parseBatCucInput('sim', result.digits.join(''));
    if ('error' in parsed) return '';
    const analysis = analyzeBatCucTopic('sim', parsed, result.birthYear);
    if ('error' in analysis) return '';
    return buildBatCucPromptContext('sim', parsed, analysis);
  }, [result]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const year = birthYear.trim() ? Number(birthYear) : undefined;
    const out = analyzeBoiSim(phone, year);
    if ('error' in out) {
      setError(out.error);
      setResult(null);
      return;
    }
    setError(null);
    setResult(out);
  }

  return (
    <div>
      <p className="text-sm text-muted leading-relaxed mb-4">
        Luận giải SIM theo <span className="text-ink">nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận</span> —
        tách dãy số thành từng cặp quái số đối chiếu 8 từ trường (Sinh Khí ·
        Thiên Y · Diên Niên · Phục Vị · Họa Hại · Lục Sát · Ngũ Quỷ · Tuyệt
        Mệnh), xét biến số 0·5, tổ hợp chế hóa giữa các sao, 3 số cuối và 5
        phương diện: tài lộc, sự nghiệp, tình cảm, sức khỏe, quý nhân. Nhập
        thêm năm sinh để xem hợp mệnh Nạp Âm.
      </p>

      <form
        onSubmit={onSubmit}
        className="border border-fog bg-white p-4 sm:p-5 space-y-4"
      >
        <label className={labelCls()}>
          Số điện thoại
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="VD: 0912 345 678"
            className={`mt-1 ${inputCls}`}
            autoComplete="tel"
          />
        </label>
        <label className={labelCls()}>
          Năm sinh (không bắt buộc — để xem hợp mệnh Nạp Âm)
          <input
            type="number"
            min={1900}
            max={2100}
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            placeholder="VD: 1990"
            className={`mt-1 ${inputCls} max-w-[10rem]`}
          />
        </label>

        {error ? <p className="text-xs text-red-700">{error}</p> : null}

        <button
          type="submit"
          className="px-5 py-2.5 text-sm text-white"
          style={{ backgroundColor: primaryColor }}
        >
          Luận giải SIM
        </button>
      </form>

      {result ? (
        <div className="mt-8 space-y-5">
          <ResultView result={result} primaryColor={primaryColor} />

          {/* Kho sim (đại lý / Lý Gia): gợi ý số điểm cao hơn */}
          <SimBetterUpsell
            score={result.overallScore}
            primaryColor={primaryColor}
          />

          {/* Tra cứu 8 từ trường */}
          <section className="border border-fog bg-white">
            <div className="px-4 py-3 border-b border-fog">
              <p className="text-[10px] uppercase tracking-wide text-muted">
                Tra cứu tám từ trường Âm Dương Ngũ Hành
              </p>
              <p className="text-sm text-ink mt-0.5">{BAT_CUC_TABLE_NOTE}</p>
            </div>
            <StarLibrary />
          </section>

          <MethodNote />

          {/* Luận giải mẫu + CTA — đặt dưới cùng, theo mẫu tử vi */}
          {analysisContext ? (
            <BatCucEssaySection
              analysisContext={analysisContext}
              topic="sim"
              templeName={templeName}
              primaryColor={primaryColor}
              contactPhone={contactPhone}
              onAskMore={() => setChatOpen(true)}
            />
          ) : null}

          <BatCucChatPanel
            open={chatOpen}
            onClose={() => setChatOpen(false)}
            primaryColor={primaryColor}
            templeName={templeName}
            templeId={templeId}
            contactPhone={contactPhone}
            topic="sim"
            analysisContext={analysisContext}
            freeQuestionLimit={3}
          />
        </div>
      ) : null}
    </div>
  );
}
