'use client';

import type { ChiTuongFeatureId } from '@/lib/fengshui/chi-tuong';

interface Props {
  featureId: ChiTuongFeatureId;
  optionId: string;
  title: string;
  caption: string;
}

/** Khung bàn tay trái (ngửa) — viewBox 0 0 320 380 */
const HAND_OUTLINE =
  'M118 348 C110 320 98 290 92 258 C86 220 84 185 90 152 C78 148 62 138 52 118 C40 92 42 68 58 58 C74 48 94 58 108 78 C112 62 118 42 128 28 C140 10 158 4 172 12 C186 4 204 8 214 24 C224 12 242 10 254 22 C266 34 268 54 260 74 C268 70 282 74 290 90 C300 112 296 138 278 152 C284 185 286 220 280 258 C274 290 262 320 254 348 C230 358 160 358 118 348 Z';

const FINGER_CREASES = [
  // ngón trỏ
  'M128 78 L148 82',
  'M124 108 L150 112',
  // giữa
  'M168 52 L190 56',
  'M164 88 L194 92',
  // áp út
  'M210 58 L232 62',
  'M206 92 L236 96',
  // út
  'M248 78 L266 84',
  'M244 108 L268 114',
  // cái
  'M62 88 L82 98',
  'M58 112 L84 124',
];

/** Các đường nền mờ — luôn hiện để định hướng. */
const FAINT = {
  tamDao: 'M255 148 C230 138 190 132 155 138 C135 142 120 150 112 158',
  triDao: 'M108 168 C140 162 185 168 225 178 C245 184 258 192 268 200',
  sinhDao: 'M108 168 C95 195 92 230 98 265 C104 295 118 320 138 338',
  dinhMenh: 'M178 330 C180 290 182 240 184 195 C185 170 186 155 188 142',
};

type LineKey = 'tamDao' | 'triDao' | 'sinhDao' | 'dinhMenh' | 'honNhan';

/** Biến thể đường Tâm đạo theo lựa chọn. */
const TAM_DAO_PATHS: Record<string, string> = {
  dai_cong_len: 'M255 150 C228 136 188 128 152 136 C132 142 118 152 112 160',
  thang_dai: 'M258 148 L112 152',
  ngan_mo: 'M255 150 C235 142 210 140 185 144',
  chuoi_xich:
    'M255 150 C248 146 242 148 238 152 C232 146 226 146 220 152 C214 146 208 146 202 152 C196 146 190 146 184 152 C178 146 172 146 166 152 C160 146 154 148 150 154',
  nhanh_xuong:
    'M255 150 C228 138 190 132 155 140 C140 145 128 155 118 168 M155 140 C150 155 148 170 152 185',
};

/** Biến thể đường Trí đạo. */
const TRI_DAO_PATHS: Record<string, string> = {
  ro_dai_hoi_cong: 'M108 168 C145 160 190 166 235 180 C250 186 262 196 270 208',
  thang_dai: 'M108 172 L268 178',
  doc_thai_am: 'M108 168 C150 162 195 175 235 205 C250 220 258 240 262 258',
  ngan: 'M108 168 C140 162 170 164 195 170',
  dut_dao:
    'M108 168 C130 162 150 164 165 168 M180 170 C200 174 220 180 235 188 M195 168 C198 175 196 182 192 188 C200 182 208 182 212 188',
};

/** Biến thể đường Sinh đạo. */
const SINH_DAO_PATHS: Record<string, string> = {
  vong_rong_sau: 'M108 168 C88 200 82 245 92 290 C100 320 122 345 152 355',
  trung_binh: 'M108 168 C95 195 92 230 98 265 C104 295 118 320 138 338',
  sat_ngon_cai: 'M108 168 C100 190 98 215 102 245 C106 270 115 295 128 315',
  dut_mo:
    'M108 168 C98 190 94 210 96 228 M102 245 C104 270 112 295 128 318 M98 232 C100 238 104 242 108 244',
};

/** Biến thể Định Mệnh. */
const DINH_MENH_PATHS: Record<string, string | null> = {
  ro_thang: 'M178 330 C180 285 182 230 184 185 C185 160 186 145 188 138',
  mo_nhat: 'M178 325 C180 280 182 230 184 190',
  nhieu_doan:
    'M178 330 C180 305 181 285 182 268 M186 250 C188 230 190 210 188 190 M192 175 C185 165 178 155 185 145',
  khong_co: null,
};

/** Biến thể Hôn Nhân — nhóm vạch ngắn mé ngoài. */
const HON_NHAN_MARKS: Record<string, string[]> = {
  mot_sau_ro: ['M268 128 L292 128'],
  hai_ba_ro: ['M268 118 L290 118', 'M268 128 L292 128', 'M268 138 L288 138'],
  nhieu_mo: [
    'M270 114 L286 114',
    'M270 120 L284 120',
    'M270 126 L288 126',
    'M270 132 L282 132',
    'M270 138 L286 138',
  ],
  che_nhanh: ['M268 128 L292 128 M285 128 L292 140', 'M268 138 L286 138'],
};

/** Gò — tâm + bán kính elip. */
const MOUNTS: Record<
  string,
  { cx: number; cy: number; rx: number; ry: number } | 'all' | null
> = {
  kim_tinh: { cx: 125, cy: 250, rx: 42, ry: 55 },
  moc_tinh: { cx: 145, cy: 155, rx: 28, ry: 22 },
  tho_tinh: { cx: 185, cy: 145, rx: 28, ry: 22 },
  thai_duong: { cx: 225, cy: 150, rx: 26, ry: 20 },
  thuy_tinh: { cx: 255, cy: 165, rx: 24, ry: 20 },
  thai_am: { cx: 245, cy: 280, rx: 32, ry: 40 },
  bang_phang: 'all',
};

const ALL_MOUNTS = [
  MOUNTS.kim_tinh,
  MOUNTS.moc_tinh,
  MOUNTS.tho_tinh,
  MOUNTS.thai_duong,
  MOUNTS.thuy_tinh,
  MOUNTS.thai_am,
].filter((m): m is { cx: number; cy: number; rx: number; ry: number } => !!m && m !== 'all');

/** Ngón cái — biến thể độ dài / độ cứng (góc nghiêng). */
function thumbTransform(optionId: string): string {
  switch (optionId) {
    case 'dai_cung':
      return 'rotate(-8 70 140) translate(-4 -6) scale(1.08)';
    case 'ngan_mem':
      return 'rotate(18 70 140) translate(2 4) scale(0.9)';
    default:
      return '';
  }
}

/** Thủ hình ngũ hành — scale lòng tay / ngón. */
function handTransform(optionId: string): string {
  switch (optionId) {
    case 'kim':
      return 'translate(160 200) scale(1.08 0.9) translate(-160 -200)';
    case 'moc':
      return 'translate(160 200) scale(0.88 1.14) translate(-160 -200)';
    case 'thuy':
      return 'translate(160 200) scale(1.05 1.0) translate(-160 -200)';
    case 'hoa':
      return 'translate(160 185) scale(0.94 1.1) translate(-160 -185)';
    case 'tho':
      return 'translate(160 215) scale(1.14 0.84) translate(-160 -215)';
    default:
      return '';
  }
}

/** Gợi ý đầu ngón theo thủ hình — giúp phân biệt vuông / nhọn / tròn. */
function FingerTipHints({ optionId }: { optionId: string }) {
  const tips = [
    { x: 138, y: 22 },
    { x: 180, y: 10 },
    { x: 222, y: 16 },
    { x: 258, y: 36 },
  ];
  if (optionId === 'kim') {
    return (
      <g stroke="#7c5cbf" strokeWidth="2" opacity="0.9">
        {tips.map((t) => (
          <line key={t.x} x1={t.x - 8} y1={t.y} x2={t.x + 8} y2={t.y} strokeLinecap="square" />
        ))}
      </g>
    );
  }
  if (optionId === 'hoa') {
    return (
      <g fill="#7c5cbf" opacity="0.9">
        {tips.map((t) => (
          <polygon
            key={t.x}
            points={`${t.x},${t.y - 8} ${t.x + 5},${t.y + 2} ${t.x - 5},${t.y + 2}`}
          />
        ))}
      </g>
    );
  }
  if (optionId === 'thuy') {
    return (
      <g fill="none" stroke="#7c5cbf" strokeWidth="2" opacity="0.85">
        {tips.map((t) => (
          <circle key={t.x} cx={t.x} cy={t.y} r="5" />
        ))}
      </g>
    );
  }
  if (optionId === 'moc') {
    return (
      <g stroke="#7c5cbf" strokeWidth="1.8" opacity="0.85">
        {FINGER_CREASES.slice(0, 8).map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    );
  }
  if (optionId === 'tho') {
    return (
      <g fill="#c4a0e8" opacity="0.35" stroke="#7c5cbf" strokeWidth="1.5">
        <ellipse cx="175" cy="230" rx="55" ry="70" />
      </g>
    );
  }
  return null;
}

function GlowPath({
  d,
  dashed,
  faint,
}: {
  d: string;
  dashed?: boolean;
  faint?: boolean;
}) {
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke="#c4a0e8"
        strokeWidth={faint ? 6 : 10}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={faint ? 0.25 : 0.35}
        strokeDasharray={dashed ? '3 5' : undefined}
      />
      <path
        d={d}
        fill="none"
        stroke="#7c5cbf"
        strokeWidth={faint ? 2 : 3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={faint ? 0.55 : 1}
        strokeDasharray={dashed ? '3 5' : undefined}
      />
    </g>
  );
}

function CelestialFrame() {
  return (
    <g fill="none" stroke="#2a3344" strokeWidth="0.8" opacity="0.55">
      <circle cx="160" cy="190" r="168" strokeDasharray="2 6" />
      <circle cx="160" cy="190" r="155" />
      <circle cx="160" cy="190" r="142" strokeDasharray="1 4" />
      {/* mặt trăng */}
      <path d="M158 28 C152 34 152 44 160 48 C154 42 154 34 158 28 Z" fill="#2a3344" stroke="none" />
      {/* mặt trời */}
      <circle cx="160" cy="352" r="3.5" fill="#2a3344" stroke="none" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const r = Math.PI * (deg / 180);
        const x1 = 160 + Math.cos(r) * 7;
        const y1 = 352 + Math.sin(r) * 7;
        const x2 = 160 + Math.cos(r) * 11;
        const y2 = 352 + Math.sin(r) * 11;
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="1" />;
      })}
      {/* sao */}
      {[
        [48, 100],
        [272, 90],
        [40, 240],
        [285, 250],
        [70, 50],
        [250, 320],
      ].map(([x, y], i) => (
        <path
          key={i}
          d={`M${x} ${y - 4} L${x + 1.2} ${y - 1.2} L${x + 4} ${y} L${x + 1.2} ${y + 1.2} L${x} ${y + 4} L${x - 1.2} ${y + 1.2} L${x - 4} ${y} L${x - 1.2} ${y - 1.2} Z`}
          fill="#2a3344"
          stroke="none"
          opacity={0.7}
        />
      ))}
    </g>
  );
}

function ActiveHighlight({
  featureId,
  optionId,
}: {
  featureId: ChiTuongFeatureId;
  optionId: string;
}) {
  if (featureId === 'tamDao') {
    const d = TAM_DAO_PATHS[optionId] ?? TAM_DAO_PATHS.dai_cong_len;
    return <GlowPath d={d} dashed={optionId === 'ngan_mo'} />;
  }
  if (featureId === 'triDao') {
    const d = TRI_DAO_PATHS[optionId] ?? TRI_DAO_PATHS.ro_dai_hoi_cong;
    return <GlowPath d={d} dashed={optionId === 'dut_dao'} />;
  }
  if (featureId === 'sinhDao') {
    const d = SINH_DAO_PATHS[optionId] ?? SINH_DAO_PATHS.trung_binh;
    return <GlowPath d={d} dashed={optionId === 'dut_mo'} />;
  }
  if (featureId === 'dinhMenh') {
    const d = DINH_MENH_PATHS[optionId];
    if (d === null || optionId === 'khong_co') {
      return (
        <text
          x="178"
          y="230"
          textAnchor="middle"
          fill="#7c5cbf"
          fontSize="11"
          fontFamily="system-ui, sans-serif"
          opacity="0.85"
        >
          (không có đường)
        </text>
      );
    }
    return (
      <GlowPath
        d={d ?? DINH_MENH_PATHS.ro_thang!}
        dashed={optionId === 'mo_nhat'}
        faint={optionId === 'mo_nhat'}
      />
    );
  }
  if (featureId === 'honNhan') {
    const marks = HON_NHAN_MARKS[optionId] ?? HON_NHAN_MARKS.mot_sau_ro;
    const dashed = optionId === 'nhieu_mo';
    return (
      <g>
        {marks.map((d) => (
          <GlowPath key={d} d={d} dashed={dashed} faint={dashed} />
        ))}
      </g>
    );
  }
  if (featureId === 'goNoiBat') {
    const mount = MOUNTS[optionId] ?? 'all';
    if (mount === 'all' || mount === null) {
      return (
        <g>
          {ALL_MOUNTS.map((m) => (
            <ellipse
              key={`${m.cx}-${m.cy}`}
              cx={m.cx}
              cy={m.cy}
              rx={m.rx}
              ry={m.ry}
              fill="#c4a0e8"
              opacity="0.22"
              stroke="#7c5cbf"
              strokeWidth="1.2"
            />
          ))}
        </g>
      );
    }
    return (
      <ellipse
        cx={mount.cx}
        cy={mount.cy}
        rx={mount.rx}
        ry={mount.ry}
        fill="#c4a0e8"
        opacity="0.4"
        stroke="#7c5cbf"
        strokeWidth="2"
      />
    );
  }
  if (featureId === 'ngonCai') {
    const stiff = optionId === 'dai_cung';
    const soft = optionId === 'ngan_mem';
    return (
      <g transform={thumbTransform(optionId)}>
        <path
          d="M52 118 C40 92 42 68 58 58 C74 48 94 58 108 78 C100 95 90 115 84 135 C72 140 60 132 52 118 Z"
          fill="#c4a0e8"
          opacity="0.35"
          stroke="#7c5cbf"
          strokeWidth="2.5"
        />
        {stiff ? (
          <path d="M70 70 L88 120" stroke="#7c5cbf" strokeWidth="2" strokeLinecap="round" />
        ) : null}
        {soft ? (
          <path
            d="M58 70 C75 85 95 95 105 115"
            fill="none"
            stroke="#7c5cbf"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="3 3"
          />
        ) : null}
      </g>
    );
  }
  if (featureId === 'banTay') {
    return (
      <g>
        <path
          d={HAND_OUTLINE}
          fill="none"
          stroke="#7c5cbf"
          strokeWidth="3"
          opacity="0.85"
        />
        <FingerTipHints optionId={optionId} />
      </g>
    );
  }
  return null;
}

function FaintContext({ active }: { active: LineKey | 'other' }) {
  const keys = Object.keys(FAINT) as (keyof typeof FAINT)[];
  return (
    <g fill="none" stroke="#2a3344" strokeWidth="1.1" opacity="0.22" strokeLinecap="round">
      {keys.map((k) =>
        k === active ? null : <path key={k} d={FAINT[k]} />,
      )}
      {/* hôn nhân nền */}
      {active !== 'honNhan' ? (
        <>
          <path d="M270 120 L286 120" />
          <path d="M270 128 L288 128" />
        </>
      ) : null}
    </g>
  );
}

function activeLineKey(featureId: ChiTuongFeatureId): LineKey | 'other' {
  if (
    featureId === 'tamDao' ||
    featureId === 'triDao' ||
    featureId === 'sinhDao' ||
    featureId === 'dinhMenh' ||
    featureId === 'honNhan'
  ) {
    return featureId;
  }
  return 'other';
}

/** Nhãn ngắn dưới tay theo thủ hình / lựa chọn. */
function ShapeLabel({ featureId, optionId }: { featureId: ChiTuongFeatureId; optionId: string }) {
  if (featureId !== 'banTay') return null;
  const labels: Record<string, string> = {
    kim: 'Tay vuông · ngón vuông',
    moc: 'Tay dài gầy · đốt rõ',
    thuy: 'Tay mềm · thịt nhuận',
    hoa: 'Ngón thon nhọn',
    tho: 'Tay dày ngắn · chắc',
  };
  const text = labels[optionId];
  if (!text) return null;
  return (
    <text
      x="160"
      y="372"
      textAnchor="middle"
      fill="#7c5cbf"
      fontSize="11"
      fontFamily="system-ui, sans-serif"
      fontWeight="600"
    >
      {text}
    </text>
  );
}

export function ChiTuongGuide({ featureId, optionId, title, caption }: Props) {
  const tHand = featureId === 'banTay' ? handTransform(optionId) : '';

  return (
    <figure className="mt-3 overflow-hidden border border-fog bg-[#fdfbf5]">
      <div className="relative mx-auto w-full max-w-[220px] sm:max-w-[260px]">
        <svg
          key={`${featureId}-${optionId}`}
          viewBox="0 0 320 380"
          className="h-auto w-full transition-opacity duration-200"
          role="img"
          aria-label={`Minh họa: ${title} — ${caption}`}
        >
          <rect width="320" height="380" fill="#fdfbf5" />
          <CelestialFrame />
          <g transform={tHand || undefined}>
            <path d={HAND_OUTLINE} fill="#f7efe4" stroke="#2a3344" strokeWidth="2" />
            <g stroke="#2a3344" strokeWidth="1" opacity="0.35" strokeLinecap="round">
              {FINGER_CREASES.map((d) => (
                <path key={d} d={d} />
              ))}
            </g>
            <FaintContext active={activeLineKey(featureId)} />
            <ActiveHighlight featureId={featureId} optionId={optionId} />
          </g>
          <ShapeLabel featureId={featureId} optionId={optionId} />
        </svg>
      </div>
      <figcaption className="border-t border-fog px-3 py-2 text-center text-[11px] leading-relaxed text-muted">
        <span className="font-semibold text-ink">Đang chọn: </span>
        {caption}
      </figcaption>
    </figure>
  );
}
