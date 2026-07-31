import { hasLatinResidue, toHanName } from './han-names';

const CACHE_PREFIX = 'so-nom-v1:';

function cacheGet(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(CACHE_PREFIX + key);
  } catch {
    return null;
  }
}

function cacheSet(key: string, value: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_PREFIX + key, value);
  } catch {
    /* quota */
  }
}

export type NomKind = 'name' | 'address' | 'phrase';

/**
 * Dịch Quốc ngữ → Hán/Nôm: từ điển local trước, DeepSeek nếu còn Latin.
 */
export async function translateToNom(
  quocNgu: string,
  kind: NomKind = 'name',
): Promise<{ text: string; source: 'dict' | 'cache' | 'ai' | 'empty' }> {
  const input = quocNgu.trim();
  if (!input) return { text: '', source: 'empty' };

  const local = toHanName(input);
  if (!hasLatinResidue(local)) {
    return { text: local, source: 'dict' };
  }

  const cacheKey = `${kind}:${input.toLowerCase()}`;
  const cached = cacheGet(cacheKey);
  if (cached && !hasLatinResidue(cached)) {
    return { text: cached, source: 'cache' };
  }

  try {
    const res = await fetch('/api/quan-tri/so-to-nom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input, kind }),
    });
    if (!res.ok) {
      return { text: local, source: 'dict' };
    }
    const data = (await res.json()) as { nom?: string };
    const nom = (data.nom ?? '').trim();
    if (!nom) return { text: local, source: 'dict' };
    cacheSet(cacheKey, nom);
    return { text: nom, source: 'ai' };
  } catch {
    return { text: local, source: 'dict' };
  }
}

/** Chỉ dùng từ điển (đồng bộ) — phù hợp lúc in nếu đã lưu sẵn Nôm. */
export function translateToNomSync(quocNgu: string): string {
  return toHanName(quocNgu);
}
