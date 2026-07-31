import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { resolveTempleScope } from '@/lib/temple-scope';
import { TempleRequiredNotice } from '@/components/admin/TempleRequiredNotice';
import { getHouseholdDetail } from '@/app/actions/so';
import { HouseholdEditor } from './HouseholdEditor';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function VietSoDetailPage({ params }: Props) {
  const ctx = await requireAdmin();
  const scope = await resolveTempleScope(ctx, null);
  if (!scope.templeId || !scope.temple) {
    return <TempleRequiredNotice feature="Viết sớ" />;
  }

  const { id } = await params;
  const detail = await getHouseholdDetail(id);
  if (!detail.ok || !detail.household) notFound();
  if (detail.household.temple_id !== scope.templeId) notFound();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <Link
            href="/quan-tri/viet-so"
            className="text-sm text-muted hover:text-ink"
          >
            ← Danh sách hộ
          </Link>
          <h1 className="font-display text-3xl text-ink mt-1">
            {detail.household.chu_ho}
          </h1>
          <p className="mt-1 text-sm text-muted">{scope.temple.name}</p>
        </div>
        <Link
          href={`/quan-tri/viet-so/in?household=${detail.household.id}`}
          className="px-4 py-2 border border-fog bg-paper text-sm hover:bg-mist"
        >
          In sớ
        </Link>
      </div>

      <HouseholdEditor
        templeId={scope.templeId}
        household={detail.household}
        members={detail.members ?? []}
        ancestors={detail.ancestors ?? []}
      />
    </div>
  );
}
