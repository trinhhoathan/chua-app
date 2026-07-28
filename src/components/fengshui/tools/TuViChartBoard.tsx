'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import {
  BRANCH_BOARD_LAYOUT,
  HOROSCOPE_SCOPE_LABELS,
  formatCanChi,
  relatedPalaceIndexes,
  type HoroscopeScopeKey,
  type IztroChartView,
  type IztroHoroscopeView,
  type IztroPalaceView,
  type IztroStarView,
} from '@/lib/fengshui/iztro-chart';

interface Props {
  primaryColor: string;
  chart: IztroChartView;
  horoscope: IztroHoroscopeView | null;
  temple?: {
    name: string;
    address?: string | null;
    hotline?: string | null;
    phone?: string | null;
    zalo?: string | null;
    facebook?: string | null;
  };
}

const SCOPE_ORDER: HoroscopeScopeKey[] = [
  'decadal',
  'age',
  'yearly',
  'monthly',
  'daily',
  'hourly',
];

const MUTAGEN_BADGE: Record<string, string> = {
  Lộc: '#C44A1F',
  Quyền: '#2F6FE0',
  Khoa: '#1B6B3A',
  Kỵ: '#1A1A1A',
};

function mutagenBadgeColor(mutagen: string): string {
  const key = Object.keys(MUTAGEN_BADGE).find((k) => mutagen.includes(k));
  return key ? MUTAGEN_BADGE[key] : '#6B7280';
}

function StarLine({ star }: { star: IztroStarView }) {
  return (
    <>
      {star.name}
      {star.brightness ? (
        <span className="ml-0.5 text-[0.85em] italic font-normal text-muted">
          {star.brightness}
        </span>
      ) : null}
      {star.mutagen ? (
        <span
          className="ml-1 inline-flex items-center justify-center align-middle w-[2.15rem] h-[0.95rem] text-[0.78em] font-medium leading-none text-white"
          style={{ backgroundColor: mutagenBadgeColor(star.mutagen) }}
        >
          {star.mutagen}
        </span>
      ) : null}
    </>
  );
}

export function TuViChartBoard({
  primaryColor,
  chart,
  horoscope,
  temple,
}: Props) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [activeScope, setActiveScope] = useState<HoroscopeScopeKey | null>(
    null,
  );

  const byBranch = useMemo(() => {
    const map = new Map<string, IztroPalaceView>();
    for (const p of chart.palaces) {
      if (p.earthlyBranch) map.set(p.earthlyBranch, p);
    }
    return map;
  }, [chart.palaces]);

  const highlight = useMemo(() => {
    let focus: number | null = null;
    if (activeScope && horoscope) {
      focus = horoscope.scopes[activeScope].index;
    } else if (hoverIndex != null) {
      focus = hoverIndex;
    }
    if (focus == null || focus < 0) return null;
    const rel = relatedPalaceIndexes(focus);
    return {
      focus: rel.focus,
      opposite: rel.opposite,
      trio: new Set(rel.trio),
    };
  }, [activeScope, horoscope, hoverIndex]);

  function scopeChipClick(key: HoroscopeScopeKey) {
    setActiveScope((cur) => (cur === key ? null : key));
  }

  function highlightStyle(palaceIndex: number): CSSProperties | undefined {
    if (!highlight) return undefined;
    if (palaceIndex === highlight.focus) {
      return {
        borderColor: primaryColor,
        background: `${primaryColor}1F`,
        boxShadow: `inset 0 0 0 1px ${primaryColor}66`,
      };
    }
    if (palaceIndex === highlight.opposite) {
      return {
        borderColor: primaryColor,
        background: `${primaryColor}16`,
        boxShadow: `inset 0 0 0 1px ${primaryColor}55`,
      };
    }
    if (highlight.trio.has(palaceIndex)) {
      return {
        borderColor: `${primaryColor}55`,
        background: `${primaryColor}08`,
        boxShadow: `inset 0 0 0 1px ${primaryColor}28`,
      };
    }
    return undefined;
  }

  return (
    <div className="space-y-4">
      {horoscope ? (
        <div className="flex flex-wrap md:flex-nowrap gap-1.5 md:gap-1">
          {SCOPE_ORDER.map((key) => {
            const scope = horoscope.scopes[key];
            const active = activeScope === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => scopeChipClick(key)}
                className="px-2.5 py-1.5 md:px-2 md:py-1.5 md:flex-1 md:min-w-0 text-left text-xs border transition-colors"
                style={
                  active
                    ? {
                        backgroundColor: primaryColor,
                        borderColor: primaryColor,
                        color: '#fff',
                      }
                    : undefined
                }
                title={`Cung ${scope.focusPalaceName} · click để bôi cung đối/tam hợp`}
              >
                <span className="block font-medium truncate">
                  {HOROSCOPE_SCOPE_LABELS[key]}
                </span>
                <span
                  className={`block mt-0.5 truncate ${active ? 'text-white/85' : 'text-muted'}`}
                >
                  {formatCanChi(scope.heavenlyStem, scope.earthlyBranch)}
                  {scope.focusPalaceName
                    ? ` · ${scope.focusPalaceName}`
                    : ''}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="border border-fog bg-white p-1.5 md:p-2 overflow-hidden">
        <div className="grid grid-cols-4 grid-rows-4 gap-1 w-full min-w-0 auto-rows-fr">
          {BRANCH_BOARD_LAYOUT.map((row, ri) =>
            row.map((branch, ci) => {
              const cellKey = `${ri}-${ci}`;
              if (!branch) {
                if (ri === 1 && ci === 1) {
                  return (
                    <div
                      key="center"
                      className="border border-fog bg-paper p-2 md:p-3 flex flex-col justify-center text-center min-w-0 overflow-hidden"
                      style={{ gridColumn: '2 / 4', gridRow: '2 / 4' }}
                    >
                      <p
                        className="text-[0.6rem] uppercase tracking-[0.2em]"
                        style={{ color: primaryColor }}
                      >
                        Lá số tử vi
                      </p>
                      <p className="mt-1 font-display text-base md:text-xl text-ink leading-tight">
                        {chart.fullName}
                      </p>
                      <p className="text-xs text-muted">({chart.gender})</p>
                      <p className="mt-1.5 text-[0.7rem] md:text-xs text-ink leading-snug">
                        {chart.fiveElementsClass}
                      </p>
                      <p className="mt-0.5 text-[0.65rem] md:text-xs text-muted">
                        Chủ {chart.soul} · Thân {chart.body}
                      </p>
                      <p className="mt-1.5 text-[0.65rem] md:text-[0.7rem] text-ink font-medium leading-snug">
                        {chart.chineseDate}
                      </p>
                      <p className="mt-0.5 text-[0.6rem] text-muted">
                        DL {chart.solarDate} · ÂL {chart.lunarDate} ·{' '}
                        {chart.time}
                      </p>
                      {horoscope?.nominalAge != null ? (
                        <p className="mt-0.5 text-[0.6rem] text-muted">
                          Tuổi hư {horoscope.nominalAge} · thời gian xem{' '}
                          {horoscope.solarDate} · {horoscope.timeLabel}
                        </p>
                      ) : null}
                      {temple?.name ? (
                        <div className="mt-2 pt-1.5 border-t border-fog/70 space-y-0.5">
                          <p className="text-[0.6rem] text-muted leading-snug">
                            Lá số được lập tại{' '}
                            {/^chùa\b/i.test(temple.name.trim())
                              ? temple.name.trim()
                              : `chùa ${temple.name.trim()}`}
                          </p>
                          {temple.address ? (
                            <p className="text-[0.55rem] text-muted/90 leading-snug">
                              {temple.address}
                            </p>
                          ) : null}
                          {(temple.hotline || temple.phone) && (
                            <p className="text-[0.55rem] text-muted/90 leading-snug">
                              Điện thoại:{' '}
                              <a
                                href={`tel:${(temple.hotline || temple.phone || '').replace(/\s/g, '')}`}
                                className="font-semibold text-ink hover:opacity-80"
                              >
                                {temple.hotline || temple.phone}
                              </a>
                            </p>
                          )}
                          {temple.zalo ? (
                            <p className="text-[0.55rem] text-muted/90 leading-snug">
                              Zalo:{' '}
                              <a
                                href={
                                  temple.zalo.startsWith('http')
                                    ? temple.zalo
                                    : `https://zalo.me/${temple.zalo.replace(/\s/g, '')}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-ink hover:opacity-80"
                              >
                                {temple.zalo.replace(/^https?:\/\/(www\.)?zalo\.me\//i, '')}
                              </a>
                            </p>
                          ) : null}
                          {temple.facebook ? (
                            <p className="text-[0.55rem] text-muted/90 leading-snug">
                              Facebook:{' '}
                              <a
                                href={temple.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-ink hover:opacity-80 break-all"
                              >
                                Fanpage
                              </a>
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  );
                }
                return null;
              }

              const palace = byBranch.get(branch);
              if (!palace) {
                return (
                  <div
                    key={cellKey}
                    className="border border-fog bg-mist/20 min-h-[8rem] md:min-h-[10rem] p-1.5 text-[0.65rem] text-muted min-w-0 overflow-hidden"
                    style={{ gridColumn: ci + 1, gridRow: ri + 1 }}
                  >
                    {branch}
                  </div>
                );
              }

              const litStyle = highlightStyle(palace.index);
              const flowStars =
                activeScope && horoscope
                  ? horoscope.scopes[activeScope].starsByPalaceIndex[
                      palace.index
                    ] ?? []
                  : [];

              return (
                <div
                  key={cellKey}
                  onMouseEnter={() => setHoverIndex(palace.index)}
                  onMouseLeave={() => setHoverIndex(null)}
                  className="border border-fog bg-mist/25 p-1.5 md:p-2 min-h-[8rem] md:min-h-[10rem] min-w-0 overflow-hidden flex flex-col text-left transition-colors"
                  style={{
                    gridColumn: ci + 1,
                    gridRow: ri + 1,
                    ...(litStyle
                      ? litStyle
                      : palace.isSoulPalace || palace.isBodyPalace
                        ? {
                            borderColor: `${primaryColor}88`,
                          }
                        : {}),
                  }}
                >
                  <div className="flex items-start justify-between gap-0.5 min-w-0">
                    <div className="min-w-0">
                      <p
                        className="text-[0.62rem] md:text-[0.7rem] font-semibold uppercase tracking-wide truncate"
                        style={{ color: primaryColor }}
                      >
                        {palace.name}
                      </p>
                      <p className="text-[0.55rem] md:text-[0.6rem] italic text-muted truncate">
                        {formatCanChi(
                          palace.heavenlyStem,
                          palace.earthlyBranch,
                        )}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      {palace.isSoulPalace ? (
                        <span
                          className="text-[0.55rem] uppercase px-1 text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          Mệnh
                        </span>
                      ) : null}
                      {palace.isBodyPalace ? (
                        <span className="text-[0.55rem] uppercase px-1 border border-fog text-muted">
                          Thân
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {palace.majorStars.length ? (
                    <ul className="mt-1.5 space-y-0 min-w-0">
                      {palace.majorStars.map((s) => (
                        <li
                          key={`${palace.name}-maj-${s.name}`}
                          className="text-[0.62rem] md:text-[0.7rem] font-medium text-ink leading-snug break-words"
                        >
                          <StarLine star={s} />
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {palace.minorStars.length ? (
                    <ul className="mt-1.5 space-y-0 min-w-0">
                      {palace.minorStars.map((s) => (
                        <li
                          key={`${palace.name}-min-${s.name}`}
                          className="text-[0.58rem] md:text-[0.65rem] text-ink/85 leading-snug break-words"
                        >
                          <StarLine star={s} />
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {palace.adjectiveStars.length ? (
                    <p className="mt-1.5 text-[0.55rem] md:text-[0.62rem] text-muted leading-snug break-words min-w-0">
                      {palace.adjectiveStars.map((s) => s.name).join(' · ')}
                    </p>
                  ) : null}

                  {[
                    palace.changsheng12 && `TS:${palace.changsheng12}`,
                    palace.boshi12 && `BS:${palace.boshi12}`,
                    palace.jiangqian12 && `TQ:${palace.jiangqian12}`,
                    palace.suiqian12 && `Tuế:${palace.suiqian12}`,
                  ].filter(Boolean).length || flowStars.length ? (
                    <div className="mt-2.5 space-y-0.5 min-w-0">
                      {[
                        palace.changsheng12 && `TS:${palace.changsheng12}`,
                        palace.boshi12 && `BS:${palace.boshi12}`,
                        palace.jiangqian12 && `TQ:${palace.jiangqian12}`,
                        palace.suiqian12 && `Tuế:${palace.suiqian12}`,
                      ].filter(Boolean).length ? (
                        <p className="text-[0.55rem] md:text-[0.6rem] text-muted/80 leading-snug break-words">
                          {[
                            palace.changsheng12 && `TS:${palace.changsheng12}`,
                            palace.boshi12 && `BS:${palace.boshi12}`,
                            palace.jiangqian12 && `TQ:${palace.jiangqian12}`,
                            palace.suiqian12 && `Tuế:${palace.suiqian12}`,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      ) : null}
                      {flowStars.length ? (
                        <p
                          className="text-[0.55rem] md:text-[0.62rem] font-medium leading-snug break-words"
                          style={{ color: primaryColor }}
                        >
                          {activeScope
                            ? HOROSCOPE_SCOPE_LABELS[activeScope]
                            : 'Lưu'}
                          : {flowStars.map((s) => s.name).join(' · ')}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="mt-auto pt-1.5">
                    <p className="text-[0.58rem] md:text-[0.65rem] text-muted leading-snug break-words">
                      ĐH {palace.decadal.range[0]}–{palace.decadal.range[1]}
                    </p>
                    {palace.ages.length ? (
                      <p className="text-[0.55rem] md:text-[0.6rem] text-muted/90 tabular-nums leading-snug break-words">
                        {palace.ages.join(' ')}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}
