import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { resolveTempleScope } from '@/lib/temple-scope';
import { TempleRequiredNotice } from '@/components/admin/TempleRequiredNotice';
import { upsertHousehold } from '@/app/actions/so';

export const dynamic = 'force-dynamic';

async function createEmptyHousehold() {
  'use server';
  const ctx = await requireAdmin();
  const scope = await resolveTempleScope(ctx, null);
  if (!scope.templeId) {
    redirect('/quan-tri/viet-so');
  }
  const res = await upsertHousehold({
    templeId: scope.templeId,
    chuHo: 'Hộ mới',
  });
  if (!res.ok || !res.id) {
    redirect('/quan-tri/viet-so?err=create');
  }
  redirect(`/quan-tri/viet-so/${res.id}`);
}

export default async function VietSoMoiPage() {
  const ctx = await requireAdmin();
  const scope = await resolveTempleScope(ctx, null);

  if (!scope.templeId || !scope.temple) {
    return <TempleRequiredNotice feature="Viết sớ" />;
  }

  return (
    <div className="border border-fog bg-paper p-8 max-w-lg">
      <h1 className="font-display text-2xl text-ink">Thêm hộ mới</h1>
      <p className="mt-2 text-sm text-muted leading-relaxed">
        Tạo hộ trống tại {scope.temple.name}, rồi chuyển sang form nhập liệu.
      </p>
      <form action={createEmptyHousehold} className="mt-6">
        <button type="submit" className="px-4 py-2 bg-ink text-white text-sm">
          Tạo hộ & mở form
        </button>
      </form>
    </div>
  );
}
