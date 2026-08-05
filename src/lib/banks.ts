/**
 * Danh sách ngân hàng VN — chọn TK nhận (admin) + short_name SePay.
 * Logo CDN vietqr.io chỉ dùng hiển thị icon, không dùng deeplink.
 * QR thanh toán: https://developer.sepay.vn/vi/tien-ich-khac/tao-qr-code
 */

export interface BankApp {
  code: string;
  bin: string;
  /** Tên hiển thị */
  name: string;
  /** short_name SePay cho tham số `bank` trên vietqr.app/img */
  shortName: string;
  logo: string;
}

export const POPULAR_BANK_APPS: BankApp[] = [
  {
    code: 'ICB',
    bin: '970415',
    name: 'VietinBank',
    shortName: 'VietinBank',
    logo: 'https://cdn.vietqr.io/img/ICB.png',
  },
  {
    code: 'VCB',
    bin: '970436',
    name: 'Vietcombank',
    shortName: 'Vietcombank',
    logo: 'https://cdn.vietqr.io/img/VCB.png',
  },
  {
    code: 'BIDV',
    bin: '970418',
    name: 'BIDV',
    shortName: 'BIDV',
    logo: 'https://cdn.vietqr.io/img/BIDV.png',
  },
  {
    code: 'MB',
    bin: '970422',
    name: 'MBBank',
    shortName: 'MBBank',
    logo: 'https://cdn.vietqr.io/img/MB.png',
  },
  {
    code: 'TCB',
    bin: '970407',
    name: 'Techcombank',
    shortName: 'Techcombank',
    logo: 'https://cdn.vietqr.io/img/TCB.png',
  },
  {
    code: 'ACB',
    bin: '970416',
    name: 'ACB',
    shortName: 'ACB',
    logo: 'https://cdn.vietqr.io/img/ACB.png',
  },
  {
    code: 'VPB',
    bin: '970432',
    name: 'VPBank',
    shortName: 'VPBank',
    logo: 'https://cdn.vietqr.io/img/VPB.png',
  },
  {
    code: 'TPB',
    bin: '970423',
    name: 'TPBank',
    shortName: 'TPBank',
    logo: 'https://cdn.vietqr.io/img/TPB.png',
  },
  {
    code: 'STB',
    bin: '970403',
    name: 'Sacombank',
    shortName: 'Sacombank',
    logo: 'https://cdn.vietqr.io/img/STB.png',
  },
  {
    code: 'HDB',
    bin: '970437',
    name: 'HDBank',
    shortName: 'HDBank',
    logo: 'https://cdn.vietqr.io/img/HDB.png',
  },
  {
    code: 'VIB',
    bin: '970441',
    name: 'VIB',
    shortName: 'VIB',
    logo: 'https://cdn.vietqr.io/img/VIB.png',
  },
  {
    code: 'MSB',
    bin: '970426',
    name: 'MSB',
    shortName: 'MSB',
    logo: 'https://cdn.vietqr.io/img/MSB.png',
  },
  {
    code: 'SHB',
    bin: '970443',
    name: 'SHB',
    shortName: 'SHB',
    logo: 'https://cdn.vietqr.io/img/SHB.png',
  },
  {
    code: 'OCB',
    bin: '970448',
    name: 'OCB',
    shortName: 'OCB',
    logo: 'https://cdn.vietqr.io/img/OCB.png',
  },
  {
    code: 'VBA',
    bin: '970405',
    name: 'Agribank',
    shortName: 'Agribank',
    logo: 'https://cdn.vietqr.io/img/VBA.png',
  },
  {
    code: 'LPB',
    bin: '970449',
    name: 'LPBank',
    shortName: 'LPBank',
    logo: 'https://cdn.vietqr.io/img/LPB.png',
  },
  {
    code: 'EIB',
    bin: '970431',
    name: 'Eximbank',
    shortName: 'Eximbank',
    logo: 'https://cdn.vietqr.io/img/EIB.png',
  },
  {
    code: 'CAKE',
    bin: '546034',
    name: 'CAKE',
    shortName: 'CAKE',
    logo: 'https://cdn.vietqr.io/img/CAKE.png',
  },
  {
    code: 'TIMO',
    bin: '963388',
    name: 'Timo',
    shortName: 'Timo',
    logo: 'https://vietqr.net/portal-service/resources/icons/TIMO.png',
  },
  {
    code: 'NAB',
    bin: '970428',
    name: 'NamABank',
    shortName: 'NamABank',
    logo: 'https://cdn.vietqr.io/img/NAB.png',
  },
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

/** Chuỗi chép sẵn khi cần nhập tay (dự phòng). */
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
