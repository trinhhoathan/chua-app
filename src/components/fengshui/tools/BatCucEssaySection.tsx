'use client';

import { useEffect, useRef, useState } from 'react';
import { splitTuViReply } from '@/lib/fengshui/tuvi-prompt';
import { resolveBatCucFollowUps } from '@/lib/fengshui/bat-cuc-prompt';
import {
  BAT_CUC_TOPICS,
  type BatCucTopicId,
} from '@/lib/fengshui/bat-cuc-contexts';
import { TuViMarkdown } from '@/components/fengshui/tools/TuViMarkdown';
import { TuViTeaserFollowUps } from '@/components/fengshui/tools/TuViTeaserFollowUps';
import { openWaterDonateForm } from '@/lib/water-merit-prompt';
import { useSitePersona } from '@/components/SitePersonaContext';
import { WaterPromoBanner } from '@/components/water/WaterPromoBanner';

interface Props {
  /** Khối dữ liệu Âm Dương Ngũ Hành đã tính sẵn (đã mask nếu chủ đề bảo mật). */
  analysisContext: string;
  topic: BatCucTopicId;
  templeName: string;
  primaryColor: string;
  contactPhone?: string | null;
  /** Mở khung chat hỏi trụ trì. */
  onAskMore: () => void;
}

/**
 * Template dùng chung cho 14 trang nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận
 * (cùng bố cục với «Luận cung Mệnh (mẫu)» trên trang tử vi):
 * — Luận giải mẫu (mệnh lệnh AI riêng từng chủ đề)
 * — Hộp CTA: Thỉnh nước (ưu tiên) · Gọi trụ trì · Hỏi trụ trì thêm
 * Luật chat: miễn phí 3 câu; từ câu 4 cần thỉnh nước.
 */
export function BatCucEssaySection({
  analysisContext,
  topic,
  templeName,
  primaryColor,
  contactPhone,
  onAskMore,
}: Props) {
  const persona = useSitePersona();
  const cfg = BAT_CUC_TOPICS[topic];
  const essaySubtitle = `Xem thử miễn phí ${cfg.dataLabel} theo nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận.`;
  const ctaTitle = `Muốn luận ${cfg.dataLabel} chuyên sâu hơn?`;

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

  // Đổi dãy số / chủ đề → reset bài luận mẫu
  useEffect(() => {
    essayAbort.current?.abort();
    setEssay('');
    setEssayError(null);
    setTeasers([]);
    setEssayLoading(false);
  }, [analysisContext, topic]);

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
    if (!analysisContext || essayLoading || cooldownSec > 0) return;
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
      const res = await fetch('/api/bat-cuc/luan-giai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          question: cfg.essayQuestion,
          analysisContext,
          history: [],
          templeName,
          topic,
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
      const resolved = resolveBatCucFollowUps(acc, topic, 5);
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

  return (
    <div className="border border-fog bg-paper p-4 md:p-5 space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p
            className="text-[0.7rem] uppercase tracking-[0.25em]"
            style={{ color: primaryColor }}
          >
            Luận giải mẫu
          </p>
          <p className="mt-1 text-sm text-muted">{essaySubtitle}</p>
        </div>
        <button
          type="button"
          disabled={!analysisContext || essayLoading || cooldownSec > 0}
          onClick={() => void runEssay()}
          className="px-3 py-2 text-sm text-white disabled:opacity-50"
          style={{ background: primaryColor }}
        >
          {essayLoading
            ? 'Đang luận…'
            : cooldownSec > 0
              ? `Chờ ${cooldownSec}s`
              : 'Luận giải mẫu'}
        </button>
      </div>

      {essayError ? <p className="text-sm text-lacquer">{essayError}</p> : null}

      {essay || essayLoading ? (
        <div className="border border-fog bg-white p-3 md:p-4">
          {essayLoading && !essay ? (
            <p className="text-sm text-muted">
              {persona.thinkingLabel} bảng sao của {cfg.dataLabel}…
            </p>
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
                  notePrefix={cfg.donateNote}
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
              sẵn theo đúng thuật toán Âm Dương Ngũ Hành này
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
        <div className="space-y-3">
          <WaterPromoBanner
            primaryColor={primaryColor}
            templeName={templeName}
            className="mt-0"
          />
        <div
          className="border bg-white p-3 space-y-2 text-sm"
          style={{ borderColor: `${primaryColor}55` }}
        >
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
                  note: cfg.donateNote.slice(0, 180),
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
        </div>
      )}
    </div>
  );
}
