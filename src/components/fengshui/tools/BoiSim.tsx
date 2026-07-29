'use client';

import { useState } from 'react';
import {
  analyzeBoiSim,
  elementLabel,
  STAR_ORDER,
  STARS,
  type BoiSimResult,
  type StarId,
} from '@/lib/fengshui/boi-sim';
import { inputCls, labelCls } from '../FieldStyles';

interface Props {
  primaryColor: string;
}

function verdictLabel(v: BoiSimResult['verdict']): string {
  if (v === 'tot') return 'Tốt';
  if (v === 'kha') return 'Khá';
  if (v === 'yeu') return 'Yếu — nên cân nhắc';
  return 'Trung bình';
}

function StarChip({ id, count }: { id: StarId; count: number }) {
  const s = STARS[id];
  if (!count) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] border ${
        s.kind === 'cat'
          ? 'border-emerald-800/25 bg-emerald-50/70 text-ink'
          : 'border-stone-400/40 bg-stone-100 text-ink'
      }`}
    >
      {s.nameVi} ×{count}
    </span>
  );
}

function ResultView({
  result,
  primaryColor,
}: {
  result: BoiSimResult;
  primaryColor: string;
}) {
  return (
    <div className="mt-8 space-y-5">
      <div className="border border-fog bg-gradient-to-b from-[#faf6ef] to-white px-4 py-5 sm:px-6">
        <p className="text-[10px] uppercase tracking-wide text-muted">
          Bát Cực Linh Số · Du Niên
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
          <p className="text-sm text-ink pb-1">{verdictLabel(result.verdict)}</p>
        </div>
        <p className="mt-3 text-sm text-ink leading-relaxed">{result.advice}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {STAR_ORDER.map((id) => (
            <StarChip key={id} id={id} count={result.starCounts[id]} />
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">
          Cát {result.catPairs}/{result.pairs.length} cặp · Hung{' '}
          {result.hungPairs}/{result.pairs.length} · Điểm Du Niên{' '}
          {result.duNienScore}/100
        </p>
      </div>

      <section className="border border-fog bg-white">
        <div className="px-4 py-3 border-b border-fog">
          <p className="text-[10px] uppercase tracking-wide text-muted">
            Từng cặp số liên tiếp
          </p>
          <p className="text-sm text-ink mt-0.5">
            Cặp cuối (đuôi sim) ảnh hưởng mạnh hơn
          </p>
        </div>
        <ul className="divide-y divide-fog">
          {result.pairs.map((p, i) => (
            <li
              key={`${p.label}-${i}`}
              className={`px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 ${
                p.isTail ? 'bg-paper/80' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="font-display text-lg tabular-nums w-8"
                  style={{ color: primaryColor }}
                >
                  {p.label}
                </span>
                <div>
                  <p className="text-sm text-ink">
                    {p.star.nameVi}{' '}
                    <span className="text-muted text-xs">
                      ({p.star.nameHan})
                    </span>
                    {p.isTail ? (
                      <span className="ml-1 text-[10px] text-muted">đuôi</span>
                    ) : null}
                  </p>
                  <p className="text-[11px] text-muted leading-snug">
                    {p.star.summary}
                  </p>
                </div>
              </div>
              <span
                className={`text-[10px] uppercase tracking-wide px-2 py-0.5 ${
                  p.star.kind === 'cat'
                    ? 'bg-emerald-800 text-white'
                    : 'bg-stone-600 text-white'
                }`}
              >
                {p.star.kind === 'cat' ? 'Cát' : 'Hung'}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid sm:grid-cols-2 gap-3">
        <section className="border border-fog bg-white px-4 py-4 space-y-1.5">
          <p className="text-[10px] uppercase tracking-wide text-muted">
            81 Số Lý (4 số cuối)
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
            Âm Dương · Tổng nút · Đuôi
          </p>
          <p className="text-sm text-ink">
            Âm (chẵn) {result.amCount} · Dương (lẻ) {result.duongCount}
          </p>
          <p className="text-sm text-ink">
            Tổng nút: <strong>{result.tongNut}</strong>
          </p>
          <p className="text-sm text-ink">
            Đuôi {result.tail2}: {result.tailFolk}
          </p>
        </section>
      </div>

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

      <section className="border border-fog bg-white px-4 py-4 space-y-1.5">
        <p className="text-[10px] uppercase tracking-wide text-muted">
          Cách cục hình thức
        </p>
        <ul className="text-sm text-ink space-y-0.5">
          {result.patterns.map((p) => (
            <li key={p}>· {p}</li>
          ))}
        </ul>
      </section>

      <div className="border border-fog bg-white px-4 py-4">
        <p className="text-[10px] uppercase tracking-wide text-muted mb-2">
          Tám từ trường Bát Cực Linh Số
        </p>
        <ul className="grid sm:grid-cols-2 gap-2 text-xs">
          {STAR_ORDER.map((id) => {
            const s = STARS[id];
            return (
              <li
                key={id}
                className={`border px-2.5 py-2 ${
                  s.kind === 'cat'
                    ? 'border-emerald-800/20 bg-emerald-50/50'
                    : 'border-fog bg-stone-50'
                }`}
              >
                <p className="font-medium text-ink">
                  {s.nameVi}{' '}
                  <span className="text-muted font-normal">{s.nameHan}</span>
                </p>
                <p className="text-muted mt-0.5 leading-snug">{s.summary}</p>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="text-[11px] text-muted leading-relaxed border border-fog bg-white px-4 py-3">
        Bát Cực Linh Số dựa trên Du Niên Bát Trạch (4 cát · 4 hung). Kết quả tham
        khảo; việc hệ trọng nên kết hợp chánh kiến và thỉnh ý tại chùa — không
        đổi sim chỉ vì một cặp hung.
      </p>
    </div>
  );
}

export function BoiSim({ primaryColor }: Props) {
  const [phone, setPhone] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BoiSimResult | null>(null);

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
        Bói SIM theo{' '}
        <span className="text-ink">Bát Cực Linh Số</span> — tách từng cặp số
        liên tiếp đối chiếu 8 sao Du Niên (Sinh Khí · Thiên Y · Diên Niên · Phục
        Vị · Họa Hại · Lục Sát · Ngũ Quỷ · Tuyệt Mệnh). Có thêm 81 Số Lý, Âm
        Dương và hợp mệnh nếu nhập năm sinh.
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
          Phân tích SIM
        </button>
      </form>

      {result ? (
        <ResultView result={result} primaryColor={primaryColor} />
      ) : null}
    </div>
  );
}
