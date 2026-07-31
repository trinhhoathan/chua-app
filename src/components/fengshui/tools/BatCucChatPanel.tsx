'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { splitTuViReply } from '@/lib/fengshui/tuvi-prompt';
import { ensureBatCucFollowUpBlock } from '@/lib/fengshui/bat-cuc-prompt';
import {
  BAT_CUC_TOPICS,
  type BatCucTopicId,
} from '@/lib/fengshui/bat-cuc-contexts';
import {
  getSavedUnlockOrderCode,
  savePaidOrderCode,
} from '@/lib/fengshui/tuvi-html';
import { openWaterDonateForm } from '@/lib/water-merit-prompt';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

interface Props {
  open: boolean;
  onClose: () => void;
  primaryColor: string;
  templeName: string;
  templeId?: string;
  contactPhone?: string | null;
  topic: BatCucTopicId;
  /** Khối dữ liệu Bát Cực đã tính sẵn (đã mask nếu chủ đề bảo mật). */
  analysisContext: string;
  /** Số câu hỏi miễn phí; hết thì thỉnh nước / nhập mã đơn để mở khóa. */
  freeQuestionLimit?: number;
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

async function verifyOrderPaid(code: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/orders/${encodeURIComponent(code)}/status`, {
      cache: 'no-store',
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { paid?: boolean };
    return Boolean(data.paid);
  } catch {
    return false;
  }
}

/** Khung chat hỏi trụ trì về dãy số — dùng chung cho 14 trang Bát Cực Linh Số. */
export function BatCucChatPanel({
  open,
  onClose,
  primaryColor,
  templeName,
  templeId = '',
  contactPhone,
  topic,
  analysisContext,
  freeQuestionLimit,
}: Props) {
  const cfg = BAT_CUC_TOPICS[topic];
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [orderCode, setOrderCode] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const streamAccRef = useRef('');

  const abbottLabel = `trụ trì ${templeName.trim() || 'chùa'}`;
  const limit =
    typeof freeQuestionLimit === 'number' && freeQuestionLimit > 0
      ? freeQuestionLimit
      : null;

  const userQuestionCount = useMemo(
    () => messages.filter((m) => m.role === 'user').length,
    [messages],
  );

  const lockedForChat =
    limit != null && !unlocked && userQuestionCount >= limit;

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
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function unlockWithCode() {
    const code = orderCode.trim().toUpperCase();
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
      if (templeId) savePaidOrderCode(code, templeId);
    } finally {
      setUnlocking(false);
    }
  }

  async function sendQuestion(raw: string) {
    const question = raw.trim();
    if (!question || streaming) return;

    if (limit != null && !unlocked && userQuestionCount >= limit) {
      setError(
        `Đã dùng hết ${limit} câu hỏi miễn phí. Thỉnh nước ủng hộ chùa để hỏi tiếp.`,
      );
      return;
    }

    setError(null);
    setInput('');
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
      const res = await fetch('/api/bat-cuc/luan-giai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          question,
          analysisContext,
          history,
          templeName,
          topic,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
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
        const withFollowUps = ensureBatCucFollowUpBlock(
          streamAccRef.current,
          topic,
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
          const withFollowUps = ensureBatCucFollowUpBlock(
            streamAccRef.current,
            topic,
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
              Bát Cực Linh Số · {cfg.title}
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

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-paper/60">
          {messages.length === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted leading-relaxed">
                {cfg.chatIntro}
                {limit != null ? (
                  <span className="block mt-1 text-[0.75rem]">
                    Miễn phí {limit} câu hỏi; từ câu {limit + 1} cần thỉnh nước
                    ủng hộ chùa.
                  </span>
                ) : null}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {cfg.chatSuggestions.map((s) => (
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
                            {abbottLabel} đang xem bảng sao…
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
                Đã hết {limit} câu hỏi miễn phí
              </p>
              <p className="text-[0.7rem] text-muted leading-relaxed">
                Thỉnh nước ủng hộ chùa để hỏi tiếp, hoặc liên hệ trụ trì trực
                tiếp.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    openWaterDonateForm({
                      note: cfg.donateNote.slice(0, 180),
                      qty: 10,
                    })
                  }
                  className="text-xs px-2.5 py-1.5 text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  Thỉnh nước
                </button>
                {phoneHref ? (
                  <a
                    href={phoneHref}
                    className="text-xs px-2.5 py-1.5 border border-fog text-ink"
                  >
                    Gọi trụ trì
                    {contactPhone ? ` · ${contactPhone}` : ''}
                  </a>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-1.5 items-end pt-1">
                <label className="flex-1 min-w-[8rem] text-[0.65rem] text-muted">
                  Mã đơn đã thanh toán
                  <input
                    value={orderCode}
                    onChange={(e) => setOrderCode(e.target.value.toUpperCase())}
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
            </div>
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
