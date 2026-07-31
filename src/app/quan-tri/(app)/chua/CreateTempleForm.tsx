'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createTempleAction } from '@/app/actions/temples';
import { DEFAULT_ADMIN_PIN } from '@/lib/admin-phone-auth';
import {
  pickRandomTempleColor,
  suggestDomainFromName,
  suggestPaymentCode,
  TEMPLE_COLOR_PALETTE,
} from '@/lib/temple-defaults';
import { TempleColorPicker } from './TempleColorPicker';

const inputCls = 'mt-1 w-full border border-fog px-3 py-2 text-sm bg-white';
const labelCls = 'block text-xs text-muted';

export function CreateTempleForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [templeAltName, setTempleAltName] = useState('');
  const [domain, setDomain] = useState('');
  const [domainTouched, setDomainTouched] = useState(false);
  const [paymentCode, setPaymentCode] = useState('');
  const [paymentTouched, setPaymentTouched] = useState(false);
  const [address, setAddress] = useState('');
  const [abbottName, setAbbottName] = useState('');
  const [abbottTitle, setAbbottTitle] = useState('Trụ trì');
  const [hotline, setHotline] = useState('');
  const [zalo, setZalo] = useState('');
  const [facebook, setFacebook] = useState('');
  const [slogan, setSlogan] = useState('');
  const [tagline, setTagline] = useState('');
  const [primaryColor, setPrimaryColor] = useState<string>(
    TEMPLE_COLOR_PALETTE[0],
  );
  const [createAbbott, setCreateAbbott] = useState(true);
  const [abbottLoginPhone, setAbbottLoginPhone] = useState('');
  const [abbottPassword, setAbbottPassword] = useState(DEFAULT_ADMIN_PIN);

  useEffect(() => {
    setPrimaryColor(pickRandomTempleColor());
  }, []);

  useEffect(() => {
    if (!domainTouched && name.trim()) {
      setDomain(suggestDomainFromName(name));
    }
    if (!paymentTouched && name.trim()) {
      setPaymentCode(suggestPaymentCode(name));
    }
  }, [name, domainTouched, paymentTouched]);

  useEffect(() => {
    if (createAbbott && !abbottLoginPhone && hotline) {
      setAbbottLoginPhone(hotline);
    }
  }, [hotline, createAbbott, abbottLoginPhone]);

  return (
    <form
      className="space-y-8 max-w-2xl"
      onSubmit={(e) => {
        e.preventDefault();
        setErr(null);
        setMsg(null);
        start(async () => {
          const res = await createTempleAction({
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
            createAbbottAccount: createAbbott,
            abbottLoginPhone: createAbbott ? abbottLoginPhone || hotline : undefined,
            abbottPassword: createAbbott ? abbottPassword : undefined,
          });
          if (!res.ok) {
            setErr(res.error);
            return;
          }
          setMsg(
            res.warning
              ? `Đã tạo Phật tự. ${res.warning}`
              : 'Đã tạo Phật tự và đặt ngữ cảnh làm việc.',
          );
          router.push('/quan-tri');
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
            placeholder="Chùa Hội Xá"
            required
          />
        </label>
        <label className={labelCls}>
          Tên khác
          <input
            className={inputCls}
            value={templeAltName}
            onChange={(e) => setTempleAltName(e.target.value)}
            placeholder="Hội Xá Tự"
          />
        </label>
        <label className={labelCls}>
          Domain *
          <input
            className={inputCls}
            value={domain}
            onChange={(e) => {
              setDomainTouched(true);
              setDomain(e.target.value);
            }}
            placeholder="hoixa.com hoặc hoixa.localhost"
            required
          />
          <span className="mt-1 block text-[11px] text-muted">
            Local: dùng *.localhost. Production: gắn DNS + Vercel sau.
          </span>
        </label>
        <label className={labelCls}>
          Mã chuyển khoản (payment code)
          <input
            className={inputCls}
            value={paymentCode}
            onChange={(e) => {
              setPaymentTouched(true);
              setPaymentCode(e.target.value.toUpperCase());
            }}
            maxLength={4}
            placeholder="HX"
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
      </section>

      <section className="border border-fog bg-paper p-5 space-y-3">
        <h2 className="font-display text-xl text-ink">Trụ trì</h2>
        <label className={labelCls}>
          Tên trụ trì
          <input
            className={inputCls}
            value={abbottName}
            onChange={(e) => setAbbottName(e.target.value)}
            placeholder="Thích …"
          />
        </label>
        <label className={labelCls}>
          Danh hiệu
          <input
            className={inputCls}
            value={abbottTitle}
            onChange={(e) => setAbbottTitle(e.target.value)}
            placeholder="Trụ trì"
          />
        </label>
        <label className={labelCls}>
          Hotline
          <input
            className={inputCls}
            value={hotline}
            onChange={(e) => setHotline(e.target.value)}
            placeholder="09xxxxxxxx"
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
            placeholder="Xóm …, xã …, huyện …, tỉnh …"
          />
        </label>
        <label className={labelCls}>
          Zalo
          <input
            className={inputCls}
            value={zalo}
            onChange={(e) => setZalo(e.target.value)}
            placeholder="https://zalo.me/09xxxxxxxx"
          />
        </label>
        <label className={labelCls}>
          Facebook
          <input
            className={inputCls}
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            placeholder="https://www.facebook.com/…"
          />
        </label>
        <label className={labelCls}>
          Slogan (để trống = mặc định)
          <input
            className={inputCls}
            value={slogan}
            onChange={(e) => setSlogan(e.target.value)}
          />
        </label>
        <label className={labelCls}>
          Tagline (để trống = mặc định)
          <input
            className={inputCls}
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
          />
        </label>
      </section>

      <section className="border border-fog bg-paper p-5 space-y-3">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={createAbbott}
            onChange={(e) => setCreateAbbott(e.target.checked)}
          />
          Tạo tài khoản đăng nhập cho trụ trì
        </label>
        {createAbbott ? (
          <>
            <label className={labelCls}>
              SĐT đăng nhập *
              <input
                className={inputCls}
                value={abbottLoginPhone}
                onChange={(e) => setAbbottLoginPhone(e.target.value)}
                placeholder="09xxxxxxxx"
              />
            </label>
            <label className={labelCls}>
              PIN 6 số
              <input
                className={inputCls}
                value={abbottPassword}
                onChange={(e) => setAbbottPassword(e.target.value)}
                maxLength={6}
              />
            </label>
          </>
        ) : null}
      </section>

      {err ? <p className="text-sm text-lacquer">{err}</p> : null}
      {msg ? <p className="text-sm text-muted">{msg}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="px-5 py-2.5 bg-ink text-white text-sm disabled:opacity-60"
      >
        {pending ? 'Đang tạo…' : 'Tạo Phật tự'}
      </button>
    </form>
  );
}
