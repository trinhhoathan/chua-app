/**
 * Tài khoản ngân hàng của CÔNG TY (1 tài khoản duy nhất).
 * Phân biệt chùa bằng mã nội dung chuyển khoản:
 *   {payment_code}{suffix}  ví dụ: CVA3K9MP  (không dấu gạch)
 *
 * QR thanh toán dùng SePay VietQR: https://vietqr.app/img
 * Docs: https://developer.sepay.vn/vi/tien-ich-khac/tao-qr-code
 *
 * MSB bắt buộc VA — COMPANY_BANK_ACCOUNT_NUMBER phải là số VA nhận tiền.
 */

import { toSePayBankId } from '@/lib/banks';

export interface CompanyBankAccount {
  bankName: string;
  /** Mã BIN NAPAS, ví dụ MSB = 970426 */
  bankBin: string;
  accountNumber: string;
  accountHolder: string;
  /** QR tĩnh (không số tiền) — trang giới thiệu */
  qrImageUrl: string | null;
}

export type SePayQrTemplate = 'compact' | 'qronly' | 'standee';

export interface VietQrOptions {
  /** Số tiền VND (không dấu phẩy) */
  amount?: number;
  /** Nội dung CK → tham số `des` (vd. CVA3K9MP) */
  addInfo?: string;
  /** Template SePay; alias cũ compact2/qr_only/print vẫn nhận */
  template?: SePayQrTemplate | 'compact2' | 'qr_only' | 'print';
  showInfo?: boolean;
  fullAcc?: boolean;
  store?: string;
}

/** Chủ TK trên ảnh SePay: không dấu, bỏ ký tự lỗi encoding. */
export function toSePayHolder(name: string): string {
  return (name || '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\?/g, '')
    .replace(/[^A-Za-z0-9\s./-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()
    .slice(0, 70);
}

function mapSePayTemplate(
  template?: VietQrOptions['template'],
): SePayQrTemplate {
  if (template === 'qronly' || template === 'qr_only') return 'qronly';
  if (template === 'standee') return 'standee';
  return 'compact';
}

export function getCompanyBankAccount(): CompanyBankAccount {
  const accountNumber = (process.env.COMPANY_BANK_ACCOUNT_NUMBER ?? '').replace(
    /\s+/g,
    '',
  );
  const accountHolder = process.env.COMPANY_BANK_ACCOUNT_HOLDER ?? '';
  const bankName = process.env.COMPANY_BANK_NAME ?? 'MSB';
  const bankBin = process.env.COMPANY_BANK_BIN ?? '970426';

  const bank: CompanyBankAccount = {
    bankName,
    bankBin,
    accountNumber,
    accountHolder,
    qrImageUrl: null,
  };

  bank.qrImageUrl =
    process.env.COMPANY_VIETQR_URL ||
    buildVietQrUrl(bank, { template: 'compact', showInfo: true });

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
 * Sinh URL ảnh VietQR SePay: https://vietqr.app/img?...
 * `bank` = short_name SePay (MSB, Vietcombank…); `acc` = STK hoặc VA.
 */
export function buildVietQrUrl(
  bank: Pick<
    CompanyBankAccount,
    'bankBin' | 'accountNumber' | 'accountHolder'
  > & { bankName?: string | null },
  options: VietQrOptions = {},
): string | null {
  const accountNumber = (bank.accountNumber || '').replace(/\s+/g, '');
  if (!accountNumber) return null;

  const bankId = toSePayBankId(bank.bankName, bank.bankBin);

  const params = new URLSearchParams();
  params.set('acc', accountNumber);
  params.set('bank', bankId);
  params.set('template', mapSePayTemplate(options.template));

  if (options.amount && options.amount > 0) {
    params.set('amount', String(Math.round(options.amount)));
  }
  if (options.addInfo) {
    const des = toVietQrTransferContent(options.addInfo);
    if (des) params.set('des', des);
  }

  const showInfo = options.showInfo !== false;
  if (showInfo) {
    params.set('showinfo', 'true');
    params.set('fullacc', options.fullAcc === false ? 'false' : 'true');
  }

  const holder = toSePayHolder(bank.accountHolder || '');
  if (holder) params.set('holder', holder);

  if (options.store) {
    const store = toSePayHolder(options.store);
    if (store) params.set('store', store);
  }

  return `https://vietqr.app/img?${params.toString()}`;
}

/**
 * URL same-origin proxy ảnh QR SePay — tránh CORS khi lưu/chia sẻ trên mobile.
 */
export function toProxiedVietQrUrl(qrUrl: string): string {
  try {
    const u = new URL(qrUrl);
    if (u.hostname !== 'vietqr.app') {
      return qrUrl;
    }
    return `/api/vietqr${u.search}`;
  } catch {
    return qrUrl;
  }
}

/**
 * Lưu / chia sẻ ảnh VietQR trên mobile (qua proxy same-origin).
 */
export async function shareOrSaveVietQrImage(
  qrUrl: string,
  fileBaseName: string,
): Promise<'shared' | 'downloaded'> {
  const fetchUrl = toProxiedVietQrUrl(qrUrl);
  const res = await fetch(fetchUrl, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Không tải được mã QR (${res.status})`);
  const blob = await res.blob();
  const safeName = (fileBaseName || 'vietqr')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 32);
  const file = new File([blob], `${safeName || 'vietqr'}.png`, {
    type: blob.type || 'image/png',
  });

  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean;
  };
  if (typeof nav.share === 'function' && nav.canShare?.({ files: [file] })) {
    await nav.share({
      files: [file],
      title: 'Mã VietQR thanh toán',
      text: 'Mở app ngân hàng → Quét VietQR → chọn ảnh này',
    });
    return 'shared';
  }

  const objectUrl = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = file.name;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
  return 'downloaded';
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
