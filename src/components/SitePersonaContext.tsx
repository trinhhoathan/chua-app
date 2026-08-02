'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { SitePersona } from '@/lib/site-persona';

/**
 * Context persona theo site — server component tính persona
 * (getSitePersona) rồi bọc cây client bằng provider này.
 * Mặc định: persona "trụ trì" (site chùa thường).
 */
const DEFAULT_PERSONA: SitePersona = {
  upsell: 'water',
  role: 'trụ trì',
  roleTitle: 'Trụ trì',
  displayName: 'trụ trì chùa',
  callLabel: 'Gọi trụ trì',
  thinkingLabel: 'Trụ trì đang xem',
  aiRoleIntro: '',
  aiOutro: '',
};

const SitePersonaContext = createContext<SitePersona>(DEFAULT_PERSONA);

export function SitePersonaProvider({
  persona,
  children,
}: {
  persona: SitePersona;
  children: ReactNode;
}) {
  return (
    <SitePersonaContext.Provider value={persona}>
      {children}
    </SitePersonaContext.Provider>
  );
}

export function useSitePersona(): SitePersona {
  return useContext(SitePersonaContext);
}

/**
 * Danh xưng người tư vấn, render inline trong câu.
 * Site chùa: hiện `fallback` (mặc định "trụ trì").
 * Site Lý Gia: hiện "Thầy Phong Thủy Phúc An".
 */
export function AdvisorName({ fallback = 'trụ trì' }: { fallback?: string }) {
  const persona = useSitePersona();
  return <>{persona.upsell === 'sim' ? persona.displayName : fallback}</>;
}

/** Render chuỗi dữ liệu tĩnh, tự thay danh xưng "trụ trì" trên site Lý Gia. */
export function AdvisorText({ text }: { text: string }) {
  const transform = useAdvisorText();
  return <>{transform(text)}</>;
}

/**
 * Trả về hàm thay danh xưng "trụ trì" trong chuỗi dữ liệu tĩnh (lib dùng chung)
 * khi hiển thị trên site Lý Gia. Site chùa: trả nguyên văn.
 */
export function useAdvisorText(): (text: string) => string {
  const persona = useSitePersona();
  if (persona.upsell !== 'sim') return (t: string) => t;
  const name = persona.displayName;
  return (t: string) =>
    t
      .replaceAll('trụ trì / thầy trong chùa', name)
      .replaceAll('trụ trì / thầy', name)
      .replaceAll('sư trụ trì', name)
      .replaceAll('thầy trụ trì', name)
      .replaceAll('Trụ trì', name)
      .replaceAll('trụ trì', name);
}
