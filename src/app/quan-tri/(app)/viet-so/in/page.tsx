import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { resolveTempleScope } from '@/lib/temple-scope';
import { TempleRequiredNotice } from '@/components/admin/TempleRequiredNotice';
import type { SoHousehold } from '@/types/database';
import catalog from '@/data/so-templates-index.json';
import { PrintSoBoard } from './PrintSoBoard';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ household?: string }>;
}

export default async function VietSoInPage({ searchParams }: Props) {
  const ctx = await requireAdmin();
  const scope = await resolveTempleScope(ctx, null);
  const sp = await searchParams;

  if (!scope.templeId || !scope.temple) {
    return <TempleRequiredNotice feature="In sớ" />;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from('so_households')
    .select('id, chu_ho')
    .eq('temple_id', scope.templeId)
    .is('deleted_at', null)
    .order('chu_ho', { ascending: true });

  const households = (data ?? []) as Pick<SoHousehold, 'id' | 'chu_ho'>[];

  const templates = (catalog.templates ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    lang: t.lang,
    kind: t.kind,
    sizes: t.sizes,
  }));

  const sets = (catalog.sets ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    longsoIds: s.longsoIds ?? [],
  }));

  return (
    <div>
      <Link
        href="/quan-tri/viet-so"
        className="text-sm text-muted hover:text-ink"
      >
        ← Viết sớ
      </Link>
      <h1 className="font-display text-3xl text-ink mt-1">In sớ</h1>
      <p className="mt-2 text-sm text-muted max-w-2xl leading-relaxed">
        {scope.temple.name} — chọn bộ sớ, lòng sớ, khổ giấy và hộ tín chủ.
      </p>
      <div className="mt-6">
        <PrintSoBoard
          households={households}
          templates={templates}
          sets={sets}
          initialHouseholdId={sp.household}
        />
      </div>
    </div>
  );
}
