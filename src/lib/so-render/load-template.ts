import type { SoTemplateFile } from './types';

const cache = new Map<number, SoTemplateFile>();

function storageUrl(longsoId: number): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  if (!base) return null;
  return `${base}/storage/v1/object/public/so-templates/longsos/${longsoId}.json.gz`;
}

/** Trên Vercel không có so-data local → ưu tiên CDN gzip. */
function preferStorage(): boolean {
  return process.env.NEXT_PUBLIC_SO_TEMPLATES_FROM_STORAGE === '1' || process.env.VERCEL === '1';
}

async function decompressGzip(res: Response): Promise<string> {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('DecompressionStream không khả dụng trong môi trường này.');
  }
  const stream = res.body?.pipeThrough(new DecompressionStream('gzip'));
  if (!stream) throw new Error('Không đọc được body gzip.');
  return new Response(stream).text();
}

async function fetchFromStorage(longsoId: number): Promise<SoTemplateFile | null> {
  const url = storageUrl(longsoId);
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const text = await decompressGzip(res);
    return JSON.parse(text) as SoTemplateFile;
  } catch {
    return null;
  }
}

async function fetchFromApi(longsoId: number): Promise<SoTemplateFile> {
  const res = await fetch(`/api/quan-tri/so-template/${longsoId}`);
  if (!res.ok) {
    throw new Error(
      res.status === 404
        ? `Không tìm thấy lòng sớ #${longsoId}.`
        : `Lỗi tải lòng sớ #${longsoId} (${res.status}).`,
    );
  }
  return (await res.json()) as SoTemplateFile;
}

/**
 * Tải template lòng sớ (client-safe).
 * Local: API đọc `so-data/`. Production (Vercel): gzip từ Supabase Storage CDN (~20KB/file).
 */
export async function loadSoTemplate(longsoId: number): Promise<SoTemplateFile> {
  const cached = cache.get(longsoId);
  if (cached) return cached;

  if (preferStorage()) {
    const fromStorage = await fetchFromStorage(longsoId);
    if (fromStorage) {
      cache.set(longsoId, fromStorage);
      return fromStorage;
    }
  }

  try {
    const data = await fetchFromApi(longsoId);
    cache.set(longsoId, data);
    return data;
  } catch (apiErr) {
    const fromStorage = await fetchFromStorage(longsoId);
    if (fromStorage) {
      cache.set(longsoId, fromStorage);
      return fromStorage;
    }
    throw apiErr;
  }
}

/** Xóa cache (hữu ích khi hot-reload / test). */
export function clearSoTemplateCache(): void {
  cache.clear();
}
