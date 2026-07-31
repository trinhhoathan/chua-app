import { redirect } from 'next/navigation';
import { requireAdmin, searchTemples } from '@/lib/auth';
import { listTempleMembersAction } from '@/app/actions/members';
import { MembersAdminPanel } from './MembersAdminPanel';

export default async function ThanhVienPage() {
  const ctx = await requireAdmin();
  if (!ctx.isSuperAdmin) {
    redirect('/quan-tri');
  }

  const listed = await listTempleMembersAction();
  const members = listed.ok && listed.members ? listed.members : [];
  const temples = await searchTemples('', 50);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Thành viên & phân quyền</h1>
      <p className="mt-2 text-sm text-muted max-w-2xl leading-relaxed">
        Siêu quản trị viên tạo tài khoản trụ trì (user thành viên), gắn với từng
        chùa và cấp quyền. Đăng nhập bằng số điện thoại + mật khẩu 6 số. Dùng ô
        tìm Phật tự trên header nếu cần thu hẹp ngữ cảnh.
      </p>
      <div className="mt-8">
        <MembersAdminPanel temples={temples} initialMembers={members} />
      </div>
    </div>
  );
}
