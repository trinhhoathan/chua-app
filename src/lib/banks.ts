/**
 * Ngân hàng VN — short_name SePay (QR ảnh) + appId deeplink VietQR.io.
 * QR SePay: https://developer.sepay.vn/vi/tien-ich-khac/tao-qr-code
 * Deeplink: https://www.vietqr.io/danh-sach-api/deeplink-app-ngan-hang
 */

export interface BankApp {
  code: string;
  bin: string;
  name: string;
  /** short_name SePay cho `bank` trên vietqr.app/img */
  shortName: string;
  logo: string;
  /** appId cho https://dl.vietqr.io/pay?app= */
  app: string;
  /** Deeplink autofill theo changelog VietQR.io (MB, ICB, BIDV, ACB, OCB…). */
  autofill?: boolean;
}

/** App đã hỗ trợ autofill ba/am/tn/bn qua dl.vietqr.io */
const AUTOFILL_APP_IDS = new Set(['mb', 'icb', 'bidv', 'acb', 'ocb']);

export function bankSupportsAutofill(
  bank: Pick<BankApp, 'app' | 'autofill'>,
): boolean {
  if (typeof bank.autofill === 'boolean') return bank.autofill;
  return AUTOFILL_APP_IDS.has(bank.app);
}

export const POPULAR_BANK_APPS: BankApp[] = [
  {
    code: 'MB',
    bin: '970422',
    name: 'MBBank',
    shortName: 'MBBank',
    logo: 'https://cdn.vietqr.io/img/MB.png',
    app: 'mb',
    autofill: true,
  },
  {
    code: 'ICB',
    bin: '970415',
    name: 'VietinBank',
    shortName: 'VietinBank',
    logo: 'https://cdn.vietqr.io/img/ICB.png',
    app: 'icb',
    autofill: true,
  },
  {
    code: 'BIDV',
    bin: '970418',
    name: 'BIDV',
    shortName: 'BIDV',
    logo: 'https://cdn.vietqr.io/img/BIDV.png',
    app: 'bidv',
    autofill: true,
  },
  {
    code: 'ACB',
    bin: '970416',
    name: 'ACB',
    shortName: 'ACB',
    logo: 'https://cdn.vietqr.io/img/ACB.png',
    app: 'acb',
    autofill: true,
  },
  {
    code: 'OCB',
    bin: '970448',
    name: 'OCB',
    shortName: 'OCB',
    logo: 'https://cdn.vietqr.io/img/OCB.png',
    app: 'ocb',
    autofill: true,
  },
  {
    code: 'VCB',
    bin: '970436',
    name: 'Vietcombank',
    shortName: 'Vietcombank',
    logo: 'https://cdn.vietqr.io/img/VCB.png',
    app: 'vcb',
    autofill: false,
  },
  {
    code: 'TCB',
    bin: '970407',
    name: 'Techcombank',
    shortName: 'Techcombank',
    logo: 'https://cdn.vietqr.io/img/TCB.png',
    app: 'tcb',
  },
  {
    code: 'VPB',
    bin: '970432',
    name: 'VPBank',
    shortName: 'VPBank',
    logo: 'https://cdn.vietqr.io/img/VPB.png',
    app: 'vpb',
  },
  {
    code: 'TPB',
    bin: '970423',
    name: 'TPBank',
    shortName: 'TPBank',
    logo: 'https://cdn.vietqr.io/img/TPB.png',
    app: 'tpb',
  },
  {
    code: 'STB',
    bin: '970403',
    name: 'Sacombank',
    shortName: 'Sacombank',
    logo: 'https://cdn.vietqr.io/img/STB.png',
    app: 'stb',
  },
  {
    code: 'HDB',
    bin: '970437',
    name: 'HDBank',
    shortName: 'HDBank',
    logo: 'https://cdn.vietqr.io/img/HDB.png',
    app: 'hdb',
  },
  {
    code: 'VIB',
    bin: '970441',
    name: 'VIB',
    shortName: 'VIB',
    logo: 'https://cdn.vietqr.io/img/VIB.png',
    app: 'vib',
  },
  {
    code: 'MSB',
    bin: '970426',
    name: 'MSB',
    shortName: 'MSB',
    logo: 'https://cdn.vietqr.io/img/MSB.png',
    app: 'msb',
  },
  {
    code: 'SHB',
    bin: '970443',
    name: 'SHB',
    shortName: 'SHB',
    logo: 'https://cdn.vietqr.io/img/SHB.png',
    app: 'shb',
  },
  {
    code: 'VBA',
    bin: '970405',
    name: 'Agribank',
    shortName: 'Agribank',
    logo: 'https://cdn.vietqr.io/img/VBA.png',
    app: 'vba',
  },
  {
    code: 'LPB',
    bin: '970449',
    name: 'LPBank',
    shortName: 'LPBank',
    logo: 'https://cdn.vietqr.io/img/LPB.png',
    app: 'lpb',
  },
  {
    code: 'EIB',
    bin: '970431',
    name: 'Eximbank',
    shortName: 'Eximbank',
    logo: 'https://cdn.vietqr.io/img/EIB.png',
    app: 'eib',
  },
  {
    code: 'CAKE',
    bin: '546034',
    name: 'CAKE',
    shortName: 'CAKE',
    logo: 'https://cdn.vietqr.io/img/CAKE.png',
    app: 'cake',
  },
  {
    code: 'TIMO',
    bin: '963388',
    name: 'Timo',
    shortName: 'Timo',
    logo: 'https://vietqr.net/portal-service/resources/icons/TIMO.png',
    app: 'timo',
  },
  {
    code: 'NAB',
    bin: '970428',
    name: 'NamABank',
    shortName: 'NamABank',
    logo: 'https://cdn.vietqr.io/img/NAB.png',
    app: 'nab',
  },
];

/** Ưu tiên NH autofill trước trên lưới thanh toán nhanh. */
export const POPULAR_BANK_APPS_MOBILE: BankApp[] = [
  ...POPULAR_BANK_APPS.filter((b) => bankSupportsAutofill(b)),
  ...POPULAR_BANK_APPS.filter((b) => !bankSupportsAutofill(b)),
];

/** short_name SePay từ BIN hoặc tên đã cấu hình. */
export function toSePayBankId(
  bankName?: string | null,
  bankBin?: string | null,
): string {
  const name = (bankName || '').trim();
  if (name) {
    const byName = POPULAR_BANK_APPS.find(
      (b) =>
        b.shortName.toLowerCase() === name.toLowerCase() ||
        b.name.toLowerCase() === name.toLowerCase() ||
        b.code.toLowerCase() === name.toLowerCase(),
    );
    if (byName) return byName.shortName;
    // Đã là short_name / alias hợp lệ (không phải BIN thuần số)
    if (!/^\d{6}$/.test(name)) return name;
  }
  const bin = (bankBin || '').trim();
  if (bin) {
    const byBin = POPULAR_BANK_APPS.find((b) => b.bin === bin);
    if (byBin) return byBin.shortName;
  }
  return name || 'MSB';
}

export function sanitizeBankAccountHolder(name: string): string {
  return (name || '')
    .replace(/\?/g, '')
    .replace(/[^\p{L}\p{N}\s.&/\-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 70);
}

/** Mã NH nhận trong tham số `ba` (app code, vd msb) — fallback BIN. */
function toRecipientBankCode(recipientBin: string): string {
  const found = POPULAR_BANK_APPS.find((b) => b.bin === recipientBin);
  return found?.app ?? recipientBin;
}

export interface BankPayDeeplinkOptions {
  amount?: number;
  transferContent?: string;
  accountHolder?: string;
  /** URL trở về sau CK (tuỳ app hỗ trợ). */
  returnUrl?: string;
}

/**
 * Deeplink mở app NH thanh toán: https://dl.vietqr.io/pay
 * MB / VietinBank / BIDV / ACB / OCB hỗ trợ autofill STK·số tiền·nội dung.
 */
export function buildBankPayDeeplink(
  bankApp: BankApp,
  recipientAccount: string,
  recipientBin: string,
  options: BankPayDeeplinkOptions = {},
): string {
  const account = recipientAccount.replace(/\s+/g, '');
  const bankCode = toRecipientBankCode(recipientBin);
  const parts: string[] = [
    `app=${encodeURIComponent(bankApp.app)}`,
    `ba=${account}@${bankCode}`,
  ];
  if (options.amount && options.amount > 0) {
    parts.push(`am=${Math.round(options.amount)}`);
  }
  if (options.transferContent) {
    parts.push(
      `tn=${encodeURIComponent(options.transferContent.slice(0, 25))}`,
    );
  }
  const holder = sanitizeBankAccountHolder(options.accountHolder || '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toUpperCase();
  if (holder) {
    parts.push(`bn=${encodeURIComponent(holder)}`);
  }
  if (options.returnUrl) {
    parts.push(`url=${encodeURIComponent(options.returnUrl)}`);
  }
  return `https://dl.vietqr.io/pay?${parts.join('&')}`;
}
