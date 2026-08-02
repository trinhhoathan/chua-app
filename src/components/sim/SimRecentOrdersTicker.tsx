import { getSupabaseAdmin } from '@/lib/supabase-admin';

function maskName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1]}` : parts[0];
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 6) return 'xxx';
  return `${digits.slice(0, 4)}xxx${digits.slice(-3)}`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${Math.max(1, mins)} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}

/**
 * Ticker "đơn đặt gần đây" — social proof từ đơn thật, ẩn bớt SĐT khách.
 * Server component; im lặng nếu thiếu service role hoặc chưa có đơn.
 */
export async function SimRecentOrdersTicker({ templeId }: { templeId: string }) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;

  let rows: Array<{
    customer_name: string;
    customer_phone: string;
    phone_display: string;
    created_at: string;
  }> = [];
  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from('sim_orders')
      .select('customer_name, customer_phone, phone_display, created_at')
      .eq('temple_id', templeId)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false })
      .limit(8);
    rows = data ?? [];
  } catch {
    return null;
  }

  if (rows.length === 0) return null;

  return (
    <div className="mt-3 overflow-hidden border border-fog bg-mist/40">
      <div className="flex items-center gap-3 px-3 py-2">
        <span className="shrink-0 text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-[#1B6B3A]">
          Đơn gần đây
        </span>
        <div className="flex gap-6 overflow-x-auto whitespace-nowrap text-[0.7rem] text-muted [scrollbar-width:none]">
          {rows.map((r, i) => (
            <span key={i} className="shrink-0">
              <span className="text-ink">{maskName(r.customer_name)}</span>{' '}
              ({maskPhone(r.customer_phone)}) đã đặt{' '}
              <span className="font-medium text-lacquer">{r.phone_display}</span>{' '}
              · {timeAgo(r.created_at)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
