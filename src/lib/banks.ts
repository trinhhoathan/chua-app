/** Ngân hàng phổ biến VN — dùng chọn app + deeplink VietQR. */
export interface BankApp {
  code: string;
  bin: string;
  name: string;
  logo: string;
  /** Tham số `app` cho https://dl.vietqr.io/pay */
  app: string;
}

export const POPULAR_BANK_APPS: BankApp[] = [
  {
    code: 'ICB',
    bin: '970415',
    name: 'VietinBank',
    logo: 'https://cdn.vietqr.io/img/ICB.png',
    app: 'icb',
  },
  {
    code: 'VCB',
    bin: '970436',
    name: 'Vietcombank',
    logo: 'https://cdn.vietqr.io/img/VCB.png',
    app: 'vcb',
  },
  {
    code: 'BIDV',
    bin: '970418',
    name: 'BIDV',
    logo: 'https://cdn.vietqr.io/img/BIDV.png',
    app: 'bidv',
  },
  {
    code: 'MB',
    bin: '970422',
    name: 'MBBank',
    logo: 'https://cdn.vietqr.io/img/MB.png',
    app: 'mb',
  },
  {
    code: 'TCB',
    bin: '970407',
    name: 'Techcombank',
    logo: 'https://cdn.vietqr.io/img/TCB.png',
    app: 'tcb',
  },
  {
    code: 'ACB',
    bin: '970416',
    name: 'ACB',
    logo: 'https://cdn.vietqr.io/img/ACB.png',
    app: 'acb',
  },
  {
    code: 'VPB',
    bin: '970432',
    name: 'VPBank',
    logo: 'https://cdn.vietqr.io/img/VPB.png',
    app: 'vpb',
  },
  {
    code: 'TPB',
    bin: '970423',
    name: 'TPBank',
    logo: 'https://cdn.vietqr.io/img/TPB.png',
    app: 'tpb',
  },
  {
    code: 'STB',
    bin: '970403',
    name: 'Sacombank',
    logo: 'https://cdn.vietqr.io/img/STB.png',
    app: 'stb',
  },
  {
    code: 'HDB',
    bin: '970437',
    name: 'HDBank',
    logo: 'https://cdn.vietqr.io/img/HDB.png',
    app: 'hdb',
  },
  {
    code: 'VIB',
    bin: '970441',
    name: 'VIB',
    logo: 'https://cdn.vietqr.io/img/VIB.png',
    app: 'vib',
  },
  {
    code: 'MSB',
    bin: '970426',
    name: 'MSB',
    logo: 'https://cdn.vietqr.io/img/MSB.png',
    app: 'msb',
  },
  {
    code: 'SHB',
    bin: '970443',
    name: 'SHB',
    logo: 'https://cdn.vietqr.io/img/SHB.png',
    app: 'shb',
  },
  {
    code: 'OCB',
    bin: '970448',
    name: 'OCB',
    logo: 'https://cdn.vietqr.io/img/OCB.png',
    app: 'ocb',
  },
  {
    code: 'VBA',
    bin: '970405',
    name: 'Agribank',
    logo: 'https://cdn.vietqr.io/img/VBA.png',
    app: 'vba',
  },
  {
    code: 'LPB',
    bin: '970449',
    name: 'LPBank',
    logo: 'https://cdn.vietqr.io/img/LPB.png',
    app: 'lpb',
  },
  {
    code: 'EIB',
    bin: '970431',
    name: 'Eximbank',
    logo: 'https://cdn.vietqr.io/img/EIB.png',
    app: 'eib',
  },
  {
    code: 'CAKE',
    bin: '546034',
    name: 'CAKE',
    logo: 'https://cdn.vietqr.io/img/CAKE.png',
    app: 'cake',
  },
  {
    code: 'TIMO',
    bin: '963388',
    name: 'Timo',
    logo: 'https://vietqr.net/portal-service/resources/icons/TIMO.png',
    app: 'timo',
  },
  {
    code: 'NAB',
    bin: '970428',
    name: 'NamABank',
    logo: 'https://cdn.vietqr.io/img/NAB.png',
    app: 'nab',
  },
];

/**
 * Deeplink mở app ngân hàng (VietQR).
 * `ba` = STK nhận @ BIN ngân hàng nhận (VietinBank công ty).
 */
export function buildBankPayDeeplink(
  bankApp: BankApp,
  recipientAccount: string,
  recipientBin: string,
): string {
  const ba = `${recipientAccount.replace(/\s+/g, '')}@${recipientBin}`;
  const params = new URLSearchParams({
    app: bankApp.app,
    ba,
  });
  return `https://dl.vietqr.io/pay?${params.toString()}`;
}
