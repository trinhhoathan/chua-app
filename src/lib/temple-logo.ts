/** Returns custom logo URL, or null to use the inline Dharma-wheel fallback. */
export function resolveTempleLogoUrl(
  logoUrl: string | null | undefined,
): string | null {
  const raw = (logoUrl ?? '').trim();
  if (!raw) return null;
  if (raw.includes('...')) return null;
  if (/^https?:\/\/\.\.\./i.test(raw)) return null;
  return raw;
}
