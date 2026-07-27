/**
 * Tài khoản ngân hàng của CÔNG TY (1 tài khoản duy nhất).
 * Phân biệt chùa bằng mã nội dung chuyển khoản:
 *   {payment_code}-{order_code}  ví dụ: CV-A3K9MP2Q
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
  /** Nội dung CK, ví dụ CV-A3K9MP */
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
    params.set('addInfo', options.addInfo.slice(0, 25));
  }
  if (bank.accountHolder) {
    params.set('accountName', bank.accountHolder);
  }

  const qs = params.toString();
  return `https://img.vietqr.io/image/${bankBin}-${accountNumber}-${template}.jpg${
    qs ? `?${qs}` : ''
  }`;
}

/** Nội dung CK: CV-A3K9MP2Q — dễ đọc trên sao kê, map về đúng chùa + đơn. */
export function buildPaymentContent(
  paymentCode: string,
  orderCode: string,
): string {
  const prefix = (paymentCode || 'XX').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const code = orderCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return `${prefix}-${code}`;
}

export function generateOrderCode(paymentCode?: string | null): string {
  const chars = 'ACDEFGHJKLMNPQRTUVWXY34679';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  const prefix = (paymentCode || 'XX')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 4);
  return `${prefix}-${suffix}`;
}

export function parsePaymentContent(content: string): {
  paymentCode: string | null;
  orderCode: string;
} {
  const cleaned = content.toUpperCase().replace(/\s+/g, '');
  const match = cleaned.match(/^([A-Z0-9]{1,6})-([A-Z0-9]{4,12})$/);
  if (match) {
    return { paymentCode: match[1], orderCode: cleaned };
  }
  return { paymentCode: null, orderCode: cleaned };
}

/**
 * Tìm mã đơn trong nội dung CK ngân hàng / SePay
 * (ví dụ: "NGUYEN VAN A CV-GCMJND chuyen tien").
 */
export function extractOrderCodeFromContent(content: string): string | null {
  const upper = (content || '').toUpperCase();
  const match = upper.match(/\b([A-Z0-9]{1,6}-[A-Z0-9]{4,12})\b/);
  return match ? match[1] : null;
}
