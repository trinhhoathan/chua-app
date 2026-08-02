import { redirect } from 'next/navigation';
import { requireAdmin, searchTemples } from '@/lib/auth';
import {
  listCredentialAuditLogsAction,
  listTempleMembersAction,
} from '@/app/actions/members';
import { MembersAdminPanel } from './MembersAdminPanel';

export default async function ThanhVienPage() {
  const ctx = await requireAdmin();
  if (!ctx.isSuperAdmin) {
    redirect('/quan-tri');
  }

  const [listed, audit] = await Promise.all([
    listTempleMembersAction(),
    listCredentialAuditLogsAction(),
  ]);
  const members = listed.ok && listed.members ? listed.members : [];
  const logs = audit.ok && audit.logs ? audit.logs : [];
  const temples = await searchTemples('', 50);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Thành viên & phân quyền</h1>
      <p className="mt-2 text-sm text-muted max-w-2xl leading-relaxed">
        Siêu quản trị viên tạo tài khoản trụ trì (user thành viên), gắn với từng
        chùa và cấp quyền. Đăng nhập bằng số điện thoại + mật khẩu 6 số. Có thể
        đổi SĐT đăng nhập, reset PIN và xem nhật ký bảo mật (ai / lúc nào / IP).
      </p>
      <div className="mt-8">
        <MembersAdminPanel
          temples={temples}
          initialMembers={members}
          initialLogs={logs}
        />
      </div>
    </div>
  );
}
