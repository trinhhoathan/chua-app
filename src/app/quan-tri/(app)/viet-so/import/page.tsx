import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { resolveTempleScope } from '@/lib/temple-scope';
import { TempleRequiredNotice } from '@/components/admin/TempleRequiredNotice';
import { ImportExcelBoard } from './ImportExcelBoard';

export const dynamic = 'force-dynamic';

export default async function VietSoImportPage() {
  const ctx = await requireAdmin();
  const scope = await resolveTempleScope(ctx, null);

  if (!scope.templeId || !scope.temple) {
    return <TempleRequiredNotice feature="Import Excel viết sớ" />;
  }

  return (
    <div>
      <Link
        href="/quan-tri/viet-so"
        className="text-sm text-muted hover:text-ink"
      >
        ← Viết sớ
      </Link>
      <h1 className="font-display text-3xl text-ink mt-1">Import Excel</h1>
      <p className="mt-2 text-sm text-muted max-w-2xl leading-relaxed">
        Nhập danh sách hộ tín chủ từ file Excel vào {scope.temple.name}.
      </p>
      <div className="mt-6">
        <ImportExcelBoard
          templeId={scope.templeId}
          templeName={scope.temple.name}
        />
      </div>
    </div>
  );
}
