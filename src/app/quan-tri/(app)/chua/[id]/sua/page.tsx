import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { getTempleBasicsAction } from '@/app/actions/temples';
import { EditTempleBasicsForm } from '../../EditTempleBasicsForm';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SuaChuaPage({ params }: Props) {
  const ctx = await requireAdmin();
  if (!ctx.isSuperAdmin) redirect('/quan-tri');

  const { id } = await params;
  const res = await getTempleBasicsAction(id);
  if (!res.ok) notFound();

  return (
    <div>
      <p className="text-xs text-muted">
        <Link href="/quan-tri/chua" className="underline hover:text-ink">
          ← Danh sách Phật tự
        </Link>
      </p>
      <h1 className="mt-3 font-display text-3xl text-ink">
        Sửa thông tin cơ bản
      </h1>
      <p className="mt-2 text-sm text-muted max-w-2xl">
        {res.temple.name} — đổi trụ trì, địa chỉ, màu, liên hệ. Nội dung CMS dài
        (ảnh, lịch sử chi tiết) chỉnh ở các mục khác sau khi «Làm việc tại đây».
      </p>
      <div className="mt-8">
        <EditTempleBasicsForm temple={res.temple} />
      </div>
    </div>
  );
}
