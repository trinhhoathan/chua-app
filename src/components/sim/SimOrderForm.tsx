'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createSimOrder } from '@/app/actions/sims';
import {
  useAdvisorRoleTitle,
  useSitePersona,
} from '@/components/SitePersonaContext';

function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + '\u00a0đ';
}

/**
 * Form đặt mua sim — tạo đơn rồi chuyển sang trang thanh toán VietQR.
 */
export function SimOrderForm({
  simId,
  phoneDisplay,
  priceVnd,
  primaryColor,
  defaultBirthDate,
  defaultGender,
  autoOpen,
  alwaysOpen,
  onCancel,
  zaloUrl,
}: {
  simId: string;
  phoneDisplay: string;
  priceVnd: number;
  primaryColor: string;
  defaultBirthDate?: string;
  defaultGender?: 'nam' | 'nu';
  /** mở sẵn form (khi vào từ nút "Đặt mua") */
  autoOpen?: boolean;
  /** luôn hiện form (dùng trong popup) — không có nút đóng ngoài */
  alwaysOpen?: boolean;
  onCancel?: () => void;
  zaloUrl: string;
}) {
  const { role } = useSitePersona();
  const roleTitle = useAdvisorRoleTitle();
  const router = useRouter();
  const [open, setOpen] = useState(Boolean(autoOpen) || Boolean(alwaysOpen));
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [birthDate, setBirthDate] = useState(defaultBirthDate ?? '');
  const [birthTime, setBirthTime] = useState('');
  const [gender, setGender] = useState<'nam' | 'nu'>(defaultGender ?? 'nam');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    const res = await createSimOrder({
      simId,
      customerName: name,
      customerPhone: phone,
      note,
      birthDate: birthDate || undefined,
      birthTime: birthTime || undefined,
      gender,
    });
    if (res.ok && res.orderCode) {
      router.push(`/sim/don-hang/${encodeURIComponent(res.orderCode)}`);
      return;
    }
    setError(res.error ?? 'Có lỗi xảy ra, vui lòng thử lại.');
    setSubmitting(false);
  }

  // min-w-0 max-w-full + appearance-none: iOS Safari date/time dễ tràn ngang
  const inputCls =
    'box-border h-10 w-full min-w-0 max-w-full appearance-none border border-fog bg-white px-3 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-lacquer';

  if (!open && !alwaysOpen) {
    return (
      <div id="dat-mua" className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex-1 px-6 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: primaryColor }}
        >
          Đặt mua sim này — {formatVnd(priceVnd)}
        </button>
        <a
          href={zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 border px-6 py-3.5 text-center text-sm font-medium transition-colors hover:text-white"
          style={{ borderColor: primaryColor, color: primaryColor }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = primaryColor;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = '';
          }}
        >
          Nhắn Zalo — {role} tư vấn miễn phí
        </a>
      </div>
    );
  }

  return (
    <form
      id="dat-mua"
      onSubmit={onSubmit}
      className={
        alwaysOpen
          ? 'min-w-0 bg-paper'
          : 'min-w-0 border bg-paper p-5'
      }
      style={alwaysOpen ? undefined : { borderColor: `${primaryColor}66` }}
    >
      {!alwaysOpen ? (
        <>
          <p className="font-display text-lg text-ink">
            Đặt mua {phoneDisplay}
          </p>
          <p className="mt-1 text-xs text-muted">
            Thanh toán chuyển khoản có mã QR · Kiểm tra sim chính chủ xong mới kích hoạt ·
            {roleTitle} hướng dẫn ngày tốt kích sim.
          </p>
        </>
      ) : (
        <p className="text-xs text-muted">
          Thanh toán chuyển khoản có mã QR · Kiểm tra sim chính chủ xong mới kích hoạt ·
          {roleTitle} hướng dẫn ngày tốt kích sim.
        </p>
      )}

      <ul
        className="mt-3 space-y-1.5 border px-3 py-2.5 text-[0.78rem] leading-snug text-ink/80"
        style={{ borderColor: `${primaryColor}33`, background: `${primaryColor}06` }}
      >
        <li>
          · Số đã luận điểm thấp? Vào{' '}
          <a href="/sim" className="underline underline-offset-2" style={{ color: primaryColor }}>
            kho sim
          </a>{' '}
          chọn dãy điểm cao hơn — hợp mệnh hơn ngay từ đầu.
        </li>
        <li>· Sim phong thủy giữ lâu dài; đổi số thường làm đứt khí số đã quen.</li>
        <li>
          · Đặt mua hỗ trợ{' '}
          {role === 'thầy' ? 'công việc tư vấn phong thủy' : 'Phật sự nhà chùa'}.
        </li>
        <li>
          · Sau khi chọn số, mở{' '}
          <span className="font-medium text-ink">báo cáo có dấu thẩm định</span> để
          lưu / in làm căn cứ kích sim.
        </li>
        <li>
          · Cần tư vấn thêm: ghi chú bên dưới hoặc nhắn Zalo {role} kèm ngày giờ
          sinh.
        </li>
      </ul>

      <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
        <label className="block min-w-0">
          <span className="mb-1 block text-xs text-muted">Họ tên *</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nguyễn Văn A"
            className={inputCls}
          />
        </label>
        <label className="block min-w-0">
          <span className="mb-1 block text-xs text-muted">SĐT liên hệ *</span>
          <input
            required
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="09xxxxxxxx"
            className={inputCls}
          />
        </label>
        <label className="block min-w-0">
          <span className="mb-1 block text-xs text-muted">
            Ngày sinh (để {role} chọn ngày kích sim)
          </span>
          <input
            type="date"
            value={birthDate}
            min="1920-01-01"
            max="2026-12-31"
            onChange={(e) => setBirthDate(e.target.value)}
            className={inputCls}
          />
        </label>
        <div className="grid min-w-0 grid-cols-2 gap-3">
          <label className="block min-w-0">
            <span className="mb-1 block text-xs text-muted">Giờ sinh</span>
            <input
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="block min-w-0">
            <span className="mb-1 block text-xs text-muted">Giới tính</span>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as 'nam' | 'nu')}
              className={inputCls}
            >
              <option value="nam">Nam</option>
              <option value="nu">Nữ</option>
            </select>
          </label>
        </div>
        <label className="block min-w-0 sm:col-span-2">
          <span className="mb-1 block text-xs text-muted">Ghi chú</span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ví dụ: cần giao sim trước cuối tuần…"
            className={inputCls}
          />
        </label>
      </div>

      {error ? (
        <p className="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: primaryColor }}
        >
          {submitting ? 'Đang tạo đơn…' : `Xác nhận đặt — ${formatVnd(priceVnd)}`}
        </button>
        <button
          type="button"
          onClick={() => {
            if (onCancel) onCancel();
            else setOpen(false);
          }}
          className="px-4 py-3 text-xs text-muted underline underline-offset-2 hover:text-ink"
        >
          Đóng
        </button>
      </div>
    </form>
  );
}
