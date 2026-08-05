/** Ngân hàng phổ biến VN — dùng chọn app + deeplink VietQR. */
export interface BankApp {
  code: string;
  bin: string;
  name: string;
  logo: string;
  /** Tham số `app` cho https://dl.vietqr.io/pay */
  app: string;
  /**
   * App nhận đủ tham số ba/am/tn/bn từ dl.vietqr.io (theo API VietQR).
   * Hiện chỉ: VietinBank, BIDV, OCB, ACB, MB — Vietcombank = false.
   */
  autofill?: boolean;
}

/** appId VietQR đã xác nhận autofill=1 (api.vietqr.io). */
const AUTOFILL_APP_IDS = new Set(['icb', 'bidv', 'ocb', 'acb', 'mb']);

export function bankSupportsAutofill(bank: Pick<BankApp, 'app' | 'autofill'>): boolean {
  if (typeof bank.autofill === 'boolean') return bank.autofill;
  return AUTOFILL_APP_IDS.has(bank.app);
}

export const POPULAR_BANK_APPS: BankApp[] = [
  {
    code: 'ICB',
    bin: '970415',
    name: 'VietinBank',
    logo: 'https://cdn.vietqr.io/img/ICB.png',
    app: 'icb',
    autofill: true,
  },
  {
    code: 'VCB',
    bin: '970436',
    name: 'Vietcombank',
    logo: 'https://cdn.vietqr.io/img/VCB.png',
    app: 'vcb',
    autofill: false,
  },
  {
    code: 'BIDV',
    bin: '970418',
    name: 'BIDV',
    logo: 'https://cdn.vietqr.io/img/BIDV.png',
    app: 'bidv',
    autofill: true,
  },
  {
    code: 'MB',
    bin: '970422',
    name: 'MBBank',
    logo: 'https://cdn.vietqr.io/img/MB.png',
    app: 'mb',
    autofill: true,
  },
  {
    code: 'TCB',
    bin: '970407',
    name: 'Techcombank',
    logo: 'https://cdn.vietqr.io/img/TCB.png',
    app: 'tcb',
    autofill: false,
  },
  {
    code: 'ACB',
    bin: '970416',
    name: 'ACB',
    logo: 'https://cdn.vietqr.io/img/ACB.png',
    app: 'acb',
    autofill: true,
  },
  {
    code: 'VPB',
    bin: '970432',
    name: 'VPBank',
    logo: 'https://cdn.vietqr.io/img/VPB.png',
    app: 'vpb',
    autofill: false,
  },
  {
    code: 'TPB',
    bin: '970423',
    name: 'TPBank',
    logo: 'https://cdn.vietqr.io/img/TPB.png',
    app: 'tpb',
    autofill: false,
  },
  {
    code: 'STB',
    bin: '970403',
    name: 'Sacombank',
    logo: 'https://cdn.vietqr.io/img/STB.png',
    app: 'stb',
    autofill: false,
  },
  {
    code: 'HDB',
    bin: '970437',
    name: 'HDBank',
    logo: 'https://cdn.vietqr.io/img/HDB.png',
    app: 'hdb',
    autofill: false,
  },
  {
    code: 'VIB',
    bin: '970441',
    name: 'VIB',
    logo: 'https://cdn.vietqr.io/img/VIB.png',
    app: 'vib',
    autofill: false,
  },
  {
    code: 'MSB',
    bin: '970426',
    name: 'MSB',
    logo: 'https://cdn.vietqr.io/img/MSB.png',
    app: 'msb',
    autofill: false,
  },
  {
    code: 'SHB',
    bin: '970443',
    name: 'SHB',
    logo: 'https://cdn.vietqr.io/img/SHB.png',
    app: 'shb',
    autofill: false,
  },
  {
    code: 'OCB',
    bin: '970448',
    name: 'OCB',
    logo: 'https://cdn.vietqr.io/img/OCB.png',
    app: 'ocb',
    autofill: true,
  },
  {
    code: 'VBA',
    bin: '970405',
    name: 'Agribank',
    logo: 'https://cdn.vietqr.io/img/VBA.png',
    app: 'vba',
    autofill: false,
  },
  {
    code: 'LPB',
    bin: '970449',
    name: 'LPBank',
    logo: 'https://cdn.vietqr.io/img/LPB.png',
    app: 'lpb',
    autofill: false,
  },
  {
    code: 'EIB',
    bin: '970431',
    name: 'Eximbank',
    logo: 'https://cdn.vietqr.io/img/EIB.png',
    app: 'eib',
    autofill: false,
  },
  {
    code: 'CAKE',
    bin: '546034',
    name: 'CAKE',
    logo: 'https://cdn.vietqr.io/img/CAKE.png',
    app: 'cake',
    autofill: false,
  },
  {
    code: 'TIMO',
    bin: '963388',
    name: 'Timo',
    logo: 'https://vietqr.net/portal-service/resources/icons/TIMO.png',
    app: 'timo',
    autofill: false,
  },
  {
    code: 'NAB',
    bin: '970428',
    name: 'NamABank',
    logo: 'https://cdn.vietqr.io/img/NAB.png',
    app: 'nab',
    autofill: false,
  },
];

/** Ưu tiên NH điền sẵn trước — tiện chọn trên mobile. */
export const POPULAR_BANK_APPS_MOBILE: BankApp[] = [
  ...POPULAR_BANK_APPS.filter((b) => bankSupportsAutofill(b)),
  ...POPULAR_BANK_APPS.filter((b) => !bankSupportsAutofill(b)),
];

/** Mã NH nhận cho tham số `ba` (doc VietQR dùng app code, vd `msb`) — fallback BIN. */
function toRecipientBankCode(recipientBin: string): string {
  const found = POPULAR_BANK_APPS.find((b) => b.bin === recipientBin);
  return found?.app ?? recipientBin;
}

export interface BankPayDeeplinkOptions {
  /** Số tiền VND — tham số `am` */
  amount?: number;
  /** Nội dung CK — tham số `tn` */
  transferContent?: string;
  /** Tên chủ TK nhận — tham số `bn` */
  accountHolder?: string;
}

/** Làm sạch tên chủ TK cho tham số deeplink (bỏ ký tự lỗi encoding như `?`). */
export function sanitizeBankAccountHolder(name: string): string {
  return (name || '')
    .replace(/\?/g, '')
    .replace(/[^\p{L}\p{N}\s.&/\-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 70);
}

/** Chuỗi chép sẵn khi app NH không autofill (VCB, TCB…). */
export function formatBankTransferClipboard(info: {
  accountNumber: string;
  bankName: string;
  accountHolder?: string;
  amount: number;
  transferContent: string;
}): string {
  const holder = sanitizeBankAccountHolder(info.accountHolder || '');
  const lines = [
    `STK: ${info.accountNumber.replace(/\s+/g, '')}`,
    `NH: ${info.bankName}`,
  ];
  if (holder) lines.push(`Chu TK: ${holder}`);
  lines.push(
    `So tien: ${Math.round(info.amount)}`,
    `Noi dung: ${info.transferContent}`,
  );
  return lines.join('\n');
}

/**
 * Deeplink mở app ngân hàng qua https://dl.vietqr.io/pay.
 *
 * Lưu ý (2026): proxy VietQR trên Android/iOS chỉ redirect scheme trống
 * (vd. `vietinbankipay://`, `intent://…scheme=mbbank…`) — **không** gắn ba/am/tn.
 * Thực tế không autofill kể cả VietinBank/MB. Cách điền sẵn đáng tin: quét ảnh VietQR.
 *
 * Vẫn gửi đủ tham số (đúng format doc: `ba` giữ `@`, space = `%20`) phòng khi VietQR sửa.
 */
export function buildBankPayDeeplink(
  bankApp: BankApp,
  recipientAccount: string,
  recipientBin: string,
  options: BankPayDeeplinkOptions = {},
): string {
  const account = recipientAccount.replace(/\s+/g, '');
  const bankCode = toRecipientBankCode(recipientBin);
  // Giữ `@` thô như ví dụ VietQR (URLSearchParams sẽ encode thành %40).
  const parts: string[] = [
    `app=${encodeURIComponent(bankApp.app)}`,
    `ba=${account}@${bankCode}`,
  ];
  if (options.amount && options.amount > 0) {
    parts.push(`am=${Math.round(options.amount)}`);
  }
  if (options.transferContent) {
    parts.push(`tn=${encodeURIComponent(options.transferContent.slice(0, 25))}`);
  }
  const holder = sanitizeBankAccountHolder(options.accountHolder || '');
  if (holder) {
    parts.push(`bn=${encodeURIComponent(holder)}`);
  }
  return `https://dl.vietqr.io/pay?${parts.join('&')}`;
}
