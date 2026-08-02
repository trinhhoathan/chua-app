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
import { useSitePersona } from '@/components/SitePersonaContext';

export type EssayFocusFlag =
  | 'hopTuoiFocus'
  | 'haLacFocus'
  | 'dungThanFocus'
  | 'vanHanFocus'
  | 'daiVanFocus'
  | 'napAmFocus'
  | 'batTuFocus';

interface Props {
  /** Ngữ cảnh gửi AI (khối dữ liệu đã tính sẵn). */
  chartContext: string;
  templeName: string;
  primaryColor: string;
  contactPhone?: string | null;
  /** Tiêu đề khối (VD: «Luận hạn năm (mẫu)»). */
  title: string;
  /** Phụ đề dưới tiêu đề. */
  subtitle: string;
  /** Tiêu đề hộp CTA. */
  ctaTitle: string;
  /** Câu hỏi mẫu gửi AI khi bấm nút luận — không đổi theo trang. */
  question: string;
  /** Cờ hướng luận gửi API — không đổi theo trang. */
  focusFlag: EssayFocusFlag;
  /** Chủ đề chọn câu hỏi mồi khi model trả thiếu. */
  topic: FollowUpTopic;
  buttonLabel: string;
  loadingLabel: string;
  /** Tiền tố ghi chú đơn thỉnh nước. */
  notePrefix: string;
  /** Mở khung chat hỏi trụ trì. */
  onAskMore: () => void;
}

/**
 * Template luận mẫu dùng chung (cùng bố cục «Luận cung Mệnh (mẫu)»):
 * — Luận giải mẫu (mệnh lệnh AI riêng từng trang)
 * — Hộp CTA: Thỉnh nước (ưu tiên) · Gọi trụ trì · Hỏi trụ trì thêm
 *
 * Chỉ đổi UI — API `/api/tuvi/luan-giai`, question, focusFlag giữ nguyên.
 */
export function TuViEssaySection({
  chartContext,
  templeName,
  primaryColor,
  contactPhone,
  title,
  subtitle,
  ctaTitle,
  question,
  focusFlag,
  topic,
  buttonLabel,
  loadingLabel,
  notePrefix,
  onAskMore,
}: Props) {
  const persona = useSitePersona();
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
    essayAbort.current?.abort();
    setEssay('');
    setEssayError(null);
    setTeasers([]);
    setEssayLoading(false);
  }, [chartContext, question, focusFlag]);

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

  const phoneHref = contactPhone
    ? `tel:${contactPhone.replace(/\s+/g, '')}`
    : null;

  // Site Lý Gia: các trang gọi truyền "Trụ trì … đang luận…" — thay danh xưng
  const displayLoadingLabel =
    persona.upsell === 'sim'
      ? loadingLabel.replace(/^Trụ trì.*?đang/u, `${persona.displayName} đang`)
      : loadingLabel;

  return (
    <div className="border border-fog bg-paper p-4 md:p-5 space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p
            className="text-[0.7rem] uppercase tracking-[0.25em]"
            style={{ color: primaryColor }}
          >
            {title}
          </p>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>
        <button
          type="button"
          disabled={!chartContext || essayLoading || cooldownSec > 0}
          onClick={() => void runEssay()}
          className="px-3 py-2 text-sm text-white disabled:opacity-50"
          style={{ background: primaryColor }}
        >
          {essayLoading
            ? 'Đang luận…'
            : cooldownSec > 0
              ? `Chờ ${cooldownSec}s`
              : buttonLabel}
        </button>
      </div>

      {essayError ? <p className="text-sm text-lacquer">{essayError}</p> : null}

      {essay || essayLoading ? (
        <div className="border border-fog bg-white p-3 md:p-4">
          {essayLoading && !essay ? (
            <p className="text-sm text-muted">{displayLoadingLabel}</p>
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
                  contactPhone={contactPhone}
                />
              ) : null}
            </>
          )}
        </div>
      ) : null}

      {persona.upsell === 'sim' ? (
        <div className="border border-fog bg-white p-3 space-y-2 text-sm">
          <p className="font-medium text-ink">{ctaTitle}</p>
          <ul className="text-[0.8rem] text-muted space-y-1 list-disc pl-4">
            <li>
              Chọn số trong Kho Sim Phong Thủy — từng sim đã được chấm điểm
              hợp mệnh sẵn
            </li>
            <li>
              Gọi {persona.displayName} tư vấn trực tiếp
              {contactPhone ? (
                <>
                  {' '}
                  qua{' '}
                  <a
                    href={phoneHref!}
                    className="underline underline-offset-2"
                    style={{ color: primaryColor }}
                  >
                    {contactPhone}
                  </a>
                </>
              ) : null}
            </li>
          </ul>
          <div className="flex flex-wrap gap-2 pt-1">
            <a
              href="/sim"
              className="px-3 py-2 text-sm text-white"
              style={{ background: primaryColor }}
            >
              Xem kho sim hợp mệnh
            </a>
            {phoneHref ? (
              <a
                href={phoneHref}
                className="px-3 py-2 text-sm border border-fog text-ink"
              >
                {persona.callLabel}
              </a>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="border border-fog bg-white p-3 space-y-2 text-sm">
          <p className="font-medium text-ink">{ctaTitle}</p>
          <ul className="text-[0.8rem] text-muted space-y-1 list-disc pl-4">
            <li>Thỉnh nước ủng hộ chùa để mở khóa luận đầy đủ</li>
            <li>
              Liên hệ hỏi trụ trì trực tiếp
              {contactPhone ? (
                <>
                  {' '}
                  qua{' '}
                  <a
                    href={phoneHref!}
                    className="underline underline-offset-2"
                    style={{ color: primaryColor }}
                  >
                    {contactPhone}
                  </a>
                </>
              ) : (
                ' qua số điện thoại nhà chùa'
              )}
            </li>
            <li>
              Hỏi trụ trì thêm trong chat — miễn phí 3 câu; từ câu thứ 4 cần
              thỉnh nước để hỏi tiếp
            </li>
          </ul>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() =>
                openWaterDonateForm({
                  note: notePrefix.slice(0, 180),
                  qty: 10,
                })
              }
              className="px-3 py-2 text-sm text-white"
              style={{ background: primaryColor }}
            >
              Thỉnh nước
            </button>
            {phoneHref ? (
              <a
                href={phoneHref}
                className="px-3 py-2 text-sm border border-fog text-ink"
              >
                Gọi trụ trì
              </a>
            ) : null}
            <button
              type="button"
              onClick={onAskMore}
              className="px-3 py-2 text-sm border border-fog text-ink"
            >
              Hỏi trụ trì thêm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
