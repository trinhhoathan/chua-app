'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  buildTuViPromptContext,
  ensureFollowUpBlock,
  splitTuViReply,
} from '@/lib/fengshui/tuvi-prompt';
import type {
  IztroChartView,
  IztroHoroscopeView,
} from '@/lib/fengshui/iztro-chart';
import { openWaterDonateForm } from '@/lib/water-merit-prompt';

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
  chart: IztroChartView;
  horoscope: IztroHoroscopeView | null;
  onEssaysChange?: (essays: { question: string; answer: string }[]) => void;
  onOpenDetail12?: () => void;
}

const SUGGESTIONS = [
  'Luận tổng quan lá số này',
  'Cách cục của lá số này là gì?',
  'Vận hạn tại thời gian xem thế nào?',
  'Luận cung Mệnh và cung Thân',
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

export function TuViChatPanel({
  open,
  onClose,
  primaryColor,
  templeName,
  chart,
  horoscope,
  onEssaysChange,
  onOpenDetail12,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const streamAccRef = useRef('');

  const abbottLabel = `trụ trì ${templeName.trim() || 'chùa'}`;

  const chartContext = useMemo(
    () => buildTuViPromptContext(chart, horoscope),
    [chart, horoscope],
  );

  const assistantCount = useMemo(
    () =>
      messages.filter(
        (m) => m.role === 'assistant' && m.content.trim().length > 0,
      ).length,
    [messages],
  );

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
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  if (!open) return null;

  async function sendQuestion(raw: string) {
    const question = raw.trim();
    if (!question || streaming) return;

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
      const res = await fetch('/api/tuvi/luan-giai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          question,
          chartContext,
          history,
          templeName,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(
          data?.error || 'Không luận giải được lúc này. Quý vị thử lại sau.',
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

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-paper/60">
          {messages.length === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted leading-relaxed">
                Hỏi bất kỳ điều gì về lá số — {abbottLabel} sẽ xem toàn bộ cung,
                sao, đối/tam hợp và vận hạn hiện tại rồi luận giải tận tình theo
                phương pháp của chùa.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={streaming}
                    onClick={() => sendQuestion(s)}
                    className="text-left text-xs border border-fog bg-white px-2 py-1.5 text-ink hover:border-ink/30"
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
                          disabled={streaming}
                          onClick={() => sendQuestion(s)}
                          className="text-left text-xs border border-fog bg-white px-2 py-1.5 text-ink hover:border-ink/30"
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

          {assistantCount >= 2 && !streaming ? (
            <div className="border border-fog bg-white p-3 space-y-2">
              <p className="text-xs font-medium text-ink">
                Muốn xem trọn bộ luận giải 12 cung chi tiết?
              </p>
              <p className="text-[0.7rem] text-muted leading-relaxed">
                Thỉnh nước ủng hộ chùa để mở khóa — luận chuyên sâu từng cung,
                kèm xuất file HTML đầy đủ.
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
          ) : null}

          <div ref={bottomRef} />
        </div>

        {error ? (
          <p className="px-3 py-1.5 text-[0.7rem] text-red-700 bg-red-50 border-t border-red-100">
            {error}
          </p>
        ) : null}

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
      </div>
    </div>
  );
}
