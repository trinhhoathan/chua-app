'use client';

import { useState, useTransition } from 'react';
import {
  createTempleMemberAction,
  listTempleMembersAction,
  resetTempleMemberPasswordAction,
  updateTempleMemberAction,
} from '@/app/actions/members';
import { formatPhoneDisplay } from '@/lib/admin-phone-auth';

export type MemberRow = {
  id: string;
  user_id: string;
  temple_id: string;
  temple_name: string;
  role: 'admin' | 'staff';
  display_name: string | null;
  phone: string | null;
  is_super_admin: boolean;
  is_active: boolean;
  created_at: string;
};

type TempleOpt = { id: string; name: string };

export function MembersAdminPanel({
  temples,
  initialMembers,
}: {
  temples: TempleOpt[];
  initialMembers: MemberRow[];
}) {
  const [members, setMembers] = useState(initialMembers);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [templeId, setTempleId] = useState(temples[0]?.id ?? '');
  const [role, setRole] = useState<'admin' | 'staff'>('admin');
  const [asSuper, setAsSuper] = useState(false);

  function refreshFromServer(next: MemberRow[]) {
    setMembers(next);
  }

  function createMember(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    start(async () => {
      const res = await createTempleMemberAction({
        phone,
        password,
        templeId,
        displayName,
        role,
        isSuperAdmin: asSuper,
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setMsg('Đã tạo tài khoản thành viên.');
      setPhone('');
      setPassword('');
      setDisplayName('');
      setAsSuper(false);
      const listed = await listTempleMembersAction();
      if (listed.ok && listed.members) refreshFromServer(listed.members);
    });
  }

  function toggleActive(m: MemberRow) {
    setMsg(null);
    setErr(null);
    start(async () => {
      const res = await updateTempleMemberAction({
        id: m.id,
        isActive: !m.is_active,
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setMembers((prev) =>
        prev.map((x) =>
          x.id === m.id ? { ...x, is_active: !m.is_active } : x,
        ),
      );
      setMsg(m.is_active ? 'Đã khóa tài khoản.' : 'Đã mở lại tài khoản.');
    });
  }

  function toggleSuper(m: MemberRow) {
    setMsg(null);
    setErr(null);
    start(async () => {
      const res = await updateTempleMemberAction({
        id: m.id,
        isSuperAdmin: !m.is_super_admin,
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setMembers((prev) =>
        prev.map((x) =>
          x.id === m.id ? { ...x, is_super_admin: !m.is_super_admin } : x,
        ),
      );
      setMsg('Đã cập nhật quyền quản trị viên nền tảng.');
    });
  }

  function changeRole(m: MemberRow, nextRole: 'admin' | 'staff') {
    setMsg(null);
    setErr(null);
    start(async () => {
      const res = await updateTempleMemberAction({ id: m.id, role: nextRole });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setMembers((prev) =>
        prev.map((x) => (x.id === m.id ? { ...x, role: nextRole } : x)),
      );
    });
  }

  function changeTemple(m: MemberRow, nextTempleId: string) {
    setMsg(null);
    setErr(null);
    start(async () => {
      const res = await updateTempleMemberAction({
        id: m.id,
        templeId: nextTempleId,
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      const templeName =
        temples.find((t) => t.id === nextTempleId)?.name ?? '—';
      setMembers((prev) =>
        prev.map((x) =>
          x.id === m.id
            ? { ...x, temple_id: nextTempleId, temple_name: templeName }
            : x,
        ),
      );
    });
  }

  function resetPin(m: MemberRow) {
    const pin = window.prompt(
      `Mật khẩu mới (6 số) cho ${m.display_name ?? m.phone ?? 'thành viên'}:`,
    );
    if (pin == null) return;
    setMsg(null);
    setErr(null);
    start(async () => {
      const res = await resetTempleMemberPasswordAction({
        id: m.id,
        password: pin.trim(),
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setMsg('Đã đặt lại mật khẩu.');
    });
  }

  return (
    <div className="space-y-10">
      {msg ? (
        <p className="text-sm text-jade-deep bg-jade/10 border border-jade/20 p-3">
          {msg}
        </p>
      ) : null}
      {err ? (
        <p className="text-sm text-lacquer bg-lacquer/5 border border-lacquer/20 p-3">
          {err}
        </p>
      ) : null}

      <section className="border border-fog bg-paper p-6">
        <h2 className="font-display text-xl text-ink">Thêm trụ trì / thành viên</h2>
        <p className="mt-1 text-sm text-muted">
          Đăng nhập bằng số điện thoại + mật khẩu 6 số. User thành viên = trụ trì
          (hoặc ban quản lý) của một chùa.
        </p>
        <form onSubmit={createMember} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block text-xs text-muted">
            Họ tên / pháp danh
            <input
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-fog bg-white"
              placeholder="Thượng tọa Thích Quảng Trang"
            />
          </label>
          <label className="block text-xs text-muted">
            Số điện thoại
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="numeric"
              className="mt-1 w-full px-3 py-2 border border-fog bg-white"
              placeholder="0981666568"
            />
          </label>
          <label className="block text-xs text-muted">
            Mật khẩu (6 số)
            <input
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              inputMode="numeric"
              maxLength={6}
              pattern="[0-9]{6}"
              className="mt-1 w-full px-3 py-2 border border-fog bg-white tracking-[0.3em]"
              placeholder="926011"
            />
          </label>
          <label className="block text-xs text-muted">
            Chùa
            <select
              required
              value={templeId}
              onChange={(e) => setTempleId(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-fog bg-white"
            >
              {temples.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-muted">
            Vai trò tại chùa
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'staff')}
              className="mt-1 w-full px-3 py-2 border border-fog bg-white"
            >
              <option value="admin">Trụ trì / Admin chùa</option>
              <option value="staff">Nhân sự</option>
            </select>
          </label>
          <label className="flex items-end gap-2 text-sm text-ink pb-2">
            <input
              type="checkbox"
              checked={asSuper}
              onChange={(e) => setAsSuper(e.target.checked)}
            />
            Cấp quyền siêu quản trị (tất cả chùa)
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={pending}
              className="px-5 py-2.5 text-sm text-white bg-ink hover:bg-jade-deep disabled:opacity-60"
            >
              {pending ? 'Đang lưu…' : 'Tạo tài khoản'}
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="font-display text-xl text-ink">Danh sách tài khoản</h2>
        <div className="mt-4 overflow-x-auto border border-fog bg-paper">
          <table className="w-full text-sm">
            <thead className="bg-mist text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="p-3">Thành viên</th>
                <th className="p-3">SĐT</th>
                <th className="p-3">Chùa</th>
                <th className="p-3">Vai trò</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-t border-fog align-top">
                  <td className="p-3">
                    <p className="font-medium text-ink">
                      {m.display_name ?? '—'}
                    </p>
                    {m.is_super_admin ? (
                      <p className="text-[11px] text-gilt mt-0.5">Super admin</p>
                    ) : null}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {m.phone ? formatPhoneDisplay(m.phone) : '—'}
                  </td>
                  <td className="p-3">
                    <select
                      value={m.temple_id}
                      disabled={pending}
                      onChange={(e) => changeTemple(m, e.target.value)}
                      className="w-full max-w-[14rem] px-2 py-1 border border-fog bg-white"
                    >
                      {temples.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">
                    <select
                      value={m.role}
                      disabled={pending}
                      onChange={(e) =>
                        changeRole(m, e.target.value as 'admin' | 'staff')
                      }
                      className="px-2 py-1 border border-fog bg-white"
                    >
                      <option value="admin">Admin chùa</option>
                      <option value="staff">Nhân sự</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <span
                      className={
                        m.is_active ? 'text-jade-deep' : 'text-lacquer'
                      }
                    >
                      {m.is_active ? 'Đang mở' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => toggleActive(m)}
                        className="px-2 py-1 text-xs border border-fog hover:bg-mist"
                      >
                        {m.is_active ? 'Khóa' : 'Mở'}
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => toggleSuper(m)}
                        className="px-2 py-1 text-xs border border-fog hover:bg-mist"
                      >
                        {m.is_super_admin ? 'Bỏ super' : 'Cấp super'}
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => resetPin(m)}
                        className="px-2 py-1 text-xs border border-fog hover:bg-mist"
                      >
                        Đổi PIN
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted">
                    Chưa có tài khoản nào.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
