import { arabicToHanDigits, toHanGlyphs, toHanName } from './han-names';
import type { SoCell, SoCellSide, SoFillData, SoLang, SoPaperTemplate } from './types';

/** Khóa lõi (không ngoặc) → trường SoFillData */
const CORE_KEYS: Record<string, keyof SoFillData> = {
  'tên sớ': 'tenSo',
  'tên chủ hộ': 'chuHo',
  'địa chỉ': 'diaChi',
  'nơi cúng': 'noiCung',
  'can năm cúng': 'canNamCung',
  'chi năm cúng': 'chiNamCung',
  'tháng cúng': 'thangCung',
  'ngày cúng': 'ngayCung',
  'ngạch sớ cố định': 'ngachSo',
  'danh sách tín chủ': 'danhSachTinChu',
  'danh sách gia tiên': 'danhSachGiaTien',
  'danh sách chính tiến': 'danhSachChinhTien',
};

const SEAL_KEY = 'dấu triện';

/** Can/chi Quốc ngữ → Hán */
const CAN_CHI_HAN: Record<string, string> = {
  Giáp: '甲',
  Ất: '乙',
  Bính: '丙',
  Đinh: '丁',
  Mậu: '戊',
  Kỷ: '己',
  Canh: '庚',
  Tân: '辛',
  Nhâm: '壬',
  Quý: '癸',
  Tý: '子',
  Sửu: '丑',
  Dần: '寅',
  Mão: '卯',
  Thìn: '辰',
  Tỵ: '巳',
  Ngọ: '午',
  Mùi: '未',
  Thân: '申',
  Dậu: '酉',
  Tuất: '戌',
  Hợi: '亥',
};

function normalizeKey(cellType: string): string {
  return cellType.replace(/^[<\[]|[>\]]$/g, '').trim().toLowerCase();
}

function isCorePlaceholder(cellType: string): boolean {
  const key = normalizeKey(cellType);
  return key in CORE_KEYS || key === SEAL_KEY;
}

function isListKey(field: keyof SoFillData): boolean {
  return (
    field === 'danhSachTinChu' ||
    field === 'danhSachGiaTien' ||
    field === 'danhSachChinhTien'
  );
}

function isCanChiField(field: keyof SoFillData): boolean {
  return field === 'canNamCung' || field === 'chiNamCung';
}

/** Chuẩn hóa danh sách tên: tách dòng / dấu câu → ghép bằng khoảng trắng */
export function normalizeNameList(raw: string): string {
  return raw
    .split(/[\n\r、,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .join(' ');
}

function resolveValue(field: keyof SoFillData, data: SoFillData): string {
  const raw = data[field] ?? '';
  if (isListKey(field)) return normalizeNameList(raw);
  return String(raw);
}

/** Màu đỏ nội dung điền (tên, địa chỉ, ngày…) — giống sớ mẫu */
const FILL_RED = '#c41e3a';

function cloneSide(
  side: SoCellSide | undefined,
  word: string,
  filled = false,
): SoCellSide | undefined {
  if (!side) {
    return filled
      ? { word, lang: 'qn', style: { color: FILL_RED } }
      : undefined;
  }
  const style = side.style ? { ...side.style } : {};
  if (filled) style.color = FILL_RED;
  return { ...side, word, style };
}

function makeCharCell(
  template: SoCell,
  qnWord: string | undefined,
  nomWord: string | undefined,
  filled = false,
): SoCell {
  const baseStyle = template.style ? { ...template.style } : {};
  if (filled) baseStyle.color = FILL_RED;
  return {
    style: baseStyle,
    cellType: filled ? 'filled' : 'static',
    anchor: template.anchor,
    metadata: filled
      ? { ...(template.metadata ?? {}), filled: true }
      : template.metadata,
    qn:
      qnWord !== undefined
        ? (cloneSide(template.qn, qnWord, filled) ?? {
            word: qnWord,
            lang: 'qn',
            style: filled ? { color: FILL_RED } : undefined,
          })
        : undefined,
    nom:
      nomWord !== undefined
        ? (cloneSide(template.nom, nomWord, filled) ?? {
            word: nomWord,
            lang: 'nom',
            style: filled ? { color: FILL_RED } : undefined,
          })
        : undefined,
  };
}

const HAN_DIGIT_CHARS = new Set('零〇一二三四五六七八九十百千'.split(''));

/** Tách địa chỉ / tên Quốc ngữ: mỗi âm một ô; số tách từng chữ số (1999 → 1,9,9,9). */
function tokenizeQuocNgu(text: string): string[] {
  const chunks = text
    .trim()
    .split(/[\s、,;./\\|]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const out: string[] = [];
  for (const chunk of chunks) {
    // "52A" / "nhà52" / "1999" → tách số và chữ
    const parts = chunk.match(/\d+|[^\d]+/g) ?? [chunk];
    for (const part of parts) {
      if (/^\d+$/.test(part)) {
        out.push(...part.split(''));
        continue;
      }
      // Chuỗi số Hán sẵn (一九九九) → mỗi chữ một ô
      if (
        part.length > 1 &&
        [...part].every((ch) => HAN_DIGIT_CHARS.has(ch))
      ) {
        out.push(...part);
        continue;
      }
      const t = part.trim();
      if (t) out.push(t);
    }
  }
  return out;
}

/** Mở rộng chuỗi thành chuỗi ô (dọc cột) — 1 ô / 1 chữ Hán hoặc 1 âm / 1 chữ số */
function expandChars(text: string, template: SoCell, lang: SoLang): SoCell[] {
  if (lang === 'qn') {
    const tokens = tokenizeQuocNgu(text);
    if (tokens.length === 0) return [makeCharCell(template, ' ', undefined, true)];
    return tokens.map((tok) => makeCharCell(template, tok, undefined, true));
  }

  if (lang === 'songngu') {
    // Mỗi âm/chữ số QN một ô + chữ Hán tương ứng (1/一, 9/九…)
    const tokens = tokenizeQuocNgu(text);
    if (tokens.length === 0) return [makeCharCell(template, ' ', ' ', true)];
    return tokens.map((tok) => {
      if (/^\d$/.test(tok)) {
        return makeCharCell(template, tok, arabicToHanDigits(tok), true);
      }
      if (HAN_DIGIT_CHARS.has(tok) && tok.length === 1) {
        return makeCharCell(template, tok, tok, true);
      }
      const han = toHanName(tok);
      return makeCharCell(template, tok, han || tok, true);
    });
  }

  // nom: mỗi glyph Hán một ô (số đã tách trong toHanGlyphs)
  const glyphs = toHanGlyphs(text);
  if (glyphs.length === 0) return [makeCharCell(template, undefined, ' ', true)];
  return glyphs.map((g) => makeCharCell(template, undefined, g, true));
}

function expandCanChi(token: string, template: SoCell, lang: SoLang): SoCell[] {
  const qn = token.trim();
  if (!qn) return [makeCharCell(template, ' ', ' ', true)];
  const han = CAN_CHI_HAN[qn] ?? (toHanName(qn) || qn);

  if (lang === 'qn') {
    return [makeCharCell(template, qn, undefined, true)];
  }
  if (lang === 'nom') {
    return Array.from(han).map((ch) =>
      makeCharCell(template, undefined, ch, true),
    );
  }
  return [makeCharCell(template, qn, han, true)];
}

/**
 * Thay placeholder lõi bằng chuỗi ô ký tự (mở rộng dọc theo cột).
 * `static` / `faked` giữ nguyên; dấu triện để trống (vẽ riêng).
 */
export function fillPlaceholders(
  paper: SoPaperTemplate,
  data: SoFillData,
  lang: SoLang,
): SoCell[] {
  // Template QN hiện đại lưu HTML string — không điền placeholder kiểu ô
  if (!Array.isArray(paper.cells)) {
    return [];
  }

  const out: SoCell[] = [];

  for (const cell of paper.cells) {
    const { cellType } = cell;

    if (cellType === 'static' || cellType === 'faked') {
      out.push(cell);
      continue;
    }

    if (!isCorePlaceholder(cellType)) {
      out.push(cell);
      continue;
    }

    const key = normalizeKey(cellType);

    if (key === SEAL_KEY) {
      out.push(makeCharCell(cell, ' ', ' '));
      continue;
    }

    const field = CORE_KEYS[key];
    if (!field) {
      out.push(cell);
      continue;
    }

    const value = resolveValue(field, data);

    if (isCanChiField(field)) {
      out.push(...expandCanChi(value, cell, lang));
      continue;
    }

    out.push(...expandChars(value, cell, lang));
  }

  return out;
}
