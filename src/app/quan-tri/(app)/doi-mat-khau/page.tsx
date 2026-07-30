import { ChangePasswordForm } from './ChangePasswordForm';

export default function DoiMatKhauPage() {
  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Đổi mật khẩu</h1>
      <p className="mt-2 text-sm text-muted max-w-xl leading-relaxed">
        Mật khẩu quản trị là 6 chữ số. Sau khi đổi, dùng mật khẩu mới khi đăng
        nhập lần sau.
      </p>
      <div className="mt-8">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
