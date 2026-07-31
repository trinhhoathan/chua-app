import {
  PAPER_MM,
  type SoCell,
  type SoLang,
  type SoPaperSize,
  type SoPaperTemplate,
} from './types';

const PX_TO_MM = 25.4 / 96;

/** Font thống nhất theo loại lòng sớ — tránh lẫn Nom Na Tong / UVN / system. */
const FONT_QN = 'UVN Bo Quen';
const FONT_NOM = 'Han-Nom Kai';

export type LayoutSide = 'qn' | 'nom' | 'both';

export interface LayoutChar {
  yMm: number;
  /** Chữ chính: Nôm (song ngữ) hoặc ô đơn */
  char: string;
  fontFamily: string;
  fontSizePt: number;
  color: string;
  side: LayoutSide;
  /** Ô điền động (tên, địa chỉ…) — thường màu đỏ */
  filled?: boolean;
  /** Song ngữ: Quốc ngữ phụ (nhỏ hơn, phía trên) */
  charQn?: string;
  fontFamilyQn?: string;
  fontSizePtQn?: number;
  bold?: boolean;
  italic?: boolean;
  /** Căn trong ô (ghi đè căn toàn trang) */
  textAlign?: 'left' | 'center' | 'right';
}

export interface LayoutColumn {
  xMm: number;
  cells: LayoutChar[];
}

export interface SoPageLayout {
  widthMm: number;
  heightMm: number;
  columns: LayoutColumn[];
  html?: string;
  htmlWidthPx?: number;
  htmlHeightPx?: number;
  lang?: SoLang;
}

/** Tùy chỉnh trước khi in */
export type SoLayoutOptions = {
  /**
   * Khoảng CÁCH THÊM giữa hai cột (mm), cộng vào bước cột đều.
   * 0 = trải đều trong khổ giấy; tăng = đẩy cột xa nhau (khối rộng hơn, không co chữ).
   */
  colGapMm?: number;
  /** Hệ số khoảng chữ theo chiều dọc (1 = mặc định) */
  rowSpread?: number;
  /** Hệ số cỡ chữ chung (fallback) */
  fontScale?: number;
  /** Cỡ chữ Quốc ngữ (song ngữ / QN) */
  fontScaleQn?: number;
  /** Cỡ chữ Nôm / Hán */
  fontScaleNom?: number;
  fontFamilyQn?: string;
  fontFamilyNom?: string;
  /** Màu phần tên / nội dung điền */
  fillColor?: string;
};

const DEFAULT_FILL = '#c41e3a';

function pxToMm(px: number): number {
  return px * PX_TO_MM;
}

function cellWords(cell: SoCell): { qn: string; nom: string } {
  return {
    qn: (cell.qn?.word ?? '').trim(),
    nom: (cell.nom?.word ?? '').trim(),
  };
}

function pickChar(cell: SoCell, lang: SoLang): string {
  const { qn, nom } = cellWords(cell);

  if (lang === 'qn') return qn || ' ';
  if (lang === 'nom') return nom || qn || ' ';
  // songngu: chữ chính = Nôm; QN đi charQn
  return nom || qn || ' ';
}

function pickSide(cell: SoCell, lang: SoLang): LayoutSide {
  if (lang === 'qn') return 'qn';
  if (lang === 'nom') return 'nom';
  const { qn, nom } = cellWords(cell);
  if (qn && nom) return 'both';
  if (nom) return 'nom';
  if (qn) return 'qn';
  return 'nom';
}

function pickFont(
  lang: SoLang,
  side: LayoutSide,
  options?: SoLayoutOptions,
): string {
  if (lang === 'qn' || side === 'qn') {
    return options?.fontFamilyQn?.trim() || FONT_QN;
  }
  return options?.fontFamilyNom?.trim() || FONT_NOM;
}

function uniformFontSize(cellHMm: number, lang: SoLang): number {
  const pt = cellHMm * (lang === 'qn' ? 1.9 : 2.35);
  return Math.max(9, Math.min(lang === 'qn' ? 16 : 22, pt));
}

function isFilledCell(cell: SoCell): boolean {
  return (
    cell.cellType === 'filled' ||
    cell.metadata?.filled === true ||
    (typeof cell.cellType === 'string' &&
      cell.cellType.startsWith('<') &&
      cell.cellType.endsWith('>'))
  );
}

function pickColor(cell: SoCell, options?: SoLayoutOptions): string {
  if (isFilledCell(cell)) {
    return options?.fillColor || cell.style?.color || DEFAULT_FILL;
  }
  return (
    cell.style?.color ||
    cell.qn?.style?.color ||
    cell.nom?.style?.color ||
    '#000'
  );
}

function parseHtmlSize(html: string): { w: number; h: number } {
  const wm = html.match(/width\s*:\s*(\d+(?:\.\d+)?)px/i);
  const hm = html.match(/height\s*:\s*(\d+(?:\.\d+)?)px/i);
  return {
    w: wm ? Number(wm[1]) : 1587,
    h: hm ? Number(hm[1]) : 1123,
  };
}

export function normalizePaperCells(
  paper: SoPaperTemplate,
): { mode: 'cells'; cells: SoCell[] } | { mode: 'html'; html: string } {
  const raw = paper.cells as unknown;
  if (typeof raw === 'string') {
    return { mode: 'html', html: raw };
  }
  if (Array.isArray(raw)) {
    return { mode: 'cells', cells: raw as SoCell[] };
  }
  return { mode: 'cells', cells: [] };
}

/**
 * Xếp chữ trên giấy nằm ngang; cột dọc đọc phải → trái.
 */
export function layoutSoPage(
  cells: SoCell[],
  paper: SoPaperTemplate,
  size: SoPaperSize,
  lang: SoLang = 'songngu',
  options: SoLayoutOptions = {},
): SoPageLayout {
  const { w: widthMm, h: heightMm } = PAPER_MM[size];

  const rawCells = paper.cells as unknown;
  if (typeof rawCells === 'string') {
    const { w, h } = parseHtmlSize(rawCells);
    return {
      widthMm,
      heightMm,
      columns: [],
      html: rawCells,
      htmlWidthPx: w,
      htmlHeightPx: h,
      lang,
    };
  }

  const list = Array.isArray(cells) ? cells : [];
  const cpc = Math.max(1, paper.cellsPerColumn || 1);

  const MIN_PAD_SIDE_MM = 12;
  const MIN_PAD_TOP_MM = 10;
  const MIN_PAD_BOTTOM_MM = 10;
  const padL = Math.max(MIN_PAD_SIDE_MM, pxToMm(paper.paddingLeft || 0));
  const padR = Math.max(MIN_PAD_SIDE_MM, pxToMm(paper.paddingRight || 0));
  const padT = Math.max(MIN_PAD_TOP_MM, pxToMm(paper.paddingTop || 0));
  const padB = Math.max(MIN_PAD_BOTTOM_MM, pxToMm(paper.paddingBottom || 0));

  const availW = Math.max(1, widthMm - padL - padR);
  const availH = Math.max(1, heightMm - padT - padB);

  const numCols = Math.max(1, Math.ceil(list.length / cpc));
  /**
   * Bước cột gốc = trải đều trong khổ in.
   * colGapMm = mm CỘNG THÊM giữa mỗi cặp cột (không ăn vào bề rộng ô).
   * → tăng slider = cột thật sự xa nhau; khối có thể rộng hơn giấy (dùng «Co lòng sớ»).
   */
  const basePitch = availW / numCols;
  const defaultExtra = lang === 'qn' ? 1.2 : lang === 'songngu' ? 0.2 : 0;
  const extraGapMm = Math.max(0, options.colGapMm ?? defaultExtra);
  const pitch = basePitch + extraGapMm;
  const blockW = pitch * numCols;
  const originX = padL + (availW - blockW) / 2;

  const cellH = availH / cpc;
  const rowSpread = Math.max(0.7, Math.min(1.35, options.rowSpread ?? 1));
  const fallbackScale = Math.max(0.6, Math.min(1.5, options.fontScale ?? 1));
  const fontScaleQn = Math.max(
    0.35,
    Math.min(1.5, options.fontScaleQn ?? fallbackScale),
  );
  const fontScaleNom = Math.max(
    0.35,
    Math.min(1.5, options.fontScaleNom ?? fallbackScale),
  );
  const sizeQnPt = uniformFontSize(cellH, 'qn') * fontScaleQn;
  const sizeNomPt = uniformFontSize(cellH, 'nom') * fontScaleNom;
  const fontSizePt =
    lang === 'qn' ? sizeQnPt : lang === 'nom' ? sizeNomPt : sizeNomPt;

  const columns: LayoutColumn[] = [];

  for (let col = 0; col < numCols; col++) {
    // RTL: cột 0 ở mép phải của khối
    const xMm = originX + (numCols - 1 - col) * pitch + pitch * 0.12;
    const colCells: LayoutChar[] = [];

    for (let row = 0; row < cpc; row++) {
      const idx = col * cpc + row;
      if (idx >= list.length) break;
      const cell = list[idx];
      if (!cell) continue;
      const side = pickSide(cell, lang);
      const filled = isFilledCell(cell);
      const { qn, nom } = cellWords(cell);
      const primarySide: LayoutSide =
        side === 'both' ? 'nom' : side === 'qn' ? 'qn' : 'nom';
      const entry: LayoutChar = {
        yMm: padT + row * cellH * rowSpread + cellH * 0.1,
        char: pickChar(cell, lang),
        fontFamily: pickFont(lang, primarySide, options),
        fontSizePt: side === 'qn' ? sizeQnPt : fontSizePt,
        color: pickColor(cell, options),
        side,
        filled,
      };
      if (side === 'both' && qn) {
        entry.charQn = qn;
        entry.fontFamilyQn = pickFont(lang, 'qn', options);
        entry.fontSizePtQn = sizeQnPt;
        entry.char = nom || entry.char;
        entry.fontSizePt = sizeNomPt;
      }
      colCells.push(entry);
    }

    columns.push({ xMm, cells: colCells });
  }

  return { widthMm, heightMm, columns, lang };
}
