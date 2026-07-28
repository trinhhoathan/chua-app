'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import {
  listGoMoDedications,
  listGoMoLeaderboard,
  submitGoMoDedication,
  syncGoMoDailyScore,
  type GoMoDedication,
  type GoMoLeaderRow,
} from '@/app/actions/go-mo';
import {
  playChuongStrike,
  playKhanhStrike,
  playMoStrike,
  speakNiemDanhHieu,
  stopNiemSpeech,
} from '@/lib/go-mo-sfx';
import {
  emitWaterNudge,
  hasShown108Modal,
  openWaterDonateForm,
} from '@/lib/water-merit-prompt';
import { WaterMeritCelebrateModal } from '@/components/water/WaterMeritCelebrateModal';
import { WaterMeritInlineCta } from '@/components/water/WaterMeritInlineCta';

export type NiemDanhHieu =
  | 'none'
  | 'a_di_da'
  | 'quan_am'
  | 'thich_ca'
  | 'dia_tang'
  | 'duoc_su';

export const NIEM_OPTIONS: { id: NiemDanhHieu; label: string }[] = [
  { id: 'none', label: 'Chỉ gõ pháp khí' },
  { id: 'a_di_da', label: 'Nam mô A Di Đà Phật' },
  { id: 'quan_am', label: 'Nam mô Quán Thế Âm Bồ Tát' },
  { id: 'thich_ca', label: 'Nam mô Bổn Sư Thích Ca Mâu Ni Phật' },
  { id: 'dia_tang', label: 'Nam mô Địa Tạng Vương Bồ Tát' },
  { id: 'duoc_su', label: 'Nam mô Dược Sư Lưu Ly Quang Vương Phật' },
];

type Speed = 'slow' | 'medium' | 'fast';
type Instrument = 'mo' | 'chuong' | 'khanh';
type DayGoal = 108 | 300 | 1080;

const SPEED_MS: Record<Speed, number> = {
  slow: 1400,
  medium: 850,
  fast: 520,
};

const SPEECH_RATE: Record<Speed, number> = {
  slow: 0.85,
  medium: 1,
  fast: 1.15,
};

interface DayStats {
  date: string;
  total: number;
  streak: number;
}

function todayKey() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function loadDayStats(storageKey: string): DayStats {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return { date: todayKey(), total: 0, streak: 0 };
    const parsed = JSON.parse(raw) as DayStats;
    const today = todayKey();
    if (parsed.date === today) return parsed;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(yesterday);
    const streak =
      parsed.date === yKey && parsed.total > 0 ? (parsed.streak || 0) + 1 : 0;
    return { date: today, total: 0, streak };
  } catch {
    return { date: todayKey(), total: 0, streak: 0 };
  }
}

function saveDayStats(storageKey: string, stats: DayStats) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(stats));
  } catch {
    /* ignore */
  }
}

function getOrCreateClientKey(templeId: string): string {
  const key = `go-mo:client:${templeId}`;
  try {
    const existing = localStorage.getItem(key);
    if (existing && existing.length >= 8) return existing;
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `ck-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(key, id);
    return id;
  } catch {
    return `ck-${Date.now()}`;
  }
}

interface Props {
  primaryColor: string;
  templeName: string;
  templeId: string;
  initialDedications?: GoMoDedication[];
  initialLeaderboard?: GoMoLeaderRow[];
  thoiKhoaNote?: string | null;
}

export function GoMoPanel({
  primaryColor,
  templeName,
  templeId,
  initialDedications = [],
  initialLeaderboard = [],
  thoiKhoaNote = null,
}: Props) {
  const storageKey = `go-mo:${templeId}`;
  const [session, setSession] = useState(0);
  const [day, setDay] = useState<DayStats>({
    date: todayKey(),
    total: 0,
    streak: 0,
  });
  const [dayGoal, setDayGoal] = useState<DayGoal>(108);
  const [auto, setAuto] = useState(false);
  const [speed, setSpeed] = useState<Speed>('medium');
  const [hitting, setHitting] = useState(false);
  const [niem, setNiem] = useState<NiemDanhHieu>('a_di_da');
  const [voiceOn, setVoiceOn] = useState(true);
  const [instrument, setInstrument] = useState<Instrument>('mo');
  const [flashText, setFlashText] = useState(false);
  const [clientKey, setClientKey] = useState('');
  const [dedications, setDedications] =
    useState<GoMoDedication[]>(initialDedications);
  const [leaderboard, setLeaderboard] =
    useState<GoMoLeaderRow[]>(initialLeaderboard);
  const hitTimer = useRef<number | null>(null);
  const autoRef = useRef<number | null>(null);
  const pendingSync = useRef(0);
  const dayTotalRef = useRef(0);
  const prevSessionRef = useRef(0);
  const nudged36Ref = useRef(false);
  const nudged72Ref = useRef(false);
  const [celebrateOpen, setCelebrateOpen] = useState(false);
  const celebrateOpenRef = useRef(false);
  const [showWaterCta, setShowWaterCta] = useState(false);

  useEffect(() => {
    const stats = loadDayStats(storageKey);
    setDay(stats);
    dayTotalRef.current = stats.total;
    setClientKey(getOrCreateClientKey(templeId));
    try {
      const g = localStorage.getItem(`${storageKey}:goal`);
      if (g === '300' || g === '1080' || g === '108') {
        setDayGoal(Number(g) as DayGoal);
      }
    } catch {
      /* ignore */
    }
  }, [storageKey, templeId]);

  const syncScore = useCallback(
    async (total: number) => {
      if (!clientKey) return;
      await syncGoMoDailyScore({
        clientKey,
        strikeCount: total,
        displayName: undefined,
      });
      const lb = await listGoMoLeaderboard(15);
      if (lb.ok) setLeaderboard(lb.rows);
    },
    [clientKey],
  );

  const strike = useCallback(async () => {
    if (celebrateOpenRef.current) return;
    setHitting(true);
    setFlashText(true);

    if (instrument === 'chuong') await playChuongStrike();
    else if (instrument === 'khanh') await playKhanhStrike();
    else await playMoStrike();

    const niemLabel = NIEM_OPTIONS.find((o) => o.id === niem)?.label ?? '';
    if (niem !== 'none' && voiceOn && niemLabel) {
      speakNiemDanhHieu(niemLabel, {
        rate: SPEECH_RATE[speed],
        enabled: true,
      });
    }

    setSession((s) => s + 1);
    setDay((prev) => {
      const next = {
        ...prev,
        date: todayKey(),
        total: prev.total + 1,
        streak:
          prev.total === 0
            ? Math.max(1, prev.streak || 1)
            : prev.streak || 1,
      };
      saveDayStats(storageKey, next);
      dayTotalRef.current = next.total;
      return next;
    });

    pendingSync.current += 1;
    if (pendingSync.current >= 9) {
      pendingSync.current = 0;
      void syncScore(dayTotalRef.current + 1);
    }

    if (hitTimer.current) window.clearTimeout(hitTimer.current);
    hitTimer.current = window.setTimeout(() => setHitting(false), 160);
    window.setTimeout(() => setFlashText(false), 320);
  }, [instrument, niem, voiceOn, speed, storageKey, syncScore]);

  useEffect(() => {
    if (!auto) {
      if (autoRef.current) {
        window.clearInterval(autoRef.current);
        autoRef.current = null;
      }
      return;
    }
    autoRef.current = window.setInterval(() => {
      void strike();
    }, SPEED_MS[speed]);
    return () => {
      if (autoRef.current) window.clearInterval(autoRef.current);
    };
  }, [auto, speed, strike]);

  useEffect(() => {
    return () => stopNiemSpeech();
  }, []);

  // Đồng bộ khi rời trang / tắt auto
  useEffect(() => {
    function flush() {
      if (clientKey && dayTotalRef.current > 0) {
        void syncGoMoDailyScore({
          clientKey,
          strikeCount: dayTotalRef.current,
        });
      }
    }
    window.addEventListener('pagehide', flush);
    return () => window.removeEventListener('pagehide', flush);
  }, [clientKey]);

  // Gamification → thỉnh nước (mốc 36 / 72 / 108, không spam)
  useEffect(() => {
    const prev = prevSessionRef.current;
    prevSessionRef.current = session;
    if (session <= prev) return;

    if (session >= 36 && prev < 36 && !nudged36Ref.current) {
      nudged36Ref.current = true;
      emitWaterNudge('go_mo');
      setShowWaterCta(true);
    }
    if (session >= 72 && prev < 72 && !nudged72Ref.current) {
      nudged72Ref.current = true;
      emitWaterNudge('go_mo');
      setShowWaterCta(true);
    }
    if (session >= 108 && prev < 108) {
      if (!hasShown108Modal(templeId)) {
        setAuto(false);
        celebrateOpenRef.current = true;
        setCelebrateOpen(true);
      } else {
        emitWaterNudge('go_mo');
        setShowWaterCta(true);
      }
    }
  }, [session, templeId]);

  function resetSession() {
    setSession(0);
    prevSessionRef.current = 0;
    nudged36Ref.current = false;
    nudged72Ref.current = false;
    setAuto(false);
    stopNiemSpeech();
    if (clientKey) {
      void syncScore(dayTotalRef.current);
    }
  }

  function changeGoal(g: DayGoal) {
    setDayGoal(g);
    try {
      localStorage.setItem(`${storageKey}:goal`, String(g));
    } catch {
      /* ignore */
    }
  }

  const sessionProgress = Math.min(100, (session / dayGoal) * 100);
  const dayProgress = Math.min(100, (day.total / dayGoal) * 100);
  const niemLabel =
    NIEM_OPTIONS.find((o) => o.id === niem)?.label ?? 'Nam mô A Di Đà Phật';

  return (
    <div className="mx-auto max-w-lg">
      <WaterMeritCelebrateModal
        open={celebrateOpen}
        onClose={() => {
          celebrateOpenRef.current = false;
          setCelebrateOpen(false);
          setShowWaterCta(true);
        }}
        primaryColor={primaryColor}
        templeName={templeName}
        templeId={templeId}
        strikeCount={108}
      />

      <div className="text-center mb-6">
        <p
          className="text-[0.65rem] uppercase tracking-[0.25em] mb-2"
          style={{ color: primaryColor }}
        >
          Tu tập tại {templeName}
        </p>
        <h1 className="font-display text-3xl md:text-4xl text-ink">
          Gõ mõ tụng kinh
        </h1>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Mỗi tiếng pháp khí là một niệm an lành. Thành tâm chạm để bắt đầu.
        </p>
      </div>

      {thoiKhoaNote ? (
        <p
          className="mb-6 text-sm border px-4 py-3 leading-relaxed"
          style={{
            borderColor: `${primaryColor}55`,
            color: primaryColor,
            background: `${primaryColor}0d`,
          }}
        >
          {thoiKhoaNote}
        </p>
      ) : null}

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat label="Phiên này" value={String(session)} />
        <Stat label="Công đức hôm nay" value={String(day.total)} />
        <Stat label="Ngày liên tục" value={String(day.streak)} />
      </div>

      {/* Mục tiêu ngày */}
      <div className="mb-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-xs text-muted">Mục tiêu thời khóa</span>
          <div className="flex gap-1.5">
            {([108, 300, 1080] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => changeGoal(g)}
                className={`px-2.5 py-1 text-[0.7rem] border tabular-nums ${
                  dayGoal === g
                    ? 'border-ink text-ink'
                    : 'border-fog text-muted'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <ProgressBar
            label={`Phiên · ${session}/${dayGoal}`}
            pct={sessionProgress}
            color={primaryColor}
          />
          <ProgressBar
            label={`Ngày · ${day.total}/${dayGoal}`}
            pct={dayProgress}
            color={primaryColor}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs text-muted mb-1.5">Niệm danh hiệu</label>
        <select
          value={niem}
          onChange={(e) => setNiem(e.target.value as NiemDanhHieu)}
          className="w-full px-3 py-2 bg-white border border-fog text-sm text-ink"
        >
          {NIEM_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
        <label className="mt-2 flex items-center gap-2 text-xs text-muted">
          <input
            type="checkbox"
            checked={voiceOn}
            onChange={(e) => setVoiceOn(e.target.checked)}
          />
          Đọc danh hiệu theo nhịp gõ (giọng máy)
        </label>
      </div>

      <div className="flex gap-2 mb-6">
        {(
          [
            ['mo', 'Mõ'],
            ['chuong', 'Chuông'],
            ['khanh', 'Khánh'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setInstrument(id)}
            className={`flex-1 py-2 text-sm border transition-colors ${
              instrument === id
                ? 'text-white border-transparent'
                : 'border-fog text-ink hover:border-ink/30'
            }`}
            style={
              instrument === id ? { backgroundColor: primaryColor } : undefined
            }
          >
            {label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => void strike()}
        disabled={celebrateOpen}
        className="relative w-full aspect-square max-w-[20rem] mx-auto block select-none touch-manipulation disabled:pointer-events-none"
        aria-label="Gõ pháp khí"
      >
        <div
          className={`absolute inset-0 rounded-full transition-transform ${
            hitting ? 'go-mo-hit' : ''
          }`}
          style={{
            background: `radial-gradient(circle at 35% 30%, #c9a227aa, ${primaryColor} 55%, #1a1714 100%)`,
          }}
        />
        <div className="absolute inset-[12%] rounded-full bg-ink/25 backdrop-blur-[1px] flex flex-col items-center justify-center text-white">
          {instrument === 'mo' ? (
            <MoSvg className={`size-28 md:size-32 ${hitting ? 'go-mo-mallet' : ''}`} />
          ) : instrument === 'chuong' ? (
            <ChuongSvg
              className={`size-28 md:size-32 ${hitting ? 'go-mo-mallet' : ''}`}
            />
          ) : (
            <KhanhSvg
              className={`size-28 md:size-32 ${hitting ? 'go-mo-mallet' : ''}`}
            />
          )}
          <p
            className={`mt-4 text-sm font-medium px-4 text-center transition-opacity ${
              flashText ? 'opacity-100 scale-105' : 'opacity-80'
            }`}
          >
            {niem === 'none' ? `Chạm để gõ ${instrumentLabel(instrument)}` : niemLabel}
          </p>
        </div>
      </button>

      <div className="mt-8 space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setAuto((v) => !v)}
            className="px-4 py-2 text-sm text-white"
            style={{ backgroundColor: primaryColor }}
          >
            {auto ? 'Dừng tự gõ' : 'Tự gõ'}
          </button>
          <button
            type="button"
            onClick={resetSession}
            className="px-4 py-2 text-sm border border-fog text-ink hover:border-ink/30"
          >
            Đặt lại phiên
          </button>
          <button
            type="button"
            onClick={() => void syncScore(day.total)}
            className="px-4 py-2 text-sm border border-fog text-ink hover:border-ink/30"
          >
            Đồng bộ điểm
          </button>
        </div>

        {showWaterCta ? (
          <WaterMeritInlineCta
            primaryColor={primaryColor}
            templeName={templeName}
            source="go_mo"
            onThinhNuoc={() =>
              openWaterDonateForm({
                note: `Hồi hướng công đức gõ mõ tại ${templeName}`,
              })
            }
            onDismiss={() => setShowWaterCta(false)}
          />
        ) : null}

        <div className="flex justify-center gap-2">
          {(
            [
              ['slow', 'Chậm'],
              ['medium', 'Vừa'],
              ['fast', 'Nhanh'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSpeed(id)}
              className={`px-3 py-1.5 text-xs border ${
                speed === id
                  ? 'border-ink text-ink'
                  : 'border-fog text-muted hover:border-ink/30'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <DedicationForm
        primaryColor={primaryColor}
        session={session}
        dayTotal={day.total}
        onSaved={async () => {
          const res = await listGoMoDedications(20);
          if (res.ok) setDedications(res.rows);
        }}
      />

      <Leaderboard
        primaryColor={primaryColor}
        rows={leaderboard}
        clientKey={clientKey}
      />

      <BangVang
        primaryColor={primaryColor}
        rows={dedications}
      />
    </div>
  );
}

function instrumentLabel(i: Instrument) {
  if (i === 'chuong') return 'chuông';
  if (i === 'khanh') return 'khánh';
  return 'mõ';
}

function ProgressBar({
  label,
  pct,
  color,
}: {
  label: string;
  pct: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-[0.7rem] text-muted mb-1">
        <span>{label}</span>
        <span className="tabular-nums">{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 bg-mist overflow-hidden">
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-fog bg-white px-3 py-3 text-center">
      <p className="font-display text-xl text-ink tabular-nums">{value}</p>
      <p className="mt-0.5 text-[0.65rem] uppercase tracking-wide text-muted">
        {label}
      </p>
    </div>
  );
}

function DedicationForm({
  primaryColor,
  session,
  dayTotal,
  onSaved,
}: {
  primaryColor: string;
  session: number;
  dayTotal: number;
  onSaved?: () => void | Promise<void>;
}) {
  const [name, setName] = useState('');
  const [wish, setWish] = useState('');
  const [hp, setHp] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await submitGoMoDedication({
      name,
      wish,
      sessionCount: session,
      dayCount: dayTotal,
      hp,
    });
    setPending(false);
    if (!res.ok) {
      setError(res.error ?? 'Không gửi được.');
      return;
    }
    setSaved(true);
    setWish('');
    await onSaved?.();
    window.setTimeout(() => setSaved(false), 2500);
  }

  return (
    <form
      onSubmit={(e) => void submit(e)}
      className="mt-10 border border-fog bg-white p-5 text-left"
    >
      <p
        className="text-[0.65rem] uppercase tracking-[0.2em] mb-1"
        style={{ color: primaryColor }}
      >
        Hồi hướng
      </p>
      <p className="text-sm text-muted mb-4 leading-relaxed">
        Gửi tâm nguyện lên bảng vàng của chùa (lưu trên máy chủ).
      </p>
      <label className="block text-xs text-muted mb-1">Danh xưng</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-3 py-2 border border-fog text-sm mb-3"
        placeholder="Phật tử…"
      />
      <label className="block text-xs text-muted mb-1">Tâm nguyện</label>
      <textarea
        value={wish}
        onChange={(e) => setWish(e.target.value)}
        rows={2}
        className="w-full px-3 py-2 border border-fog text-sm mb-3 resize-none"
        placeholder="Hồi hướng cho…"
      />
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        aria-hidden
      />
      {error ? <p className="mb-2 text-xs text-red-800">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 text-sm text-white disabled:opacity-60"
        style={{ backgroundColor: primaryColor }}
      >
        {saved ? 'Đã ghi nhận' : pending ? 'Đang gửi…' : 'Hồi hướng'}
      </button>
    </form>
  );
}

function Leaderboard({
  primaryColor,
  rows,
  clientKey,
}: {
  primaryColor: string;
  rows: GoMoLeaderRow[];
  clientKey: string;
}) {
  return (
    <div className="mt-8 border border-fog bg-white p-5 text-left">
      <p
        className="text-[0.65rem] uppercase tracking-[0.2em] mb-1"
        style={{ color: primaryColor }}
      >
        Công đức hôm nay
      </p>
      <p className="text-sm text-muted mb-4 leading-relaxed">
        Xếp hạng số tiếng gõ trong ngày (theo thiết bị, ẩn danh một phần).
      </p>
      {rows.length === 0 ? (
        <p className="text-xs text-muted">Chưa có ai đồng bộ điểm hôm nay.</p>
      ) : (
        <ol className="space-y-2">
          {rows.map((r, i) => {
            const isYou = r.client_key === clientKey;
            const label =
              r.display_name?.trim() ||
              (isYou ? 'Bạn' : `Phật tử ${String(r.client_key).slice(0, 4)}`);
            return (
              <li
                key={`${r.client_key}-${i}`}
                className={`flex items-center justify-between gap-3 text-sm py-1.5 border-b border-fog/80 ${
                  isYou ? 'font-medium text-ink' : 'text-ink/90'
                }`}
              >
                <span>
                  <span className="text-muted tabular-nums mr-2">{i + 1}.</span>
                  {label}
                  {isYou ? (
                    <span className="ml-2 text-[0.65rem] text-muted">bạn</span>
                  ) : null}
                </span>
                <span className="tabular-nums text-muted">
                  {r.strike_count} tiếng
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function BangVang({
  primaryColor,
  rows,
}: {
  primaryColor: string;
  rows: GoMoDedication[];
}) {
  return (
    <div className="mt-8 border border-fog bg-white p-5 text-left">
      <p
        className="text-[0.65rem] uppercase tracking-[0.2em] mb-1"
        style={{ color: primaryColor }}
      >
        Bảng vàng
      </p>
      <p className="text-sm text-muted mb-4 leading-relaxed">
        Lời hồi hướng gần đây của Phật tử tại chùa.
      </p>
      {rows.length === 0 ? (
        <p className="text-xs text-muted">Chưa có ghi nhận.</p>
      ) : (
        <ul className="divide-y divide-fog">
          {rows.map((e) => (
            <li key={e.id} className="py-3">
              <div className="flex justify-between gap-2 text-sm">
                <span className="font-medium text-ink">{e.devotee_name}</span>
                <span className="text-xs text-muted tabular-nums shrink-0">
                  {e.day_count} tiếng
                </span>
              </div>
              {e.wish ? (
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  {e.wish}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MoSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <ellipse cx="58" cy="62" rx="38" ry="34" fill="#5c3d1e" />
      <ellipse cx="58" cy="58" rx="32" ry="28" fill="#8b5a2b" />
      <ellipse cx="48" cy="50" rx="10" ry="8" fill="#c9a227" opacity=".35" />
      <ellipse cx="72" cy="62" rx="8" ry="14" fill="#2a1a0c" />
      <g transform="rotate(-25 95 30)">
        <rect x="88" y="18" width="6" height="42" rx="2" fill="#3d2914" />
        <circle cx="91" cy="16" r="8" fill="#6b4423" />
      </g>
    </svg>
  );
}

function ChuongSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <path
        d="M40 28c0 0 4-10 20-10s20 10 20 10v8c0 28-8 48-20 56-12-8-20-28-20-56v-8z"
        fill="#c9a227"
      />
      <path
        d="M44 32c2 26 8 42 16 48 8-6 14-22 16-48"
        fill="none"
        stroke="#8b6914"
        strokeWidth="2"
      />
      <ellipse cx="60" cy="28" rx="18" ry="5" fill="#e8c56a" />
      <line x1="60" y1="12" x2="60" y2="28" stroke="#5c4a1a" strokeWidth="3" />
      <circle cx="60" cy="10" r="4" fill="#5c4a1a" />
    </svg>
  );
}

function KhanhSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <path
        d="M30 48h60l-8 36H38L30 48z"
        fill="#d4af37"
        stroke="#8b6914"
        strokeWidth="2"
      />
      <path d="M38 48l6 28h32l6-28" fill="none" stroke="#f5e6a8" strokeWidth="1.5" />
      <rect x="56" y="22" width="8" height="28" rx="2" fill="#5c4a1a" />
      <circle cx="60" cy="20" r="5" fill="#5c4a1a" />
      <ellipse cx="78" cy="78" rx="7" ry="5" fill="#6b4423" opacity=".85" />
    </svg>
  );
}
