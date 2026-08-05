/**
 * Ngân hàng VN — short_name SePay cho ảnh QR vietqr.app/img.
 *
 * Lưu ý: vietqr.app (SePay) chỉ sinh **ảnh QR** chứa STK/số tiền/nội dung.
 * Không có API “chuyển tiếp mở app NH đã điền sẵn”.
 * dl.vietqr.io/pay mở app trống — không dùng.
 *
 * Docs: https://developer.sepay.vn/vi/tien-ich-khac/tao-qr-code
 */

export interface BankApp {
  code: string;
  bin: string;
  name: string;
  /** short_name SePay cho `bank` trên vietqr.app/img */
  shortName: string;
  logo: string;
  /** id ngắn (vcb, mb…) — dùng mở scheme app nếu có */
  app: string;
  /** Scheme mở app NH trực tiếp (không qua dl.vietqr.io). */
  scheme?: string;
}

export const POPULAR_BANK_APPS: BankApp[] = [
  {
    code: 'VCB',
    bin: '970436',
    name: 'Vietcombank',
    shortName: 'Vietcombank',
    logo: 'https://cdn.vietqr.io/img/VCB.png',
    app: 'vcb',
    scheme: 'vietcombankmobile://',
  },
  {
    code: 'ICB',
    bin: '970415',
    name: 'VietinBank',
    shortName: 'VietinBank',
    logo: 'https://cdn.vietqr.io/img/ICB.png',
    app: 'icb',
    scheme: 'vietinbankipay://',
  },
  {
    code: 'MB',
    bin: '970422',
    name: 'MBBank',
    shortName: 'MBBank',
    logo: 'https://cdn.vietqr.io/img/MB.png',
    app: 'mb',
    scheme: 'mbbank://',
  },
  {
    code: 'BIDV',
    bin: '970418',
    name: 'BIDV',
    shortName: 'BIDV',
    logo: 'https://cdn.vietqr.io/img/BIDV.png',
    app: 'bidv',
    scheme: 'bidv://',
  },
  {
    code: 'TCB',
    bin: '970407',
    name: 'Techcombank',
    shortName: 'Techcombank',
    logo: 'https://cdn.vietqr.io/img/TCB.png',
    app: 'tcb',
    scheme: 'tcb://',
  },
  {
    code: 'ACB',
    bin: '970416',
    name: 'ACB',
    shortName: 'ACB',
    logo: 'https://cdn.vietqr.io/img/ACB.png',
    app: 'acb',
    scheme: 'acb://',
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
    code: 'OCB',
    bin: '970448',
    name: 'OCB',
    shortName: 'OCB',
    logo: 'https://cdn.vietqr.io/img/OCB.png',
    app: 'ocb',
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

/** Lưới chọn app trên mobile (giữ thứ tự phổ biến). */
export const POPULAR_BANK_APPS_MOBILE: BankApp[] = POPULAR_BANK_APPS;

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

/**
 * Mở app NH bằng scheme gốc (không qua dl.vietqr.io).
 * App mở trống — thông tin CK nằm trong ảnh QR SePay đã lưu.
 */
export function openBankApp(bankApp: BankApp): boolean {
  if (typeof window === 'undefined') return false;
  const scheme = bankApp.scheme?.trim();
  if (!scheme) return false;
  window.location.href = scheme;
  return true;
}
