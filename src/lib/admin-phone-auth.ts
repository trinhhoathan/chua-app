/** Auth login uses phone as identity; Supabase still stores a synthetic email. */

export const PHONE_LOGIN_DOMAIN = 'phone.chua.app';

const VN_MOBILE = /^0\d{9}$/;

/** Chuẩn hóa SĐT VN về dạng 0xxxxxxxxx (10 số). */
export function normalizeLoginPhone(raw: string): string | null {
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return null;

  let local = digits;
  if (local.startsWith('84') && local.length >= 11) {
    local = `0${local.slice(2)}`;
  }
  if (local.length === 9) {
    local = `0${local}`;
  }
  if (!VN_MOBILE.test(local)) return null;
  return local;
}

/** Email nội bộ map từ SĐT — không dùng để gửi mail. */
export function phoneToLoginEmail(phone: string): string {
  const normalized = normalizeLoginPhone(phone);
  if (!normalized) {
    throw new Error('Số điện thoại không hợp lệ');
  }
  return `${normalized}@${PHONE_LOGIN_DOMAIN}`;
}

export function loginEmailToPhone(email: string | null | undefined): string | null {
  if (!email) return null;
  const lower = email.trim().toLowerCase();
  const suffix = `@${PHONE_LOGIN_DOMAIN}`;
  if (!lower.endsWith(suffix)) return null;
  return normalizeLoginPhone(lower.slice(0, -suffix.length));
}

/** Mật khẩu quản trị: đúng 6 chữ số. */
export function isNumericPin(password: string): boolean {
  return /^\d{6}$/.test(password);
}

export function formatPhoneDisplay(phone: string): string {
  const n = normalizeLoginPhone(phone);
  if (!n) return phone;
  return `${n.slice(0, 4)} ${n.slice(4, 7)} ${n.slice(7)}`;
}
