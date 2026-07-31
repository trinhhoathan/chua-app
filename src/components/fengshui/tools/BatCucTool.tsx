'use client';

import { useMemo, useState } from 'react';
import {
  ASPECT_LABELS,
  elementLabel,
  type BatCucAnalysis,
  type ShortAnalysis,
} from '@/lib/fengshui/bat-cuc';
import {
  BAT_CUC_TOPICS,
  analyzeBatCucTopic,
  buildBatCucPromptContext,
  parseBatCucInput,
  suggestNicePrices,
  verdictLabel,
  type BatCucParsedInput,
  type BatCucTopicAnalysis,
  type BatCucTopicId,
  type PriceSuggestion,
} from '@/lib/fengshui/bat-cuc-contexts';
import {
  AspectBars,
  BAT_CUC_TABLE_NOTE,
  DigitMeaningTable,
  EnergyChain,
  MethodNote,
  PairDetail,
  StarLibrary,
  kindBadge,
} from '@/components/fengshui/tools/BatCucResultBlocks';
import { BatCucEssaySection } from '@/components/fengshui/tools/BatCucEssaySection';
import { BatCucChatPanel } from '@/components/fengshui/tools/BatCucChatPanel';
import { inputCls, labelCls } from '../FieldStyles';

interface Props {
  topic: BatCucTopicId;
  primaryColor: string;
  templeId: string;
  templeName: string;
  templeHotline?: string | null;
  templePhone?: string | null;
}

interface ToolResult {
  parsed: BatCucParsedInput;
  analysis: BatCucTopicAnalysis;
  priceSuggestions: PriceSuggestion[];
}

const CURRENT_YEAR = new Date().getFullYear();

function FullResult({
  topic,
  parsed,
  a,
  primaryColor,
}: {
  topic: BatCucTopicId;
  parsed: BatCucParsedInput;
  a: BatCucAnalysis;
  primaryColor: string;
}) {
  const cfg = BAT_CUC_TOPICS[topic];
  return (
    <>
      {/* Chuỗi năng lượng */}
      <section className="border border-fog bg-white px-4 py-4">
        <p className="text-[10px] uppercase tracking-wide text-muted">
          Chuỗi năng lượng của dãy số
        </p>
        <p className="text-xs text-muted mt-0.5 mb-3">
          Số 0 · 5 không thuộc quái — hiển thị nhỏ, đóng vai trò biến số. Ô
          viền đậm là vùng đuôi (ảnh hưởng mạnh nhất).
        </p>
        <EnergyChain pairs={a.pairs} />
      </section>

      {/* 5 phương diện + đuôi */}
      <div className="grid sm:grid-cols-2 gap-3">
        <section className="border border-fog bg-white px-4 py-4">
          <p className="text-[10px] uppercase tracking-wide text-muted mb-1">
            Năm phương diện
          </p>
          <p className="text-[11px] text-muted mb-3">
            ★ là phương diện trọng tâm của {cfg.dataLabel}
          </p>
          <AspectBars
            aspects={a.aspects}
            primaryColor={primaryColor}
            highlight={cfg.aspectFocus}
          />
        </section>

        <section className="border border-fog bg-white px-4 py-4">
          <p className="text-[10px] uppercase tracking-wide text-muted">
            Phần đuôi — quyết định mạnh nhất
          </p>
          <p className="font-display text-3xl text-ink mt-1 tabular-nums">
            {a.tail.last3}
          </p>
          {a.tail.star ? (
            <p className="text-sm text-ink mt-1">
              Sao đóng đuôi:{' '}
              <span className="font-medium">{a.tail.star.nameVi}</span>{' '}
              <span className="text-muted text-xs">
                ({a.tail.star.nameHan})
              </span>{' '}
              {kindBadge(a.tail.star.kind)}
            </p>
          ) : null}
          <ul className="mt-2 space-y-1.5">
            {a.tail.notes.map((n) => (
              <li key={n} className="text-[13px] text-ink leading-relaxed">
                · {n}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Tổ hợp đặc biệt */}
      {a.combos.length > 0 ? (
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
            {a.combos.map((c, i) => (
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
          {a.pairs.map((p, i) => (
            <PairDetail
              key={`${p.raw}-${i}`}
              pair={p}
              primaryColor={primaryColor}
            />
          ))}
        </div>
      </section>

      {/* Âm dương · nút · cách cục + hợp mệnh */}
      <div className="grid sm:grid-cols-2 gap-3">
        <section className="border border-fog bg-white px-4 py-4 space-y-1.5">
          <p className="text-[10px] uppercase tracking-wide text-muted">
            Âm Dương · Tổng nút · Cách cục
          </p>
          <p className="text-sm text-ink">
            Âm (chẵn) {a.amCount} · Dương (lẻ) {a.duongCount} —{' '}
            {Math.abs(a.amCount - a.duongCount) <= 1
              ? 'cân bằng tốt'
              : Math.abs(a.amCount - a.duongCount) <= 3
                ? 'tương đối cân'
                : 'lệch nhiều, khí thiên lệch'}
          </p>
          <p className="text-sm text-ink">
            Tổng {a.tongSo} → nút: <strong>{a.tongNut}</strong>
            {a.tongNut === 8
              ? ' — phát lộc (dân gian)'
              : a.tongNut === 6
                ? ' — lộc (dân gian)'
                : a.tongNut === 1
                  ? ' — khởi đầu, nhất quán'
                  : ''}
          </p>
          <ul className="text-sm text-ink space-y-0.5">
            {a.patterns.map((p) => (
              <li key={p}>· {p}</li>
            ))}
          </ul>
        </section>

        {a.napAm && a.elementRelation ? (
          <section className="border border-fog bg-white px-4 py-4 space-y-1.5">
            <p className="text-[10px] uppercase tracking-wide text-muted">
              Hợp mệnh (Nạp Âm năm sinh)
            </p>
            <p className="text-sm text-ink">
              Năm {a.birthYear}: {a.napAm.name} —{' '}
              {elementLabel(a.napAm.element)}
            </p>
            <p className="text-sm text-ink">
              Số {elementLabel(a.elementRelation.sim)} ↔ Mệnh{' '}
              {elementLabel(a.elementRelation.menh)}:{' '}
              <strong>{a.elementRelation.relation}</strong>
            </p>
          </section>
        ) : (
          <section className="border border-fog bg-white px-4 py-4">
            <p className="text-[10px] uppercase tracking-wide text-muted mb-1">
              Phương diện trọng tâm
            </p>
            <p className="text-sm text-ink leading-relaxed">
              Trang này nhấn mạnh:{' '}
              {cfg.aspectFocus.map((x) => ASPECT_LABELS[x]).join(' · ')}.
            </p>
          </section>
        )}
      </div>

      {parsed.letters.length > 0 ? (
        <section className="border border-fog bg-white px-4 py-4 space-y-1.5">
          <p className="text-[10px] uppercase tracking-wide text-muted">
            Chữ cái tách riêng (tham khảo)
          </p>
          <p className="text-sm text-ink">
            {parsed.letters
              .map((l) => `${l.letter} = ${l.alphaIndex} → quy về ${l.reduced}`)
              .join(' · ')}
          </p>
          <p className="text-[12px] text-muted leading-relaxed">
            Sách Bát Cực chỉ luận chữ số; chữ cái được quy đổi theo vị trí
            alphabet (A=1…Z=26, cộng dồn về 1–9) để tham khảo quái số, không
            đưa vào chuỗi cặp chính.
          </p>
        </section>
      ) : null}
    </>
  );
}

function ShortResult({
  parsed,
  a,
  primaryColor,
}: {
  parsed: BatCucParsedInput;
  a: ShortAnalysis;
  primaryColor: string;
}) {
  return (
    <>
      <section className="border border-fog bg-white">
        <div className="px-4 py-3 border-b border-fog">
          <p className="text-[10px] uppercase tracking-wide text-muted">
            Luận từng chữ số (dãy ngắn)
          </p>
          <p className="text-sm text-ink mt-0.5">
            Mỗi chữ số một quái Hậu Thiên — dãy ngắn luận theo chủ khí từng số
          </p>
        </div>
        <DigitMeaningTable
          meanings={a.digitMeanings}
          primaryColor={primaryColor}
        />
      </section>

      {a.pairs.length > 0 ? (
        <section className="border border-fog bg-white">
          <div className="px-4 py-3 border-b border-fog">
            <p className="text-[10px] uppercase tracking-wide text-muted">
              Cặp quái tách được
            </p>
          </div>
          <div className="divide-y divide-fog">
            {a.pairs.map((p, i) => (
              <PairDetail
                key={`${p.raw}-${i}`}
                pair={p}
                primaryColor={primaryColor}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="border border-fog bg-white px-4 py-4 space-y-1.5">
        <p className="text-[10px] uppercase tracking-wide text-muted">
          Tổng hợp
        </p>
        <p className="text-sm text-ink">
          Tổng {a.tongSo} → nút <strong>{a.tongNut}</strong> · Âm (chẵn){' '}
          {a.amCount} · Dương (lẻ) {a.duongCount}
        </p>
        <ul className="space-y-1">
          {a.notes.map((n) => (
            <li key={n} className="text-sm text-ink leading-relaxed">
              · {n}
            </li>
          ))}
        </ul>
        {a.napAm && a.elementRelation ? (
          <p className="text-sm text-ink pt-1">
            Năm {a.birthYear}: mệnh {a.napAm.name} (
            {elementLabel(a.napAm.element)}) — {a.elementRelation.relation}
          </p>
        ) : null}
      </section>

      {parsed.letters.length > 0 ? (
        <section className="border border-fog bg-white px-4 py-4 space-y-1.5">
          <p className="text-[10px] uppercase tracking-wide text-muted">
            Chữ cái tách riêng (tham khảo)
          </p>
          <p className="text-sm text-ink">
            {parsed.letters
              .map((l) => `${l.letter} = ${l.alphaIndex} → quy về ${l.reduced}`)
              .join(' · ')}
          </p>
        </section>
      ) : null}
    </>
  );
}

/** Trang công cụ Bát Cực Linh Số dùng chung cho 13 chủ đề (ngoài SIM). */
export function BatCucTool({
  topic,
  primaryColor,
  templeId,
  templeName,
  templeHotline,
  templePhone,
}: Props) {
  const cfg = BAT_CUC_TOPICS[topic];
  const contactPhone = templeHotline || templePhone || null;
  const isDate = cfg.inputKind === 'date' || cfg.inputKind === 'datetime';

  const [value, setValue] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [day, setDay] = useState(16);
  const [month, setMonth] = useState(8);
  const [year, setYear] = useState(isDate && topic === 'su_kien' ? CURRENT_YEAR : 2000);
  const [hour, setHour] = useState(9);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ToolResult | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const analysisContext = useMemo(
    () =>
      result
        ? buildBatCucPromptContext(
            topic,
            result.parsed,
            result.analysis,
            result.priceSuggestions.length ? result.priceSuggestions : undefined,
          )
        : '',
    [topic, result],
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const input = isDate
      ? { d: day, m: month, y: year, hour: cfg.inputKind === 'datetime' ? hour : undefined }
      : value;
    const parsed = parseBatCucInput(topic, input);
    if ('error' in parsed) {
      setError(parsed.error);
      setResult(null);
      return;
    }
    const yearNum = birthYear.trim() ? Number(birthYear) : undefined;
    const analysis = analyzeBatCucTopic(topic, parsed, yearNum);
    if ('error' in analysis) {
      setError(analysis.error);
      setResult(null);
      return;
    }
    const priceSuggestions =
      topic === 'gia_ban' && parsed.moneyAmount
        ? suggestNicePrices(parsed.moneyAmount, 5)
        : [];
    setResult({ parsed, analysis, priceSuggestions });
  }

  const overall =
    result?.analysis.mode === 'full'
      ? result.analysis.full.overallScore
      : result?.analysis.mode === 'short'
        ? result.analysis.short.overallScore
        : 0;
  const verdict =
    result?.analysis.mode === 'full'
      ? result.analysis.full.verdict
      : result?.analysis.mode === 'short'
        ? result.analysis.short.verdict
        : 'trung_binh';

  return (
    <div>
      <p className="text-sm text-muted leading-relaxed mb-4">
        {cfg.description} Phương pháp{' '}
        <span className="text-ink">Bát Cực Linh Số</span>: tách dãy số thành
        cặp quái số đối chiếu 8 từ trường, xét biến số 0·5, tổ hợp chế hóa và
        phần đuôi.{' '}
        {cfg.askBirthYear
          ? 'Nhập thêm năm sinh để xem hợp mệnh Nạp Âm.'
          : ''}
      </p>

      {cfg.secure ? (
        <p className="text-[12px] leading-relaxed border border-amber-700/30 bg-amber-50/70 text-amber-900 px-3 py-2 mb-4">
          Bảo mật: dãy số được phân tích ngay trên máy của quý vị. Khi hỏi AI,
          hệ thống chỉ gửi kết quả phân tích đã che số gốc
          {topic === 'mat_khau'
            ? ' (che toàn bộ)'
            : ' (chỉ giữ vài số cuối)'}
          , tuyệt đối không gửi dãy thô.
          {topic === 'mat_khau'
            ? ' Không nhập mật khẩu ngân hàng / email đang dùng.'
            : ''}
        </p>
      ) : null}

      <form
        onSubmit={onSubmit}
        className="border border-fog bg-white p-4 sm:p-5 space-y-4"
      >
        {isDate ? (
          <div className="flex flex-wrap gap-3">
            <label className={labelCls()}>
              Ngày
              <input
                type="number"
                min={1}
                max={31}
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                className={`mt-1 ${inputCls} w-20`}
              />
            </label>
            <label className={labelCls()}>
              Tháng
              <input
                type="number"
                min={1}
                max={12}
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className={`mt-1 ${inputCls} w-20`}
              />
            </label>
            <label className={labelCls()}>
              Năm
              <input
                type="number"
                min={1900}
                max={2100}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className={`mt-1 ${inputCls} w-28`}
              />
            </label>
            {cfg.inputKind === 'datetime' ? (
              <label className={labelCls()}>
                Giờ (0–23)
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={hour}
                  onChange={(e) => setHour(Number(e.target.value))}
                  className={`mt-1 ${inputCls} w-20`}
                />
              </label>
            ) : null}
          </div>
        ) : (
          <label className={labelCls()}>
            {cfg.inputLabel}
            <input
              type="text"
              inputMode={cfg.inputKind === 'money' ? 'numeric' : 'text'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={cfg.placeholder}
              className={`mt-1 ${inputCls}`}
            />
          </label>
        )}
        {cfg.inputHint ? (
          <p className="text-[11px] text-muted leading-relaxed -mt-2">
            {cfg.inputHint}
          </p>
        ) : null}

        {cfg.askBirthYear ? (
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
        ) : null}

        {error ? <p className="text-xs text-red-700">{error}</p> : null}

        <button
          type="submit"
          className="px-5 py-2.5 text-sm text-white"
          style={{ backgroundColor: primaryColor }}
        >
          Luận giải
        </button>
      </form>

      {result ? (
        <div className="mt-8 space-y-5">
          {/* Kết luận tổng */}
          <div className="border border-fog bg-gradient-to-b from-[#faf6ef] to-white px-4 py-5 sm:px-6">
            <p className="text-[10px] uppercase tracking-wide text-muted">
              Bát Cực Linh Số · {cfg.title}
            </p>
            <p className="font-display text-2xl text-ink mt-1 tabular-nums break-all">
              {result.parsed.display}
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
                  {overall}
                  <span className="text-base text-muted">/100</span>
                </p>
              </div>
              <p className="text-sm text-ink pb-1 font-medium">
                {verdictLabel(verdict)}
                {result.analysis.mode === 'full'
                  ? ` — cát ${result.analysis.full.catPairs}/${result.analysis.full.pairs.length} cặp, hung ${result.analysis.full.hungPairs}/${result.analysis.full.pairs.length} cặp`
                  : ' — luận theo chế độ dãy ngắn'}
              </p>
            </div>
            {result.analysis.mode === 'full' &&
            result.analysis.full.tail.warning ? (
              <p className="mt-3 text-[13px] leading-relaxed border border-red-800/30 bg-red-50/70 text-red-900 px-3 py-2">
                {result.analysis.full.tail.warning}
              </p>
            ) : null}
            {result.parsed.warnings.map((w) => (
              <p
                key={w}
                className="mt-3 text-[13px] leading-relaxed border border-amber-700/30 bg-amber-50/70 text-amber-900 px-3 py-2"
              >
                {w}
              </p>
            ))}
          </div>

          {/* Giải mã cấu trúc (CCCD, biển số, thẻ, âm lịch…) */}
          {result.parsed.extras.length > 0 ? (
            <section className="border border-fog bg-white px-4 py-4">
              <p className="text-[10px] uppercase tracking-wide text-muted mb-2">
                Giải mã cấu trúc
              </p>
              <ul className="space-y-1">
                {result.parsed.extras.map((x) => (
                  <li key={x.label} className="text-sm text-ink">
                    <span className="text-muted">{x.label}:</span> {x.value}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {result.analysis.mode === 'full' ? (
            <FullResult
              topic={topic}
              parsed={result.parsed}
              a={result.analysis.full}
              primaryColor={primaryColor}
            />
          ) : (
            <ShortResult
              parsed={result.parsed}
              a={result.analysis.short}
              primaryColor={primaryColor}
            />
          )}

          {/* Gợi ý giá đẹp */}
          {result.priceSuggestions.length > 0 ? (
            <section className="border border-fog bg-white">
              <div className="px-4 py-3 border-b border-fog">
                <p className="text-[10px] uppercase tracking-wide text-muted">
                  Gợi ý giá đẹp lân cận (±3%)
                </p>
                <p className="text-sm text-ink mt-0.5">
                  Máy đã xếp hạng theo engine Bát Cực — ưu tiên đuôi Thiên Y /
                  Diên Niên
                </p>
              </div>
              <ul className="divide-y divide-fog">
                {result.priceSuggestions.map((s) => (
                  <li
                    key={s.amount}
                    className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p
                        className="font-display text-lg tabular-nums"
                        style={{ color: primaryColor }}
                      >
                        {s.display}
                      </p>
                      <p className="text-[12px] text-muted leading-snug">
                        {s.note}
                      </p>
                    </div>
                    <span className="text-xs text-muted tabular-nums shrink-0">
                      {s.score} điểm
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* Tra cứu 8 từ trường */}
          <section className="border border-fog bg-white">
            <div className="px-4 py-3 border-b border-fog">
              <p className="text-[10px] uppercase tracking-wide text-muted">
                Tra cứu tám từ trường Bát Cực Linh Số
              </p>
              <p className="text-sm text-ink mt-0.5">{BAT_CUC_TABLE_NOTE}</p>
            </div>
            <StarLibrary />
          </section>

          <MethodNote />

          {/* Luận giải mẫu + CTA — đặt dưới cùng, theo mẫu tử vi */}
          <BatCucEssaySection
            analysisContext={analysisContext}
            topic={topic}
            templeName={templeName}
            primaryColor={primaryColor}
            contactPhone={contactPhone}
            onAskMore={() => setChatOpen(true)}
          />

          <BatCucChatPanel
            open={chatOpen}
            onClose={() => setChatOpen(false)}
            primaryColor={primaryColor}
            templeName={templeName}
            templeId={templeId}
            contactPhone={contactPhone}
            topic={topic}
            analysisContext={analysisContext}
            freeQuestionLimit={3}
          />
        </div>
      ) : null}
    </div>
  );
}
