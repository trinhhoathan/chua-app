'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from 'react';
import type {
  SoAncestor,
  SoHousehold,
  SoHouseholdMember,
} from '@/types/database';
import {
  loadSoTemplate,
  fillPlaceholders,
  layoutSoPage,
  PAPER_MM,
  type SoPaperSize,
  type SoPageLayout,
  type SoLayoutOptions,
  type SoLang,
} from '@/lib/so-render';
import { buildSoFillData } from '@/lib/so-render/build-fill-data';

export type { SoPaperSize };

type Props = {
  household: SoHousehold;
  members: SoHouseholdMember[];
  ancestors: SoAncestor[];
  longsoId: number;
  tenSo: string;
  paperSize: SoPaperSize;
};

const MM_TO_PX = 96 / 25.4;
const STYLE_STORAGE_KEY = 'so-preview-style-v4';

type TextAlign = 'left' | 'center' | 'right';

/** Ghi đè từng ô: chữ + kiểu (font, cỡ, đậm/nghiêng, màu) */
type CellOverride = {
  /** Song ngữ: "Quốc ngữ|Nôm" */
  text?: string;
  fontFamily?: string;
  fontFamilyQn?: string;
  /** Hệ số cỡ chữ so với mặc định (1 = 100%) */
  sizeScale?: number;
  bold?: boolean;
  italic?: boolean;
  color?: string;
  /** Căn lề trong ô (vùng chọn) */
  textAlign?: TextAlign;
};

function cellKey(ci: number, ri: number) {
  return `${ci}-${ri}`;
}

function parseCellKey(k: string): { ci: number; ri: number } {
  const [ci, ri] = k.split('-').map(Number);
  return { ci: ci ?? 0, ri: ri ?? 0 };
}

function applyCellOverrides(
  page: SoPageLayout,
  overrides: Record<string, CellOverride>,
): SoPageLayout {
  if (page.html || Object.keys(overrides).length === 0) return page;
  return {
    ...page,
    columns: page.columns.map((col, ci) => ({
      ...col,
      cells: col.cells.map((cell, ri) => {
        const o = overrides[cellKey(ci, ri)];
        if (!o) return cell;
        const next = { ...cell };
        if (o.text != null) {
          const raw = o.text;
          if (cell.side === 'both' && raw.includes('|')) {
            const i = raw.indexOf('|');
            next.charQn = raw.slice(0, i).trim() || ' ';
            next.char = raw.slice(i + 1).trim() || ' ';
          } else {
            next.char = raw;
          }
        }
        if (o.fontFamily) next.fontFamily = o.fontFamily;
        if (o.fontFamilyQn) next.fontFamilyQn = o.fontFamilyQn;
        const scale = o.sizeScale ?? 1;
        if (scale !== 1) {
          next.fontSizePt = cell.fontSizePt * scale;
          if (cell.fontSizePtQn != null) {
            next.fontSizePtQn = cell.fontSizePtQn * scale;
          }
        }
        if (o.color) next.color = o.color;
        if (o.bold != null) next.bold = o.bold;
        if (o.italic != null) next.italic = o.italic;
        if (o.textAlign) next.textAlign = o.textAlign;
        return next;
      }),
    })),
  };
}

function cellTextSeed(cell: {
  side: string;
  char: string;
  charQn?: string;
}): string {
  if (cell.side === 'both' && cell.charQn?.trim()) {
    return `${cell.charQn}|${cell.char}`;
  }
  return cell.char === ' ' ? '' : cell.char;
}

type PrintStyle = {
  scale: number;
  ox: number;
  oy: number;
  /** @deprecated giữ để migrate; dùng fontScaleQn / fontScaleNom */
  fontScale: number;
  fontScaleQn: number;
  fontScaleNom: number;
  /** Khoảng cách ngang giữa Quốc ngữ và Nôm (mm) — song ngữ */
  qnNomGapMm: number;
  colGapMm: number;
  rowSpread: number;
  fontQn: string;
  fontNom: string;
  fillColor: string;
  /** Căn chữ trong cột (ngang) */
  textAlign: TextAlign;
};

/** Mặc định tối ưu cho sớ Song ngữ */
const DEFAULT_STYLE: PrintStyle = {
  scale: 1,
  ox: 0,
  oy: 0,
  fontScale: 1,
  fontScaleQn: 0.97,
  fontScaleNom: 0.73,
  qnNomGapMm: 0.4,
  colGapMm: 0.2,
  rowSpread: 1,
  fontQn: 'UVN Bo Quen',
  fontNom: 'Han-Nom Kai',
  fillColor: '#c41e3a',
  textAlign: 'right',
};

/** Nhóm font Quốc ngữ — Việt / serif / sans / hệ thống */
const FONT_QN_GROUPS: { label: string; fonts: string[] }[] = [
  {
    label: 'Việt / sớ',
    fonts: ['UVN Bo Quen', 'Be Vietnam Pro', 'Be Vietnam Pro Medium'],
  },
  {
    label: 'Serif (in sớ)',
    fonts: [
      'EB Garamond',
      'Literata',
      'Lora',
      'Source Serif 4',
      'Spectral',
      'IBM Plex Serif',
      'Libre Baskerville',
      'Alegreya',
      'Cormorant Garamond',
      'Newsreader',
      'Noto Serif',
      'Crimson Pro',
      'Playfair Display',
    ],
  },
  {
    label: 'Sans',
    fonts: [
      'Mulish',
      'Nunito',
      'Inter',
      'Source Sans 3',
      'IBM Plex Sans',
    ],
  },
  {
    label: 'Hệ thống',
    fonts: ['Times New Roman', 'Georgia', 'Arial'],
  },
];
/** Nhóm font — Nôm VN / thư pháp / khai-tống (SIL OFL trừ bộ mẫu) */
const FONT_NOM_GROUPS: { label: string; fonts: string[] }[] = [
  {
    label: 'Hán-Nôm Việt',
    fonts: [
      'Han-Nom Kai',
      'Nom Na Tong',
      'Nom Na Tong Light',
      'HAN NOM',
      'HAN NOM A',
      'HAN NOM B',
    ],
  },
  {
    label: 'Thư pháp / bút lông (OFL)',
    fonts: [
      'Ma Shan Zheng',
      'Long Cang',
      'Liu Jian Mao Cao',
      'Zhi Mang Xing',
      'Liyu Shoushu',
      'Yuji Boku',
      'Yuji Mai',
      'Yuji Syuku',
      'Potta One',
      'Train One',
      'Zen Kurenaido',
    ],
  },
  {
    label: 'Khai / Tống / Minh (OFL)',
    fonts: [
      'LXGW WenKai',
      'LXGW ZhenKai',
      'Klee One',
      'Xuandong Kaishu',
      'LXGW Neo ZhiSong',
      'LXGW Heart Serif',
      'Shippori Mincho',
      'ZCOOL XiaoWei',
      'ZCOOL QingKe HuangYou',
    ],
  },
];

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function loadStyle(): PrintStyle {
  if (typeof window === 'undefined') return DEFAULT_STYLE;
  try {
    const raw = localStorage.getItem(STYLE_STORAGE_KEY);
    if (!raw) {
      // migrate v1 fit
      const old = localStorage.getItem('so-preview-fit-v1');
      if (old) {
        const p = JSON.parse(old) as Partial<PrintStyle>;
        return {
          ...DEFAULT_STYLE,
          scale: clamp(Number(p.scale) || DEFAULT_STYLE.scale, 0.75, 1),
          ox: clamp(Number(p.ox) || 0, -80, 80),
          oy: clamp(Number(p.oy) || 0, -80, 80),
        };
      }
      return DEFAULT_STYLE;
    }
    const p = JSON.parse(raw) as Partial<PrintStyle>;
    return {
      scale: clamp(Number(p.scale) || DEFAULT_STYLE.scale, 0.75, 1),
      ox: clamp(Number(p.ox) || 0, -80, 80),
      oy: clamp(Number(p.oy) || 0, -80, 80),
      fontScale: clamp(Number(p.fontScale) || 1, 0.35, 1.5),
      fontScaleQn: clamp(
        p.fontScaleQn != null
          ? Number(p.fontScaleQn)
          : DEFAULT_STYLE.fontScaleQn,
        0.35,
        1.5,
      ),
      fontScaleNom: clamp(
        p.fontScaleNom != null
          ? Number(p.fontScaleNom)
          : Number(p.fontScale) || DEFAULT_STYLE.fontScaleNom,
        0.35,
        1.5,
      ),
      qnNomGapMm: clamp(
        p.qnNomGapMm != null ? Number(p.qnNomGapMm) : DEFAULT_STYLE.qnNomGapMm,
        0,
        8,
      ),
      colGapMm: clamp(Number(p.colGapMm) ?? DEFAULT_STYLE.colGapMm, 0, 8),
      rowSpread: clamp(Number(p.rowSpread) || 1, 0.7, 1.35),
      fontQn: p.fontQn || DEFAULT_STYLE.fontQn,
      fontNom:
        !p.fontNom || p.fontNom === 'Chu Nom Khai'
          ? DEFAULT_STYLE.fontNom
          : p.fontNom,
      fillColor: p.fillColor || DEFAULT_STYLE.fillColor,
      textAlign:
        p.textAlign === 'left' ||
        p.textAlign === 'center' ||
        p.textAlign === 'right'
          ? p.textAlign
          : DEFAULT_STYLE.textAlign,
    };
  } catch {
    return DEFAULT_STYLE;
  }
}

function toLayoutOptions(style: PrintStyle): SoLayoutOptions {
  return {
    colGapMm: style.colGapMm,
    rowSpread: style.rowSpread,
    fontScale: style.fontScale,
    fontScaleQn: style.fontScaleQn,
    fontScaleNom: style.fontScaleNom,
    fontFamilyQn: style.fontQn,
    fontFamilyNom: style.fontNom,
    fillColor: style.fillColor,
  };
}

/** Icon căn lề kiểu Word (3 gạch ngang). */
function AlignIcon({ align }: { align: TextAlign }) {
  const d =
    align === 'left'
      ? 'M2 3h12v1.5H2zm0 4h8v1.5H2zm0 4h12v1.5H2z'
      : align === 'right'
        ? 'M2 3h12v1.5H2zm4 4h8v1.5H6zm-4 4h12v1.5H2z'
        : 'M2 3h12v1.5H2zm2 4h8v1.5H4zm-2 4h12v1.5H2z';
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
      <path fill="currentColor" d={d} />
    </svg>
  );
}

/** Nền sáng + chữ mực; khi bật dùng nền mist (tránh text-white bị lộ trên bg-paper). */
const TOOL_BTN =
  'h-8 min-w-8 px-2 inline-flex items-center justify-center text-xs text-ink border-r border-fog last:border-r-0 hover:bg-mist/80';
const TOOL_BTN_OFF = 'bg-paper';
const TOOL_BTN_ON = 'bg-mist text-ink font-semibold shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)]';

/** Ô song ngữ: Quốc ngữ bên trái — Nôm bên phải (không chồng tọa độ). */
function BilingualCell({
  charQn,
  charNom,
  fontQn,
  fontNom,
  sizeQnPt,
  sizeNomPt,
  color,
  gapMm,
  bold,
  italic,
  align = 'center',
}: {
  charQn: string;
  charNom: string;
  fontQn: string;
  fontNom: string;
  sizeQnPt: number;
  sizeNomPt: number;
  color: string;
  gapMm: number;
  bold?: boolean;
  italic?: boolean;
  align?: TextAlign;
}) {
  const weight = bold ? 700 : 400;
  const fstyle = italic ? 'italic' : 'normal';
  const justify =
    align === 'left'
      ? 'flex-start'
      : align === 'right'
        ? 'flex-end'
        : 'center';
  return (
    <span
      style={{
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: justify,
        width: '100%',
        gap: `${Math.max(0, gapMm)}mm`,
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          fontFamily: `'${fontQn}', 'Times New Roman', serif`,
          fontSize: `${sizeQnPt}pt`,
          fontWeight: weight,
          fontStyle: fstyle,
          color,
          lineHeight: 1,
          transform: 'scale(0.92)',
          transformOrigin: 'center right',
        }}
      >
        {charQn}
      </span>
      <span
        style={{
          display: 'inline-block',
          fontFamily: `'${fontNom}', 'Han-Nom Kai', serif`,
          fontSize: `${sizeNomPt}pt`,
          fontWeight: weight,
          fontStyle: fstyle,
          color,
          lineHeight: 1,
        }}
      >
        {charNom}
      </span>
    </span>
  );
}

export function SoPreview({
  household,
  members,
  ancestors,
  longsoId,
  tenSo,
  paperSize,
}: Props) {
  const [layout, setLayout] = useState<SoPageLayout | null>(null);
  const [lang, setLang] = useState<SoLang>('songngu');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewScale, setViewScale] = useState(1);
  const [style, setStyle] = useState<PrintStyle>(DEFAULT_STYLE);
  /** Ghi đè từng ô (chữ + kiểu) — giữ khi đổi style layout, xóa khi đổi hộ/lòng sớ */
  const [cellOverrides, setCellOverrides] = useState<
    Record<string, CellOverride>
  >({});
  /** Các ô đang chọn (Ctrl/Cmd+bấm để chọn nhiều) */
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [editValue, setEditValue] = useState('');
  const viewportRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const contentGenRef = useRef('');

  useEffect(() => {
    setStyle(loadStyle());
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STYLE_STORAGE_KEY, JSON.stringify(style));
    } catch {
      /* ignore */
    }
  }, [style]);

  const fillKey = useMemo(
    () =>
      JSON.stringify({
        h: household.id,
        u: household.updated_at,
        m: members.map((x) => [x.id, x.updated_at, x.print_selected]),
        a: ancestors.map((x) => [x.id, x.updated_at, x.print_selected]),
        tenSo,
      }),
    [household, members, ancestors, tenSo],
  );

  const styleKey = useMemo(
    () =>
      JSON.stringify({
        fontScaleQn: style.fontScaleQn,
        fontScaleNom: style.fontScaleNom,
        qnNomGapMm: style.qnNomGapMm,
        colGapMm: style.colGapMm,
        rowSpread: style.rowSpread,
        fontQn: style.fontQn,
        fontNom: style.fontNom,
        fillColor: style.fillColor,
      }),
    [style],
  );

  // Đổi nội dung gốc → bỏ chỉnh tay
  useEffect(() => {
    const gen = `${longsoId}|${paperSize}|${fillKey}`;
    if (contentGenRef.current && contentGenRef.current !== gen) {
      setCellOverrides({});
      setSelectedKeys([]);
      setEditValue('');
    }
    contentGenRef.current = gen;
  }, [longsoId, paperSize, fillKey]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);
    (async () => {
      try {
        const file = await loadSoTemplate(longsoId);
        const paper =
          file.template[paperSize] ??
          file.template.A3 ??
          Object.values(file.template)[0];
        if (!paper) throw new Error('Lòng sớ không có template khổ giấy này.');

        const fillData = buildSoFillData({
          household,
          members,
          ancestors,
          tenSo,
          lang: file.lang,
        });
        const cells = fillPlaceholders(paper, fillData, file.lang);
        const page = layoutSoPage(
          cells,
          paper,
          paperSize,
          file.lang,
          toLayoutOptions(style),
        );
        if (!cancelled) {
          setLang(file.lang);
          setLayout(page);
        }
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : 'Không tải được lòng sớ.');
          setLayout(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [longsoId, paperSize, fillKey, styleKey]);

  const displayLayout = useMemo(
    () => (layout ? applyCellOverrides(layout, cellOverrides) : null),
    [layout, cellOverrides],
  );

  const dims = PAPER_MM[paperSize];
  const widthPx = (displayLayout?.widthMm ?? dims.w) * MM_TO_PX;
  const heightPx = (displayLayout?.heightMm ?? dims.h) * MM_TO_PX;
  const editCount = Object.keys(cellOverrides).length;
  const selectedSet = useMemo(() => new Set(selectedKeys), [selectedKeys]);
  const singleKey = selectedKeys.length === 1 ? selectedKeys[0]! : null;
  const selectionOverride = useMemo((): CellOverride => {
    if (selectedKeys.length === 0) return {};
    const first = cellOverrides[selectedKeys[0]!] ?? {};
    if (selectedKeys.length === 1) return first;
    // Chỉ giữ thuộc tính giống nhau giữa các ô đã chọn
    const merged: CellOverride = { ...first };
    for (const k of selectedKeys.slice(1)) {
      const o = cellOverrides[k] ?? {};
      (Object.keys(merged) as (keyof CellOverride)[]).forEach((key) => {
        if (merged[key] !== o[key]) delete merged[key];
      });
    }
    return merged;
  }, [selectedKeys, cellOverrides]);

  useEffect(() => {
    function updateScale() {
      const el = viewportRef.current;
      if (!el || !displayLayout) return;
      const avail = el.clientWidth;
      const s = avail > 0 && widthPx > 0 ? avail / widthPx : 1;
      setViewScale(s);
    }
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [displayLayout, widthPx]);

  useEffect(() => {
    if (singleKey) {
      editInputRef.current?.focus();
    }
  }, [singleKey]);

  function printPage() {
    window.print();
  }

  function nudge(dx: number, dy: number) {
    setStyle((f) => ({
      ...f,
      ox: clamp(f.ox + dx, -80, 80),
      oy: clamp(f.oy + dy, -80, 80),
    }));
  }

  /** Ước bề rộng ô (mm) — song ngữ = QN + khoảng + Nôm. */
  function estimateGlyphWidthMm(cell: {
    side: string;
    char: string;
    charQn?: string;
    fontSizePt: number;
    fontSizePtQn?: number;
  }): number {
    const nomPt = cell.fontSizePt;
    const qnPt = cell.fontSizePtQn ?? nomPt * 0.5;
    if (cell.side === 'both' && cell.charQn?.trim()) {
      const qnW = Math.max(2.5, cell.charQn.length * qnPt * 0.2);
      const nomW = Math.max(3, nomPt * 0.36);
      return qnW + style.qnNomGapMm + nomW;
    }
    if (cell.side === 'qn') {
      return Math.max(4, Math.max(1, cell.char.trim().length) * nomPt * 0.2);
    }
    return Math.max(3.5, nomPt * 0.38);
  }

  /** Căn tâm cụm chữ vào giữa khổ giấy (theo bounding box các ô có chữ). */
  function centerClusterOnPaper() {
    if (!displayLayout || displayLayout.html) return;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    let found = false;

    for (const col of displayLayout.columns) {
      for (const cell of col.cells) {
        const has =
          Boolean(cell.char.trim()) || Boolean(cell.charQn?.trim());
        if (!has) continue;
        found = true;
        const glyphWMm = estimateGlyphWidthMm(cell);
        const glyphHMm = Math.max(3, cell.fontSizePt * 0.35);
        // Nút neo mép trái tại col.xMm; chữ song ngữ xếp ngang từ đó
        minX = Math.min(minX, col.xMm);
        maxX = Math.max(maxX, col.xMm + glyphWMm);
        minY = Math.min(minY, cell.yMm);
        maxY = Math.max(maxY, cell.yMm + glyphHMm);
      }
    }
    if (!found) return;

    const clusterCx = (minX + maxX) / 2;
    const clusterCy = (minY + maxY) / 2;
    const paperCx = displayLayout.widthMm / 2;
    const paperCy = displayLayout.heightMm / 2;
    // transform: translate() scale() · origin center → T = (C - Cc) * s
    const s = style.scale;
    setStyle((f) => ({
      ...f,
      ox: clamp((paperCx - clusterCx) * s, -80, 80),
      oy: clamp((paperCy - clusterCy) * s, -80, 80),
    }));
  }

  function selectCell(
    ci: number,
    ri: number,
    current: string,
    e: MouseEvent,
  ) {
    const k = cellKey(ci, ri);
    if (e.ctrlKey || e.metaKey) {
      setSelectedKeys((prev) => {
        const next = prev.includes(k)
          ? prev.filter((x) => x !== k)
          : [...prev, k];
        if (next.length === 1) {
          const pos = parseCellKey(next[0]!);
          const cell = displayLayout?.columns[pos.ci]?.cells[pos.ri];
          if (cell) setEditValue(cellTextSeed(cell));
        }
        return next;
      });
    } else {
      setSelectedKeys([k]);
      setEditValue(current === ' ' ? '' : current);
    }
  }

  function patchSelected(patch: Partial<CellOverride>) {
    if (selectedKeys.length === 0) return;
    setCellOverrides((prev) => {
      const next = { ...prev };
      for (const k of selectedKeys) {
        const merged: CellOverride = { ...next[k], ...patch };
        for (const [key, val] of Object.entries(patch)) {
          if (val === undefined) delete merged[key as keyof CellOverride];
        }
        if (Object.keys(merged).length === 0) delete next[k];
        else next[k] = merged;
      }
      return next;
    });
  }

  function commitText() {
    if (!singleKey) return;
    const next = editValue.trim() === '' ? ' ' : editValue;
    patchSelected({ text: next });
  }

  function clearSelectedOverrides() {
    if (selectedKeys.length === 0) return;
    setCellOverrides((prev) => {
      const next = { ...prev };
      for (const k of selectedKeys) delete next[k];
      return next;
    });
  }

  function resetEdits() {
    setCellOverrides({});
    setSelectedKeys([]);
    setEditValue('');
  }

  const contentTransform = `translate(${style.ox * MM_TO_PX}px, ${style.oy * MM_TO_PX}px) scale(${style.scale})`;
  const isQn = lang === 'qn';
  const sizePct = Math.round((selectionOverride.sizeScale ?? 1) * 100);

  const labelCls = 'block text-xs text-muted mb-1';
  const rangeCls = 'w-full accent-ink';

  return (
    <div className="space-y-4">
      <link rel="stylesheet" href="/fonts/so/so-fonts.css" />
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <button
          type="button"
          onClick={printPage}
          disabled={!displayLayout}
          className="px-4 py-2 bg-ink text-white text-sm disabled:opacity-50"
        >
          In sớ này
        </button>
        <span className="text-sm text-muted">
          {tenSo} · {paperSize} ngang ({dims.w}×{dims.h} mm) · {household.chu_ho}
          {isQn ? ' · Quốc ngữ' : ''}
        </span>
        {editCount > 0 ? (
          <button
            type="button"
            onClick={resetEdits}
            className="px-3 py-1.5 text-sm border border-fog hover:bg-mist"
          >
            Bỏ {editCount} chỗ sửa tay
          </button>
        ) : null}
      </div>

      {/* Tầng 2 · Cài đặt chung */}
      <div className="print:hidden space-y-3 border border-fog bg-paper p-3 text-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[10rem] flex-1">
            <label className={labelCls}>
              Co lòng sớ ({Math.round(style.scale * 100)}%)
            </label>
            <input
              type="range"
              min={75}
              max={100}
              step={1}
              value={Math.round(style.scale * 100)}
              onChange={(e) =>
                setStyle((f) => ({
                  ...f,
                  scale: Number(e.target.value) / 100,
                }))
              }
              className={rangeCls}
            />
          </div>
          {lang !== 'nom' ? (
            <div className="min-w-[10rem] flex-1">
              <label className={labelCls}>
                Cỡ chữ Quốc ngữ ({Math.round(style.fontScaleQn * 100)}%)
              </label>
              <input
                type="range"
                min={35}
                max={130}
                step={1}
                value={Math.round(style.fontScaleQn * 100)}
                onChange={(e) =>
                  setStyle((f) => ({
                    ...f,
                    fontScaleQn: Number(e.target.value) / 100,
                    fontScale: Number(e.target.value) / 100,
                  }))
                }
                className={rangeCls}
              />
            </div>
          ) : null}
          {lang !== 'qn' ? (
            <div className="min-w-[10rem] flex-1">
              <label className={labelCls}>
                Cỡ chữ Hán/Nôm ({Math.round(style.fontScaleNom * 100)}%)
              </label>
              <input
                type="range"
                min={35}
                max={130}
                step={1}
                value={Math.round(style.fontScaleNom * 100)}
                onChange={(e) =>
                  setStyle((f) => ({
                    ...f,
                    fontScaleNom: Number(e.target.value) / 100,
                    fontScale: Number(e.target.value) / 100,
                  }))
                }
                className={rangeCls}
              />
            </div>
          ) : null}
          {lang === 'songngu' ? (
            <div className="min-w-[10rem] flex-1">
              <label className={labelCls}>
                Khoảng QN – Nôm ({style.qnNomGapMm.toFixed(1)} mm)
              </label>
              <input
                type="range"
                min={0}
                max={6}
                step={0.1}
                value={style.qnNomGapMm}
                onChange={(e) =>
                  setStyle((f) => ({
                    ...f,
                    qnNomGapMm: Number(e.target.value),
                  }))
                }
                className={rangeCls}
              />
            </div>
          ) : null}
          <div className="min-w-[10rem] flex-1">
            <label className={labelCls}>
              Khoảng cách cột (+{style.colGapMm.toFixed(1)} mm)
            </label>
            <input
              type="range"
              min={0}
              max={6}
              step={0.1}
              value={style.colGapMm}
              onChange={(e) =>
                setStyle((f) => ({
                  ...f,
                  colGapMm: Number(e.target.value),
                }))
              }
              className={rangeCls}
            />
          </div>
          <div className="min-w-[10rem] flex-1">
            <label className={labelCls}>
              Khoảng chữ dọc ({Math.round(style.rowSpread * 100)}%)
            </label>
            <input
              type="range"
              min={75}
              max={130}
              step={1}
              value={Math.round(style.rowSpread * 100)}
              onChange={(e) =>
                setStyle((f) => ({
                  ...f,
                  rowSpread: Number(e.target.value) / 100,
                }))
              }
              className={rangeCls}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className={labelCls}>Căn chữ</label>
            <div className="flex border border-fog overflow-hidden h-8">
              {(
                [
                  { v: 'left' as const, title: 'Căn trái' },
                  { v: 'center' as const, title: 'Căn giữa' },
                  { v: 'right' as const, title: 'Căn phải' },
                ] as const
              ).map(({ v, title }) => (
                <button
                  key={v}
                  type="button"
                  title={title}
                  className={`${TOOL_BTN} ${
                    style.textAlign === v ? TOOL_BTN_ON : TOOL_BTN_OFF
                  }`}
                  onClick={() => setStyle((f) => ({ ...f, textAlign: v }))}
                >
                  <AlignIcon align={v} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Font Quốc ngữ</label>
            <select
              className="h-8 px-2 border border-fog bg-paper min-w-[10rem] max-w-[14rem] text-xs"
              value={style.fontQn}
              onChange={(e) =>
                setStyle((f) => ({ ...f, fontQn: e.target.value }))
              }
            >
              {FONT_QN_GROUPS.map((g) => (
                <optgroup key={g.label} label={g.label}>
                  {g.fonts.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Font Hán/Nôm</label>
            <select
              className="h-8 px-2 border border-fog bg-paper min-w-[10rem] max-w-[14rem] text-xs"
              value={style.fontNom}
              onChange={(e) =>
                setStyle((f) => ({ ...f, fontNom: e.target.value }))
              }
            >
              {FONT_NOM_GROUPS.map((g) => (
                <optgroup key={g.label} label={g.label}>
                  {g.fonts.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Màu tên / nội dung điền</label>
            <div className="flex items-center gap-2 h-8">
              <input
                type="color"
                value={style.fillColor}
                onChange={(e) =>
                  setStyle((f) => ({ ...f, fillColor: e.target.value }))
                }
                className="h-8 w-10 border border-fog bg-paper cursor-pointer"
              />
              <span className="text-xs tabular-nums text-muted">
                {style.fillColor}
              </span>
            </div>
          </div>
          <div>
            <span className={labelCls}>
              Dịch vị trí{' '}
              <span className="tabular-nums font-normal">
                ({style.ox > 0 ? '+' : ''}
                {style.ox.toFixed(0)}/{style.oy > 0 ? '+' : ''}
                {style.oy.toFixed(0)} mm)
              </span>
            </span>
            <div className="grid grid-cols-3 gap-0.5 w-[6.5rem]">
              <span />
              <button
                type="button"
                className="h-7 border border-fog hover:bg-mist text-xs"
                onClick={() => nudge(0, -2)}
              >
                ↑
              </button>
              <span />
              <button
                type="button"
                className="h-7 border border-fog hover:bg-mist text-xs"
                onClick={() => nudge(-2, 0)}
              >
                ←
              </button>
              <button
                type="button"
                className="h-7 border border-fog hover:bg-mist text-xs"
                onClick={() => setStyle((f) => ({ ...f, ox: 0, oy: 0 }))}
                title="Đưa lệch về 0"
              >
                ·
              </button>
              <button
                type="button"
                className="h-7 border border-fog hover:bg-mist text-xs"
                onClick={() => nudge(2, 0)}
              >
                →
              </button>
              <span />
              <button
                type="button"
                className="h-7 border border-fog hover:bg-mist text-xs"
                onClick={() => nudge(0, 2)}
              >
                ↓
              </button>
              <span />
            </div>
          </div>
          <div className="ml-auto flex items-end gap-2 self-end">
            <button
              type="button"
              className="h-8 px-3 border border-fog text-xs hover:bg-mist disabled:opacity-40"
              onClick={centerClusterOnPaper}
              disabled={!displayLayout || Boolean(displayLayout.html)}
            >
              Căn giữa khổ giấy
            </button>
            <button
              type="button"
              className="h-8 px-3 border border-fog text-xs text-muted hover:bg-mist hover:text-ink"
              onClick={() => setStyle(DEFAULT_STYLE)}
            >
              Đặt lại mặc định
            </button>
          </div>
        </div>
        <p className="text-[11px] text-muted/80 leading-relaxed">
          {displayLayout?.html
            ? 'Lòng sớ HTML hiện đại chưa hỗ trợ sửa từng chữ trên preview.'
            : 'Bấm chữ trên sớ để chỉnh · Ctrl/Cmd+bấm chọn nhiều · Song ngữ: Quốc ngữ|Nôm.'}
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Đang tải lòng sớ…</p>
      ) : null}
      {err ? <p className="text-sm text-lacquer">{err}</p> : null}

      {/* Tầng 3 · Toolbar ngữ cảnh (sticky, sát tờ sớ) */}
      {selectedKeys.length > 0 ? (
        <div className="print:hidden sticky top-0 z-20 mb-2 flex flex-wrap items-center gap-1.5 border border-fog bg-paper shadow-sm text-xs px-1.5 py-1.5">
          {singleKey ? (
            <div className="flex items-center h-8 border border-fog overflow-hidden rounded-sm">
              <input
                ref={editInputRef}
                className="h-8 px-1.5 border-0 bg-transparent text-xs focus:outline-none focus:bg-mist min-w-[8ch] max-w-[16rem]"
                style={{
                  width: `${Math.max((editValue || 'QN|Nôm').length + 5, 10)}ch`,
                }}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    commitText();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    setSelectedKeys([]);
                    setEditValue('');
                  }
                }}
                placeholder="QN|Nôm"
                title="Nội dung (Enter để áp)"
              />
              <button
                type="button"
                title="Áp chữ (Enter)"
                className={`${TOOL_BTN} ${TOOL_BTN_OFF} border-l border-fog`}
                onClick={commitText}
              >
                ✓
              </button>
            </div>
          ) : null}

          <select
            className="h-8 px-1.5 max-w-[8.5rem] text-xs border border-fog rounded-sm bg-paper"
            value={selectionOverride.fontFamily ?? ''}
            title="Font Hán/Nôm"
            onChange={(e) =>
              patchSelected(
                e.target.value
                  ? { fontFamily: e.target.value }
                  : { fontFamily: undefined },
              )
            }
          >
            <option value="">Font Hán/Nôm</option>
            {FONT_NOM_GROUPS.map((g) => (
              <optgroup key={g.label} label={g.label}>
                {g.fonts.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </optgroup>
            ))}
            {FONT_QN_GROUPS.map((g) => (
              <optgroup key={`qn-${g.label}`} label={`QN · ${g.label}`}>
                {g.fonts.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {lang === 'songngu' ? (
            <select
              className="h-8 px-1.5 max-w-[8.5rem] text-xs border border-fog rounded-sm bg-paper"
              value={selectionOverride.fontFamilyQn ?? ''}
              title="Font Quốc ngữ"
              onChange={(e) =>
                patchSelected(
                  e.target.value
                    ? { fontFamilyQn: e.target.value }
                    : { fontFamilyQn: undefined },
                )
              }
            >
              <option value="">Font Quốc ngữ</option>
              {FONT_QN_GROUPS.map((g) => (
                <optgroup key={g.label} label={g.label}>
                  {g.fonts.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          ) : null}

          <label
            className="flex items-center gap-1.5 px-2 h-8 border border-fog rounded-sm text-ink whitespace-nowrap"
            title="Cỡ chữ"
          >
            <span className="tabular-nums min-w-[2.5rem] text-right">{sizePct}%</span>
            <input
              type="range"
              min={70}
              max={220}
              step={5}
              value={sizePct}
              onChange={(e) =>
                patchSelected({ sizeScale: Number(e.target.value) / 100 })
              }
              className="w-24 accent-ink cursor-pointer"
            />
          </label>

          <div className="flex items-center h-8 border border-fog overflow-hidden rounded-sm">
            <button
              type="button"
              title="Bold — Đậm (B)"
              className={`${TOOL_BTN} font-bold ${
                selectionOverride.bold ? TOOL_BTN_ON : TOOL_BTN_OFF
              }`}
              onClick={() =>
                patchSelected({ bold: !selectionOverride.bold })
              }
            >
              B
            </button>
            <button
              type="button"
              title="Italic — Nghiêng (I)"
              className={`${TOOL_BTN} italic ${
                selectionOverride.italic ? TOOL_BTN_ON : TOOL_BTN_OFF
              }`}
              onClick={() =>
                patchSelected({ italic: !selectionOverride.italic })
              }
            >
              I
            </button>
          </div>

          <div className="flex items-center h-8 border border-fog overflow-hidden rounded-sm">
            {(
              [
                { v: 'left' as const, title: 'Align left' },
                { v: 'center' as const, title: 'Align center' },
                { v: 'right' as const, title: 'Align right' },
              ] as const
            ).map(({ v, title }) => {
              const active =
                (selectionOverride.textAlign ?? style.textAlign) === v;
              return (
                <button
                  key={v}
                  type="button"
                  title={title}
                  className={`${TOOL_BTN} ${
                    active ? TOOL_BTN_ON : TOOL_BTN_OFF
                  }`}
                  onClick={() => patchSelected({ textAlign: v })}
                >
                  <AlignIcon align={v} />
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 px-2 h-8 border border-fog rounded-sm">
            <input
              type="color"
              value={selectionOverride.color || '#000000'}
              title="Màu chữ"
              onChange={(e) => patchSelected({ color: e.target.value })}
              className="h-6 w-6 border border-fog bg-paper cursor-pointer p-0"
            />
            <button
              type="button"
              title="Đỏ điền"
              className="w-5 h-5 border border-fog"
              style={{ background: '#c41e3a' }}
              onClick={() => patchSelected({ color: '#c41e3a' })}
            />
            <button
              type="button"
              title="Đen"
              className="w-5 h-5 border border-fog bg-black"
              onClick={() => patchSelected({ color: '#000000' })}
            />
          </div>

          <div className="flex items-center gap-1.5 ml-auto h-8">
            <span className="text-muted whitespace-nowrap tabular-nums px-1">
              {selectedKeys.length} ô
            </span>
            <button
              type="button"
              className="h-7 px-2 border border-fog rounded-sm hover:bg-mist whitespace-nowrap"
              onClick={clearSelectedOverrides}
            >
              Xóa kiểu
            </button>
            <button
              type="button"
              title="Bỏ chọn"
              className="ml-1 inline-flex items-center justify-center rounded-sm border-0 shrink-0 aspect-square"
              style={{
                width: 28,
                height: 28,
                padding: 6,
                backgroundColor: '#c41e3a',
                color: '#ffffff',
                fontSize: 11,
                fontWeight: 600,
                lineHeight: 1,
                boxSizing: 'border-box',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#a81830';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#c41e3a';
              }}
              onClick={() => {
                setSelectedKeys([]);
                setEditValue('');
              }}
            >
              ✕
            </button>
          </div>
        </div>
      ) : null}

      {displayLayout ? (
        <div
          ref={viewportRef}
          className="so-print-viewport w-full overflow-hidden border-2 border-[#e8a0a0] bg-[#f7e7a3] p-0 print:border-0 print:bg-transparent print:p-0 print:m-0 print:overflow-visible"
        >
          <div
            className="so-print-scaler w-full print:m-0 print:p-0"
            style={{
              width: '100%',
              height: heightPx * viewScale,
            }}
          >
            <div
              className="so-page relative bg-[#f7e7a3] origin-top-left print:bg-transparent print:shadow-none"
              style={{
                width: widthPx,
                height: heightPx,
                transform: `scale(${viewScale})`,
              }}
            >
              <div
                className="so-page-content absolute inset-0 origin-center"
                style={{ transform: contentTransform }}
              >
                {displayLayout.html ? (
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{
                      transform: `scale(${widthPx / (displayLayout.htmlWidthPx || widthPx)}, ${heightPx / (displayLayout.htmlHeightPx || heightPx)})`,
                      transformOrigin: 'top left',
                      width: displayLayout.htmlWidthPx,
                      height: displayLayout.htmlHeightPx,
                    }}
                    dangerouslySetInnerHTML={{ __html: displayLayout.html }}
                  />
                ) : (
                  displayLayout.columns.map((col, ci) =>
                    col.cells.map((cell, ri) => {
                      const bilingual =
                        cell.side === 'both' && Boolean(cell.charQn?.trim());
                      const qnSide = cell.side === 'qn';
                      const boxEm = bilingual ? 4.8 : qnSide ? 3.4 : 1.45;
                      const k = cellKey(ci, ri);
                      const selected = selectedSet.has(k);
                      const edited = k in cellOverrides;
                      const editSeed = cellTextSeed(cell);
                      return (
                        <button
                          key={k}
                          type="button"
                          title={
                            bilingual
                              ? 'Chọn ô — Ctrl+bấm chọn nhiều · Song ngữ: QN|Nôm'
                              : 'Chọn ô để sửa chữ / kiểu · Ctrl+bấm chọn nhiều'
                          }
                          onClick={(e) => selectCell(ci, ri, editSeed, e)}
                          className={`absolute leading-none whitespace-nowrap print:pointer-events-none ${
                            selected
                              ? 'ring-2 ring-lacquer ring-offset-1 z-10'
                              : edited
                                ? 'ring-1 ring-[#c41e3a]/40'
                                : 'hover:ring-1 hover:ring-ink/30'
                          }`}
                          style={{
                            left: col.xMm * MM_TO_PX,
                            top: cell.yMm * MM_TO_PX,
                            fontFamily: bilingual
                              ? undefined
                              : `'${cell.fontFamily}', ${
                                  qnSide
                                    ? "'Times New Roman', serif"
                                    : "'Han-Nom Kai', serif"
                                }`,
                            fontSize: bilingual
                              ? undefined
                              : `${cell.fontSizePt}pt`,
                            fontWeight: cell.bold ? 700 : 400,
                            fontStyle: cell.italic ? 'italic' : 'normal',
                            color: cell.color,
                            width: `${boxEm}em`,
                            textAlign: cell.textAlign ?? style.textAlign,
                            background: 'transparent',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                          }}
                        >
                          {bilingual ? (
                            <BilingualCell
                              charQn={cell.charQn!}
                              charNom={cell.char}
                              fontQn={cell.fontFamilyQn || style.fontQn}
                              fontNom={cell.fontFamily}
                              sizeQnPt={
                                cell.fontSizePtQn ?? cell.fontSizePt * 0.48
                              }
                              sizeNomPt={cell.fontSizePt}
                              color={cell.color}
                              gapMm={style.qnNomGapMm}
                              bold={cell.bold}
                              italic={cell.italic}
                              align={cell.textAlign ?? style.textAlign}
                            />
                          ) : (
                            cell.char
                          )}
                        </button>
                      );
                    }),
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <style>{`
        @media print {
          /* Khổ đã là ngang (vd. 420×297) — không thêm landscape kẻo bị đảo → tràn trang 2 */
          @page {
            size: ${dims.w}mm ${dims.h}mm;
            margin: 0;
          }
          html, body {
            width: ${dims.w}mm !important;
            height: ${dims.h}mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            background: transparent !important;
          }
          /* Ẩn hết UI; visibility:hidden vẫn chiếm chỗ → gây trang trắng */
          body * {
            visibility: hidden !important;
          }
          .so-page,
          .so-page * {
            visibility: visible !important;
          }
          .so-print-viewport,
          .so-print-scaler {
            position: static !important;
            width: 0 !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            overflow: visible !important;
            background: transparent !important;
          }
          .so-page {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: ${dims.w}mm !important;
            height: ${dims.h}mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: transparent !important;
            background-color: transparent !important;
            box-shadow: none !important;
            transform: none !important;
            overflow: hidden !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            break-after: avoid !important;
            break-inside: avoid !important;
            -webkit-print-color-adjust: economy;
            print-color-adjust: economy;
          }
          .so-page-content,
          .so-page-content * {
            background: transparent !important;
            background-color: transparent !important;
            box-shadow: none !important;
          }
          .so-page button {
            outline: none !important;
            box-shadow: none !important;
            border: none !important;
            background: transparent !important;
            -webkit-appearance: none;
            appearance: none;
          }
          .so-page-content {
            transform: ${contentTransform} !important;
            transform-origin: center center !important;
          }
        }
      `}</style>
    </div>
  );
}

export function SoPreviewBatch({
  household,
  members,
  ancestors,
  items,
  paperSize,
}: {
  household: SoHousehold;
  members: SoHouseholdMember[];
  ancestors: SoAncestor[];
  items: { longsoId: number; tenSo: string }[];
  paperSize: SoPaperSize;
}) {
  const [idx, setIdx] = useState(0);
  const cur = items[idx];
  if (!cur) {
    return <p className="text-sm text-muted">Chưa chọn lòng sớ.</p>;
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 print:hidden text-sm">
        <button
          type="button"
          disabled={idx <= 0}
          onClick={() => setIdx((i) => i - 1)}
          className="px-3 py-1.5 border border-fog disabled:opacity-40"
        >
          ← Trước
        </button>
        <span>
          Sớ {idx + 1}/{items.length}
        </span>
        <button
          type="button"
          disabled={idx >= items.length - 1}
          onClick={() => setIdx((i) => i + 1)}
          className="px-3 py-1.5 border border-fog disabled:opacity-40"
        >
          Sau →
        </button>
      </div>
      <SoPreview
        key={`${cur.longsoId}-${paperSize}`}
        household={household}
        members={members}
        ancestors={ancestors}
        longsoId={cur.longsoId}
        tenSo={cur.tenSo}
        paperSize={paperSize}
      />
    </div>
  );
}
