/**
 * Con dấu tròn đỏ "LÝ GIA PHÚC AN" + chữ ký cách điệu của thầy — vẽ SVG thuần
 * để sắc nét khi in ra PDF, không phụ thuộc file ảnh. Server-safe.
 */

const SEAL_RED = '#B3271E';

export function SealStamp({ size = 130 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label="Con dấu Lý Gia Phúc An"
      style={{ transform: 'rotate(-7deg)' }}
    >
      <defs>
        {/* Hai quỹ đạo tách biệt trong dải giữa vòng ngoài (r≈90) và vòng trong (r=58):
            chữ trên gần vòng trong hơn; chữ dưới hạ sát vòng ngoài. */}
        <path id="lgpa-seal-top" d="M 100 100 m -68 0 a 68 68 0 1 1 136 0" />
        <path id="lgpa-seal-bottom" d="M 100 100 m -78 0 a 78 78 0 1 0 156 0" />
      </defs>

      <g fill="none" stroke={SEAL_RED} opacity={0.93}>
        <circle cx="100" cy="100" r="96" strokeWidth="3.5" />
        <circle cx="100" cy="100" r="90" strokeWidth="1.4" />
        <circle cx="100" cy="100" r="58" strokeWidth="1.6" />
      </g>

      {/* Chữ trên: đậm, nằm giữa 2 nét tròn */}
      <text
        fill={SEAL_RED}
        fontSize="19.5"
        fontWeight="900"
        letterSpacing="2.4"
        opacity={1}
        stroke={SEAL_RED}
        strokeWidth="0.55"
        paintOrder="stroke fill"
        style={{ fontFamily: 'var(--font-display, serif)' }}
      >
        <textPath href="#lgpa-seal-top" startOffset="50%" textAnchor="middle">
          LÝ GIA PHÚC AN
        </textPath>
      </text>

      {/* Chữ dưới: cùng quỹ đạo */}
      <text
        fill={SEAL_RED}
        fontSize="11"
        fontWeight="600"
        letterSpacing="1.6"
        opacity={0.9}
      >
        <textPath href="#lgpa-seal-bottom" startOffset="50%" textAnchor="middle">
          TƯ VẤN PHONG THỦY · HÀ NỘI
        </textPath>
      </text>

      {/* hai sao nhỏ hai bên */}
      <g fill={SEAL_RED} opacity={0.9}>
        <path d="m24 100 3.2 2.3-1.2-3.7 3.2-2.3h-4L24 92.5l-1.2 3.8h-4l3.2 2.3-1.2 3.7z" />
        <path d="m176 100 3.2 2.3-1.2-3.7 3.2-2.3h-4l-1.2-3.8-1.2 3.8h-4l3.2 2.3-1.2 3.7z" />
      </g>

      {/* tâm dấu: sao + chữ căn giữa hình tròn trong (cx=100, cy=100) */}
      <g fill={SEAL_RED} opacity={0.93} textAnchor="middle">
        {/* Sao 5 cánh — tâm (100, 82) */}
        <path d="M100 68 L104.4 81.5 H118.5 L107.1 89.9 L111.4 103.4 L100 95 L88.6 103.4 L92.9 89.9 L81.5 81.5 H95.6 Z" />
        <text
          x="100"
          y="118"
          fontSize="16"
          fontWeight="800"
          letterSpacing="0.12em"
          style={{ fontFamily: 'system-ui, sans-serif' }}
        >
          LGPA
        </text>
        <text
          x="100"
          y="132"
          fontSize="6.8"
          fontWeight="600"
          letterSpacing="0.08em"
        >
          KIẾN TẠO VẬN MỆNH
        </text>
      </g>
    </svg>
  );
}

/** Chữ ký cách điệu + tên thầy, đặt cạnh con dấu trong khối chứng nhận. */
export function MasterSignature({ width = 170 }: { width?: number }) {
  return (
    <svg
      viewBox="0 0 220 110"
      width={width}
      role="img"
      aria-label="Chữ ký thầy Lý Gia Phúc An"
    >
      {/* nét ký cách điệu */}
      <g fill="none" stroke="#241f18" strokeLinecap="round">
        <path
          d="M28 62 C 42 22, 58 18, 62 34 C 66 50, 46 74, 36 70 C 30 67, 44 52, 66 48 C 92 43, 96 28, 88 26 C 80 24, 76 44, 92 52 C 104 58, 118 40, 126 30"
          strokeWidth="2.6"
        />
        <path
          d="M118 52 C 132 40, 150 26, 168 30 C 184 34, 176 52, 160 54 C 148 56, 152 44, 170 44 C 186 44, 196 38, 202 30"
          strokeWidth="2.2"
        />
        <path d="M22 78 C 70 70, 150 70, 200 74" strokeWidth="1.3" opacity="0.65" />
      </g>
      <text
        x="110"
        y="98"
        textAnchor="middle"
        fontSize="13"
        fontWeight="600"
        fill="#241f18"
        style={{ fontFamily: 'var(--font-display, serif)' }}
      >
        Thầy Lý Gia Phúc An
      </text>
    </svg>
  );
}
