import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { formatVnd } from '@/lib/tenant';
import { WaterPriceForm } from './WaterPriceForm';

export default async function DonGiaPage() {
  const ctx = await requireAdmin();
  const templeIds = ctx.temples.map((t) => t.id);
  if (templeIds.length === 0) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from('temples')
    .select('id, name, water_price_vnd')
    .in('id', templeIds)
    .eq('is_active', true)
    .order('name');

  const temples = (data ?? []).map((t) => ({
    id: String(t.id),
    name: String(t.name),
    water_price_vnd: Number(t.water_price_vnd ?? 80000),
  }));

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Đơn giá nước</h1>
      <p className="mt-2 text-sm text-muted max-w-2xl leading-relaxed">
        Quản lý mức phát tâm mỗi thùng nước thanh tịnh trên website. Hiện tại:{' '}
        <span className="text-ink font-medium">
          {temples.map((t) => `${t.name} ${formatVnd(t.water_price_vnd)}đ`).join(' · ')}
        </span>
      </p>

      <div className="mt-8">
        <WaterPriceForm temples={temples} />
      </div>
    </div>
  );
}
