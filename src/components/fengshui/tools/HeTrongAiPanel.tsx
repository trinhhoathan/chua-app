'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { HeTrongPayload } from '@/lib/fengshui/he-trong-prompt';
import type { NhanTuongPayload } from '@/lib/fengshui/nhan-tuong-prompt';
import type { ChiTuongPayload } from '@/lib/fengshui/chi-tuong-prompt';
import { useSitePersona } from '@/components/SitePersonaContext';
import { openWaterDonateForm } from '@/lib/water-merit-prompt';
import { LY_GIA } from '@/lib/ly-gia-phuc-an';
import { TuViMarkdown } from './TuViMarkdown';

/**
 * Panel luận giải AI dùng chung cho nhóm tool "Hệ trọng".
 *
 * - Client CHỈ gửi input thô — server tự tính lại bằng engine lõi.
 * - Ví lượt server-side: hết lượt → 402 → hiện upsell theo persona
 *   (chùa: thỉnh nước + gọi trụ trì; Lý Gia: gọi thầy + Zalo)
 *   kèm ô nhập mã đơn đã thanh toán để cộng lượt.
 */

type Phase = 'idle' | 'streaming' | 'done' | 'error';

export function HeTrongAiPanel({
  primaryColor,
  payload,
  resetKey,
  contactPhone,
  className = '',
  endpoint = '/api/he-trong/luan-giai',
  introNote,
}: {
  primaryColor: string;
  /** Input thô đúng schema server (topic + ngày + năm sinh…) */
  payload: HeTrongPayload | NhanTuongPayload | ChiTuongPayload;
  /** Đổi khi input đổi → xóa bài luận cũ */
  resetKey?: string;
  contactPhone?: string | null;
  className?: string;
  /** API route nhận payload — mặc định nhóm Hệ trọng. */
  endpoint?: string;
  /** Câu giới thiệu thay câu mặc định "lịch pháp và luật cổ truyền". */
  introNote?: string;
}) {
  const persona = useSitePersona();
  const isSim = persona.upsell === 'sim';

  const [phase, setPhase] = useState<Phase>('idle');
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [gate, setGate] = useState<'quota' | 'ip' | null>(null);

  const [orderCode, setOrderCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [redeemMsg, setRedeemMsg] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Input đổi → bỏ bài luận cũ
    abortRef.current?.abort();
    setPhase('idle');
    setText('');
    setError(null);
    setGate(null);
  }, [resetKey]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const run = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setPhase('streaming');
    setText('');
    setError(null);
    setGate(null);
    setRedeemMsg(null);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const remainHeader = res.headers.get('X-Ai-Remaining');
      if (remainHeader !== null) setRemaining(Number(remainHeader));

      if (res.status === 402) {
        const data = (await res.json().catch(() => null)) as {
          code?: string;
          error?: string;
        } | null;
        setRemaining(0);
        setGate(data?.code === 'ip_ceiling' ? 'ip' : 'quota');
        setPhase('idle');
        return;
      }
      if (res.status === 429) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(
          data?.error ?? 'Quý vị thao tác hơi nhanh, đợi chút rồi thử lại.',
        );
        setPhase('error');
        return;
      }
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error ?? 'Không luận giải được lúc này. Quý vị thử lại sau.');
        setPhase('error');
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setText(acc);
      }
      setText(acc);
      setPhase('done');
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return;
      setError('Kết nối gián đoạn. Quý vị thử lại giúp.');
      setPhase('error');
    }
  }, [payload, endpoint]);

  const redeem = useCallback(async () => {
    const code = orderCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!code || redeeming) return;
    setRedeeming(true);
    setRedeemMsg(null);
    try {
      const res = await fetch('/api/ai/quota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderCode: code }),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        remaining?: number;
      } | null;
      if (data?.ok) {
        setRemaining(data.remaining ?? null);
        setGate(null);
        setRedeemMsg(
          `Đã cộng lượt luận giải. Quý vị còn ${data.remaining ?? '—'} lượt.`,
        );
        setOrderCode('');
      } else {
        setRedeemMsg(data?.error ?? 'Không cộng được lượt. Quý vị thử lại.');
      }
    } catch {
      setRedeemMsg('Hệ thống đang bận. Quý vị thử lại sau giây lát.');
    } finally {
      setRedeeming(false);
    }
  }, [orderCode, redeeming]);

  const phone = contactPhone || (isSim ? LY_GIA.phone : null);

  return (
    <section
      className={`border border-fog bg-paper p-4 md:p-5 ${className}`}
      style={{ borderTopWidth: 3, borderTopColor: primaryColor }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p
          className="text-[0.68rem] font-semibold uppercase tracking-[0.25em]"
          style={{ color: primaryColor }}
        >
          Luận giải của {isSim ? persona.displayName : persona.roleTitle}
        </p>
        {remaining !== null && remaining >= 0 ? (
          <p className="text-[0.7rem] text-muted">
            Còn {remaining} lượt luận giải
          </p>
        ) : null}
      </div>

      {phase === 'idle' && !text && !gate ? (
        <div className="mt-3">
          <p className="text-xs leading-relaxed text-muted">
            {introNote ??
              'Kết quả bên trên do lịch pháp và luật cổ truyền tính sẵn.'}{' '}
            {isSim ? persona.displayName : persona.roleTitle} sẽ diễn giải cặn
            kẽ từng tiêu chí và dặn cách bồi đắp, hóa giải.
          </p>
          <button
            type="button"
            onClick={run}
            className="mt-3 px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            Nghe {isSim ? 'thầy' : persona.role} luận giải
          </button>
        </div>
      ) : null}

      {phase === 'streaming' && !text ? (
        <p className="mt-3 animate-pulse text-sm text-muted">
          {persona.thinkingLabel}…
        </p>
      ) : null}

      {text ? (
        <TuViMarkdown
          text={text}
          primaryColor={primaryColor}
          className="mt-3"
        />
      ) : null}
      {phase === 'streaming' && text ? (
        <p className="mt-1 animate-pulse text-xs text-muted">…</p>
      ) : null}

      {phase === 'error' && error ? (
        <div className="mt-3 border border-fog bg-mist px-3 py-2">
          <p className="text-xs text-ink">{error}</p>
          <button
            type="button"
            onClick={run}
            className="mt-2 text-xs font-semibold underline"
            style={{ color: primaryColor }}
          >
            Thử lại
          </button>
        </div>
      ) : null}

      {gate === 'ip' ? (
        <div className="mt-3 border border-fog bg-mist px-3 py-3">
          <p className="text-sm text-ink">
            Hệ thống nhận quá nhiều lượt luận giải từ mạng của quý vị hôm nay.
            Quý vị quay lại vào ngày mai, hoặc{' '}
            {isSim ? 'gọi thầy tư vấn trực tiếp' : `liên hệ ${persona.role}`}.
          </p>
          {phone ? (
            <a
              href={`tel:${phone}`}
              className="mt-2 inline-block px-4 py-2 text-xs font-semibold text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {persona.callLabel}
            </a>
          ) : null}
        </div>
      ) : null}

      {gate === 'quota' ? (
        <div className="mt-3 border border-fog bg-mist px-3 py-3">
          <p className="text-sm font-semibold text-ink">
            Quý vị đã dùng hết lượt luận giải miễn phí.
          </p>
          {isSim ? (
            <>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Muốn xem sâu hơn, quý vị gọi thầy tư vấn trực tiếp — việc hệ
                trọng nghe thầy dặn tận nơi vẫn chắc nhất. Nếu đã đặt sim của
                thầy, nhập mã đơn bên dưới để được cộng thêm lượt.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <a
                  href={`tel:${phone ?? LY_GIA.phone}`}
                  className="px-4 py-2 text-xs font-semibold text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {persona.callLabel}
                </a>
                <a
                  href={LY_GIA.zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border px-4 py-2 text-xs font-semibold"
                  style={{ borderColor: primaryColor, color: primaryColor }}
                >
                  Nhắn Zalo cho thầy
                </a>
              </div>
            </>
          ) : (
            <>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Quý vị có thể thỉnh nước ủng hộ chùa — sau khi thanh toán, nhập
                mã đơn bên dưới để được cộng thêm lượt luận giải. Việc hệ trọng
                cũng nên thỉnh ý {persona.role} trực tiếp.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openWaterDonateForm()}
                  className="px-4 py-2 text-xs font-semibold text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  Thỉnh nước ủng hộ chùa
                </button>
                {phone ? (
                  <a
                    href={`tel:${phone}`}
                    className="border px-4 py-2 text-xs font-semibold"
                    style={{ borderColor: primaryColor, color: primaryColor }}
                  >
                    {persona.callLabel}
                  </a>
                ) : null}
              </div>
            </>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
              placeholder={isSim ? 'Mã đơn sim (VD: LGPA-XXXXXX)' : 'Mã đơn nước (VD: CV-XXXXXX)'}
              className="w-52 border border-fog bg-paper px-3 py-2 text-xs uppercase text-ink outline-none focus:border-ink"
            />
            <button
              type="button"
              onClick={redeem}
              disabled={redeeming || !orderCode.trim()}
              className="border px-4 py-2 text-xs font-semibold disabled:opacity-50"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              {redeeming ? 'Đang kiểm tra…' : 'Cộng lượt bằng mã đơn'}
            </button>
          </div>
          {redeemMsg ? (
            <p className="mt-2 text-xs text-ink">{redeemMsg}</p>
          ) : null}
        </div>
      ) : null}

      {redeemMsg && gate === null && phase === 'idle' ? (
        <div className="mt-3">
          <p className="text-xs text-ink">{redeemMsg}</p>
          <button
            type="button"
            onClick={run}
            className="mt-2 px-4 py-2 text-xs font-semibold text-white"
            style={{ backgroundColor: primaryColor }}
          >
            Nghe {isSim ? 'thầy' : persona.role} luận giải
          </button>
        </div>
      ) : null}

      {phase === 'done' ? (
        <p className="mt-3 border-t border-fog pt-2 text-[0.7rem] leading-relaxed text-muted">
          Bài luận dựa trên cổ học, mang tính tham khảo. Việc hệ trọng nên{' '}
          {isSim
            ? 'gọi thầy tư vấn trực tiếp'
            : `thỉnh ý ${persona.role} trực tiếp`}
          .
        </p>
      ) : null}
    </section>
  );
}
