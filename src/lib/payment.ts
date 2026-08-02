/**
 * Tài khoản ngân hàng của CÔNG TY (1 tài khoản duy nhất).
 * Phân biệt chùa bằng mã nội dung chuyển khoản:
 *   {payment_code}{suffix}  ví dụ: CVA3K9MP  (không dấu gạch)
 *
 * QR thanh toán dùng VietQR Quick Link (img.vietqr.io) — quét là điền sẵn
 * STK, số tiền và nội dung CK.
 */

export interface CompanyBankAccount {
  bankName: string;
  /** Mã BIN NAPAS, ví dụ VietinBank = 970415 */
  bankBin: string;
  accountNumber: string;
  accountHolder: string;
  /** QR tĩnh (không số tiền) — trang giới thiệu */
  qrImageUrl: string | null;
}

export interface VietQrOptions {
  /** Số tiền VND (không dấu phẩy) */
  amount?: number;
  /** Nội dung CK, ví dụ CVA3K9MP */
  addInfo?: string;
  /** Template: compact2 | compact | qr_only | print */
  template?: 'compact2' | 'compact' | 'qr_only' | 'print';
}

export function getCompanyBankAccount(): CompanyBankAccount {
  const accountNumber = (process.env.COMPANY_BANK_ACCOUNT_NUMBER ?? '').replace(
    /\s+/g,
    '',
  );
  const accountHolder = process.env.COMPANY_BANK_ACCOUNT_HOLDER ?? '';
  const bankName = process.env.COMPANY_BANK_NAME ?? 'VietinBank';
  const bankBin = process.env.COMPANY_BANK_BIN ?? '970415';

  const bank: CompanyBankAccount = {
    bankName,
    bankBin,
    accountNumber,
    accountHolder,
    qrImageUrl: null,
  };

  bank.qrImageUrl =
    process.env.COMPANY_VIETQR_URL ||
    buildVietQrUrl(bank, { template: 'compact2' });

  return bank;
}

/**
 * Chuẩn hoá mã đơn: chỉ A–Z / 0–9, không dấu `-` / khoảng trắng.
 * Dùng thống nhất cho QR, hiển thị, webhook, mở khóa luận giải.
 */
export function normalizeOrderCode(code: string): string {
  return (code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/** @deprecated dùng normalizeOrderCode */
export function normalizeOrderCodeKey(code: string): string {
  return normalizeOrderCode(code);
}

/** Nội dung CK đưa vào VietQR / app ngân hàng (= mã đơn chuẩn hoá). */
export function toVietQrTransferContent(orderCode: string): string {
  return normalizeOrderCode(orderCode).slice(0, 25);
}

/**
 * Sinh URL ảnh VietQR từ thông tin tài khoản (dùng được cả server và client).
 * Khi có `amount` + `addInfo`, app ngân hàng điền sẵn số tiền và nội dung CK.
 */
export function buildVietQrUrl(
  bank: Pick<
    CompanyBankAccount,
    'bankBin' | 'accountNumber' | 'accountHolder'
  >,
  options: VietQrOptions = {},
): string | null {
  const accountNumber = (bank.accountNumber || '').replace(/\s+/g, '');
  if (!accountNumber) return null;

  const bankBin = bank.bankBin || '970415';
  const template = options.template ?? 'compact2';

  const params = new URLSearchParams();
  if (options.amount && options.amount > 0) {
    params.set('amount', String(Math.round(options.amount)));
  }
  if (options.addInfo) {
    const addInfo = toVietQrTransferContent(options.addInfo);
    if (addInfo) params.set('addInfo', addInfo);
  }
  if (bank.accountHolder) {
    params.set('accountName', bank.accountHolder);
  }

  const qs = params.toString();
  return `https://img.vietqr.io/image/${bankBin}-${accountNumber}-${template}.jpg${
    qs ? `?${qs}` : ''
  }`;
}

/** Nội dung CK = mã đơn (không gạch). */
export function buildPaymentContent(
  paymentCode: string,
  orderCode: string,
): string {
  const prefix = normalizeOrderCode(paymentCode || 'XX');
  const code = normalizeOrderCode(orderCode);
  // Nếu orderCode đã gồm prefix thì dùng luôn.
  if (code.startsWith(prefix)) return code;
  return `${prefix}${code}`;
}

/** Sinh mã đơn mới: {paymentCode}{6 ký tự} — không dấu gạch. */
export function generateOrderCode(paymentCode?: string | null): string {
  const chars = 'ACDEFGHJKLMNPQRTUVWXY34679';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  const prefix = normalizeOrderCode(paymentCode || 'XX').slice(0, 4);
  return `${prefix}${suffix}`;
}

export function parsePaymentContent(content: string): {
  paymentCode: string | null;
  orderCode: string;
} {
  const cleaned = normalizeOrderCode(content);
  // Legacy có gạch: CV-XXXX
  const legacy = content.toUpperCase().replace(/\s+/g, '');
  const match = legacy.match(/^([A-Z0-9]{1,6})-([A-Z0-9]{4,12})$/);
  if (match) {
    return { paymentCode: match[1], orderCode: normalizeOrderCode(legacy) };
  }
  return { paymentCode: null, orderCode: cleaned };
}

/**
 * Ứng viên mã đơn trong nội dung CK ngân hàng / SePay.
 * Hỗ trợ legacy `CV-GCMJND` và dạng chuẩn `CVGCMJND`.
 */
export function extractOrderCodeCandidates(content: string): string[] {
  const upper = (content || '').toUpperCase();
  const out: string[] = [];

  const withHyphen = upper.match(/\b([A-Z0-9]{1,6}-[A-Z0-9]{4,12})\b/g);
  if (withHyphen) {
    for (const h of withHyphen) out.push(normalizeOrderCode(h));
  }

  const tokens = upper.match(/\b[A-Z0-9]{6,16}\b/g) ?? [];
  for (const t of tokens) {
    if (/^\d/.test(t)) continue;
    if (t.length < 7 || t.length > 12) continue;
    if (!/^[A-Z]{1,4}[A-Z0-9]+$/.test(t)) continue;
    out.push(normalizeOrderCode(t));
  }

  return [...new Set(out)];
}

export function extractOrderCodeFromContent(content: string): string | null {
  const candidates = extractOrderCodeCandidates(content);
  return candidates[0] ?? null;
}
