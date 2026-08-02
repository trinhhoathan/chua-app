export type CredentialAuditAction =
  | 'password_reset'
  | 'password_change'
  | 'phone_change';

const ACTION_LABELS: Record<CredentialAuditAction, string> = {
  password_reset: 'Reset mật khẩu (super admin)',
  password_change: 'Tự đổi mật khẩu',
  phone_change: 'Đổi SĐT đăng nhập',
};

export function credentialActionLabel(action: CredentialAuditAction): string {
  return ACTION_LABELS[action] ?? action;
}
