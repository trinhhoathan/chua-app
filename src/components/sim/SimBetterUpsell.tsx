'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { findBetterSims, type BetterSimBrief } from '@/app/actions/sims';
import { useSitePersona } from '@/components/SitePersonaContext';
import { NETWORK_LABELS } from '@/lib/sim/catalog';
import { ELEMENT_BADGE } from '@/components/sim/sim-ui';

function formatVnd(v: number): string {
  return `${Math.round(v).toLocaleString('vi-VN')} đ`;
}

/**
 * Khối upsell sau kết quả Bói Sim — hiện khi site bật kho sim (đại lý / Lý Gia).
 */
export function SimBetterUpsell({
  score,
  primaryColor,
}: {
  /** Điểm tổng của số vừa luận. */
  score: number;
  primaryColor: string;
}) {
  const persona = useSitePersona();
  const storeOn = persona.simStoreEnabled;
  const [sims, setSims] = useState<BetterSimBrief[] | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!storeOn) return;
    let cancelled = false;
    findBetterSims(score, 6)
      .then((res) => {
        if (cancelled) return;
        setSims(res.sims);
        setTotal(res.total);
      })
      .catch(() => {
        if (!cancelled) setSims([]);
      });
    return () => {
      cancelled = true;
    };
  }, [storeOn, score]);

  if (!storeOn || !sims || sims.length === 0) return null;

  const templeTone = persona.upsell === 'water';

  return (
    <section
      className="border p-4 sm:p-5"
      style={{
        borderColor: `${primaryColor}55`,
        background: `${primaryColor}08`,
      }}
    >
      <p
        className="text-[10px] uppercase tracking-[0.25em]"
        style={{ color: primaryColor }}
      >
        Kho Sim Phong Thủy
      </p>
      <p className="mt-1 font-display text-xl text-ink">
        Trong kho đang có {total.toLocaleString('vi-VN')} số điểm cao hơn số
        của quý vị
      </p>
      <p className="mt-1 text-sm text-muted leading-relaxed">
        Số vừa xem đạt {score}/100. Dưới đây là vài dãy số đã được chấm điểm
        sẵn — bấm vào để xem luận giải và đặt mua
        {templeTone
          ? ' (công đức hỗ trợ Phật sự nhà chùa).'
          : ` theo tư vấn của ${persona.displayName}.`}
      </p>

      <ul className="mt-4 grid grid-cols-2 gap-2">
        {sims.map((s) => {
          const badge = ELEMENT_BADGE[s.element];
          return (
            <li key={s.phone}>
              <Link
                href={`/sim/${s.phone}`}
                className="block border border-fog bg-white px-3 py-2.5 hover:border-ink/30 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-lg text-ink tabular-nums">
                    {s.phoneDisplay}
                  </span>
                  <span
                    className="text-sm font-semibold tabular-nums"
                    style={{ color: primaryColor }}
                  >
                    {s.overallScore}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted">
                  <span>
                    {NETWORK_LABELS[s.network] ?? s.network}
                    {badge ? ` · ${badge.label}` : ''}
                  </span>
                  <span className="text-ink font-medium">
                    {formatVnd(s.priceVnd)}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-4">
        <Link
          href={`/sim?diem=${Math.min(99, Math.max(0, Math.floor(score) + 1))}&sap=score`}
          className="inline-block px-4 py-2 text-sm text-white"
          style={{ backgroundColor: primaryColor }}
        >
          Xem tất cả số điểm cao hơn trong kho →
        </Link>
      </div>
    </section>
  );
}
