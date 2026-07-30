'use client';

import { useState, useTransition } from 'react';
import { changeOwnPasswordAction } from '@/app/actions/auth';

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);

    if (newPassword !== confirmPassword) {
      setErr('Mật khẩu mới và xác nhận không khớp.');
      return;
    }

    start(async () => {
      const res = await changeOwnPasswordAction({
        currentPassword,
        newPassword,
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setMsg('Đã đổi mật khẩu thành công. Lần đăng nhập sau dùng mật khẩu mới.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-md border border-fog bg-paper p-5 md:p-6 space-y-4"
    >
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

      <label className="block text-xs text-muted">
        Mật khẩu hiện tại
        <input
          type="password"
          required
          autoComplete="current-password"
          minLength={6}
          maxLength={72}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="mt-1 w-full px-3 py-2 border border-fog bg-white"
          placeholder="••••••••"
        />
      </label>

      <label className="block text-xs text-muted">
        Mật khẩu mới (PIN 6 số hoặc ≥ 8 ký tự)
        <input
          type="password"
          required
          autoComplete="new-password"
          minLength={6}
          maxLength={72}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mt-1 w-full px-3 py-2 border border-fog bg-white"
          placeholder="••••••••"
        />
      </label>

      <label className="block text-xs text-muted">
        Xác nhận mật khẩu mới
        <input
          type="password"
          required
          autoComplete="new-password"
          minLength={6}
          maxLength={72}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1 w-full px-3 py-2 border border-fog bg-white"
          placeholder="••••••••"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="px-5 py-2.5 text-sm text-white bg-ink hover:bg-jade-deep disabled:opacity-60"
      >
        {pending ? 'Đang lưu…' : 'Đổi mật khẩu'}
      </button>
    </form>
  );
}
