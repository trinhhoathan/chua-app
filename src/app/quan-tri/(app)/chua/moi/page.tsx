import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { CreateTempleForm } from '../CreateTempleForm';

export const dynamic = 'force-dynamic';

export default async function TaoChuaMoiPage() {
  const ctx = await requireAdmin();
  if (!ctx.isSuperAdmin) redirect('/quan-tri');

  return (
    <div>
      <p className="text-xs text-muted">
        <Link href="/quan-tri/chua" className="underline hover:text-ink">
          ← Danh sách Phật tự
        </Link>
      </p>
      <h1 className="mt-3 font-display text-3xl text-ink">Thêm Phật tự mới</h1>
      <p className="mt-2 text-sm text-muted max-w-2xl leading-relaxed">
        Hệ thống tạo trang chùa với template sẵn (slogan, mục giới thiệu, màu
        chủ đạo). Sau đó bổ sung ảnh / lịch sử / nội dung (tay hoặc AI) trong
        ngữ cảnh chùa vừa tạo.
      </p>
      <div className="mt-8">
        <CreateTempleForm />
      </div>
    </div>
  );
}
