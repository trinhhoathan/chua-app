'use client';

import type { NhanTuongFeatureId } from '@/lib/fengshui/nhan-tuong';

interface Props {
  featureId: NhanTuongFeatureId;
  optionId: string;
  title: string;
  caption: string;
}

/** Khung mặt chính diện — viewBox 0 0 320 380 */
const FACE_BASE =
  'M160 48 C210 48 248 88 252 150 C256 210 248 270 220 310 C200 340 175 355 160 358 C145 355 120 340 100 310 C72 270 64 210 68 150 C72 88 110 48 160 48 Z';

/** Biến thể đường viền theo ngũ hành hình. */
const FACE_SHAPES: Record<string, string> = {
  kim: 'M160 52 C205 52 238 95 242 155 C246 215 238 265 215 300 C195 330 175 348 160 350 C145 348 125 330 105 300 C82 265 74 215 78 155 C82 95 115 52 160 52 Z',
  moc: 'M160 38 C195 38 225 85 230 155 C234 225 228 285 205 325 C185 355 170 365 160 368 C150 365 135 355 115 325 C92 285 86 225 90 155 C95 85 125 38 160 38 Z',
  thuy: 'M160 55 C215 55 255 100 258 165 C260 230 245 285 210 320 C185 345 170 352 160 354 C150 352 135 345 110 320 C75 285 60 230 62 165 C65 100 105 55 160 55 Z',
  hoa: 'M160 42 C190 42 215 80 220 140 C226 200 240 260 230 305 C215 340 185 355 160 358 C135 355 105 340 90 305 C80 260 94 200 100 140 C105 80 130 42 160 42 Z',
  tho: 'M160 58 C218 58 258 105 260 170 C262 235 248 285 215 315 C190 340 172 350 160 352 C148 350 130 340 105 315 C72 285 58 235 60 170 C62 105 102 58 160 58 Z',
};

function facePath(featureId: NhanTuongFeatureId, optionId: string): string {
  if (featureId === 'faceShape') {
    return FACE_SHAPES[optionId] ?? FACE_BASE;
  }
  return FACE_BASE;
}

function CelestialFrame() {
  return (
    <g fill="none" stroke="#2a3344" strokeWidth="0.8" opacity="0.55">
      <circle cx="160" cy="190" r="168" strokeDasharray="2 6" />
      <circle cx="160" cy="190" r="155" />
      <circle cx="160" cy="190" r="142" strokeDasharray="1 4" />
      <path
        d="M158 28 C152 34 152 44 160 48 C154 42 154 34 158 28 Z"
        fill="#2a3344"
        stroke="none"
      />
      <circle cx="160" cy="352" r="3.5" fill="#2a3344" stroke="none" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const r = Math.PI * (deg / 180);
        const x1 = 160 + Math.cos(r) * 7;
        const y1 = 352 + Math.sin(r) * 7;
        const x2 = 160 + Math.cos(r) * 11;
        const y2 = 352 + Math.sin(r) * 11;
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="1" />;
      })}
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

function GlowPath({
  d,
  dashed,
  faint,
  fill,
}: {
  d: string;
  dashed?: boolean;
  faint?: boolean;
  fill?: string;
}) {
  return (
    <g>
      <path
        d={d}
        fill={fill ?? 'none'}
        stroke="#c4a0e8"
        strokeWidth={faint ? 5 : 8}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={faint ? 0.22 : 0.35}
        strokeDasharray={dashed ? '3 5' : undefined}
      />
      <path
        d={d}
        fill={fill ?? 'none'}
        stroke="#7c5cbf"
        strokeWidth={faint ? 1.8 : 2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={faint ? 0.55 : 1}
        strokeDasharray={dashed ? '3 5' : undefined}
      />
    </g>
  );
}

function GlowEllipse({
  cx,
  cy,
  rx,
  ry,
  faint,
}: {
  cx: number | string;
  cy: number | string;
  rx: number | string;
  ry: number | string;
  faint?: boolean;
}) {
  return (
    <g>
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill="#c4a0e8"
        opacity={faint ? 0.18 : 0.35}
        stroke="#7c5cbf"
        strokeWidth={faint ? 1.2 : 2}
      />
    </g>
  );
}

/** Nét mặt nền — luôn hiện mờ để định hướng. */
function BaseFeatures({
  hide,
}: {
  hide?: Partial<
    Record<'brows' | 'eyes' | 'nose' | 'mouth' | 'ears' | 'dinh', boolean>
  >;
}) {
  return (
    <g
      fill="none"
      stroke="#2a3344"
      strokeWidth="1.2"
      opacity="0.28"
      strokeLinecap="round"
    >
      {!hide?.brows ? (
        <>
          <path d="M95 145 C115 135 135 135 148 142" />
          <path d="M172 142 C185 135 205 135 225 145" />
        </>
      ) : null}
      {!hide?.eyes ? (
        <>
          <ellipse cx="120" cy="168" rx="16" ry="9" />
          <ellipse cx="200" cy="168" rx="16" ry="9" />
          <circle cx="120" cy="168" r="4" fill="#2a3344" stroke="none" />
          <circle cx="200" cy="168" r="4" fill="#2a3344" stroke="none" />
        </>
      ) : null}
      {!hide?.nose ? (
        <path d="M160 175 C152 200 148 220 155 235 C158 240 162 240 165 235 C172 220 168 200 160 175" />
      ) : null}
      {!hide?.mouth ? <path d="M130 275 C145 288 175 288 190 275" /> : null}
      {!hide?.ears ? (
        <>
          <path d="M68 175 C52 185 50 215 62 235 C72 248 78 245 80 230" />
          <path d="M252 175 C268 185 270 215 258 235 C248 248 242 245 240 230" />
        </>
      ) : null}
      {!hide?.dinh ? (
        <>
          {/* ranh giới tam đình */}
          <path d="M95 138 L225 138" strokeDasharray="2 4" opacity="0.5" />
          <path d="M100 248 L220 248" strokeDasharray="2 4" opacity="0.5" />
        </>
      ) : null}
    </g>
  );
}

/** Lông mày theo lựa chọn. */
function Brows({ optionId }: { optionId: string }) {
  const left: Record<string, string> = {
    thanh_tu: 'M92 148 C115 132 138 130 152 140',
    dam_rap: 'M90 145 C112 128 140 126 154 142 M98 150 C118 138 140 136 150 146',
    thua_nhat: 'M100 148 C118 140 135 140 145 146',
    xech_dung: 'M95 152 C118 140 140 128 155 122',
    cong_nhu: 'M95 150 C115 132 138 128 152 142',
    giao_lien: 'M100 148 C125 138 145 140 158 148',
  };
  const right: Record<string, string> = {
    thanh_tu: 'M168 140 C182 130 205 132 228 148',
    dam_rap: 'M166 142 C180 126 208 128 230 145 M170 146 C190 136 212 138 222 150',
    thua_nhat: 'M175 146 C185 140 202 140 220 148',
    xech_dung: 'M165 122 C180 128 202 140 225 152',
    cong_nhu: 'M168 142 C182 128 205 132 225 150',
    giao_lien: 'M162 148 C175 140 195 138 220 148',
  };
  const dL = left[optionId] ?? left.thanh_tu;
  const dR = right[optionId] ?? right.thanh_tu;
  const thick = optionId === 'dam_rap';
  const faint = optionId === 'thua_nhat';
  return (
    <g>
      <GlowPath d={dL} faint={faint} />
      <GlowPath d={dR} faint={faint} />
      {thick ? (
        <g stroke="#7c5cbf" strokeWidth="3.5" opacity="0.7" strokeLinecap="round">
          <path d={dL} fill="none" />
          <path d={dR} fill="none" />
        </g>
      ) : null}
      {optionId === 'giao_lien' ? (
        <GlowEllipse cx="160" cy="145" rx="10" ry="8" />
      ) : null}
    </g>
  );
}

/** Mắt theo lựa chọn. */
function Eyes({ optionId }: { optionId: string }) {
  if (optionId === 'den_trang_ro') {
    return (
      <g>
        <GlowEllipse cx="120" cy="168" rx="18" ry="10" />
        <GlowEllipse cx="200" cy="168" rx="18" ry="10" />
        <circle cx="120" cy="168" r="5.5" fill="#7c5cbf" />
        <circle cx="200" cy="168" r="5.5" fill="#7c5cbf" />
        <circle cx="122" cy="166" r="1.5" fill="#fff" opacity="0.9" />
        <circle cx="202" cy="166" r="1.5" fill="#fff" opacity="0.9" />
      </g>
    );
  }
  if (optionId === 'to_sang') {
    return (
      <g>
        <GlowEllipse cx="120" cy="168" rx="22" ry="14" />
        <GlowEllipse cx="200" cy="168" rx="22" ry="14" />
        <circle cx="120" cy="168" r="7" fill="#7c5cbf" />
        <circle cx="200" cy="168" r="7" fill="#7c5cbf" />
      </g>
    );
  }
  if (optionId === 'dai_nho') {
    return (
      <g>
        <GlowPath d="M98 168 C110 158 130 156 145 166 C140 174 115 176 98 168" />
        <GlowPath d="M175 166 C190 156 210 158 222 168 C205 176 180 174 175 166" />
        <ellipse cx="120" cy="167" rx="5" ry="3.5" fill="#7c5cbf" />
        <ellipse cx="200" cy="167" rx="5" ry="3.5" fill="#7c5cbf" />
      </g>
    );
  }
  if (optionId === 'loi_lo') {
    return (
      <g>
        <GlowEllipse cx="120" cy="168" rx="18" ry="14" />
        <GlowEllipse cx="200" cy="168" rx="18" ry="14" />
        <circle cx="120" cy="168" r="8" fill="#c4a0e8" stroke="#7c5cbf" strokeWidth="2" />
        <circle cx="200" cy="168" r="8" fill="#c4a0e8" stroke="#7c5cbf" strokeWidth="2" />
      </g>
    );
  }
  if (optionId === 'sau_trung') {
    return (
      <g>
        <GlowEllipse cx="120" cy="170" rx="16" ry="8" faint />
        <GlowEllipse cx="200" cy="170" rx="16" ry="8" faint />
        <ellipse cx="120" cy="172" rx="14" ry="10" fill="#2a3344" opacity="0.12" />
        <ellipse cx="200" cy="172" rx="14" ry="10" fill="#2a3344" opacity="0.12" />
        <circle cx="120" cy="170" r="3.5" fill="#7c5cbf" opacity="0.7" />
        <circle cx="200" cy="170" r="3.5" fill="#7c5cbf" opacity="0.7" />
      </g>
    );
  }
  if (optionId === 'tam_bach') {
    return (
      <g>
        <GlowEllipse cx="120" cy="168" rx="18" ry="12" />
        <GlowEllipse cx="200" cy="168" rx="18" ry="12" />
        <ellipse cx="120" cy="168" rx="16" ry="10" fill="#fff" stroke="#7c5cbf" strokeWidth="1.5" />
        <ellipse cx="200" cy="168" rx="16" ry="10" fill="#fff" stroke="#7c5cbf" strokeWidth="1.5" />
        <circle cx="120" cy="170" r="4" fill="#7c5cbf" />
        <circle cx="200" cy="170" r="4" fill="#7c5cbf" />
      </g>
    );
  }
  return null;
}

/** Mũi theo lựa chọn. */
function Nose({ optionId }: { optionId: string }) {
  const paths: Record<string, string> = {
    cao_thang_no:
      'M160 172 C150 198 146 222 154 238 C158 245 162 245 166 238 C174 222 170 198 160 172 M148 236 C154 242 166 242 172 236',
    su_tu:
      'M160 178 C148 200 142 222 150 240 C155 248 165 248 170 240 C178 222 172 200 160 178 M142 238 C152 250 168 250 178 238',
    thap_nho:
      'M160 185 C154 205 152 220 156 230 C158 234 162 234 164 230 C168 220 166 205 160 185',
    go_gay:
      'M160 172 C150 190 148 200 156 208 C164 216 148 228 154 238 C158 244 162 244 166 238 C172 228 168 218 160 210 C152 202 162 192 160 172',
    nhon_moc:
      'M160 175 C152 200 150 220 158 236 C160 242 160 242 162 236 C170 220 168 200 160 175',
    hech_lo:
      'M160 180 C152 200 150 218 156 230 C160 236 160 236 164 230 C170 218 168 200 160 180 M152 228 C156 234 164 234 168 228',
  };
  const d = paths[optionId] ?? paths.cao_thang_no;
  const faint = optionId === 'thap_nho' || optionId === 'nhon_moc';
  return (
    <g>
      <GlowPath d={d} faint={faint} />
      {optionId === 'hech_lo' ? (
        <g fill="#7c5cbf" opacity="0.55">
          <ellipse cx="154" cy="232" rx="3.5" ry="2.5" />
          <ellipse cx="166" cy="232" rx="3.5" ry="2.5" />
        </g>
      ) : null}
    </g>
  );
}

/** Miệng theo lựa chọn. */
function Mouth({ optionId }: { optionId: string }) {
  if (optionId === 'vuong_day') {
    return (
      <g>
        <GlowPath d="M128 272 C128 272 135 268 160 268 C185 268 192 272 192 272" />
        <GlowPath d="M128 272 C140 292 180 292 192 272" />
        <path
          d="M135 278 C148 286 172 286 185 278"
          fill="#c4a0e8"
          opacity="0.35"
          stroke="none"
        />
      </g>
    );
  }
  if (optionId === 'rong_lon') {
    return (
      <GlowPath d="M115 270 C140 295 180 295 205 270 C185 285 135 285 115 270" />
    );
  }
  if (optionId === 'mong') {
    return <GlowPath d="M135 278 C150 282 170 282 185 278" faint />;
  }
  if (optionId === 'nho_chum') {
    return <GlowPath d="M145 278 C155 284 165 284 175 278" />;
  }
  if (optionId === 'lech_tre') {
    return (
      <GlowPath
        d="M130 270 C145 278 170 285 195 280"
        dashed
      />
    );
  }
  return null;
}

/** Tai theo lựa chọn. */
function Ears({ optionId }: { optionId: string }) {
  const left: Record<string, string> = {
    day_to_chau:
      'M70 165 C48 178 45 215 58 245 C68 262 82 258 84 240 C86 215 82 185 70 165 Z',
    cao_qua_may:
      'M72 145 C50 155 48 195 60 225 C70 240 82 235 84 220 C86 190 84 160 72 145 Z',
    mong_nho:
      'M74 175 C60 185 58 210 66 228 C72 238 80 235 80 222 C80 200 78 185 74 175 Z',
    luan_quach_dao:
      'M72 170 C55 175 42 200 50 230 C58 248 78 250 85 235 C78 220 82 190 72 170 Z',
    thap_duoi_mat:
      'M72 195 C52 205 50 240 62 265 C72 278 84 272 84 255 C84 230 82 210 72 195 Z',
  };
  const right: Record<string, string> = {
    day_to_chau:
      'M250 165 C272 178 275 215 262 245 C252 262 238 258 236 240 C234 215 238 185 250 165 Z',
    cao_qua_may:
      'M248 145 C270 155 272 195 260 225 C250 240 238 235 236 220 C234 190 236 160 248 145 Z',
    mong_nho:
      'M246 175 C260 185 262 210 254 228 C248 238 240 235 240 222 C240 200 242 185 246 175 Z',
    luan_quach_dao:
      'M248 170 C265 175 278 200 270 230 C262 248 242 250 235 235 C242 220 238 190 248 170 Z',
    thap_duoi_mat:
      'M248 195 C268 205 270 240 258 265 C248 278 236 272 236 255 C236 230 238 210 248 195 Z',
  };
  const dL = left[optionId] ?? left.day_to_chau;
  const dR = right[optionId] ?? right.day_to_chau;
  const faint = optionId === 'mong_nho';
  return (
    <g>
      <path
        d={dL}
        fill="#c4a0e8"
        opacity={faint ? 0.2 : 0.35}
        stroke="#7c5cbf"
        strokeWidth="2"
      />
      <path
        d={dR}
        fill="#c4a0e8"
        opacity={faint ? 0.2 : 0.35}
        stroke="#7c5cbf"
        strokeWidth="2"
      />
    </g>
  );
}

/** Vùng tam đình được tô sáng. */
function DinhBand({
  featureId,
  optionId,
}: {
  featureId: 'thuongDinh' | 'trungDinh' | 'haDinh';
  optionId: string;
}) {
  const bands = {
    thuongDinh: { y: 55, h: 85, labelY: 95 },
    trungDinh: { y: 138, h: 110, labelY: 195 },
    haDinh: { y: 248, h: 105, labelY: 300 },
  };
  const b = bands[featureId];
  const scale =
    optionId === 'cao_rong' || optionId === 'no_nang' || optionId === 'day_no'
      ? 1.08
      : optionId === 'thap_hep' || optionId === 'hut_lep' || optionId === 'nhon_lem'
        ? 0.88
        : 1;
  const midY = b.y + b.h / 2;
  const h = b.h * scale;
  const y = midY - h / 2;

  return (
    <g>
      <rect
        x="78"
        y={y}
        width="164"
        height={h}
        rx="8"
        fill="#c4a0e8"
        opacity="0.28"
        stroke="#7c5cbf"
        strokeWidth="2"
      />
      {(optionId === 'thap_hep' ||
        optionId === 'hut_lep' ||
        optionId === 'nhon_lem') && (
        <path
          d={`M95 ${midY} L225 ${midY}`}
          stroke="#7c5cbf"
          strokeWidth="2"
          strokeDasharray="4 4"
          opacity="0.8"
        />
      )}
    </g>
  );
}

/** Thần thái — quầng sáng quanh đầu / mắt. */
function ThanThai({ optionId }: { optionId: string }) {
  if (optionId === 'an_dinh') {
    return (
      <g>
        <circle
          cx="160"
          cy="190"
          r="95"
          fill="none"
          stroke="#7c5cbf"
          strokeWidth="2.5"
          opacity="0.55"
        />
        <circle
          cx="160"
          cy="190"
          r="108"
          fill="none"
          stroke="#c4a0e8"
          strokeWidth="8"
          opacity="0.25"
        />
        <GlowEllipse cx="120" cy="168" rx="14" ry="8" />
        <GlowEllipse cx="200" cy="168" rx="14" ry="8" />
        <circle cx="120" cy="168" r="4" fill="#7c5cbf" />
        <circle cx="200" cy="168" r="4" fill="#7c5cbf" />
      </g>
    );
  }
  if (optionId === 'lo_quang') {
    return (
      <g>
        {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((deg) => {
          const r = (deg * Math.PI) / 180;
          return (
            <line
              key={deg}
              x1={160 + Math.cos(r) * 88}
              y1={190 + Math.sin(r) * 88}
              x2={160 + Math.cos(r) * 118}
              y2={190 + Math.sin(r) * 118}
              stroke="#7c5cbf"
              strokeWidth="2"
              opacity="0.75"
              strokeLinecap="round"
            />
          );
        })}
        <circle cx="115" cy="165" r="3.5" fill="#7c5cbf" />
        <circle cx="125" cy="172" r="3.5" fill="#7c5cbf" />
        <circle cx="195" cy="165" r="3.5" fill="#7c5cbf" />
        <circle cx="205" cy="172" r="3.5" fill="#7c5cbf" />
      </g>
    );
  }
  if (optionId === 'me_moi') {
    return (
      <g opacity="0.7">
        <GlowEllipse cx="120" cy="172" rx="14" ry="7" faint />
        <GlowEllipse cx="200" cy="172" rx="14" ry="7" faint />
        <path
          d="M130 278 C145 272 175 272 190 278"
          fill="none"
          stroke="#7c5cbf"
          strokeWidth="2"
          strokeDasharray="3 4"
          opacity="0.7"
        />
        <ellipse cx="160" cy="200" rx="70" ry="90" fill="#2a3344" opacity="0.06" />
      </g>
    );
  }
  return null;
}

function ShapeLabel({
  featureId,
  optionId,
}: {
  featureId: NhanTuongFeatureId;
  optionId: string;
}) {
  if (featureId !== 'faceShape') return null;
  const labels: Record<string, string> = {
    kim: 'Mặt vuông chữ điền',
    moc: 'Mặt dài thanh tú',
    thuy: 'Mặt tròn đầy đặn',
    hoa: 'Trên nhọn · dưới nở',
    tho: 'Mặt đầy dày trầm',
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

function ActiveHighlight({
  featureId,
  optionId,
}: {
  featureId: NhanTuongFeatureId;
  optionId: string;
}) {
  if (featureId === 'faceShape') {
    return (
      <path
        d={FACE_SHAPES[optionId] ?? FACE_BASE}
        fill="none"
        stroke="#7c5cbf"
        strokeWidth="3"
        opacity="0.85"
      />
    );
  }
  if (
    featureId === 'thuongDinh' ||
    featureId === 'trungDinh' ||
    featureId === 'haDinh'
  ) {
    return <DinhBand featureId={featureId} optionId={optionId} />;
  }
  if (featureId === 'longMay') return <Brows optionId={optionId} />;
  if (featureId === 'mat') return <Eyes optionId={optionId} />;
  if (featureId === 'mui') return <Nose optionId={optionId} />;
  if (featureId === 'mieng') return <Mouth optionId={optionId} />;
  if (featureId === 'tai') return <Ears optionId={optionId} />;
  if (featureId === 'thanThai') return <ThanThai optionId={optionId} />;
  return null;
}

export function NhanTuongGuide({ featureId, optionId, title, caption }: Props) {
  const outline = facePath(featureId, optionId);
  const hideBase = {
    brows: featureId === 'longMay',
    eyes: featureId === 'mat' || featureId === 'thanThai',
    nose: featureId === 'mui',
    mouth: featureId === 'mieng' || featureId === 'thanThai',
    ears: featureId === 'tai',
    dinh:
      featureId === 'thuongDinh' ||
      featureId === 'trungDinh' ||
      featureId === 'haDinh' ||
      featureId === 'faceShape',
  };

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
          <path d={outline} fill="#f7efe4" stroke="#2a3344" strokeWidth="2" />
          {/* tóc / chân tóc gợi ý */}
          <path
            d="M95 95 C110 70 140 55 160 52 C180 55 210 70 225 95 C210 85 185 78 160 78 C135 78 110 85 95 95 Z"
            fill="#2a3344"
            opacity="0.12"
          />
          <BaseFeatures hide={hideBase} />
          <ActiveHighlight featureId={featureId} optionId={optionId} />
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
