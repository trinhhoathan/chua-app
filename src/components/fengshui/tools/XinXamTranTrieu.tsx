'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  TRAN_TRIEU_INTRO,
  TRAN_TRIEU_ORACLES,
  TRAN_TRIEU_RANK_LABELS,
  drawTranTrieuOracle,
  getTranTrieuOracle,
  tranTrieuRankGroup,
  tranTrieuRankTone,
  type TranTrieuOracle,
  type TranTrieuRank,
} from '@/lib/fengshui/tran-trieu-xam';
import { playXamBoom, playXamRattle, stopXamRattle } from '@/lib/fengshui/xam-sfx';
import { inputCls } from '../FieldStyles';

interface Props {
  primaryColor: string;
}

type Tab = 'draw' | 'browse';
type Phase = 'idle' | 'shaking' | 'boom' | 'result';

const SHAKE_MS = 2600;

const RANK_FILTERS: Array<TranTrieuRank | 'all'> = [
  'all',
  'thượng_quái',
  'thượng_thượng',
  'đại_cát',
  'trung_bình',
  'trung_hạ',
  'hạ_hạ',
  'hạ_quái',
];

export function XinXamTranTrieu({ primaryColor }: Props) {
  const [tab, setTab] = useState<Tab>('draw');
  const [phase, setPhase] = useState<Phase>('idle');
  const [oracle, setOracle] = useState<TranTrieuOracle | null>(null);
  const [shakeLevel, setShakeLevel] = useState(0);
  const [q, setQ] = useState('');
  const [rankFilter, setRankFilter] = useState<TranTrieuRank | 'all'>('all');
  const [browseId, setBrowseId] = useState<number | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      stopXamRattle();
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return TRAN_TRIEU_ORACLES.filter((o) => {
      if (rankFilter !== 'all' && o.rank !== rankFilter) return false;
      if (!needle) return true;
      return (
        String(o.id).includes(needle) ||
        o.titleHan.toLowerCase().includes(needle) ||
        o.titleVi.toLowerCase().includes(needle) ||
        TRAN_TRIEU_RANK_LABELS[o.rank].toLowerCase().includes(needle)
      );
    });
  }, [q, rankFilter]);

  const browseOracle = browseId != null ? getTranTrieuOracle(browseId) : null;

  function clearTimers() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }

  function draw() {
    clearTimers();
    stopXamRattle();
    setOracle(null);
    setPhase('shaking');
    setShakeLevel(1);
    void playXamRattle(SHAKE_MS);

    timers.current.push(
      window.setTimeout(() => setShakeLevel(2), 700),
      window.setTimeout(() => setShakeLevel(3), 1400),
      window.setTimeout(() => {
        setPhase('boom');
        setShakeLevel(0);
        void playXamBoom();
        setOracle(drawTranTrieuOracle());
      }, SHAKE_MS),
      window.setTimeout(() => setPhase('result'), SHAKE_MS + 420),
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-l-2 pl-4 text-sm leading-relaxed text-muted" style={{ borderColor: primaryColor }}>
        <p className="text-ink font-medium">{TRAN_TRIEU_INTRO.aka}</p>
        <p className="mt-2">{TRAN_TRIEU_INTRO.countNote}</p>
        <p className="mt-1.5">{TRAN_TRIEU_INTRO.groups}</p>
      </div>

      <div className="flex gap-1 border-b border-fog">
        {(
          [
            ['draw', 'Bốc quẻ'],
            ['browse', 'Tra cứu 50 quẻ'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`px-4 py-2.5 text-sm transition-colors ${
              tab === id
                ? 'border-b-2 text-ink font-medium'
                : 'text-muted hover:text-ink'
            }`}
            style={tab === id ? { borderColor: primaryColor } : undefined}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'draw' ? (
        <DrawPanel
          primaryColor={primaryColor}
          phase={phase}
          shakeLevel={shakeLevel}
          oracle={oracle}
          onDraw={draw}
        />
      ) : browseOracle ? (
        <div>
          <button
            type="button"
            onClick={() => setBrowseId(null)}
            className="text-xs text-muted hover:text-ink"
          >
            ← Danh sách quẻ
          </button>
          <div className="mt-4">
            <OracleDetail oracle={browseOracle} primaryColor={primaryColor} />
          </div>
        </div>
      ) : (
        <BrowsePanel
          primaryColor={primaryColor}
          q={q}
          setQ={setQ}
          rankFilter={rankFilter}
          setRankFilter={setRankFilter}
          filtered={filtered}
          onSelect={setBrowseId}
        />
      )}
    </div>
  );
}

function DrawPanel({
  primaryColor,
  phase,
  shakeLevel,
  oracle,
  onDraw,
}: {
  primaryColor: string;
  phase: Phase;
  shakeLevel: number;
  oracle: TranTrieuOracle | null;
  onDraw: () => void;
}) {
  if (phase === 'result' && oracle) {
    return (
      <div className="xam-result-pop space-y-5">
        <OracleDetail oracle={oracle} primaryColor={primaryColor} />
        <button
          type="button"
          onClick={onDraw}
          className="px-5 py-2.5 text-sm text-white"
          style={{ backgroundColor: primaryColor }}
        >
          Bốc quẻ khác
        </button>
      </div>
    );
  }

  const tubeClass =
    phase === 'idle'
      ? 'xam-tube-idle'
      : phase === 'shaking'
        ? `xam-tube-shake xam-tube-shake-${shakeLevel}`
        : phase === 'boom'
          ? 'xam-tube-boom'
          : '';

  return (
    <div className="flex flex-col items-center text-center py-4">
      <div className="relative">
        {phase === 'boom' ? <span className="xam-boom-burst" aria-hidden /> : null}
        <div
          className={`relative size-24 rounded-full flex items-center justify-center text-white shadow-md ${tubeClass}`}
          style={{
            background: `linear-gradient(160deg, #c9a227 0%, ${primaryColor} 100%)`,
          }}
          aria-hidden
        >
          <span className="text-3xl font-display leading-none">聖</span>
        </div>
      </div>

      <p className="mt-5 text-sm text-muted max-w-sm leading-relaxed">
        {phase === 'shaking'
          ? shakeLevel >= 3
            ? 'Ống xăm đang lắc mạnh… sắp ra quẻ!'
            : shakeLevel >= 2
              ? 'Lắc mạnh hơn…'
              : 'Đang lắc ống xăm Trần Triều…'
          : phase === 'boom'
            ? 'Quẻ đã ra…'
            : 'Thành tâm niệm Đức Thánh Trần Hưng Đạo (Cửu Thiên Vũ Đế), rồi nhấn bốc quẻ.'}
      </p>

      <button
        type="button"
        disabled={phase === 'shaking' || phase === 'boom'}
        onClick={onDraw}
        className="mt-6 px-6 py-2.5 text-sm text-white disabled:opacity-60"
        style={{ backgroundColor: primaryColor }}
      >
        {phase === 'shaking' || phase === 'boom' ? 'Đang rút…' : 'Bốc quẻ thần ứng'}
      </button>
    </div>
  );
}

function BrowsePanel({
  primaryColor,
  q,
  setQ,
  rankFilter,
  setRankFilter,
  filtered,
  onSelect,
}: {
  primaryColor: string;
  q: string;
  setQ: (v: string) => void;
  rankFilter: TranTrieuRank | 'all';
  setRankFilter: (v: TranTrieuRank | 'all') => void;
  filtered: TranTrieuOracle[];
  onSelect: (id: number) => void;
}) {
  return (
    <div className="space-y-4">
      <input
        className={inputCls}
        placeholder="Tìm số quẻ, triệu Hán Việt, hạng…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="flex flex-wrap gap-1.5">
        {RANK_FILTERS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRankFilter(r)}
            className={`px-2.5 py-1 text-[0.7rem] border transition-colors ${
              rankFilter === r
                ? 'text-white border-transparent'
                : 'border-fog text-muted hover:text-ink'
            }`}
            style={
              rankFilter === r
                ? {
                    backgroundColor:
                      r === 'all' ? primaryColor : tranTrieuRankTone(r),
                  }
                : undefined
            }
          >
            {r === 'all' ? 'Tất cả' : TRAN_TRIEU_RANK_LABELS[r]}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted">{filtered.length} quẻ</p>
      <ul className="divide-y divide-fog border border-fog">
        {filtered.map((o) => (
          <li key={o.id}>
            <button
              type="button"
              onClick={() => onSelect(o.id)}
              className="w-full flex items-start gap-3 px-3 py-3 text-left hover:bg-mist/60 transition-colors"
            >
              <span
                className="shrink-0 mt-0.5 inline-flex min-w-8 justify-center px-1.5 py-0.5 text-[0.65rem] text-white"
                style={{ backgroundColor: tranTrieuRankTone(o.rank) }}
              >
                {o.id}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-ink text-sm">
                  {o.titleHan}
                </span>
                <span className="block text-xs text-muted mt-0.5">
                  {o.titleVi} · {TRAN_TRIEU_RANK_LABELS[o.rank]}
                  {o.needsVerify ? ' · cần đối chiếu' : ''}
                </span>
              </span>
              <span className="text-muted text-xs shrink-0">→</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function OracleDetail({
  oracle,
  primaryColor,
}: {
  oracle: TranTrieuOracle;
  primaryColor: string;
}) {
  const group = tranTrieuRankGroup(oracle.rank);
  const groupLabel =
    group === 'tot' ? 'Nhóm tốt' : group === 'trung' ? 'Nhóm trung' : 'Nhóm kém';

  return (
    <article className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center px-2.5 py-1 text-[0.7rem] uppercase tracking-wide text-white"
          style={{ backgroundColor: tranTrieuRankTone(oracle.rank) }}
        >
          Quẻ số {oracle.id} · {TRAN_TRIEU_RANK_LABELS[oracle.rank]}
        </span>
        <span className="text-[0.7rem] text-muted">{groupLabel}</span>
      </div>

      <div>
        <h2 className="font-display text-2xl text-ink leading-snug">
          {oracle.titleHan}
        </h2>
        <p className="mt-1 text-sm text-muted">{oracle.titleVi}</p>
      </div>

      {oracle.poemVi ? (
        <blockquote
          className="border-l-2 pl-4 text-sm text-ink/90 leading-relaxed whitespace-pre-line"
          style={{ borderColor: primaryColor }}
        >
          {oracle.poemVi}
          {oracle.poemHan ? (
            <span className="mt-3 block text-xs text-muted whitespace-pre-line">
              {oracle.poemHan}
            </span>
          ) : null}
        </blockquote>
      ) : (
        <p className="text-sm text-amber-900/80 bg-amber-50/80 border border-amber-200/60 px-3 py-2 leading-relaxed">
          Thơ tổng thi chưa có đủ trong bản số hóa này —{' '}
          <em>thông tin cần kiểm tra nguyên bản lại</em> (sách Linh Xăm Đức Thánh
          Trần / Hội Bắc Việt Tương Tế).
        </p>
      )}

      <section>
        <h3 className="text-[0.7rem] uppercase tracking-[0.2em] text-muted mb-2">
          Giải nghĩa
        </h3>
        <div className="text-sm text-ink leading-relaxed whitespace-pre-line space-y-3">
          {oracle.judgment}
        </div>
      </section>

      {Object.keys(oracle.aspects).length > 0 ? (
        <section>
          <h3 className="text-[0.7rem] uppercase tracking-[0.2em] text-muted mb-2">
            Ứng nghiệm từng việc
          </h3>
          <dl className="grid gap-2 sm:grid-cols-2">
            {Object.entries(oracle.aspects).map(([key, val]) => (
              <div key={key} className="border border-fog bg-paper/80 px-3 py-2.5">
                <dt className="text-xs font-medium text-ink">{key}</dt>
                <dd className="mt-1 text-[0.8rem] text-ink/90">
                  <span className="text-muted">{val.phrase}</span>
                  {val.meaning ? (
                    <span className="block mt-0.5 text-muted leading-relaxed">
                      {val.meaning}
                    </span>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {oracle.needsVerify ? (
        <aside className="border border-amber-300/70 bg-amber-50/70 px-3 py-3 text-[0.78rem] text-amber-950/90 leading-relaxed">
          <p className="font-medium">Thông tin cần kiểm tra nguyên bản lại</p>
          <ul className="mt-1.5 list-disc pl-4 space-y-1">
            {oracle.verifyNotes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </aside>
      ) : null}

      <p className="text-[0.7rem] text-muted leading-relaxed border-t border-fog pt-4">
        {oracle.sourceNote} Kết quả mang tính tham khảo tâm linh — việc hệ trọng
        nên thỉnh ý tại đền thờ Đức Thánh Trần hoặc đối chiếu sách in.
      </p>
    </article>
  );
}
