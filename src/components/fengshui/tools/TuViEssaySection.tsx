'use client';

import { useEffect, useRef, useState } from 'react';
import {
  resolveEssayFollowUps,
  splitTuViReply,
  type FollowUpTopic,
} from '@/lib/fengshui/tuvi-prompt';
import { TuViMarkdown } from '@/components/fengshui/tools/TuViMarkdown';
import { TuViTeaserFollowUps } from '@/components/fengshui/tools/TuViTeaserFollowUps';
import { openWaterDonateForm } from '@/lib/water-merit-prompt';

export type EssayFocusFlag = 'hopTuoiFocus' | 'haLacFocus' | 'dungThanFocus';

interface Props {
  /** Ngữ cảnh gửi AI (khối dữ liệu đã tính sẵn). */
  chartContext: string;
  templeName: string;
  primaryColor: string;
  /** Câu hỏi mẫu gửi AI khi bấm nút luận. */
  question: string;
  /** Cờ hướng luận gửi API. */
  focusFlag: EssayFocusFlag;
  /** Chủ đề chọn câu hỏi mồi khi model trả thiếu. */
  topic: FollowUpTopic;
  buttonLabel: string;
  loadingLabel: string;
  /** Tiền tố ghi chú đơn thỉnh nước. */
  notePrefix: string;
  onAskMore?: () => void;
}

/** Khối "luận mẫu" dùng chung: stream bài luận + 5 câu hỏi mồi → thỉnh nước. */
export function TuViEssaySection({
  chartContext,
  templeName,
  primaryColor,
  question,
  focusFlag,
  topic,
  buttonLabel,
  loadingLabel,
  notePrefix,
  onAskMore,
}: Props) {
  const [essay, setEssay] = useState('');
  const [essayLoading, setEssayLoading] = useState(false);
  const [essayError, setEssayError] = useState<string | null>(null);
  const [teasers, setTeasers] = useState<string[]>([]);
  const [cooldownSec, setCooldownSec] = useState(0);
  const essayAbort = useRef<AbortController | null>(null);
  const rafRef = useRef(0);
  const pendingRef = useRef('');

  useEffect(() => {
    return () => {
      essayAbort.current?.abort();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (cooldownSec <= 0) return;
    const t = window.setTimeout(() => setCooldownSec((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldownSec]);

  function paintEssay(raw: string) {
    pendingRef.current = raw;
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      setEssay(splitTuViReply(pendingRef.current).body);
    });
  }

  async function runEssay() {
    if (!chartContext || essayLoading || cooldownSec > 0) return;
    essayAbort.current?.abort();
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    const controller = new AbortController();
    essayAbort.current = controller;
    setEssayLoading(true);
    setEssayError(null);
    setEssay('');
    setTeasers([]);
    pendingRef.current = '';

    try {
      const res = await fetch('/api/tuvi/luan-giai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          question,
          chartContext,
          history: [],
          templeName,
          [focusFlag]: true,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
          retryAfterSec?: number;
        } | null;
        if (res.status === 429) {
          setCooldownSec(Math.max(3, data?.retryAfterSec ?? 12));
        }
        throw new Error(data?.error || 'Không luận giải được lúc này.');
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error('Không nhận được phản hồi luận giải.');
      const decoder = new TextDecoder();
      let acc = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        paintEssay(acc);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      const resolved = resolveEssayFollowUps(acc, question, topic, 5);
      setEssay(resolved.body || acc);
      setTeasers(resolved.suggestions);
      if (!acc.trim()) throw new Error('Phản hồi luận giải trống.');
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      setEssayError(
        e instanceof Error ? e.message : 'Không kết nối được để luận giải.',
      );
    } finally {
      setEssayLoading(false);
      essayAbort.current = null;
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={essayLoading || cooldownSec > 0}
          onClick={() => void runEssay()}
          className="px-4 py-2.5 text-sm text-white disabled:opacity-50"
          style={{ background: primaryColor }}
        >
          {essayLoading
            ? 'Đang luận…'
            : cooldownSec > 0
              ? `Chờ ${cooldownSec}s`
              : buttonLabel}
        </button>
        {onAskMore ? (
          <button
            type="button"
            onClick={onAskMore}
            className="px-4 py-2.5 text-sm border border-fog text-ink"
          >
            Hỏi trụ trì thêm
          </button>
        ) : null}
        <button
          type="button"
          onClick={() =>
            openWaterDonateForm({ note: notePrefix.slice(0, 180), qty: 10 })
          }
          className="px-4 py-2.5 text-sm border border-fog text-ink"
        >
          Thỉnh nước hỏi sâu
        </button>
      </div>

      {essayError ? <p className="text-sm text-lacquer">{essayError}</p> : null}
      {essay || essayLoading ? (
        <div className="border border-fog bg-white p-4 md:p-5">
          {essayLoading && !essay ? (
            <p className="text-sm text-muted">{loadingLabel}</p>
          ) : (
            <>
              <TuViMarkdown
                text={essay}
                primaryColor={primaryColor}
                className="text-ink"
              />
              {essayLoading ? (
                <span
                  className="inline-block w-[0.45em] h-[1em] ml-0.5 align-[-0.1em] animate-pulse"
                  style={{ backgroundColor: primaryColor }}
                  aria-hidden
                />
              ) : null}
              {!essayLoading && teasers.length > 0 ? (
                <TuViTeaserFollowUps
                  suggestions={teasers}
                  primaryColor={primaryColor}
                  notePrefix={notePrefix}
                />
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
