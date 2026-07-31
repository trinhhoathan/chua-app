import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { resolveTempleScope } from '@/lib/temple-scope';
import { TempleRequiredNotice } from '@/components/admin/TempleRequiredNotice';
import { getHouseholdDetail } from '@/app/actions/so';
import { SoPreviewBatch } from '@/components/so/SoPreview';
import type { SoPaperSize } from '@/lib/so-render/types';
import catalog from '@/data/so-templates-index.json';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{
    household?: string;
    longso?: string;
    size?: string;
  }>;
}

const SIZES: SoPaperSize[] = ['A3', 'A3s', 'long', 'super_long', 'A2'];

export default async function VietSoPreviewPage({ searchParams }: Props) {
  const ctx = await requireAdmin();
  const scope = await resolveTempleScope(ctx, null);
  if (!scope.templeId || !scope.temple) {
    return <TempleRequiredNotice feature="Xem trước sớ" />;
  }

  const sp = await searchParams;
  const householdId = (sp.household ?? '').trim();
  const longsoIds = (sp.longso ?? '')
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
  const sizeRaw = (sp.size ?? 'A3') as SoPaperSize;
  const paperSize: SoPaperSize = SIZES.includes(sizeRaw) ? sizeRaw : 'A3';

  if (!householdId) {
    return (
      <div>
        <p className="text-sm text-muted">Thiếu hộ tín chủ.</p>
        <Link href="/quan-tri/viet-so/in" className="text-sm underline mt-2 inline-block">
          ← Quay lại In sớ
        </Link>
      </div>
    );
  }

  const detail = await getHouseholdDetail(householdId);
  if (
    !detail.ok ||
    !detail.household ||
    detail.household.temple_id !== scope.templeId
  ) {
    return (
      <div>
        <p className="text-sm text-lacquer">
          {detail.error ?? 'Không tải được hộ.'}
        </p>
        <Link href="/quan-tri/viet-so/in" className="text-sm underline mt-2 inline-block">
          ← Quay lại In sớ
        </Link>
      </div>
    );
  }

  const nameById = new Map(
    (catalog.templates ?? []).map((t) => [t.id, t.name]),
  );
  const items = longsoIds.map((id) => ({
    longsoId: id,
    tenSo: nameById.get(id) ?? `Lòng sớ #${id}`,
  }));

  const backQs = new URLSearchParams();
  backQs.set('household', householdId);

  return (
    <div>
      <link rel="stylesheet" href="/fonts/so/so-fonts.css" />
      <Link
        href={`/quan-tri/viet-so/in?${backQs.toString()}`}
        className="text-sm text-muted hover:text-ink print:hidden"
      >
        ← Quay lại In sớ
      </Link>
      <h1 className="font-display text-3xl text-ink mt-1 print:hidden">
        Xem trước sớ
      </h1>
      <p className="mt-2 text-sm text-muted print:hidden">
        {scope.temple.name} · {detail.household.chu_ho}
      </p>
      <div className="mt-6">
        <SoPreviewBatch
          household={detail.household}
          members={detail.members ?? []}
          ancestors={detail.ancestors ?? []}
          items={items}
          paperSize={paperSize}
        />
      </div>
    </div>
  );
}
