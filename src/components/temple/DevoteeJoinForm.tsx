'use client';

import { useState, useTransition } from 'react';
import { registerDevoteePublic } from '@/app/actions/admin';

interface Props {
  templeName: string;
  primaryColor: string;
  variant?: 'section' | 'page';
}

type Channel = 'zalo' | 'sms' | 'phone';

export function DevoteeJoinForm({
  templeName,
  primaryColor,
  variant = 'section',
}: Props) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [channel, setChannel] = useState<Channel>('zalo');
  const [consent, setConsent] = useState(true);
  const [hp, setHp] = useState('');
  const [msg, setMsg] = useState<{
    kind: 'ok' | 'err';
    text: string;
  } | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    start(async () => {
      const res = await registerDevoteePublic({
        fullName,
        phone,
        consent,
        preferredChannel: channel,
        hp,
      });
      if (!res.ok) {
        setMsg({ kind: 'err', text: res.error ?? 'Không đăng ký được.' });
        return;
      }
      setMsg({
        kind: 'ok',
        text: res.existing
          ? 'Đã cập nhật thông tin của quý vị. Xin cảm tạ.'
          : 'Xin chào mừng quý vị đã kết duyên cùng nhà chùa.',
      });
      setFullName('');
      setPhone('');
    });
  }

  return (
    <form
      onSubmit={submit}
      className={`space-y-4 ${
        variant === 'page' ? '' : 'max-w-lg mx-auto md:mx-0'
      }`}
    >
      <input
        type="text"
        name="website"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <label className="block text-xs uppercase tracking-[0.2em] text-muted">
        Họ và tên
        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nguyễn Văn A"
          autoComplete="name"
          className="mt-1.5 w-full border border-fog bg-white px-4 py-3 text-ink text-base"
        />
      </label>

      <label className="block text-xs uppercase tracking-[0.2em] text-muted">
        Số điện thoại
        <input
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="09xxxxxxxx"
          inputMode="tel"
          autoComplete="tel"
          className="mt-1.5 w-full border border-fog bg-white px-4 py-3 text-ink text-lg font-medium tabular-nums tracking-wide"
        />
      </label>

      <fieldset>
        <legend className="text-xs uppercase tracking-[0.2em] text-muted">
          Kênh nhà chùa liên hệ khi có lễ
        </legend>
        <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
          {([
            { value: 'zalo', label: 'Zalo' },
            { value: 'sms', label: 'Tin nhắn' },
            { value: 'phone', label: 'Gọi điện' },
          ] as { value: Channel; label: string }[]).map((c) => {
            const active = channel === c.value;
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => setChannel(c.value)}
                className="px-3 py-2 border text-center transition-colors"
                style={
                  active
                    ? {
                        background: primaryColor,
                        borderColor: primaryColor,
                        color: '#fff',
                      }
                    : undefined
                }
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="flex items-start gap-2.5 text-sm text-ink leading-snug">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 size-4 accent-ink"
        />
        <span>
          Đồng ý cho <strong className="font-medium">{templeName}</strong> gửi
          thông tin lễ, khóa tu, thiện nguyện qua kênh đã chọn.
        </span>
      </label>

      {msg ? (
        <p
          className={`text-sm ${
            msg.kind === 'ok' ? 'text-ink' : 'text-lacquer'
          }`}
        >
          {msg.text}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 text-white text-sm uppercase tracking-[0.25em] disabled:opacity-60"
        style={{ background: primaryColor }}
      >
        {pending ? 'Đang gửi…' : 'Kết duyên cùng nhà chùa'}
      </button>

      <p className="text-[0.72rem] text-muted leading-relaxed">
        Thông tin của quý vị chỉ nhà chùa quản lý, không chia sẻ cho bên thứ
        ba. Có thể huỷ nhận tin bất cứ lúc nào.
      </p>
    </form>
  );
}
