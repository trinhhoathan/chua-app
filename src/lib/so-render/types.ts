export type SoLang = 'qn' | 'nom' | 'songngu';
export type SoPaperSize = 'A3' | 'A3s' | 'long' | 'super_long' | 'A2';

export interface SoCellStyle {
  fontName?: string;
  fontSize?: number;
  color?: string;
  margin?: { left: number; top: number; right: number; bottom: number };
  hAlign?: string;
  vAlign?: string;
  bold?: boolean;
  italic?: boolean;
}

export interface SoCellSide {
  word?: string;
  lang?: string;
  style?: SoCellStyle;
}

export interface SoCell {
  qn?: SoCellSide;
  nom?: SoCellSide;
  style?: SoCellStyle;
  cellType: string;
  anchor?: number;
  metadata?: Record<string, unknown>;
}

export interface SoPaperTemplate {
  /** Mảng ô (truyền thống) hoặc HTML string (Quốc ngữ ngang hiện đại) */
  cells: SoCell[] | string;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  cellsPerColumn: number;
  seal?: {
    cpos: number;
    offset: number;
    width: number;
    height: number;
    x: number;
    y: number;
  };
}

export interface SoTemplateFile {
  lang: SoLang;
  name: string;
  placeholders: string[];
  template: Partial<Record<SoPaperSize, SoPaperTemplate>>;
}

export interface SoFillData {
  tenSo: string;
  chuHo: string;
  diaChi: string;
  noiCung: string;
  canNamCung: string;
  chiNamCung: string;
  thangCung: string;
  ngayCung: string;
  ngachSo: string;
  /** Nhiều dòng hoặc tên cách nhau bằng dấu — điền cột */
  danhSachTinChu: string;
  danhSachGiaTien?: string;
  danhSachChinhTien?: string;
}

/** Khổ giấy sớ luôn nằm ngang (cạnh dài = chiều rộng). */
export const PAPER_MM: Record<SoPaperSize, { w: number; h: number }> = {
  A3: { w: 420, h: 297 },
  A3s: { w: 470, h: 300 },
  long: { w: 550, h: 300 },
  super_long: { w: 790, h: 300 },
  A2: { w: 600, h: 420 },
};
