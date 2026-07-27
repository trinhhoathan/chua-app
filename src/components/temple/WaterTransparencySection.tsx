import type { Temple } from '@/types/database';
import { formatVnd } from '@/lib/tenant';
import {
  formatPaidAt,
  type WaterTransparency,
} from '@/lib/transparency';

interface Props {
  temple: Temple;
  data: WaterTransparency;
}

export function WaterTransparencySection({ temple, data }: Props) {
  const primary = temple.primary_color || '#7A1F1F';

  return (
    <section id="minh-bach" className="bg-mist scroll-mt-8">
      <div className="mx-auto max-w-5xl px-6 py-20 md:px-12 md:py-28">
        <div className="section-rule mb-6" />
        <h2 className="font-display text-3xl md:text-4xl text-ink leading-tight">
          Sổ Vàng Công Đức
        </h2>
        <p className="mt-4 text-muted max-w-2xl leading-relaxed">
          Mọi phát tâm thỉnh nước đã hoàn tất tại {temple.name} được công khai
          để Quý Phật tử tùy hỷ theo dõi công đức chung — người đi lễ trước gieo
          hạt lành, người đến sau hưởng giọt nước mát.
        </p>

        <div className="mt-10 grid sm:grid-cols-3 gap-6 md:gap-8">
          <Stat
            label="Tổng thùng đã thỉnh"
            value={data.total_quantity.toLocaleString('vi-VN')}
            hint="thùng"
            accent={primary}
          />
          <Stat
            label="Số lần phát tâm"
            value={data.order_count.toLocaleString('vi-VN')}
            hint="phát tâm"
            accent={primary}
          />
          <Stat
            label="Tổng công đức"
            value={formatVnd(data.total_amount)}
            hint="đã ghi nhận"
            accent={primary}
          />
        </div>

        <div className="mt-12">
          <h3 className="text-sm font-medium tracking-wide uppercase text-ink/70 mb-4">
            Phát tâm gần đây
          </h3>
          {data.recent.length === 0 ? (
            <p className="text-muted text-sm border border-fog bg-paper px-5 py-8 text-center">
              Chưa có phát tâm ghi nhận. Hãy là người đầu tiên gieo duyên nước
              mát.
            </p>
          ) : (
            <ul className="divide-y divide-fog border border-fog bg-paper">
              {data.recent.map((row) => (
                <li
                  key={`${row.order_code}-${row.paid_at}`}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3.5 md:px-5"
                >
                  <div className="min-w-0">
                    <p className="text-ink font-medium truncate">
                      {row.customer_name}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {formatPaidAt(row.paid_at)}
                      {row.order_code ? (
                        <>
                          {' · '}
                          <span className="font-mono">{row.order_code}</span>
                        </>
                      ) : null}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-ink font-medium">
                      {row.quantity.toLocaleString('vi-VN')} thùng
                    </p>
                    <p className="text-xs text-muted">
                      {formatVnd(row.total_amount)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  accent: string;
}) {
  return (
    <div className="bg-paper border border-fog px-5 py-6">
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p
        className="mt-2 font-display text-3xl md:text-4xl leading-none"
        style={{ color: accent }}
      >
        {value}
      </p>
      <p className="mt-2 text-xs text-muted">{hint}</p>
    </div>
  );
}
