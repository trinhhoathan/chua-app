/**
 * Biểu đồ mạng nhện (radar chart) 5 phương diện — SVG thuần, server-safe,
 * không dùng thư viện ngoài. Dùng ở trang chi tiết sim và trang báo cáo.
 */

export interface RadarAxis {
  label: string;
  /** 0–100 */
  score: number;
}

const TAU = Math.PI * 2;

/** Tọa độ đỉnh trên vòng tròn, trục 0 hướng thẳng lên. */
function pt(cx: number, cy: number, r: number, i: number, n: number) {
  const angle = -Math.PI / 2 + (i / n) * TAU;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function ringPath(cx: number, cy: number, r: number, n: number): string {
  return (
    Array.from({ length: n }, (_, i) => {
      const { x, y } = pt(cx, cy, r, i, n);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ') + ' Z'
  );
}

/** Rút gọn nhãn dài để vừa hai bên radar (vd. "Quý nhân · quan hệ" → "Quý nhân"). */
function compactLabel(label: string): string {
  const cut = label.indexOf(' · ');
  if (cut > 0) return label.slice(0, cut);
  if (label.length > 12) return `${label.slice(0, 11)}…`;
  return label;
}

export function SimRadarChart({
  axes,
  color = '#7A1F1F',
  size = 280,
  showScores = true,
}: {
  axes: RadarAxis[];
  color?: string;
  size?: number;
  showScores?: boolean;
}) {
  const n = axes.length;
  if (n < 3) return null;

  // Chừa lề rộng hai bên để nhãn "Sự nghiệp" / "Quý nhân" không bị cắt
  const padX = 58;
  const padY = 36;
  const chartSize = size;
  const width = chartSize + padX * 2;
  const height = chartSize + padY * 2;
  const cx = width / 2;
  const cy = height / 2;
  const rMax = chartSize / 2 - 8;
  const labelR = rMax + 22;
  const rings = [0.25, 0.5, 0.75, 1];

  const dataPath =
    axes
      .map((a, i) => {
        const r = (Math.max(0, Math.min(100, a.score)) / 100) * rMax;
        const { x, y } = pt(cx, cy, r, i, n);
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ') + ' Z';

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      className="mx-auto block h-auto max-w-full"
      style={{ maxWidth: width }}
      role="img"
      aria-label={`Phổ điểm: ${axes.map((a) => `${a.label} ${a.score}`).join(', ')}`}
    >
      {/* lưới nền */}
      {rings.map((f) => (
        <path
          key={f}
          d={ringPath(cx, cy, rMax * f, n)}
          fill={f === 1 ? '#f6f1e7' : 'none'}
          stroke="#d8cfbd"
          strokeWidth={f === 1 ? 1.2 : 0.7}
        />
      ))}
      {/* trục */}
      {axes.map((_, i) => {
        const { x, y } = pt(cx, cy, rMax, i, n);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="#d8cfbd"
            strokeWidth={0.7}
          />
        );
      })}
      {/* vùng dữ liệu */}
      <path d={dataPath} fill={color} fillOpacity={0.22} stroke={color} strokeWidth={1.8} />
      {/* điểm đỉnh */}
      {axes.map((a, i) => {
        const r = (Math.max(0, Math.min(100, a.score)) / 100) * rMax;
        const { x, y } = pt(cx, cy, r, i, n);
        return <circle key={i} cx={x} cy={y} r={3} fill={color} />;
      })}
      {/* nhãn + điểm */}
      {axes.map((a, i) => {
        const { x, y } = pt(cx, cy, labelR, i, n);
        const dx = x - cx;
        const anchor =
          Math.abs(dx) < 12 ? 'middle' : dx > 0 ? 'start' : 'end';
        // Đẩy thêm một chút theo hướng ngang để chữ không đè lên vòng ngoài
        const tx = dx > 12 ? x + 4 : dx < -12 ? x - 4 : x;
        const label = compactLabel(a.label);
        return (
          <text
            key={i}
            x={tx}
            y={y}
            textAnchor={anchor}
            fontSize={11}
            fill="#5c5647"
          >
            <tspan x={tx} dy={showScores ? '-0.25em' : '0.32em'}>
              {label}
            </tspan>
            {showScores ? (
              <tspan x={tx} dy="1.15em" fontWeight={700} fill="#241f18" fontSize={11.5}>
                {Math.round(a.score)}
              </tspan>
            ) : null}
          </text>
        );
      })}
    </svg>
  );
}
