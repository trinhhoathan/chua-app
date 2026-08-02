'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateTempleBasicsAction } from '@/app/actions/temples';
import { POPULAR_BANK_APPS } from '@/lib/banks';
import { TEMPLE_COLOR_PALETTE } from '@/lib/temple-defaults';
import { isLyGiaDomain } from '@/lib/ly-gia-phuc-an';
import type { TempleContactLinks } from '@/types/database';
import { TempleColorPicker } from './TempleColorPicker';

const inputCls = 'mt-1 w-full border border-fog px-3 py-2 text-sm bg-white';
const labelCls = 'block text-xs text-muted';

export type TempleBasics = {
  id: string;
  name: string;
  domain: string;
  temple_alt_name: string | null;
  payment_code: string | null;
  address: string | null;
  abbott_name: string | null;
  abbott_title: string | null;
  hotline: string | null;
  slogan: string | null;
  tagline: string | null;
  primary_color: string | null;
  is_active: boolean;
  contact_links: TempleContactLinks;
  bank_name: string | null;
  bank_bin: string | null;
  bank_account_number: string | null;
  bank_account_holder: string | null;
};

export function EditTempleBasicsForm({ temple }: { temple: TempleBasics }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [name, setName] = useState(temple.name);
  const [templeAltName, setTempleAltName] = useState(
    temple.temple_alt_name ?? '',
  );
  const [domain, setDomain] = useState(temple.domain);
  const [paymentCode, setPaymentCode] = useState(temple.payment_code ?? '');
  const [address, setAddress] = useState(temple.address ?? '');
  const [abbottName, setAbbottName] = useState(temple.abbott_name ?? '');
  const [abbottTitle, setAbbottTitle] = useState(
    temple.abbott_title ?? 'Trụ trì',
  );
  const [hotline, setHotline] = useState(temple.hotline ?? '');
  const [zalo, setZalo] = useState(temple.contact_links.zalo ?? '');
  const [facebook, setFacebook] = useState(temple.contact_links.facebook ?? '');
  const [slogan, setSlogan] = useState(temple.slogan ?? '');
  const [tagline, setTagline] = useState(temple.tagline ?? '');
  const [primaryColor, setPrimaryColor] = useState(
    temple.primary_color ?? TEMPLE_COLOR_PALETTE[0],
  );
  const [isActive, setIsActive] = useState(temple.is_active);
  const [bankName, setBankName] = useState(temple.bank_name ?? '');
  const [bankBin, setBankBin] = useState(temple.bank_bin ?? '');
  const [bankAccountNumber, setBankAccountNumber] = useState(
    temple.bank_account_number ?? '',
  );
  const [bankAccountHolder, setBankAccountHolder] = useState(
    temple.bank_account_holder ?? '',
  );

  // Bank đang chọn trong danh sách (khớp theo BIN)
  const selectedBankCode =
    POPULAR_BANK_APPS.find((b) => b.bin === bankBin)?.code ?? '';

  return (
    <form
      className="space-y-8 max-w-2xl"
      onSubmit={(e) => {
        e.preventDefault();
        setErr(null);
        setMsg(null);
        start(async () => {
          const res = await updateTempleBasicsAction({
            id: temple.id,
            name,
            domain,
            templeAltName,
            paymentCode,
            address,
            abbottName,
            abbottTitle,
            hotline,
            zalo,
            facebook,
            slogan,
            tagline,
            primaryColor,
            isActive,
            bankName,
            bankBin,
            bankAccountNumber,
            bankAccountHolder,
          });
          if (!res.ok) {
            setErr(res.error);
            return;
          }
          setMsg('Đã lưu thông tin cơ bản.');
          router.refresh();
        });
      }}
    >
      <section className="border border-fog bg-paper p-5 space-y-3">
        <h2 className="font-display text-xl text-ink">Phật tự</h2>
        <label className={labelCls}>
          Tên chùa *
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label className={labelCls}>
          Tên khác
          <input
            className={inputCls}
            value={templeAltName}
            onChange={(e) => setTempleAltName(e.target.value)}
          />
        </label>
        <label className={labelCls}>
          Domain *
          <input
            className={inputCls}
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            required
          />
        </label>
        <label className={labelCls}>
          Mã CK
          <input
            className={inputCls}
            value={paymentCode}
            onChange={(e) => setPaymentCode(e.target.value.toUpperCase())}
            maxLength={4}
          />
        </label>
        <div>
          <p className={labelCls}>Màu chủ đạo</p>
          <div className="mt-2">
            <TempleColorPicker
              value={primaryColor}
              onChange={setPrimaryColor}
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink pt-1">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Đang hoạt động (is_active)
        </label>
      </section>

      <section className="border border-fog bg-paper p-5 space-y-3">
        <h2 className="font-display text-xl text-ink">
          {isLyGiaDomain(domain) ? 'Thầy Phong Thủy' : 'Trụ trì'}
        </h2>
        <label className={labelCls}>
          {isLyGiaDomain(domain) ? 'Tên thầy' : 'Tên trụ trì'}
          <input
            className={inputCls}
            value={abbottName}
            onChange={(e) => setAbbottName(e.target.value)}
          />
        </label>
        <label className={labelCls}>
          Danh hiệu
          <input
            className={inputCls}
            value={abbottTitle}
            onChange={(e) => setAbbottTitle(e.target.value)}
          />
        </label>
        <label className={labelCls}>
          Hotline
          <input
            className={inputCls}
            value={hotline}
            onChange={(e) => setHotline(e.target.value)}
          />
        </label>
      </section>

      <section className="border border-fog bg-paper p-5 space-y-3">
        <h2 className="font-display text-xl text-ink">Địa chỉ & liên hệ</h2>
        <label className={labelCls}>
          Địa chỉ
          <textarea
            className={inputCls}
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </label>
        <label className={labelCls}>
          Zalo
          <input
            className={inputCls}
            value={zalo}
            onChange={(e) => setZalo(e.target.value)}
          />
        </label>
        <label className={labelCls}>
          Facebook
          <input
            className={inputCls}
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
          />
        </label>
        <label className={labelCls}>
          Slogan
          <input
            className={inputCls}
            value={slogan}
            onChange={(e) => setSlogan(e.target.value)}
          />
        </label>
        <label className={labelCls}>
          Tagline
          <input
            className={inputCls}
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
          />
        </label>
      </section>

      <section className="border border-fog bg-paper p-5 space-y-3">
        <h2 className="font-display text-xl text-ink">
          Tài khoản nhận tiền (VietQR)
        </h2>
        <p className="text-xs text-muted">
          Dùng để sinh mã QR nhận thanh toán đơn sim / dịch vụ của riêng Phật tự
          này. Bỏ trống nếu chưa dùng.
        </p>
        <label className={labelCls}>
          Ngân hàng
          <select
            className={inputCls}
            value={selectedBankCode}
            onChange={(e) => {
              const bank = POPULAR_BANK_APPS.find(
                (b) => b.code === e.target.value,
              );
              if (bank) {
                setBankName(bank.name);
                setBankBin(bank.bin);
              } else {
                setBankName('');
                setBankBin('');
              }
            }}
          >
            <option value="">— Chọn ngân hàng —</option>
            {POPULAR_BANK_APPS.map((b) => (
              <option key={b.code} value={b.code}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className={labelCls}>
            Tên ngân hàng (tự sửa được)
            <input
              className={inputCls}
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="VD: MBBank"
            />
          </label>
          <label className={labelCls}>
            Mã BIN (NAPAS)
            <input
              className={inputCls}
              value={bankBin}
              onChange={(e) => setBankBin(e.target.value.replace(/\D/g, ''))}
              placeholder="VD: 970422"
              maxLength={6}
            />
          </label>
        </div>
        <label className={labelCls}>
          Số tài khoản
          <input
            className={inputCls}
            value={bankAccountNumber}
            onChange={(e) => setBankAccountNumber(e.target.value)}
            placeholder="VD: 0123456789"
          />
        </label>
        <label className={labelCls}>
          Chủ tài khoản (IN HOA không dấu)
          <input
            className={inputCls}
            value={bankAccountHolder}
            onChange={(e) => setBankAccountHolder(e.target.value)}
            placeholder="VD: TRINH VAN CUONG"
          />
        </label>
      </section>

      {err ? <p className="text-sm text-lacquer">{err}</p> : null}
      {msg ? <p className="text-sm text-muted">{msg}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2.5 bg-ink text-white text-sm disabled:opacity-60"
        >
          {pending ? 'Đang lưu…' : 'Lưu thay đổi'}
        </button>
        <button
          type="button"
          className="px-5 py-2.5 border border-ink/20 text-sm hover:bg-mist"
          onClick={() => router.push('/quan-tri/chua')}
        >
          Quay lại danh sách
        </button>
      </div>
    </form>
  );
}
