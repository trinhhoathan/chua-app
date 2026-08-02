'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  TRIGRAMS,
  allHexagrams,
  buildFromLines,
  buildQueContext,
  castLine,
  type CastLineResult,
  type CastResult,
  type Hexagram,
  type LineValue,
} from '@/lib/fengshui/kinh-dich-64';
import {
  ensureKinhDichFollowUps,
  splitKinhDichReply,
} from '@/lib/fengshui/kinh-dich-prompt';
import {
  playCoinToss,
  playHexagramReveal,
  playLineLand,
} from '@/lib/fengshui/dich-sfx';
import {
  getSavedUnlockOrderCode,
  savePaidOrderCode,
} from '@/lib/fengshui/tuvi-html';
import { openWaterDonateForm } from '@/lib/water-merit-prompt';
import { useSitePersona } from '@/components/SitePersonaContext';
import { useStickToBottom } from '@/components/fengshui/useStickToBottom';
import { inputCls, labelCls } from '../FieldStyles';

interface Props {
  primaryColor: string;
  templeName?: string;
  templeId?: string;
}

type Tab = 'cast' | 'browse';
type CastPhase = 'idle' | 'tossing' | 'result';
/** Bước Reo quẻ: phải chọn giờ động tâm trước */
type CastStep = 'intention' | 'casting';

type ChatRole = 'user' | 'assistant';
type ChatMessage = { id: string; role: ChatRole; content: string };

const TOSS_MS = 1100;

const COIN_YANG = '/images/kinh-dich/coin-yang.svg';
const COIN_YIN = '/images/kinh-dich/coin-yin.svg';

const SUGGESTED_QUESTIONS = [
  'Công việc sắp tới nên tiến hay nên chờ?',
  'Duyên tình duyên này có thuận không?',
  'Nên chuyển nhà / đổi chỗ ở lúc này chứ?',
  'Sức khỏe và tâm trí cần chú ý điều gì?',
  'Việc gia đạo hiện tại nên xử lý ra sao?',
  'Năm nay hướng tu học · làm phúc thế nào cho an?',
];

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Kinh Dịch là gì?',
    a: 'Kinh Dịch là bộ kinh cổ luận về biến đổi của trời–đất–người qua 64 quẻ. Mỗi quẻ gồm thoán từ (lời đoán), đại tượng (hình tượng đạo quân tử) và sáu hào. Ở đây dùng để soi chiếu việc hỏi — tham khảo hướng thiện, không thay cho quyết định tuyệt đối.',
  },
  {
    q: 'Giờ động tâm là gì?',
    a: 'Là thời điểm quý vị khởi nghĩ chân thành về việc muốn hỏi. Ghi đúng giờ đó giúp gắn quẻ với “niệm” lúc phát tâm, thay vì chỉ lấy giờ bấm nút máy.',
  },
  {
    q: 'Ba đồng xu quyết định hào thế nào?',
    a: 'Mỗi hào gieo 3 xu: ngửa = 3, sấp = 2. Tổng 6 = lão âm (động), 7 = thiếu dương, 8 = thiếu âm, 9 = lão dương (động). Sáu hào từ dưới lên tạo quẻ gốc; hào động sinh quẻ biến.',
  },
  {
    q: 'Luận 4 tầng gồm những gì?',
    a: '1) Hào từ — lời từng hào, ưu tiên hào động. 2) Tượng — thoán từ & đại tượng. 3) Biến quẻ — chiều chuyển khi có hào động. 4) Ứng kỳ — áp vào câu hỏi và giờ động tâm, kèm lời khuyên hướng thiện.',
  },
  {
    q: 'Có nên tin tuyệt đối vào quẻ?',
    a: 'Không. Quẻ là gương soi tâm và thời thế theo cổ học. Việc hệ trọng nên kết hợp chánh kiến, nhân quả và thỉnh ý trực tiếp tại chùa.',
  },
];

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function formatDongTam(d: Date) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

function formatDongTamFull(d: Date) {
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()} ${formatDongTam(d)}`;
}

function nowAsTimeInputValue(d = new Date()) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function YangBar({
  changing,
  wide,
}: {
  changing?: boolean;
  wide?: boolean;
}) {
  return (
    <div
      className={`relative mx-auto ${wide ? 'h-3 w-full max-w-[11rem]' : 'h-2.5 w-full max-w-[9rem]'}`}
    >
      <div className="absolute inset-y-0 left-0 right-0 rounded-[1px] bg-ink" />
      {changing ? (
        <span
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-semibold text-amber-800"
          title="Lão dương — hào động"
        >
          ○
        </span>
      ) : null}
    </div>
  );
}

function YinBar({
  changing,
  wide,
}: {
  changing?: boolean;
  wide?: boolean;
}) {
  return (
    <div
      className={`relative mx-auto flex ${wide ? 'h-3 w-full max-w-[11rem] gap-2.5' : 'h-2.5 w-full max-w-[9rem] gap-2'}`}
    >
      <div className="flex-1 rounded-[1px] bg-ink" />
      <div className="flex-1 rounded-[1px] bg-ink" />
      {changing ? (
        <span
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-semibold text-amber-800"
          title="Lão âm — hào động"
        >
          ×
        </span>
      ) : null}
    </div>
  );
}

function MiniHexBars({ binary }: { binary: string }) {
  const bits = binary.split('').map(Number);
  const rows = [...bits].reverse();
  return (
    <div className="w-9 space-y-[3px] shrink-0" aria-hidden>
      {rows.map((bit, i) =>
        bit === 1 ? (
          <div key={i} className="h-[3px] w-full bg-ink/80 rounded-[0.5px]" />
        ) : (
          <div key={i} className="flex h-[3px] w-full gap-[3px]">
            <div className="flex-1 bg-ink/80 rounded-[0.5px]" />
            <div className="flex-1 bg-ink/80 rounded-[0.5px]" />
          </div>
        ),
      )}
    </div>
  );
}

function BronzeCoin({
  heads,
  className = '',
}: {
  heads: boolean;
  className?: string;
}) {
  return (
    <div className={`dich-coin ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={heads ? COIN_YANG : COIN_YIN}
        alt={heads ? 'Đồng xu dương' : 'Đồng xu âm'}
        draggable={false}
      />
    </div>
  );
}

function CastStage({
  phase,
  displayCoins,
  lines,
}: {
  phase: CastPhase;
  displayCoins: [boolean, boolean, boolean];
  lines: CastLineResult[];
}) {
  const tossing = phase === 'tossing';
  const settled = phase === 'idle' && lines.length > 0;

  if (tossing) {
    return (
      <div className="dich-cast-stage mx-auto w-full max-w-sm py-5 sm:py-7">
        <div className="dich-orbit-scene">
          <div className="dich-orbit dich-orbit-spin">
            {displayCoins.map((heads, i) => (
              <div
                key={`orbit-${i}`}
                className="dich-orbit-slot"
                style={{ ['--i' as string]: i }}
              >
                <BronzeCoin heads={heads} className="dich-coin-self-spin" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dich-cast-stage mx-auto w-full max-w-sm py-6 sm:py-8">
      <div className="flex items-center justify-center gap-3 sm:gap-5 min-h-[5.5rem]">
        {displayCoins.map((heads, i) => (
          <BronzeCoin
            key={`${phase}-${i}-${heads ? 'y' : 'n'}-${lines.length}`}
            heads={heads}
            className={settled ? 'dich-coin-land' : 'dich-coin-idle'}
          />
        ))}
      </div>
    </div>
  );
}

function renderSimpleMarkdown(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const html = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.+?)`/g, '<code>$1</code>');
    if (line.startsWith('### ')) {
      return (
        <p
          key={i}
          className="mt-2 mb-1 font-semibold text-ink"
          dangerouslySetInnerHTML={{ __html: html.replace(/^###\s*/, '') }}
        />
      );
    }
    if (line.startsWith('## ')) {
      return (
        <p
          key={i}
          className="mt-3 mb-1 font-semibold text-ink"
          dangerouslySetInnerHTML={{ __html: html.replace(/^##\s*/, '') }}
        />
      );
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return (
        <p
          key={i}
          className="pl-3 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: `• ${html.replace(/^[-*]\s*/, '')}`,
          }}
        />
      );
    }
    if (!line.trim()) return <div key={i} className="h-2" />;
    return (
      <p
        key={i}
        className="text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  });
}

function HexDetail({
  hex,
  changingIndexes,
  title,
  primaryColor,
  hideFigure,
}: {
  hex: Hexagram;
  changingIndexes?: number[];
  title?: string;
  primaryColor: string;
  /** Ẩn cột hình (khi header modal đã có ký hiệu quẻ) */
  hideFigure?: boolean;
}) {
  return (
    <div className="border border-fog bg-white p-4 sm:p-5">
      {title ? (
        <p className="text-[10px] uppercase tracking-wide text-muted mb-3">
          {title}
        </p>
      ) : null}
      <div
        className={
          hideFigure ? '' : 'flex flex-wrap gap-5 sm:gap-6 items-start'
        }
      >
        {!hideFigure ? (
          <p
            className="font-display text-4xl sm:text-5xl leading-none shrink-0"
            style={{ color: primaryColor }}
            title={hex.nameFull}
            aria-hidden
          >
            {hex.unicode}
          </p>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted tabular-nums">
            Quẻ số {hex.number}
          </p>
          <p className="font-display text-xl sm:text-2xl text-ink mt-0.5">
            {hex.nameFull}{' '}
            <span className="text-muted text-lg">({hex.nameHan})</span>
          </p>
          <p className="mt-1.5 text-sm" style={{ color: primaryColor }}>
            {hex.meaning}
          </p>
          <p className="text-xs text-muted mt-2">
            Thượng {TRIGRAMS[hex.upper].nameVi} (
            {TRIGRAMS[hex.upper].element}) · Hạ {TRIGRAMS[hex.lower].nameVi} (
            {TRIGRAMS[hex.lower].element})
          </p>
          <p className="mt-3 text-sm text-ink leading-relaxed">{hex.summary}</p>
          <div className="mt-3 space-y-2 border-t border-fog pt-3">
            <p className="text-xs text-muted leading-relaxed">
              <span className="font-medium text-ink">Thoán từ:</span>{' '}
              {hex.judgment}
            </p>
            <p className="text-xs text-muted leading-relaxed">
              <span className="font-medium text-ink">Đại tượng:</span>{' '}
              {hex.image}
            </p>
          </div>
          <ul className="mt-3 flex flex-wrap gap-1">
            {hex.keywords.map((k) => (
              <li
                key={k}
                className="px-2 py-0.5 text-[11px] border border-fog bg-paper text-ink"
              >
                {k}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {changingIndexes && changingIndexes.length > 0 ? (
        <div className="mt-4 border-t border-fog pt-3 space-y-1.5">
          <p className="text-[10px] uppercase tracking-wide text-muted">
            Hào động
          </p>
          {changingIndexes.map((i) => (
            <p key={i} className="text-xs text-ink leading-relaxed">
              <span className="text-muted">Hào {i + 1}:</span> {hex.lines[i]}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FaqSection({ primaryColor }: { primaryColor: string }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mt-8 border border-fog bg-white">
      <div className="px-4 py-3 border-b border-fog">
        <p className="text-[10px] uppercase tracking-wide text-muted">
          Câu hỏi thường gặp
        </p>
        <p className="font-display text-lg text-ink mt-0.5">
          Hiểu thêm về gieo quẻ Kinh Dịch
        </p>
      </div>
      <ul>
        {FAQS.map((item, i) => {
          const isOpen = open === i;
          return (
            <li key={item.q} className="border-b border-fog last:border-0">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <span className="text-sm text-ink font-medium">{item.q}</span>
                <span
                  className="text-muted text-xs shrink-0"
                  style={{ color: isOpen ? primaryColor : undefined }}
                >
                  {isOpen ? '▴' : '▾'}
                </span>
              </button>
              {isOpen ? (
                <p className="px-4 pb-3 text-xs text-muted leading-relaxed">
                  {item.a}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function HexBrowseModal({
  hex,
  primaryColor,
  onClose,
}: {
  hex: Hexagram;
  primaryColor: string;
  onClose: () => void;
}) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal
        aria-label={`Chi tiết quẻ ${hex.nameFull}`}
        className="relative z-10 w-full sm:max-w-2xl max-h-[min(92vh,44rem)] overflow-y-auto bg-paper border border-fog shadow-[0_28px_80px_-24px_rgba(0,0,0,0.45)]"
      >
        <div
          className="sticky top-0 z-10 px-4 sm:px-5 py-3 border-b border-fog flex items-start justify-between gap-3 bg-paper/95 backdrop-blur-sm"
          style={{
            background: `linear-gradient(160deg, ${primaryColor}12, var(--color-paper, #f7f3eb) 55%)`,
          }}
        >
          <div className="min-w-0">
            <p
              className="text-[0.65rem] uppercase tracking-[0.2em]"
              style={{ color: primaryColor }}
            >
              Tra cứu 64 quẻ
            </p>
            <p className="font-display text-lg sm:text-xl text-ink mt-0.5 truncate">
              <span className="mr-1.5" style={{ color: primaryColor }}>
                {hex.unicode}
              </span>
              {hex.nameFull}{' '}
              <span className="text-muted text-base">({hex.nameHan})</span>
            </p>
            <p className="text-xs text-muted mt-0.5 tabular-nums">
              Quẻ số {hex.number}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 size-8 inline-flex items-center justify-center border border-fog text-muted hover:text-ink bg-white"
            aria-label="Đóng"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <HexDetail hex={hex} primaryColor={primaryColor} hideFigure />
          <div className="border border-fog bg-white p-3 sm:p-4 space-y-1.5">
            <p className="text-[10px] uppercase tracking-wide text-muted">
              Sáu hào (từ dưới lên)
            </p>
            {hex.lines.map((line, i) => (
              <p key={i} className="text-xs text-ink leading-relaxed">
                {line}
              </p>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 text-sm text-white"
            style={{ backgroundColor: primaryColor }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export function KinhDich64({
  primaryColor,
  templeName = 'chùa',
  templeId = '',
}: Props) {
  const persona = useSitePersona();
  const isSimSite = persona.upsell === 'sim';
  const [tab, setTab] = useState<Tab>('cast');
  const [castStep, setCastStep] = useState<CastStep>('intention');
  const [phase, setPhase] = useState<CastPhase>('idle');
  const [lines, setLines] = useState<CastLineResult[]>([]);
  const [tossingCoins, setTossingCoins] = useState<
    [boolean, boolean, boolean] | null
  >(null);
  const [result, setResult] = useState<CastResult | null>(null);
  const [browseQuery, setBrowseQuery] = useState('');
  const [selectedBrowse, setSelectedBrowse] = useState<Hexagram | null>(null);

  // Giờ động tâm
  const [liveNow, setLiveNow] = useState(() => new Date());
  const [dongTam, setDongTam] = useState(() => new Date());
  const [editingTime, setEditingTime] = useState(false);
  const [timeDraft, setTimeDraft] = useState(() => nowAsTimeInputValue());
  const [intentQuestion, setIntentQuestion] = useState('');
  const [showSuggests, setShowSuggests] = useState(false);

  // Chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userQuestionCount, setUserQuestionCount] = useState(0);
  const [orderCode, setOrderCode] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  /** Lượt luận giải còn lại theo ví server (X-Ai-Remaining); null = chưa biết, -1 = không giới hạn */
  const [serverRemaining, setServerRemaining] = useState<number | null>(null);
  const [initialDone, setInitialDone] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const streamAccRef = useRef('');
  const timers = useRef<number[]>([]);
  const { containerRef, bottomRef, onScroll, onWheel, stickToBottom } =
    useStickToBottom([messages, streaming]);
  const intentLockedRef = useRef<{ question: string; dongTamAt: string } | null>(
    null,
  );

  const catalog = useMemo(() => allHexagrams(), []);
  const filtered = useMemo(() => {
    const q = browseQuery.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter(
      (h) =>
        h.nameVi.toLowerCase().includes(q) ||
        h.nameFull.toLowerCase().includes(q) ||
        h.nameHan.includes(q) ||
        h.meaning.toLowerCase().includes(q) ||
        h.unicode.includes(q) ||
        String(h.number) === q ||
        h.keywords.some((k) => k.includes(q)),
    );
  }, [catalog, browseQuery]);

  const queContext = useMemo(
    () =>
      result
        ? buildQueContext(result, intentLockedRef.current ?? undefined)
        : '',
    [result],
  );

  // Nguồn sự thật là ví server: chỉ khóa khi server báo hết lượt (402 / X-Ai-Remaining = 0)
  const lockedForChat =
    !unlocked && serverRemaining != null && serverRemaining === 0;

  const displayDongTam = editingTime ? dongTam : liveNow;

  useEffect(() => {
    if (editingTime || castStep !== 'intention') return;
    const id = window.setInterval(() => {
      const n = new Date();
      setLiveNow(n);
      setDongTam(n);
    }, 1000);
    return () => window.clearInterval(id);
  }, [editingTime, castStep]);

  useEffect(() => {
    if (!templeId) return;
    const saved = getSavedUnlockOrderCode(templeId);
    if (saved) {
      setOrderCode(saved);
      void verifyOrder(saved).then((ok) => {
        if (ok) setUnlocked(true);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templeId]);

  useEffect(() => {
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      abortRef.current?.abort();
    };
  }, []);

  async function verifyOrder(code: string): Promise<boolean> {
    try {
      const res = await fetch(
        `/api/orders/${encodeURIComponent(code)}/status`,
      );
      if (!res.ok) return false;
      const data = (await res.json()) as { paid?: boolean };
      return Boolean(data.paid);
    } catch {
      return false;
    }
  }

  function clearTimers() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }

  function resetToIntention() {
    clearTimers();
    abortRef.current?.abort();
    setCastStep('intention');
    setPhase('idle');
    setLines([]);
    setTossingCoins(null);
    setResult(null);
    setMessages([]);
    setUserQuestionCount(0);
    setInitialDone(false);
    setError(null);
    setStreaming(false);
    setStreamingId(null);
    intentLockedRef.current = null;
    const n = new Date();
    setLiveNow(n);
    setDongTam(n);
    setEditingTime(false);
    setTimeDraft(nowAsTimeInputValue(n));
  }

  function resetCast() {
    // Giữ giờ động tâm + câu hỏi, chỉ gieo lại 6 hào
    clearTimers();
    abortRef.current?.abort();
    setPhase('idle');
    setLines([]);
    setTossingCoins(null);
    setResult(null);
    setMessages([]);
    setUserQuestionCount(0);
    setInitialDone(false);
    setError(null);
    setStreaming(false);
    setStreamingId(null);
  }

  function applyEditedTime() {
    const [hh, mm] = timeDraft.split(':').map((x) => Number(x));
    if (
      Number.isNaN(hh) ||
      Number.isNaN(mm) ||
      hh < 0 ||
      hh > 23 ||
      mm < 0 ||
      mm > 59
    ) {
      setError('Giờ động tâm không hợp lệ.');
      return;
    }
    const next = new Date();
    next.setHours(hh, mm, 0, 0);
    setDongTam(next);
    setLiveNow(next);
    setEditingTime(true);
    setError(null);
  }

  function startCasting() {
    const q = intentQuestion.trim();
    if (!q) {
      setError('Xin hãy ghi câu hỏi / việc muốn hỏi trước khi gieo quẻ.');
      setShowSuggests(true);
      return;
    }
    intentLockedRef.current = {
      question: q,
      dongTamAt: formatDongTamFull(dongTam),
    };
    setError(null);
    setCastStep('casting');
    setPhase('idle');
    setLines([]);
    setTossingCoins(null);
    setResult(null);
    setMessages([]);
    setUserQuestionCount(0);
    setInitialDone(false);
  }

  function tossNext() {
    if (phase === 'tossing' || lines.length >= 6) return;
    clearTimers();
    setPhase('tossing');
    const cast = castLine();
    setTossingCoins(cast.coins);
    void playCoinToss();

    timers.current.push(
      window.setTimeout(() => {
        void playLineLand(cast.isYang);
        const nextLines = [...lines, cast];
        setLines(nextLines);
        setTossingCoins(null);

        if (nextLines.length >= 6) {
          const built = buildFromLines(
            nextLines.map((l) => l.value) as LineValue[],
          );
          setResult(built);
          setPhase('result');
          void playHexagramReveal();
        } else {
          setPhase('idle');
        }
      }, TOSS_MS),
    );
  }

  const sendAi = useCallback(
    async (
      question: string,
      opts: { isInitial?: boolean; questionIndex?: number },
    ) => {
      if (!queContext || streaming) return;
      const isInitial = Boolean(opts.isInitial);
      const qIndex =
        opts.questionIndex ?? (isInitial ? 0 : userQuestionCount);

      if (!isInitial && lockedForChat) {
        setError(
          isSimSite
            ? 'Đã dùng hết lượt luận giải miễn phí. Gọi thầy hoặc chọn sim hợp mệnh trong kho để được tư vấn tiếp.'
            : 'Đã dùng hết lượt luận giải miễn phí. Thỉnh nước và nhập mã đơn để hỏi tiếp.',
        );
        return;
      }

      setError(null);
      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: question,
      };
      const assistantId = `a-${Date.now()}`;
      const history = messages.map((m) => ({
        role: m.role,
        content:
          m.role === 'assistant'
            ? splitKinhDichReply(m.content).body
            : m.content,
      }));

      streamAccRef.current = '';
      setStreamingId(assistantId);
      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: assistantId, role: 'assistant', content: '' },
      ]);
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch('/api/kinh-dich/luan-giai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            question,
            queContext,
            history,
            templeName,
            orderCode: unlocked ? orderCode : undefined,
            questionIndex: qIndex,
            isInitialReading: isInitial,
          }),
        });

        const remainHeader = res.headers.get('X-Ai-Remaining');
        if (remainHeader !== null) setServerRemaining(Number(remainHeader));

        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as {
            error?: string;
            code?: string;
          } | null;
          if (res.status === 402) setServerRemaining(0);
          throw new Error(
            data?.error ||
              'Không luận giải được lúc này. Quý vị thử lại sau.',
          );
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error('Không nhận được phản hồi luận giải.');

        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (!chunk) continue;
          streamAccRef.current += chunk;
          const snapshot = streamAccRef.current;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: snapshot } : m,
            ),
          );
        }

        const finalText = ensureKinhDichFollowUps(
          streamAccRef.current ||
            'Xin lỗi, chưa nhận được nội dung luận giải.',
          question,
        );
        streamAccRef.current = finalText;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: finalText } : m,
          ),
        );

        if (isInitial) {
          setInitialDone(true);
        } else {
          setUserQuestionCount((c) => c + 1);
        }
      } catch (e) {
        if ((e as Error).name === 'AbortError') {
          /* ignore */
        } else {
          setError((e as Error).message);
          setMessages((prev) =>
            prev.filter((m) => m.id !== assistantId && m.id !== userMsg.id),
          );
        }
      } finally {
        setStreaming(false);
        setStreamingId(null);
      }
    },
    [
      queContext,
      streaming,
      userQuestionCount,
      unlocked,
      lockedForChat,
      messages,
      templeName,
      orderCode,
    ],
  );

  async function unlockWithCode() {
    const code = orderCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!code) {
      setError('Vui lòng nhập mã đơn thỉnh nước.');
      return;
    }
    const ok = await verifyOrder(code);
    if (!ok) {
      setError(
        'Mã đơn chưa thanh toán hoặc không tồn tại. Thỉnh nước rồi quay lại nhập mã.',
      );
      return;
    }
    setOrderCode(code);
    setUnlocked(true);
    setServerRemaining(null);
    savePaidOrderCode(code, templeId || undefined);
    setError(null);
  }

  function sendUserQuestion(raw: string) {
    const q = raw.trim();
    if (!q || streaming) return;
    setInput('');
    stickToBottom();
    void sendAi(q, { questionIndex: userQuestionCount });
  }

  const lastAssistant = [...messages]
    .reverse()
    .find((m) => m.role === 'assistant' && m.content.trim());
  const suggestions = lastAssistant
    ? splitKinhDichReply(lastAssistant.content).suggestions
    : [];

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        {(
          [
            { id: 'cast' as const, label: 'Reo quẻ' },
            { id: 'browse' as const, label: 'Tra cứu 64 quẻ' },
          ] as const
        ).map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 text-xs border transition-colors ${
                active
                  ? 'border-ink/30 text-white'
                  : 'border-fog bg-white text-ink hover:border-ink/25'
              }`}
              style={active ? { backgroundColor: primaryColor } : undefined}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'browse' ? (
        <div>
          <div className="mb-4">
            <p className="font-display text-xl text-ink">64 quẻ Kinh Dịch</p>
            <p className="text-xs text-muted mt-1 leading-relaxed max-w-xl">
              Thứ tự Văn Vương. Mỗi quẻ gồm thoán từ, đại tượng và sáu hào —
              bấm vào quẻ để mở khung chi tiết.
            </p>
          </div>
          <label className={`${labelCls()} block max-w-sm mb-3`}>
            Tìm quẻ
            <input
              type="search"
              value={browseQuery}
              onChange={(e) => setBrowseQuery(e.target.value)}
              placeholder="Tên đầy đủ, số, Hán, ý nghĩa…"
              className={`mt-1 ${inputCls}`}
            />
          </label>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {filtered.map((h) => (
              <li key={h.number}>
                <button
                  type="button"
                  onClick={() => setSelectedBrowse(h)}
                  className={`w-full text-left border px-3 py-2.5 transition-colors flex gap-3 items-start ${
                    selectedBrowse?.number === h.number
                      ? 'border-ink/30 bg-white'
                      : 'border-fog bg-white hover:border-ink/25'
                  }`}
                  style={
                    selectedBrowse?.number === h.number
                      ? { boxShadow: `inset 0 0 0 1px ${primaryColor}` }
                      : undefined
                  }
                >
                  <MiniHexBars binary={h.binary} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span
                        className="font-display text-xl leading-none"
                        style={{ color: primaryColor }}
                      >
                        {h.nameHan}
                      </span>
                      <span className="text-[11px] text-muted tabular-nums">
                        #{h.number}
                      </span>
                    </div>
                    <p className="text-sm text-ink font-medium mt-0.5 truncate">
                      {h.nameFull}
                    </p>
                    <p className="text-[11px] text-muted mt-0.5 line-clamp-2 leading-snug">
                      {h.meaning}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
          {selectedBrowse ? (
            <HexBrowseModal
              hex={selectedBrowse}
              primaryColor={primaryColor}
              onClose={() => setSelectedBrowse(null)}
            />
          ) : null}
          <FaqSection primaryColor={primaryColor} />
        </div>
      ) : castStep === 'intention' ? (
        <div className="border border-fog bg-gradient-to-b from-[#faf6ef] to-white px-4 py-8 sm:px-8 text-center">
          <p className="text-[11px] text-muted tracking-wide">
            Trước khi gieo — hãy xác định{' '}
            <span className="font-medium text-ink">Giờ Động Tâm</span>
          </p>

          <h2
            className="mt-5 font-display text-2xl sm:text-3xl"
            style={{ color: primaryColor }}
          >
            Giờ Động Tâm
          </h2>

          <p
            className="mt-3 font-display text-4xl sm:text-5xl tabular-nums tracking-wide"
            style={{ color: primaryColor }}
          >
            {formatDongTam(displayDongTam)}
          </p>
          <p className="mt-1 text-xs text-muted tabular-nums">
            {pad2(displayDongTam.getDate())}/{pad2(displayDongTam.getMonth() + 1)}
            /{displayDongTam.getFullYear()}
            {editingTime ? ' · đã chỉnh tay' : ' · đang theo giờ hiện tại'}
          </p>

          {!editingTime ? (
            <button
              type="button"
              onClick={() => {
                setTimeDraft(nowAsTimeInputValue(displayDongTam));
                setEditingTime(true);
              }}
              className="mt-2 text-xs underline-offset-2 hover:underline inline-flex items-center gap-1"
              style={{ color: primaryColor }}
            >
              ✎ Ấn để chỉnh thời gian
            </button>
          ) : (
            <div className="mt-3 flex flex-wrap items-end justify-center gap-2">
              <label className={`${labelCls()} text-left`}>
                Giờ : phút
                <input
                  type="time"
                  step={60}
                  value={timeDraft}
                  onChange={(e) => setTimeDraft(e.target.value)}
                  className={`mt-1 ${inputCls} w-[9rem]`}
                />
              </label>
              <button
                type="button"
                onClick={applyEditedTime}
                className="px-3 py-2 text-xs text-white"
                style={{ backgroundColor: primaryColor }}
              >
                Lưu giờ
              </button>
              <button
                type="button"
                onClick={() => {
                  const n = new Date();
                  setEditingTime(false);
                  setLiveNow(n);
                  setDongTam(n);
                  setTimeDraft(nowAsTimeInputValue(n));
                }}
                className="px-3 py-2 text-xs border border-fog text-ink"
              >
                Dùng giờ máy
              </button>
            </div>
          )}

          <p className="mt-5 text-sm text-muted leading-relaxed max-w-md mx-auto">
            Chọn khung thời gian khi quý vị{' '}
            <span className="text-ink">khởi nghĩ</span> về việc muốn hỏi. Quẻ
            Kinh Dịch soi chiếu qua{' '}
            <span className="text-ink font-medium">
              luận 4 tầng chuyên sâu
            </span>{' '}
            (Hào từ · Tượng · Biến quẻ · Ứng kỳ) — tham khảo, hướng thiện.
          </p>

          <div className="mt-6 mx-auto max-w-lg border border-fog bg-white/90 px-4 py-4 text-left space-y-3">
            <ul className="text-xs text-muted space-y-1.5 leading-relaxed">
              <li>
                * Câu hỏi càng chi tiết, luận giải càng sát việc của quý vị.
              </li>
              <li>
                * Chỉnh Giờ động tâm đúng lúc quý vị bắt đầu nghĩ về việc muốn
                hỏi.
              </li>
            </ul>

            <label className={labelCls()}>
              Việc / câu hỏi muốn hỏi
              <textarea
                value={intentQuestion}
                onChange={(e) => setIntentQuestion(e.target.value)}
                rows={3}
                placeholder="Ví dụ: Tháng này có nên nhận việc mới không?"
                className={`mt-1 ${inputCls} resize-y min-h-[4.5rem]`}
              />
            </label>

            {showSuggests ? (
              <ul className="flex flex-wrap gap-1.5">
                {SUGGESTED_QUESTIONS.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => {
                        setIntentQuestion(s);
                        setShowSuggests(false);
                      }}
                      className="text-left text-[11px] border border-fog px-2 py-1.5 text-ink hover:border-ink/30 bg-paper"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowSuggests((v) => !v)}
                className="px-3 py-2 text-xs border border-fog text-ink hover:border-ink/30"
              >
                {showSuggests ? 'Ẩn gợi ý' : '✦ Gợi ý câu hỏi'}
              </button>
              <button
                type="button"
                onClick={startCasting}
                className="flex-1 min-w-[10rem] px-4 py-2.5 text-sm text-white"
                style={{ backgroundColor: primaryColor }}
              >
                Gieo quẻ miễn phí
              </button>
            </div>
          </div>

          {error && castStep === 'intention' ? (
            <p className="mt-3 text-xs text-red-700">{error}</p>
          ) : null}

          <FaqSection primaryColor={primaryColor} />
        </div>
      ) : (
        <div>
          {/* Intent summary bar */}
          <div className="mb-4 border border-fog bg-white px-3 py-2.5 flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-muted">
                Giờ động tâm
              </p>
              <p
                className="text-sm font-medium tabular-nums"
                style={{ color: primaryColor }}
              >
                {intentLockedRef.current?.dongTamAt ?? formatDongTamFull(dongTam)}
              </p>
              <p className="mt-1 text-xs text-ink leading-relaxed line-clamp-2">
                {intentLockedRef.current?.question ?? intentQuestion}
              </p>
            </div>
            <button
              type="button"
              onClick={resetToIntention}
              className="text-xs shrink-0 underline-offset-2 hover:underline"
              style={{ color: primaryColor }}
            >
              Đổi giờ / câu hỏi
            </button>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-xs text-muted">
                Hào {Math.min(lines.length + (phase === 'tossing' ? 1 : 0), 6)}
                /6 (từ dưới lên)
              </p>
              {phase !== 'idle' || lines.length > 0 ? (
                <button
                  type="button"
                  onClick={resetCast}
                  className="text-xs underline-offset-2 hover:underline"
                  style={{ color: primaryColor }}
                >
                  Gieo lại
                </button>
              ) : null}
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className="h-1.5 flex-1 rounded-full transition-colors"
                  style={{
                    backgroundColor:
                      i < lines.length
                        ? primaryColor
                        : i === lines.length && phase === 'tossing'
                          ? `${primaryColor}66`
                          : '#e7e5e4',
                  }}
                />
              ))}
            </div>
          </div>

          {phase !== 'result' ? (
            <div className="border border-fog bg-gradient-to-b from-[#f7f1e6] to-white p-4 sm:p-5 text-center overflow-hidden">
              <p className="text-sm text-ink mb-1 font-medium">
                {lines.length === 0
                  ? 'Thành tâm niệm, rồi gieo hào sơ (dưới cùng)'
                  : lines.length < 6
                    ? `Gieo hào ${lines.length + 1}`
                    : ''}
              </p>
              <p className="text-xs text-muted mb-3">
                Ba đồng xu — mặt vàng (陽) = dương · mặt tối (陰) = âm
              </p>

              <CastStage
                phase={phase === 'tossing' ? 'tossing' : 'idle'}
                displayCoins={
                  tossingCoins ??
                  (lines.length > 0
                    ? lines[lines.length - 1].coins
                    : [true, true, false])
                }
                lines={lines}
              />

              {phase === 'idle' && lines.length > 0 ? (
                <p className="mt-1 text-[11px] text-muted">
                  Hào {lines.length}: {lines[lines.length - 1].label}
                  {lines[lines.length - 1].isChanging ? ' · động' : ''}
                </p>
              ) : null}

              {lines.length > 0 ? (
                <div className="mt-4 mb-4 space-y-1.5 max-w-[10rem] mx-auto">
                  {[...lines].reverse().map((l, revIdx) => {
                    const idx = lines.length - 1 - revIdx;
                    return (
                      <div key={idx} className="dich-line-in">
                        {l.isYang ? (
                          <YangBar changing={l.isChanging} />
                        ) : (
                          <YinBar changing={l.isChanging} />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-3" />
              )}

              <button
                type="button"
                disabled={phase === 'tossing'}
                onClick={tossNext}
                className="px-6 py-2.5 text-sm text-white disabled:opacity-60"
                style={{ backgroundColor: primaryColor }}
              >
                {phase === 'tossing'
                  ? 'Đồng xu đang bay…'
                  : lines.length === 0
                    ? 'Thành tâm — gieo hào 1'
                    : `Gieo hào ${lines.length + 1}`}
              </button>
            </div>
          ) : result ? (
            <div className="space-y-4">
              <HexDetail
                hex={result.primary}
                changingIndexes={result.changingIndexes}
                title="Quẻ gốc"
                primaryColor={primaryColor}
              />
              {result.secondary ? (
                <HexDetail
                  hex={result.secondary}
                  title="Quẻ biến"
                  primaryColor={primaryColor}
                />
              ) : (
                <p className="text-xs text-muted">
                  Không có hào động — chỉ luận quẻ gốc.
                </p>
              )}

              {/* AI section */}
              <div className="border border-fog bg-white">
                <div className="px-4 py-3 border-b border-fog flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      Luận giải cùng {isSimSite ? persona.displayName : 'trụ trì'}
                    </p>
                    <p className="text-[11px] text-muted mt-0.5">
                      {isSimSite
                        ? 'Có lượt luận giải miễn phí — hết lượt thì gọi thầy tư vấn'
                        : 'Có lượt luận giải miễn phí — hết lượt thì thỉnh nước, nhập mã đơn để cộng lượt'}
                      {serverRemaining != null && serverRemaining >= 0
                        ? ` · còn ${serverRemaining} lượt`
                        : ''}
                    </p>
                  </div>
                  {!initialDone ? (
                    <button
                      type="button"
                      disabled={streaming}
                      onClick={() => {
                        stickToBottom();
                        void sendAi(
                          `Xin ${isSimSite ? 'thầy' : 'trụ trì'} luận giải quẻ này theo 4 tầng (Hào từ · Tượng · Biến quẻ · Ứng kỳ).
Giờ động tâm: ${intentLockedRef.current?.dongTamAt ?? ''}.
Câu hỏi: ${intentLockedRef.current?.question ?? ''}.
Xin luận sát câu hỏi, trang nghiêm và hướng thiện.`,
                          { isInitial: true },
                        );
                      }}
                      className="px-3 py-1.5 text-xs text-white disabled:opacity-60"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {streaming
                        ? 'Đang luận…'
                        : isSimSite
                          ? 'Mời thầy luận giải'
                          : 'Mời trụ trì luận giải'}
                    </button>
                  ) : null}
                </div>

                <div
                  ref={containerRef}
                  onScroll={onScroll}
                  onWheel={onWheel}
                  className="px-3 py-3 max-h-[28rem] overflow-y-auto space-y-3"
                >
                  {messages.length === 0 && !streaming ? (
                    <p className="text-xs text-muted text-center py-6">
                      {isSimSite
                        ? 'Bấm «Mời thầy luận giải» để nhận luận đầu (miễn phí), rồi được hỏi thêm 1 câu.'
                        : 'Bấm «Mời trụ trì luận giải» để nhận luận đầu (miễn phí), rồi được hỏi thêm 1 câu; từ câu hỏi thứ 2 cần thỉnh nước.'}
                    </p>
                  ) : null}

                  {messages.map((m) => {
                    const { body, suggestions: sug } =
                      m.role === 'assistant'
                        ? splitKinhDichReply(m.content)
                        : { body: m.content, suggestions: [] as string[] };
                    const isStream =
                      streaming && streamingId === m.id && !body.trim();
                    return (
                      <div key={m.id} className="space-y-1.5">
                        <div
                          className={`text-sm px-3 py-2 ${
                            m.role === 'user'
                              ? 'bg-stone-50 border border-fog ml-6'
                              : 'bg-white border border-fog mr-2'
                          }`}
                        >
                          {m.role === 'assistant' ? (
                            <>
                              {body ? renderSimpleMarkdown(body) : null}
                              {isStream ||
                              (streaming &&
                                streamingId === m.id &&
                                !splitKinhDichReply(m.content).body) ? (
                                <span className="inline-block size-1.5 rounded-full bg-stone-400 animate-pulse" />
                              ) : null}
                            </>
                          ) : (
                            m.content
                          )}
                        </div>
                        {sug.length > 0 &&
                        m.id === lastAssistant?.id &&
                        !streaming ? (
                          <div className="pl-0.5 space-y-1.5">
                            <p className="text-[0.65rem] text-muted">
                              Quý vị có thể hỏi tiếp:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {sug.map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  disabled={streaming || lockedForChat}
                                  onClick={() => sendUserQuestion(s)}
                                  className="text-left text-xs border border-fog bg-white px-2 py-1.5 text-ink hover:border-ink/30 disabled:opacity-50"
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {lockedForChat ? (
                  isSimSite ? (
                    <div className="px-4 py-3 border-t border-fog space-y-2 bg-stone-50/80">
                      <p className="text-xs font-medium text-ink">
                        Đã dùng hết câu hỏi thêm miễn phí
                      </p>
                      <p className="text-[0.7rem] text-muted leading-relaxed">
                        Muốn {persona.displayName} luận sâu hơn về quẻ này?
                        Gọi thầy tư vấn trực tiếp, hoặc vào kho sim chọn dãy
                        số hợp mệnh đã chấm điểm sẵn.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <a
                          href="/sim"
                          className="text-xs px-2.5 py-1.5 text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          Xem kho sim hợp mệnh
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-3 border-t border-fog space-y-2 bg-stone-50/80">
                      <p className="text-xs font-medium text-ink">
                        Từ câu hỏi thứ 2 cần thỉnh nước
                      </p>
                      <p className="text-[0.7rem] text-muted leading-relaxed">
                        Quý vị đã dùng hết 1 câu hỏi thêm miễn phí. Thỉnh nước
                        ủng hộ chùa để hỏi tiếp về quẻ này — công đức duy trì
                        đèn nước công quả.
                      </p>
                      <div className="flex flex-wrap gap-2 items-end">
                        <button
                          type="button"
                          onClick={() =>
                            openWaterDonateForm({
                              note: 'Hỏi tiếp luận giải Kinh Dịch',
                              qty: 10,
                            })
                          }
                          className="text-xs px-2.5 py-1.5 text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          Thỉnh nước
                        </button>
                        <label className={`${labelCls()} flex-1 min-w-[8rem]`}>
                          Mã đơn đã thanh toán
                          <input
                            value={orderCode}
                            onChange={(e) =>
                              setOrderCode(e.target.value.toUpperCase())
                            }
                            className={`mt-1 ${inputCls}`}
                            placeholder="VD: A3K9MP2Q"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => void unlockWithCode()}
                          className="text-xs px-2.5 py-1.5 border border-fog text-ink"
                        >
                          Mở khóa
                        </button>
                      </div>
                    </div>
                  )
                ) : null}

                {error ? (
                  <p className="px-3 py-1.5 text-[0.7rem] text-red-700 bg-red-50 border-t border-red-100">
                    {error}
                  </p>
                ) : null}

                {initialDone ? (
                  <form
                    className="border-t border-fog p-2 flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendUserQuestion(input);
                    }}
                  >
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      disabled={streaming || lockedForChat}
                      placeholder={
                        lockedForChat
                          ? isSimSite
                            ? 'Gọi thầy để hỏi tiếp…'
                            : 'Thỉnh nước để hỏi tiếp…'
                          : 'Hỏi về quẻ…'
                      }
                      className={`flex-1 ${inputCls} disabled:opacity-60`}
                    />
                    <button
                      type="submit"
                      disabled={
                        streaming || lockedForChat || !input.trim()
                      }
                      className="px-3 py-2 text-xs text-white disabled:opacity-50"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Gửi
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
