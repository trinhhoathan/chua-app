/**
 * SePay API v2 (server-only) — Bearer token từ Cấu hình công ty → API Access.
 * Docs: https://developer.sepay.vn/vi/sepay-api/v2/bat-dau-nhanh
 */

const SEPAY_API_BASE =
  process.env.SEPAY_API_BASE?.replace(/\/$/, '') || 'https://userapi.sepay.vn';

export function getSePayApiToken(): string | null {
  const token = process.env.SEPAY_API_TOKEN?.trim();
  return token || null;
}

export class SePayApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = 'SePayApiError';
    this.status = status;
    this.body = body;
  }
}

async function sepayFetch<T>(
  path: string,
  init?: RequestInit & { searchParams?: Record<string, string | number | undefined> },
): Promise<T> {
  const token = getSePayApiToken();
  if (!token) {
    throw new SePayApiError('Thiếu SEPAY_API_TOKEN trên server.', 500);
  }

  const url = new URL(
    path.startsWith('http') ? path : `${SEPAY_API_BASE}${path.startsWith('/') ? '' : '/'}${path}`,
  );
  if (init?.searchParams) {
    for (const [k, v] of Object.entries(init.searchParams)) {
      if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
    }
  }

  const { searchParams: _sp, ...rest } = init ?? {};
  const res = await fetch(url.toString(), {
    ...rest,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(rest.headers ?? {}),
    },
    cache: 'no-store',
  });

  let body: unknown = null;
  const text = await res.text();
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!res.ok) {
    const msg =
      typeof body === 'object' &&
      body &&
      'message' in body &&
      typeof (body as { message: unknown }).message === 'string'
        ? (body as { message: string }).message
        : `SePay API lỗi HTTP ${res.status}`;
    throw new SePayApiError(msg, res.status, body);
  }

  return body as T;
}

export interface SePayBankAccount {
  id?: number | string;
  account_number?: string;
  account_holder_name?: string;
  bank_short_name?: string;
  bank_full_name?: string;
  [key: string]: unknown;
}

export interface SePayTransaction {
  id?: number | string;
  amount_in?: number;
  amount_out?: number;
  transaction_content?: string;
  reference_number?: string;
  bank_account_id?: number | string;
  [key: string]: unknown;
}

/** Danh sách tài khoản ngân hàng đã liên kết SePay. */
export async function listSePayBankAccounts(): Promise<SePayBankAccount[]> {
  const data = await sepayFetch<{
    status?: string;
    data?: SePayBankAccount[] | { bank_accounts?: SePayBankAccount[] };
  }>('/v2/bank-accounts');

  if (Array.isArray(data?.data)) return data.data;
  if (
    data?.data &&
    typeof data.data === 'object' &&
    Array.isArray((data.data as { bank_accounts?: SePayBankAccount[] }).bank_accounts)
  ) {
    return (data.data as { bank_accounts: SePayBankAccount[] }).bank_accounts;
  }
  return [];
}

/** Giao dịch gần đây (lọc theo nội dung / khoảng ngày nếu cần). */
export async function listSePayTransactions(params?: {
  q?: string;
  transaction_date_from?: string;
  transaction_date_to?: string;
  per_page?: number;
}): Promise<SePayTransaction[]> {
  const data = await sepayFetch<{
    status?: string;
    data?: SePayTransaction[] | { transactions?: SePayTransaction[] };
  }>('/v2/transactions', {
    searchParams: {
      q: params?.q,
      transaction_date_from: params?.transaction_date_from,
      transaction_date_to: params?.transaction_date_to,
      per_page: params?.per_page ?? 20,
    },
  });

  if (Array.isArray(data?.data)) return data.data;
  if (
    data?.data &&
    typeof data.data === 'object' &&
    Array.isArray((data.data as { transactions?: SePayTransaction[] }).transactions)
  ) {
    return (data.data as { transactions: SePayTransaction[] }).transactions;
  }
  return [];
}

/** Kiểm tra token + kết nối SePay (dùng khi setup). */
export async function pingSePayApi(): Promise<{
  ok: boolean;
  accounts: number;
  error?: string;
}> {
  try {
    const accounts = await listSePayBankAccounts();
    return { ok: true, accounts: accounts.length };
  } catch (e) {
    const err = e instanceof SePayApiError ? e.message : 'Không kết nối được SePay';
    return { ok: false, accounts: 0, error: err };
  }
}
