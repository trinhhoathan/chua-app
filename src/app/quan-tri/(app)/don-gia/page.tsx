import { redirect } from 'next/navigation';
import { requireAdmin, searchTemples } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { formatVnd } from '@/lib/tenant';
import { WaterPriceForm } from './WaterPriceForm';

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function DonGiaPage({ searchParams }: Props) {
  const ctx = await requireAdmin();
  if (!ctx.isSuperAdmin) {
    redirect('/quan-tri');
  }

  const sp = await searchParams;
  const q = (sp.q ?? '').trim();
  const found = await searchTemples(q, 50);
  const templeIds = found.map((t) => t.id);
  if (templeIds.length === 0) {
    return (
      <div>
        <h1 className="font-display text-3xl text-ink">Đơn giá nước</h1>
        <p className="mt-2 text-sm text-muted">Không tìm thấy Phật tự.</p>
      </div>
    );
  }

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
        Chỉ siêu quản trị viên được đặt mức phát tâm mỗi thùng. Hiện tại:{' '}
        <span className="text-ink font-medium">
          {temples
            .slice(0, 5)
            .map((t) => `${t.name} ${formatVnd(t.water_price_vnd)}`)
            .join(' · ')}
          {temples.length > 5 ? ' …' : ''}
        </span>
      </p>

      <form className="mt-4 flex gap-2" action="/quan-tri/don-gia" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Tìm Phật tự…"
          className="flex-1 max-w-md px-3 py-2 text-sm border border-fog bg-paper"
        />
        <button type="submit" className="px-4 py-2 bg-ink text-white text-sm">
          Tìm
        </button>
      </form>

      <div className="mt-8">
        <WaterPriceForm temples={temples} />
      </div>
    </div>
  );
}
