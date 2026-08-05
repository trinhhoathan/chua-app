/**
 * Con dấu tròn đỏ + chữ ký — vẽ SVG thuần, sắc nét khi in PDF.
 * Mặc định: Lý Gia Phúc An; temple truyền props theo tên chùa / trụ trì.
 */

const SEAL_RED = '#B3271E';

export interface SealStampProps {
  size?: number;
  /** Chữ vòng trên (viết hoa). */
  orgName?: string;
  /** Chữ vòng dưới. */
  subtitle?: string;
  /** Monogram giữa dấu (2–6 ký tự). */
  monogram?: string;
  /** Dòng nhỏ dưới monogram. */
  tagline?: string;
}

const DEFAULT_SEAL: Required<
  Omit<SealStampProps, 'size'>
> = {
  orgName: 'LÝ GIA PHÚC AN',
  subtitle: 'TƯ VẤN PHONG THỦY · HÀ NỘI',
  monogram: 'LGPA',
  tagline: 'KIẾN TẠO VẬN MỆNH',
};

export function SealStamp({
  size = 130,
  orgName = DEFAULT_SEAL.orgName,
  subtitle = DEFAULT_SEAL.subtitle,
  monogram = DEFAULT_SEAL.monogram,
  tagline = DEFAULT_SEAL.tagline,
}: SealStampProps) {
  /** Tên dài (vd. CHÙA QUAN ÂM BẮC HỒNG): cung rộng hơn + tracking hẹp hơn để không cắt chữ. */
  const topLen = orgName.length;
  /** Bán kính nhỏ hơn → chữ hạ xuống, nằm giữa vành ngoài và vòng trong. */
  const topRadius = topLen > 22 ? 70 : topLen > 18 ? 69 : topLen > 14 ? 68 : 66;
  const topSize =
    topLen > 24 ? 14.5 : topLen > 20 ? 15.5 : topLen > 16 ? 17 : topLen > 14 ? 18.5 : 20.5;
  const topTracking = topLen > 24 ? 0.25 : topLen > 20 ? 0.45 : topLen > 16 ? 0.8 : 1.4;
  /** Vòng dưới (tên trụ trì) — nhỏ hơn vòng trên một chút, vẫn đọc được. */
  const bottomSize =
    subtitle.length > 38 ? 9.2 : subtitle.length > 30 ? 10 : subtitle.length > 22 ? 11 : 12.5;
  const monoSize = monogram.length > 4 ? 12 : 16;
  const uid = `seal-${monogram.replace(/\W/g, '').slice(0, 8) || 'x'}`;
  /** Cung trên kéo dài thêm mỗi bên → chữ mở rộng sang hai bên. */
  const topExtendDeg = topLen > 18 ? 34 : 12;
  const topExt = (topExtendDeg * Math.PI) / 180;
  const topSx = -topRadius * Math.cos(topExt);
  const topSy = topRadius * Math.sin(topExt);
  const topEx = topRadius * Math.cos(topExt);
  const topEy = topRadius * Math.sin(topExt);
  const topPath = `M ${100 + topSx} ${100 + topSy} A ${topRadius} ${topRadius} 0 1 1 ${100 + topEx} ${100 + topEy}`;

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label={`Con dấu ${orgName}`}
      style={{ transform: 'rotate(-7deg)' }}
    >
      <defs>
        <path id={`${uid}-top`} d={topPath} />
        <path id={`${uid}-bottom`} d="M 100 100 m -78 0 a 78 78 0 1 0 156 0" />
      </defs>

      <g fill="none" stroke={SEAL_RED} opacity={0.93}>
        <circle cx="100" cy="100" r="96" strokeWidth="3.5" />
        <circle cx="100" cy="100" r="90" strokeWidth="1.4" />
        <circle cx="100" cy="100" r="58" strokeWidth="1.6" />
      </g>

      <text
        fill={SEAL_RED}
        fontSize={topSize}
        fontWeight="900"
        letterSpacing={topTracking}
        opacity={1}
        stroke={SEAL_RED}
        strokeWidth="0.45"
        paintOrder="stroke fill"
        style={{ fontFamily: 'var(--font-display, serif)' }}
      >
        <textPath href={`#${uid}-top`} startOffset="50%" textAnchor="middle">
          {orgName}
        </textPath>
      </text>

      <text
        fill={SEAL_RED}
        fontSize={bottomSize}
        fontWeight="600"
        letterSpacing={subtitle.length > 30 ? 0.25 : subtitle.length > 22 ? 0.5 : 0.9}
        opacity={0.9}
        style={{ fontFamily: 'var(--font-display, serif)' }}
      >
        <textPath href={`#${uid}-bottom`} startOffset="50%" textAnchor="middle">
          {subtitle}
        </textPath>
      </text>

      {/* Hạ xuống khỏi đuôi chữ vòng trên — tránh chèn vào tên chùa. */}
      <g fill={SEAL_RED} opacity={0.9} transform="translate(0 16)">
        <path d="m24 100 3.2 2.3-1.2-3.7 3.2-2.3h-4L24 92.5l-1.2 3.8h-4l3.2 2.3-1.2 3.7z" />
        <path d="m176 100 3.2 2.3-1.2-3.7 3.2-2.3h-4l-1.2-3.8-1.2 3.8h-4l3.2 2.3-1.2 3.7z" />
      </g>

      <g fill={SEAL_RED} opacity={0.93} textAnchor="middle">
        <path d="M100 68 L104.4 81.5 H118.5 L107.1 89.9 L111.4 103.4 L100 95 L88.6 103.4 L92.9 89.9 L81.5 81.5 H95.6 Z" />
        <text
          x="100"
          y="118"
          fontSize={monoSize}
          fontWeight="800"
          letterSpacing="0.08em"
          style={{ fontFamily: 'system-ui, sans-serif' }}
        >
          {monogram}
        </text>
        <text
          x="100"
          y="132"
          fontSize="6.2"
          fontWeight="600"
          letterSpacing="0.06em"
        >
          {tagline}
        </text>
      </g>
    </svg>
  );
}

export interface MasterSignatureProps {
  width?: number;
  signerName?: string;
  signerTitle?: string;
}

/** Chữ ký cách điệu + tên người thẩm định. */
export function MasterSignature({
  width = 170,
  signerName = 'Thầy Lý Gia Phúc An',
  signerTitle,
}: MasterSignatureProps) {
  return (
    <svg
      viewBox="0 0 220 120"
      width={width}
      role="img"
      aria-label={`Chữ ký ${signerName}`}
    >
      <g fill="none" stroke="#241f18" strokeLinecap="round">
        <path
          d="M28 62 C 42 22, 58 18, 62 34 C 66 50, 46 74, 36 70 C 30 67, 44 52, 66 48 C 92 43, 96 28, 88 26 C 80 24, 76 44, 92 52 C 104 58, 118 40, 126 30"
          strokeWidth="2.6"
        />
        <path
          d="M118 52 C 132 40, 150 26, 168 30 C 184 34, 176 52, 160 54 C 148 56, 152 44, 170 44 C 186 44, 196 38, 202 30"
          strokeWidth="2.2"
        />
        <path
          d="M22 78 C 70 70, 150 70, 200 74"
          strokeWidth="1.3"
          opacity="0.65"
        />
      </g>
      <text
        x="110"
        y={signerTitle ? 92 : 98}
        textAnchor="middle"
        fontSize="12.5"
        fontWeight="600"
        fill="#241f18"
        style={{ fontFamily: 'var(--font-display, serif)' }}
      >
        {signerName}
      </text>
      {signerTitle ? (
        <text
          x="110"
          y="108"
          textAnchor="middle"
          fontSize="9"
          fill="#5c564c"
          style={{ fontFamily: 'system-ui, sans-serif' }}
        >
          {signerTitle}
        </text>
      ) : null}
    </svg>
  );
}
