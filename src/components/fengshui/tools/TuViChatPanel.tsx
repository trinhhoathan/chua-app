'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  buildDaiVanPromptContext,
  buildHanNamPromptContext,
  buildTuViPromptContext,
  ensureFollowUpBlock,
  splitTuViReply,
  type TuViSchool,
} from '@/lib/fengshui/tuvi-prompt';
import { buildPhiTinhPromptBlock } from '@/lib/fengshui/tuvi-phi-tinh';
import {
  getSavedUnlockOrderCode,
  savePaidOrderCode,
} from '@/lib/fengshui/tuvi-html';
import type {
  IztroChartView,
  IztroHoroscopeView,
} from '@/lib/fengshui/iztro-chart';
import { openWaterDonateForm } from '@/lib/water-merit-prompt';
import { useSitePersona } from '@/components/SitePersonaContext';
import { useStickToBottom } from '@/components/fengshui/useStickToBottom';

type Role = 'user' | 'assistant';

type Message = {
  id: string;
  role: Role;
  content: string;
};

interface Props {
  open: boolean;
  onClose: () => void;
  primaryColor: string;
  templeName: string;
  /** Lá số Tử Vi — có thể bỏ trống khi dùng contextOverride (hợp tuổi, Hà Lạc…). */
  chart?: IztroChartView | null;
  horoscope: IztroHoroscopeView | null;
  school?: TuViSchool;
  /** Không đưa vận hạn vào ngữ cảnh / prompt (trang luận giải cung). */
  noVanHan?: boolean;
  /** Chỉ luận hạn năm / lưu niên. */
  vanHanFocus?: boolean;
  /** Chỉ luận đại vận · tiểu vận. */
  daiVanFocus?: boolean;
  /** Chỉ luận nạp âm · ngũ hành tứ trụ. */
  napAmFocus?: boolean;
  /** Chỉ luận hợp tuổi · xung khắc hai người. */
  hopTuoiFocus?: boolean;
  /** Chỉ luận Bát tự Hà Lạc. */
  haLacFocus?: boolean;
  /** Chỉ luận dụng thần Bát tự. */
  dungThanFocus?: boolean;
  /** Luận lá số Bát tự Tứ trụ (Tử Bình). */
  batTuFocus?: boolean;
  /** Ghi đè ngữ cảnh gửi AI (vd. khối nạp âm thay vì lá số). */
  contextOverride?: string;
  /** Số câu hỏi miễn phí; từ câu tiếp theo cần thỉnh nước. */
  freeQuestionLimit?: number;
  templeId?: string;
  contactPhone?: string | null;
  onEssaysChange?: (essays: { question: string; answer: string }[]) => void;
  onOpenDetail12?: () => void;
}

const SUGGESTIONS_FULL = [
  'Luận tổng quan lá số này',
  'Cách cục của lá số này là gì?',
  'Vận hạn tại thời gian xem thế nào?',
  'Luận cung Mệnh và cung Thân',
];

const SUGGESTIONS_NO_VAN_HAN = [
  'Luận tổng quan lá số này',
  'Cách cục / cung Mệnh thế nào?',
  'Tam hợp và đối cung nổi bật?',
  'Luận cung Mệnh và cung Thân',
];

const SUGGESTIONS_HAN_NAM = [
  'Luận hạn năm / lưu niên năm xem',
  'Đại hạn và tiểu hạn đang đi thế nào?',
  'Năm này nên–tránh điều gì?',
  'Tứ hóa lưu niên ảnh hưởng ra sao?',
];

const SUGGESTIONS_DAI_VAN = [
  'Luận đại hạn đang đi',
  'Tiểu hạn năm này thế nào?',
  'Đại hạn kế tiếp sẽ ra sao?',
  'Nên–tránh trong chu kỳ đại vận này?',
];

const SUGGESTIONS_NAP_AM = [
  'Luận sâu mệnh nạp âm của tôi',
  'Ngũ hành tôi vượng gì, khuyết gì?',
  'Bổ khuyết ngũ hành thế nào cho hợp?',
  'Nạp âm các trụ sinh khắc ra sao?',
];

const SUGGESTIONS_HOP_TUOI = [
  'Hai tuổi này hợp nhau ở điểm nào nhất?',
  'Điểm xung khắc nào cần hóa giải?',
  'Cách hóa giải xung khắc thế nào?',
  'Nên cưới / hợp tác vào năm nào đẹp?',
];

const SUGGESTIONS_HA_LAC = [
  'Quẻ tiên thiên của tôi nói gì?',
  'Hào nguyên đường báo điều gì?',
  'Quẻ hậu thiên — hậu vận ra sao?',
  'Thiên số địa số của tôi mạnh yếu gì?',
];

const SUGGESTIONS_DUNG_THAN = [
  'Vì sao tôi thân vượng / thân nhược?',
  'Dụng thần của tôi ứng dụng thế nào?',
  'Nghề nghiệp nào hợp dụng thần?',
  'Kỵ thần cần tránh những gì?',
];

const SUGGESTIONS_BAT_TU = [
  'Luận tổng quan lá số Bát tự này',
  'Thập thần trong tứ trụ nói gì về tôi?',
  'Đại vận đang đi và lưu niên năm nay?',
  'Công danh · tài lộc theo bát tự thế nào?',
];

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

async function verifyOrderPaid(code: string): Promise<boolean> {
  try {
    const res = await fetch(
      `/api/orders/${encodeURIComponent(code)}/status`,
      { cache: 'no-store' },
    );
    if (!res.ok) return false;
    const data = (await res.json()) as { paid?: boolean };
    return Boolean(data.paid);
  } catch {
    return false;
  }
}

export function TuViChatPanel({
  open,
  onClose,
  primaryColor,
  templeName,
  chart,
  horoscope,
  school = 'bac_phai',
  noVanHan = false,
  vanHanFocus = false,
  daiVanFocus = false,
  napAmFocus = false,
  hopTuoiFocus = false,
  haLacFocus = false,
  dungThanFocus = false,
  batTuFocus = false,
  contextOverride,
  freeQuestionLimit,
  templeId = '',
  contactPhone,
  onEssaysChange,
  onOpenDetail12,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [orderCode, setOrderCode] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  /** Lượt luận giải còn lại theo ví server (X-Ai-Remaining); null = chưa biết, -1 = không giới hạn */
  const [serverRemaining, setServerRemaining] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const streamAccRef = useRef('');
  const { containerRef, bottomRef, onScroll, onWheel, stickToBottom } =
    useStickToBottom([messages, streaming]);

  const persona = useSitePersona();
  const abbottLabel =
    persona.upsell === 'sim'
      ? persona.displayName
      : `trụ trì ${templeName.trim() || 'chùa'}`;
  const starterSuggestions = hopTuoiFocus
    ? SUGGESTIONS_HOP_TUOI
    : haLacFocus
      ? SUGGESTIONS_HA_LAC
      : batTuFocus
        ? SUGGESTIONS_BAT_TU
        : dungThanFocus
        ? SUGGESTIONS_DUNG_THAN
        : napAmFocus
          ? SUGGESTIONS_NAP_AM
          : daiVanFocus
            ? SUGGESTIONS_DAI_VAN
            : vanHanFocus
              ? SUGGESTIONS_HAN_NAM
              : noVanHan
                ? SUGGESTIONS_NO_VAN_HAN
                : SUGGESTIONS_FULL;
  const limit =
    typeof freeQuestionLimit === 'number' && freeQuestionLimit > 0
      ? freeQuestionLimit
      : null;

  const chartContext = useMemo(() => {
    if (contextOverride) return contextOverride;
    if (!chart) return '';
    if (daiVanFocus && horoscope) {
      return buildDaiVanPromptContext(chart, horoscope);
    }
    if (vanHanFocus && horoscope) {
      return buildHanNamPromptContext(chart, horoscope);
    }
    const base = buildTuViPromptContext(chart, horoscope, {
      noVanHan: noVanHan || undefined,
    });
    if (school !== 'phi_tinh') return base;
    const phi = buildPhiTinhPromptBlock(chart);
    return phi ? `${base}\n\n${phi}` : base;
  }, [
    chart,
    horoscope,
    school,
    noVanHan,
    vanHanFocus,
    daiVanFocus,
    contextOverride,
  ]);

  const userQuestionCount = useMemo(
    () => messages.filter((m) => m.role === 'user').length,
    [messages],
  );

  const assistantCount = useMemo(
    () =>
      messages.filter(
        (m) => m.role === 'assistant' && m.content.trim().length > 0,
      ).length,
    [messages],
  );

  // Nguồn sự thật là ví server: chỉ khóa khi server báo hết lượt (402 / X-Ai-Remaining = 0)
  const lockedForChat =
    !unlocked && serverRemaining != null && serverRemaining === 0;

  useEffect(() => {
    if (!templeId || limit == null) return;
    const saved = getSavedUnlockOrderCode(templeId);
    if (!saved) return;
    setOrderCode(saved);
    void verifyOrderPaid(saved).then((ok) => {
      if (ok) setUnlocked(true);
    });
  }, [templeId, limit]);

  useEffect(() => {
    if (!onEssaysChange) return;
    const essays: { question: string; answer: string }[] = [];
    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      if (m.role !== 'user') continue;
      const next = messages[i + 1];
      if (!next || next.role !== 'assistant' || !next.content.trim()) continue;
      if (streaming && streamingId === next.id) continue;
      essays.push({
        question: m.content,
        answer: splitTuViReply(next.content).body,
      });
    }
    onEssaysChange(essays);
  }, [messages, onEssaysChange, streaming, streamingId]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !streaming) onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, streaming]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function unlockWithCode() {
    const code = orderCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!code) {
      setError('Vui lòng nhập mã đơn thỉnh nước.');
      return;
    }
    setUnlocking(true);
    setError(null);
    try {
      const ok = await verifyOrderPaid(code);
      if (!ok) {
        setError(
          'Mã đơn chưa thanh toán hoặc không hợp lệ. Thỉnh nước rồi nhập lại mã.',
        );
        return;
      }
      setOrderCode(code);
      setUnlocked(true);
      setServerRemaining(null);
      if (templeId) savePaidOrderCode(code, templeId);
    } finally {
      setUnlocking(false);
    }
  }

  async function sendQuestion(raw: string) {
    const question = raw.trim();
    if (!question || streaming) return;

    if (lockedForChat) {
      setError(
        persona.upsell === 'sim'
          ? 'Đã dùng hết lượt luận giải miễn phí. Gọi thầy hoặc chọn sim hợp mệnh trong kho để được tư vấn tiếp.'
          : 'Đã dùng hết lượt luận giải miễn phí. Thỉnh nước ủng hộ chùa để hỏi tiếp.',
      );
      return;
    }

    setError(null);
    setInput('');
    stickToBottom();
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: question,
    };
    const assistantId = `a-${Date.now()}`;
    const history = messages.map((m) => ({
      role: m.role,
      content:
        m.role === 'assistant' ? splitTuViReply(m.content).body : m.content,
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
      const res = await fetch('/api/tuvi/luan-giai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          question,
          chartContext,
          history,
          templeName,
          orderCode: unlocked ? orderCode : undefined,
          school,
          noVanHan:
            vanHanFocus ||
            daiVanFocus ||
            napAmFocus ||
            hopTuoiFocus ||
            haLacFocus ||
            dungThanFocus ||
            batTuFocus
              ? undefined
              : noVanHan || undefined,
          vanHanFocus: vanHanFocus || undefined,
          daiVanFocus: daiVanFocus || undefined,
          napAmFocus: napAmFocus || undefined,
          hopTuoiFocus: hopTuoiFocus || undefined,
          haLacFocus: haLacFocus || undefined,
          dungThanFocus: dungThanFocus || undefined,
          batTuFocus: batTuFocus || undefined,
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
            (res.status === 429
              ? 'Quý vị thao tác hơi nhanh. Vui lòng đợi giây lát rồi thử lại.'
              : 'Không luận giải được lúc này. Quý vị thử lại sau.'),
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

      if (!streamAccRef.current.trim()) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content:
                    'Xin lỗi, chưa nhận được nội dung luận giải. Quý vị thử hỏi lại.',
                }
              : m,
          ),
        );
      } else {
        const withFollowUps = ensureFollowUpBlock(
          streamAccRef.current,
          question,
        );
        streamAccRef.current = withFollowUps;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: withFollowUps } : m,
          ),
        );
      }
    } catch (e) {
      if ((e as Error).name === 'AbortError') {
        if (streamAccRef.current.trim()) {
          const withFollowUps = ensureFollowUpBlock(
            streamAccRef.current,
            question,
          );
          streamAccRef.current = withFollowUps;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: withFollowUps } : m,
            ),
          );
        }
        return;
      }
      const msg =
        e instanceof Error ? e.message : 'Không kết nối được để luận giải.';
      setError(msg);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: m.content || `Không luận giải được: ${msg}`,
              }
            : m,
        ),
      );
    } finally {
      setStreaming(false);
      setStreamingId(null);
      abortRef.current = null;
    }
  }

  function stopStream() {
    abortRef.current?.abort();
    setStreaming(false);
    setStreamingId(null);
  }

  if (!open) return null;

  const phoneHref = contactPhone
    ? `tel:${contactPhone.replace(/\s+/g, '')}`
    : null;

  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center bg-ink/40 p-0 sm:p-4">
      <div
        className="flex w-full sm:max-w-lg h-[min(92vh,720px)] sm:h-[min(85vh,720px)] flex-col border border-fog bg-white shadow-xl"
        role="dialog"
        aria-label={`Luận giải với ${abbottLabel}`}
      >
        <header className="flex items-center justify-between gap-2 border-b border-fog px-3 py-2.5 shrink-0">
          <div className="min-w-0">
            <p
              className="text-[0.65rem] uppercase tracking-[0.2em]"
              style={{ color: primaryColor }}
            >
              Luận giải tử vi
            </p>
            <p className="text-sm font-medium text-ink truncate">
              {abbottLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (streaming) stopStream();
              onClose();
            }}
            className="shrink-0 px-2 py-1 text-xs border border-fog text-muted hover:text-ink"
            aria-label="Đóng"
          >
            Đóng
          </button>
        </header>

        <div
          ref={containerRef}
          onScroll={onScroll}
          onWheel={onWheel}
          className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-paper/60"
        >
          {messages.length === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted leading-relaxed">
                {batTuFocus
                  ? `Hỏi về lá số Bát tự — ${abbottLabel} luận tứ trụ, thập thần, thần sát và vận trình đại vận – lưu niên (không luận sao cung Tử Vi).`
                  : napAmFocus
                  ? `Hỏi về nạp âm / ngũ hành — ${abbottLabel} tập trung mệnh nạp âm và ngũ hành tứ trụ (không luận sao cung hay vận hạn).`
                  : daiVanFocus
                  ? `Hỏi về đại vận / tiểu vận — ${abbottLabel} tập trung đại hạn và tiểu hạn đang đi (không lập lại cả lá số).`
                  : vanHanFocus
                    ? `Hỏi về hạn năm / lưu niên — ${abbottLabel} tập trung vận hạn năm xem (không lập lại cả lá số).`
                    : noVanHan
                      ? `Hỏi về cung, sao, cách cục hoặc phi tinh trên lá số — ${abbottLabel} luận theo hướng đã chọn (không luận vận hạn trong phần này).`
                      : `Hỏi bất kỳ điều gì về lá số — ${abbottLabel} sẽ xem toàn bộ cung, sao, đối/tam hợp và vận hạn hiện tại rồi luận giải tận tình theo phương pháp ${persona.upsell === 'sim' ? 'của thầy' : 'của chùa'}.`}
                {limit != null ? (
                  <span className="block mt-1 text-[0.75rem]">
                    {persona.upsell === 'sim'
                      ? `Miễn phí ${limit} câu hỏi; muốn luận sâu hơn hãy gọi thầy hoặc chọn sim hợp mệnh trong kho.`
                      : `Miễn phí ${limit} câu hỏi; từ câu ${limit + 1} cần thỉnh nước ủng hộ chùa.`}
                  </span>
                ) : null}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {starterSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={streaming || lockedForChat}
                    onClick={() => void sendQuestion(s)}
                    className="text-left text-xs border border-fog bg-white px-2 py-1.5 text-ink hover:border-ink/30 disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {messages.map((m) => {
            const isThisStreaming = streaming && streamingId === m.id;
            const rawBody =
              m.role === 'assistant'
                ? isThisStreaming
                  ? m.content.replace(/\s*<<<goi-y>>>[\s\S]*$/i, '').trim()
                  : splitTuViReply(m.content).body
                : m.content;
            const suggestions =
              m.role === 'assistant' && !isThisStreaming
                ? splitTuViReply(m.content).suggestions
                : [];

            return (
              <div key={m.id} className="space-y-2">
                <div
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[92%] px-3 py-2 text-sm ${
                      m.role === 'user'
                        ? 'text-white'
                        : 'bg-white border border-fog text-ink'
                    }`}
                    style={
                      m.role === 'user'
                        ? { backgroundColor: primaryColor }
                        : undefined
                    }
                  >
                    {m.role === 'assistant' ? (
                      <>
                        {rawBody ? (
                          renderSimpleMarkdown(rawBody)
                        ) : isThisStreaming ? (
                          <span className="text-muted italic">
                            {abbottLabel} đang xem lá số…
                          </span>
                        ) : null}
                        {isThisStreaming ? (
                          <span
                            className="inline-block w-[0.45em] h-[1em] ml-0.5 align-[-0.1em] animate-pulse"
                            style={{ backgroundColor: primaryColor }}
                            aria-hidden
                          />
                        ) : null}
                      </>
                    ) : (
                      m.content
                    )}
                  </div>
                </div>

                {suggestions.length > 0 ? (
                  <div className="pl-0.5 space-y-1.5">
                    <p className="text-[0.65rem] text-muted">
                      Quý vị có thể hỏi tiếp:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          disabled={streaming || lockedForChat}
                          onClick={() => void sendQuestion(s)}
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

          {lockedForChat && !streaming ? (
            <div className="border border-fog bg-white p-3 space-y-2">
              <p className="text-xs font-medium text-ink">
                Đã hết lượt luận giải miễn phí
              </p>
              <p className="text-[0.7rem] text-muted leading-relaxed">
                {persona.upsell === 'sim'
                  ? `Gọi ${persona.displayName} để được luận tiếp, hoặc vào kho sim chọn số hợp mệnh.`
                  : 'Thỉnh nước ủng hộ chùa để hỏi tiếp, luận 12 cung chuyên sâu, hoặc liên hệ trụ trì trực tiếp.'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {persona.upsell === 'sim' ? (
                  <a
                    href="/sim"
                    className="text-xs px-2.5 py-1.5 text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Xem kho sim hợp mệnh
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      openWaterDonateForm({
                        note: 'Hỏi tiếp luận giải tử vi',
                        qty: 10,
                      })
                    }
                    className="text-xs px-2.5 py-1.5 text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Thỉnh nước
                  </button>
                )}
                {phoneHref ? (
                  <a
                    href={phoneHref}
                    className="text-xs px-2.5 py-1.5 border border-fog text-ink"
                  >
                    {persona.callLabel}
                    {contactPhone ? ` · ${contactPhone}` : ''}
                  </a>
                ) : null}
              </div>
              {persona.upsell === 'sim' ? null : (
                <div className="flex flex-wrap gap-1.5 items-end pt-1">
                  <label className="flex-1 min-w-[8rem] text-[0.65rem] text-muted">
                    Mã đơn đã thanh toán
                    <input
                      value={orderCode}
                      onChange={(e) =>
                        setOrderCode(e.target.value.toUpperCase())
                      }
                      placeholder="VD: BH…"
                      className="mt-0.5 w-full border border-fog px-2 py-1.5 text-sm text-ink bg-white"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={unlocking}
                    onClick={() => void unlockWithCode()}
                    className="text-xs px-2.5 py-1.5 border border-fog text-ink disabled:opacity-50"
                  >
                    {unlocking ? 'Đang kiểm…' : 'Mở khóa'}
                  </button>
                </div>
              )}
            </div>
          ) : null}

          {limit == null && assistantCount >= 2 && !streaming ? (
            persona.upsell === 'sim' ? (
              <div className="border border-fog bg-white p-3 space-y-2">
                <p className="text-xs font-medium text-ink">
                  Muốn được {persona.displayName} luận chuyên sâu hơn?
                </p>
                <p className="text-[0.7rem] text-muted leading-relaxed">
                  Gọi thầy tư vấn trực tiếp, hoặc vào kho sim chọn dãy số hợp
                  mệnh đã chấm điểm sẵn.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <a
                    href="/sim"
                    className="text-xs px-2.5 py-1.5 text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Xem kho sim hợp mệnh
                  </a>
                  {phoneHref ? (
                    <a
                      href={phoneHref}
                      className="text-xs px-2.5 py-1.5 border border-fog text-ink"
                    >
                      {persona.callLabel}
                      {contactPhone ? ` · ${contactPhone}` : ''}
                    </a>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="border border-fog bg-white p-3 space-y-2">
                <p className="text-xs font-medium text-ink">
                  Muốn xem trọn bộ luận giải 12 cung chi tiết?
                </p>
                <p className="text-[0.7rem] text-muted leading-relaxed">
                  Thỉnh nước ủng hộ chùa để mở khóa — luận chuyên sâu từng
                  cung, kèm xuất file HTML đầy đủ.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      openWaterDonateForm({
                        note: 'Mở khóa luận giải 12 cung',
                        qty: 10,
                      })
                    }
                    className="text-xs px-2.5 py-1.5 text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Thỉnh nước mở khóa
                  </button>
                  {onOpenDetail12 ? (
                    <button
                      type="button"
                      onClick={onOpenDetail12}
                      className="text-xs px-2.5 py-1.5 border border-fog text-ink"
                    >
                      Xem mục 12 cung
                    </button>
                  ) : null}
                </div>
              </div>
            )
          ) : null}

          <div ref={bottomRef} />
        </div>

        {error ? (
          <p className="px-3 py-1.5 text-[0.7rem] text-red-700 bg-red-50 border-t border-red-100">
            {error}
          </p>
        ) : null}

        {lockedForChat ? null : (
          <form
            className="shrink-0 border-t border-fog p-2.5 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void sendQuestion(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={streaming}
              placeholder={`Hỏi ${abbottLabel}…`}
              className="min-w-0 flex-1 border border-fog px-2.5 py-2 text-sm bg-white text-ink"
            />
            {streaming ? (
              <button
                type="button"
                onClick={stopStream}
                className="shrink-0 px-3 py-2 text-xs border border-fog text-ink"
              >
                Dừng
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="shrink-0 px-3 py-2 text-xs text-white disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                Gửi
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
