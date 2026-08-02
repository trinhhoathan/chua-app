'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  IZTRO_PALACE_ORDER,
  type IztroChartView,
  type IztroHoroscopeView,
} from '@/lib/fengshui/iztro-chart';
import {
  buildTuViPromptContext,
  type TuViSchool,
} from '@/lib/fengshui/tuvi-prompt';
import { openWaterDonateForm } from '@/lib/water-merit-prompt';
import { useSitePersona } from '@/components/SitePersonaContext';
import { TuViMarkdown } from '@/components/fengshui/tools/TuViMarkdown';
import {
  chartSessionKey,
  getSavedUnlockOrderCode,
  savePaidOrderCode,
  TUVI_UNLOCK_ORDER_KEY,
  type PalaceEssay,
} from '@/lib/fengshui/tuvi-html';

interface Props {
  primaryColor: string;
  templeName: string;
  templeId: string;
  contactPhone?: string | null;
  chart: IztroChartView;
  horoscope: IztroHoroscopeView | null;
  school?: TuViSchool;
  palaceEssays: PalaceEssay[];
  onPalaceEssaysChange: (essays: PalaceEssay[]) => void;
  onRequestFullShare?: () => void;
}

type Phase = 'locked' | 'unlocked' | 'running' | 'done';

const BENEFITS = [
  'Luận chuyên sâu từng cung: chính tinh, phụ tinh, tứ hóa, độ sáng',
  'Liên hệ đối cung, tam hợp và đại hạn của cung',
  'Kết nối với cung Mệnh — thấy rõ cách cục toàn cục',
  'Xuất file HTML đầy đủ để lưu / chia sẻ',
];

const WAIT_TIPS = [
  'Trụ trì đang xem từng cung thật kỹ — khoảng 2–4 phút là thường.',
  'Mỗi cung cần luận riêng nên xin quý vị giữ tab này mở đến khi xong.',
  'Có thể đọc lại phần xem thử cung Mệnh trong lúc chờ.',
  'Khi xong, quý vị tải file HTML để lưu hoặc chia sẻ dễ dàng.',
  'Công đức thỉnh nước giúp duy trì đèn nước công quả tại chùa.',
];

const WAIT_TIPS_SIM = [
  'Thầy Phong Thủy Phúc An đang xem từng cung thật kỹ — khoảng 2–4 phút là thường.',
  'Mỗi cung cần luận riêng nên xin quý vị giữ tab này mở đến khi xong.',
  'Có thể đọc lại phần xem thử cung Mệnh trong lúc chờ.',
  'Khi xong, quý vị tải file HTML để lưu hoặc chia sẻ dễ dàng.',
];

function storageKeyForEssays(sessionKey: string) {
  return `tuvi-palace-essays:${sessionKey}`;
}

async function verifyOrderPaid(code: string): Promise<boolean> {
  const res = await fetch(
    `/api/orders/${encodeURIComponent(code)}/status`,
    { cache: 'no-store' },
  );
  if (!res.ok) return false;
  const data = (await res.json()) as { paid?: boolean };
  return Boolean(data.paid);
}

async function fetchPalaceEssay(opts: {
  palaceName: string;
  palaceIndex: number;
  chartContext: string;
  templeName: string;
  orderCode?: string;
  freeTeaser?: boolean;
  school?: TuViSchool;
  signal?: AbortSignal;
}): Promise<string> {
  const res = await fetch('/api/tuvi/luan-giai-cung', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: opts.signal,
    body: JSON.stringify({
      palaceName: opts.palaceName,
      palaceIndex: opts.palaceIndex,
      chartContext: opts.chartContext,
      templeName: opts.templeName,
      orderCode: opts.orderCode,
      freeTeaser: opts.freeTeaser,
      school: opts.school,
    }),
  });
  const data = (await res.json()) as { content?: string; error?: string };
  if (!res.ok) {
    throw new Error(data.error || 'Không luận được cung.');
  }
  return data.content || '';
}

/** Chạy tối đa `concurrency` promise cùng lúc. */
async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
  hooks?: {
    onStart?: (item: T, index: number) => void;
    onDone?: (item: T, index: number, doneCount: number) => void;
  },
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  let done = 0;

  async function worker() {
    while (next < items.length) {
      const i = next++;
      const item = items[i];
      hooks?.onStart?.(item, i);
      results[i] = await fn(item, i);
      done++;
      hooks?.onDone?.(item, i, done);
    }
  }

  const n = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: n }, () => worker()));
  return results;
}

function formatElapsed(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m <= 0) return `${s} giây`;
  return `${m} phút ${s.toString().padStart(2, '0')} giây`;
}

function RunningPanel({
  primaryColor,
  palaceNames,
  doneNames,
  activeNames,
  doneCount,
  total,
  elapsedSec,
  tip,
}: {
  primaryColor: string;
  palaceNames: string[];
  doneNames: Set<string>;
  activeNames: Set<string>;
  doneCount: number;
  total: number;
  elapsedSec: number;
  tip: string;
}) {
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const remaining = Math.max(0, total - doneCount);
  const avg = doneCount > 0 ? elapsedSec / doneCount : 0;
  const etaSec =
    avg > 0 && remaining > 0
      ? Math.round((avg * remaining) / 2)
      : remaining * 18;

  return (
    <div
      className="border p-3 space-y-3"
      style={{
        borderColor: `${primaryColor}55`,
        background: `${primaryColor}08`,
      }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink flex items-center gap-2">
            <span
              className="inline-block size-2 rounded-full animate-pulse"
              style={{ backgroundColor: primaryColor }}
              aria-hidden
            />
            Đang luận giải 12 cung…
          </p>
          <p className="mt-1 text-[0.7rem] text-muted leading-relaxed">
            Từng cung được luận chuyên sâu — xin quý vị{' '}
            <strong className="text-ink font-medium">không đóng tab</strong>,
            khoảng 2–4 phút.
          </p>
        </div>
        <p
          className="shrink-0 text-lg font-semibold tabular-nums"
          style={{ color: primaryColor }}
        >
          {pct}%
        </p>
      </div>

      <div>
        <div className="h-2 bg-white/80 border border-fog overflow-hidden">
          <div
            className="h-full transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%`, backgroundColor: primaryColor }}
          />
        </div>
        <div className="mt-1.5 flex flex-wrap justify-between gap-x-3 gap-y-0.5 text-[0.65rem] text-muted">
          <span>
            Đã xong {doneCount}/{total} cung
            {activeNames.size
              ? ` · đang luận: ${[...activeNames].join(', ')}`
              : ''}
          </span>
          <span>
            Đã chờ {formatElapsed(elapsedSec)}
            {remaining > 0
              ? ` · còn ~${formatElapsed(Math.max(etaSec, 15))}`
              : ''}
          </span>
        </div>
      </div>

      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-1">
        {palaceNames.map((name) => {
          const done = doneNames.has(name);
          const active = activeNames.has(name);
          return (
            <li
              key={name}
              className={`text-[0.65rem] px-1.5 py-1 border flex items-center gap-1.5 ${
                done
                  ? 'border-transparent bg-white text-ink'
                  : active
                    ? 'border-fog bg-white text-ink'
                    : 'border-transparent text-muted/80'
              }`}
              style={
                active
                  ? { boxShadow: `inset 0 0 0 1px ${primaryColor}66` }
                  : done
                    ? { boxShadow: `inset 0 0 0 1px ${primaryColor}33` }
                    : undefined
              }
            >
              <span
                className="shrink-0 size-1.5 rounded-full"
                style={{
                  backgroundColor: done || active ? primaryColor : '#d4d0c8',
                }}
                aria-hidden
              />
              <span className={active ? 'font-medium' : undefined}>
                {name}
                {active ? '…' : ''}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="text-[0.7rem] text-muted leading-relaxed border-t border-fog/80 pt-2">
        {tip}
      </p>
    </div>
  );
}

export function TuViDetailPanel({
  primaryColor,
  templeName,
  templeId,
  contactPhone,
  chart,
  horoscope,
  school = 'bac_phai',
  palaceEssays,
  onPalaceEssaysChange,
  onRequestFullShare,
}: Props) {
  const persona = useSitePersona();
  const [orderCode, setOrderCode] = useState('');
  const [phase, setPhase] = useState<Phase>('locked');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneCount, setDoneCount] = useState(0);
  const [doneNames, setDoneNames] = useState<Set<string>>(() => new Set());
  const [activeNames, setActiveNames] = useState<Set<string>>(() => new Set());
  const [elapsedSec, setElapsedSec] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [teaser, setTeaser] = useState<string | null>(null);
  const [teaserLoading, setTeaserLoading] = useState(false);
  const [teaserError, setTeaserError] = useState<string | null>(null);
  const runStartedAt = useRef<number | null>(null);
  const runningRef = useRef(false);

  const sessionKey = useMemo(() => chartSessionKey(chart), [chart]);
  const chartContext = useMemo(
    () => buildTuViPromptContext(chart, horoscope),
    [chart, horoscope],
  );

  const menhPalace = useMemo(
    () => chart.palaces.find((p) => p.isSoulPalace || p.name === 'Mệnh'),
    [chart.palaces],
  );

  const palaceList = useMemo(() => {
    const byName = new Map(
      chart.palaces.filter((p) => p.index >= 0).map((p) => [p.name, p]),
    );
    return IZTRO_PALACE_ORDER.map((name) => byName.get(name)).filter(
      Boolean,
    ) as typeof chart.palaces;
  }, [chart.palaces]);

  const palaceNames = useMemo(
    () => palaceList.map((p) => p.name),
    [palaceList],
  );

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(storageKeyForEssays(sessionKey));
      if (saved) {
        const parsed = JSON.parse(saved) as PalaceEssay[];
        if (Array.isArray(parsed) && parsed.length) {
          onPalaceEssaysChange(parsed);
          setPhase(parsed.length >= 12 ? 'done' : 'unlocked');
          setOpenAccordion(parsed[0]?.name ?? null);
        }
      }
    } catch {
      /* ignore */
    }
    const code = getSavedUnlockOrderCode(templeId);
    if (code) {
      setOrderCode(code);
      void (async () => {
        const ok = await verifyOrderPaid(code);
        if (ok) {
          setPhase((p) => (p === 'done' || p === 'running' ? p : 'unlocked'));
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ khi đổi lá số
  }, [sessionKey, templeId]);

  useEffect(() => {
    if (!palaceEssays.length) return;
    try {
      sessionStorage.setItem(
        storageKeyForEssays(sessionKey),
        JSON.stringify(palaceEssays),
      );
    } catch {
      /* ignore */
    }
  }, [palaceEssays, sessionKey]);

  useEffect(() => {
    if (phase !== 'running') return;
    runStartedAt.current = Date.now();
    setElapsedSec(0);
    setTipIndex(0);
    const tick = window.setInterval(() => {
      if (runStartedAt.current) {
        setElapsedSec(Math.floor((Date.now() - runStartedAt.current) / 1000));
      }
    }, 1000);
    const tip = window.setInterval(() => {
      setTipIndex((i) => i + 1);
    }, 8000);
    return () => {
      window.clearInterval(tick);
      window.clearInterval(tip);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'running') return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = '';
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [phase]);

  const unlockWithCode = useCallback(
    async (code: string) => {
      const trimmed = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (!trimmed) {
        setError('Vui lòng nhập mã đơn.');
        return false;
      }
      setVerifying(true);
      setError(null);
      try {
        const ok = await verifyOrderPaid(trimmed);
        if (!ok) {
          setError(
            'Mã đơn chưa thanh toán hoặc không tồn tại. Thỉnh nước rồi quay lại nhập mã.',
          );
          setPhase('locked');
          return false;
        }
        setOrderCode(trimmed);
        savePaidOrderCode(trimmed, templeId);
        try {
          localStorage.setItem(TUVI_UNLOCK_ORDER_KEY(templeId), trimmed);
        } catch {
          /* ignore */
        }
        setPhase((p) => (p === 'done' ? 'done' : 'unlocked'));
        return true;
      } catch {
        setError('Không kiểm tra được mã đơn. Thử lại sau.');
        return false;
      } finally {
        setVerifying(false);
      }
    },
    [templeId],
  );

  async function runTeaser() {
    if (!menhPalace || teaserLoading) return;
    setTeaserLoading(true);
    setTeaserError(null);
    try {
      const content = await fetchPalaceEssay({
        palaceName: menhPalace.name,
        palaceIndex: menhPalace.index,
        chartContext,
        templeName,
        freeTeaser: true,
        school,
      });
      setTeaser(content);
      setOpenAccordion(menhPalace.name);
    } catch (e) {
      setTeaserError(
        e instanceof Error ? e.message : 'Không luận thử được cung Mệnh.',
      );
    } finally {
      setTeaserLoading(false);
    }
  }

  async function runAll12(forcedCode?: string) {
    if (runningRef.current) return;
    let code = (forcedCode || orderCode)
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
    if (!code) {
      setError('Nhập mã đơn đã thanh toán trước khi chạy 12 cung.');
      return;
    }
    if (!forcedCode) {
      const ok = await unlockWithCode(code);
      if (!ok) return;
    }

    runningRef.current = true;
    setPhase('running');
    setError(null);
    setDoneCount(0);
    setDoneNames(new Set());
    setActiveNames(new Set());
    setElapsedSec(0);

    try {
      const essays = await mapPool(
        palaceList,
        2,
        async (palace) => {
          const content = await fetchPalaceEssay({
            palaceName: palace.name,
            palaceIndex: palace.index,
            chartContext,
            templeName,
            orderCode: code,
            school,
          });
          return { name: palace.name, content } satisfies PalaceEssay;
        },
        {
          onStart: (palace) => {
            setActiveNames((prev) => new Set(prev).add(palace.name));
          },
          onDone: (palace, _i, done) => {
            setActiveNames((prev) => {
              const next = new Set(prev);
              next.delete(palace.name);
              return next;
            });
            setDoneNames((prev) => new Set(prev).add(palace.name));
            setDoneCount(done);
          },
        },
      );
      onPalaceEssaysChange(essays);
      setPhase('done');
      setOpenAccordion(essays[0]?.name ?? null);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Có lỗi khi luận 12 cung. Thử lại sau.',
      );
      setPhase('unlocked');
    } finally {
      runningRef.current = false;
    }
  }

  async function unlockAndRun() {
    const code = orderCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!code) {
      setError('Vui lòng nhập mã đơn.');
      return;
    }
    setVerifying(true);
    setError(null);
    try {
      const ok = await verifyOrderPaid(code);
      if (!ok) {
        setError(
          'Mã đơn chưa thanh toán hoặc không tồn tại. Thỉnh nước rồi quay lại nhập mã.',
        );
        return;
      }
      setOrderCode(code);
      savePaidOrderCode(code, templeId);
      try {
        localStorage.setItem(TUVI_UNLOCK_ORDER_KEY(templeId), code);
      } catch {
        /* ignore */
      }
    } catch {
      setError('Không kiểm tra được mã đơn. Thử lại sau.');
      return;
    } finally {
      setVerifying(false);
    }
    await runAll12(code);
  }

  const locked = phase === 'locked';

  return (
    <section id="tuvi-detail-12" className="border border-fog bg-white">
      <div className="border-b border-fog px-3 py-2.5 flex items-start justify-between gap-2">
        <div>
          <p
            className="text-[0.65rem] uppercase tracking-[0.2em]"
            style={{ color: primaryColor }}
          >
            Trọn bộ chuyên sâu
          </p>
          <h3 className="text-sm font-medium text-ink">
            Luận giải chi tiết 12 cung
          </h3>
        </div>
        {phase === 'done' && onRequestFullShare ? (
          <button
            type="button"
            onClick={onRequestFullShare}
            className="shrink-0 text-xs px-2.5 py-1.5 text-white"
            style={{ backgroundColor: primaryColor }}
          >
            Tải HTML luận giải đầy đủ
          </button>
        ) : null}
      </div>

      <div className="p-3 space-y-4">
        <div className="border border-fog bg-paper/50 p-3 space-y-2">
          <p className="text-xs font-medium text-ink">
            Xem thử miễn phí — cung Mệnh
          </p>
          <p className="text-[0.7rem] text-muted leading-relaxed">
            Luận một cung Mệnh để cảm nhận chất lượng trước khi mở khóa trọn bộ
            12 cung.
          </p>
          {!teaser ? (
            <div className="space-y-2">
              <button
                type="button"
                disabled={teaserLoading || !menhPalace || phase === 'running'}
                onClick={() => void runTeaser()}
                className="text-xs px-3 py-1.5 border border-fog text-ink hover:border-ink/30 disabled:opacity-50"
              >
                {teaserLoading ? 'Đang luận cung Mệnh…' : 'Luận thử cung Mệnh'}
              </button>
              {teaserLoading ? (
                <div className="space-y-1">
                  <div className="h-1 bg-fog overflow-hidden">
                    <div
                      className="h-full w-1/3 animate-pulse"
                      style={{ backgroundColor: primaryColor }}
                    />
                  </div>
                  <p className="text-[0.65rem] text-muted">
                    Đang soạn luận cung Mệnh — khoảng 15–40 giây, xin chờ…
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
          {teaserError ? (
            <p className="text-xs text-red-700">{teaserError}</p>
          ) : null}
          {teaser ? (
            <div className="max-h-56 overflow-y-auto border border-fog bg-white p-2.5">
              <TuViMarkdown text={teaser} primaryColor={primaryColor} />
            </div>
          ) : null}
        </div>

        {phase === 'running' ? (
          <RunningPanel
            primaryColor={primaryColor}
            palaceNames={palaceNames}
            doneNames={doneNames}
            activeNames={activeNames}
            doneCount={doneCount}
            total={palaceList.length}
            elapsedSec={elapsedSec}
            tip={
              (persona.upsell === 'sim' ? WAIT_TIPS_SIM : WAIT_TIPS)[
                tipIndex %
                  (persona.upsell === 'sim' ? WAIT_TIPS_SIM : WAIT_TIPS).length
              ]
            }
          />
        ) : locked ? (
          persona.upsell === 'sim' ? (
            <div className="space-y-3">
              <ul className="space-y-1.5">
                {BENEFITS.slice(0, 3).map((b) => (
                  <li
                    key={b}
                    className="text-xs text-muted leading-snug flex gap-2"
                  >
                    <span style={{ color: primaryColor }} aria-hidden>
                      ✓
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[0.7rem] text-muted leading-relaxed">
                Phần luận 12 cung chuyên sâu do {persona.displayName} xem trực
                tiếp — gọi thầy để đặt lịch, hoặc vào kho sim chọn dãy số hợp
                mệnh đã chấm điểm sẵn.
              </p>
              <div className="flex flex-wrap gap-2">
                {contactPhone ? (
                  <a
                    href={`tel:${contactPhone.replace(/\s+/g, '')}`}
                    className="text-sm px-3 py-2 text-white font-medium"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {persona.callLabel} · {contactPhone}
                  </a>
                ) : null}
                <a
                  href="/sim"
                  className="text-sm px-3 py-2 border border-fog text-ink"
                >
                  Xem kho sim hợp mệnh
                </a>
              </div>
            </div>
          ) : (
          <div className="space-y-3">
            <ul className="space-y-1.5">
              {BENEFITS.map((b) => (
                <li
                  key={b}
                  className="text-xs text-muted leading-snug flex gap-2"
                >
                  <span style={{ color: primaryColor }} aria-hidden>
                    ✓
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() =>
                openWaterDonateForm({
                  note: 'Mở khóa luận giải 12 cung',
                  qty: 10,
                })
              }
              className="w-full text-sm px-3 py-2.5 text-white font-medium"
              style={{ backgroundColor: primaryColor }}
            >
              Thỉnh nước ủng hộ chùa để mở khóa trọn bộ 12 cung
            </button>
            <div className="flex gap-2">
              <input
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value.toUpperCase())}
                placeholder="Nhập mã đơn (VD: NUOC…)"
                disabled={verifying}
                className="min-w-0 flex-1 border border-fog px-2 py-1.5 text-xs font-mono disabled:opacity-60"
                aria-label="Mã đơn thỉnh nước"
              />
              <button
                type="button"
                disabled={verifying}
                onClick={() => void unlockAndRun()}
                className="shrink-0 px-3 py-1.5 text-xs border border-fog text-ink hover:border-ink/30 disabled:opacity-50"
              >
                {verifying ? 'Đang kiểm…' : 'Mở khóa'}
              </button>
            </div>
            <p className="text-[0.65rem] text-muted leading-relaxed">
              Sau khi mở khóa, hệ thống tự luận đủ 12 cung (thường 2–4 phút). Xin
              giữ trang mở đến khi hoàn tất.
            </p>
            {error ? <p className="text-xs text-red-700">{error}</p> : null}
          </div>
          )
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted">
              Đã mở khóa bằng mã{' '}
              <span className="font-mono text-ink">{orderCode}</span>
            </p>
            {phase !== 'done' ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => void runAll12()}
                  className="w-full text-sm px-3 py-2 text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  Bắt đầu luận giải 12 cung
                </button>
                <p className="text-[0.65rem] text-muted leading-relaxed">
                  Quá trình thường mất 2–4 phút — {persona.role} luận lần lượt
                  từng cung. Vui lòng không đóng tab khi đang chạy.
                </p>
              </div>
            ) : null}
            {error ? <p className="text-xs text-red-700">{error}</p> : null}

            {palaceEssays.length ? (
              <div className="space-y-1">
                {palaceEssays.map((essay) => {
                  const open = openAccordion === essay.name;
                  return (
                    <div key={essay.name} className="border border-fog">
                      <button
                        type="button"
                        className="w-full flex items-center justify-between gap-2 px-2.5 py-2 text-left text-xs font-medium text-ink hover:bg-mist/50"
                        onClick={() =>
                          setOpenAccordion(open ? null : essay.name)
                        }
                      >
                        <span>Cung {essay.name}</span>
                        <span className="text-muted">{open ? '−' : '+'}</span>
                      </button>
                      {open ? (
                        <div className="px-2.5 pb-2.5 border-t border-fog max-h-64 overflow-y-auto">
                          <TuViMarkdown
                            text={essay.content}
                            primaryColor={primaryColor}
                          />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : null}

            {phase === 'done' && onRequestFullShare ? (
              <button
                type="button"
                onClick={onRequestFullShare}
                className="w-full text-sm px-3 py-2.5 text-white font-medium"
                style={{ backgroundColor: primaryColor }}
              >
                Tải HTML luận giải đầy đủ
              </button>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
