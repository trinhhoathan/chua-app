import type {
  IztroChartView,
  IztroPalaceView,
  IztroStarView,
} from '@/lib/fengshui/iztro-chart';

export type PhiMutagen = 'Lộc' | 'Quyền' | 'Khoa' | 'Kỵ';

export type PhiFlight = {
  mutagen: PhiMutagen;
  starName: string;
  toPalaceName: string;
  toPalaceIndex: number;
  /** Cùng cung (phi hồi) */
  self: boolean;
};

export type PalacePhiTinh = {
  fromPalaceName: string;
  fromPalaceIndex: number;
  heavenlyStem: string;
  flights: PhiFlight[];
};

const MUTAGEN_ORDER: PhiMutagen[] = ['Lộc', 'Quyền', 'Khoa', 'Kỵ'];

/** Tứ hóa theo thiên can (Lộc → Quyền → Khoa → Kỵ). */
const STEM_MUTAGEN_STARS: Record<string, readonly [string, string, string, string]> =
  {
    Giáp: ['Liêm Trinh', 'Phá Quân', 'Vũ Khúc', 'Thái Dương'],
    Ất: ['Thiên Cơ', 'Thiên Lương', 'Tử Vi', 'Thái Âm'],
    Bính: ['Thiên Đồng', 'Thiên Cơ', 'Văn Xương', 'Liêm Trinh'],
    Đinh: ['Thái Âm', 'Thiên Đồng', 'Thiên Cơ', 'Cự Môn'],
    Mậu: ['Tham Lang', 'Thái Âm', 'Hữu Bật', 'Thiên Cơ'],
    Kỷ: ['Vũ Khúc', 'Tham Lang', 'Thiên Lương', 'Văn Khúc'],
    Canh: ['Thái Dương', 'Vũ Khúc', 'Thái Âm', 'Thiên Đồng'],
    Tân: ['Cự Môn', 'Thái Dương', 'Văn Khúc', 'Văn Xương'],
    Nhâm: ['Thiên Lương', 'Tử Vi', 'Tả Phù', 'Vũ Khúc'],
    Quý: ['Phá Quân', 'Cự Môn', 'Thái Âm', 'Tham Lang'],
  };

function allStars(palace: IztroPalaceView): IztroStarView[] {
  return [
    ...palace.majorStars,
    ...palace.minorStars,
    ...palace.adjectiveStars,
  ];
}

function findPalaceForStar(
  palaces: IztroPalaceView[],
  starName: string,
): IztroPalaceView | null {
  const name = starName.trim();
  if (!name) return null;
  for (const p of palaces) {
    if (p.majorStars.some((s) => s.name === name)) return p;
  }
  for (const p of palaces) {
    if (allStars(p).some((s) => s.name === name)) return p;
  }
  return null;
}

/**
 * Phi tinh theo can cung: mỗi cung lấy tứ hóa theo thiên can của cung,
 * rồi “bay” vào cung đang chứa sao hóa tương ứng.
 */
export function buildPalacePhiTinh(chart: IztroChartView): PalacePhiTinh[] {
  const palaces = chart.palaces.filter((p) => p.index >= 0);
  const rows: PalacePhiTinh[] = [];

  for (const from of palaces) {
    const stem = (from.heavenlyStem || '').trim();
    const starNames = STEM_MUTAGEN_STARS[stem];
    if (!starNames) continue;

    const flights: PhiFlight[] = [];
    for (let i = 0; i < MUTAGEN_ORDER.length; i++) {
      const starName = starNames[i];
      const to = findPalaceForStar(palaces, starName);
      if (!to) continue;
      flights.push({
        mutagen: MUTAGEN_ORDER[i],
        starName,
        toPalaceName: to.name,
        toPalaceIndex: to.index,
        self: to.index === from.index,
      });
    }

    rows.push({
      fromPalaceName: from.name,
      fromPalaceIndex: from.index,
      heavenlyStem: stem,
      flights,
    });
  }

  return rows;
}

export function palacePhiByName(
  rows: PalacePhiTinh[],
): Map<string, PalacePhiTinh> {
  return new Map(rows.map((r) => [r.fromPalaceName, r]));
}

/** Phi nhập: cung nhận hóa từ cung khác. */
export function inboundFlights(
  rows: PalacePhiTinh[],
  palaceName: string,
): Array<PhiFlight & { fromPalaceName: string }> {
  const inbound: Array<PhiFlight & { fromPalaceName: string }> = [];
  for (const row of rows) {
    for (const f of row.flights) {
      if (f.toPalaceName === palaceName) {
        inbound.push({ ...f, fromPalaceName: row.fromPalaceName });
      }
    }
  }
  return inbound;
}

/** Khối ngữ cảnh đưa vào prompt khi chọn Phi tinh. */
export function buildPhiTinhPromptBlock(chart: IztroChartView): string {
  const rows = buildPalacePhiTinh(chart);
  if (!rows.length) return '';

  const lines = [
    '## Phi tinh (bay tinh giữa các cung — theo thiên can từng cung)',
    'Mỗi dòng: cung nguồn (can) → Hóa X (sao) nhập cung đích. "(hồi)" = phi về chính cung đó.',
    'Luận theo hướng Phi tinh: quan hệ cung A phi nhập cung B (Lộc/Quyền/Khoa/Kỵ), không chỉ nhìn tứ hóa năm sinh.',
  ];

  for (const row of rows) {
    if (!row.flights.length) continue;
    const parts = row.flights.map((f) => {
      const dest = f.self ? `${f.toPalaceName}(hồi)` : f.toPalaceName;
      return `Hóa ${f.mutagen} ${f.starName}→${dest}`;
    });
    lines.push(
      `- ${row.fromPalaceName} (${row.heavenlyStem}): ${parts.join('; ')}`,
    );
  }

  return lines.join('\n');
}
