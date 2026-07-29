/** Parse/format ngày kiểu Việt Nam dd/mm/yyyy. */

export function parseVnDate(raw: string): {
  isoDate: string;
  year: number;
} | null {
  const m = raw.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const d = new Date(year, month - 1, day);
  if (
    Number.isNaN(d.getTime()) ||
    d.getFullYear() !== year ||
    d.getMonth() !== month - 1 ||
    d.getDate() !== day
  ) {
    return null;
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    isoDate: `${year}-${pad(month)}-${pad(day)}`,
    year,
  };
}

export function formatVnDate(isoDate: string | null | undefined): string {
  if (!isoDate) return '';
  // Accept YYYY-MM-DD or full ISO
  const m = String(isoDate).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return '';
  return `${m[3]}/${m[2]}/${m[1]}`;
}

export function formatVnTime(raw: string | null | undefined): string {
  if (!raw) return '';
  const m = String(raw).match(/^(\d{1,2}):(\d{2})/);
  if (!m) return '';
  return `${String(m[1]).padStart(2, '0')}:${m[2]}`;
}

export function normalizeVnTime(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  const m = t.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`;
}
