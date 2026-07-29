'use client';

import { useMemo, useState, useTransition } from 'react';
import { registerDevoteePublic } from '@/app/actions/admin';
import {
  VnDateDropdowns,
  VnTimeDropdowns,
  composeVnDate,
  composeVnTime,
  yearOptions,
  type DateParts,
  type TimeParts,
} from '@/components/forms/VnDateTimeFields';

interface Props {
  templeName: string;
  primaryColor: string;
  variant?: 'section' | 'page';
}

const EMPTY_DATE: DateParts = { day: '', month: '', year: '' };
const EMPTY_TIME: TimeParts = { hour: '', minute: '' };

export function DevoteeJoinForm({
  templeName,
  primaryColor,
  variant = 'section',
}: Props) {
  const [fullName, setFullName] = useState('');
  const [dharmaName, setDharmaName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [birth, setBirth] = useState<DateParts>(EMPTY_DATE);
  const [birthTime, setBirthTime] = useState<TimeParts>(EMPTY_TIME);
  const [quyY, setQuyY] = useState<DateParts>(EMPTY_DATE);
  const [consent, setConsent] = useState(true);
  const [hp, setHp] = useState('');
  const [msg, setMsg] = useState<{
    kind: 'ok' | 'err';
    text: string;
  } | null>(null);
  const [pending, start] = useTransition();

  const thisYear = new Date().getFullYear();
  const birthYears = useMemo(
    () => yearOptions(thisYear - 120, thisYear),
    [thisYear],
  );
  const quyYYears = useMemo(
    () => yearOptions(thisYear - 80, thisYear),
    [thisYear],
  );

  const labelCls = 'text-xs uppercase tracking-[0.2em] text-muted';
  const inputCls =
    'mt-1.5 w-full border border-fog bg-white px-4 py-3 text-ink text-base';

  function resetForm() {
    setFullName('');
    setDharmaName('');
    setPhone('');
    setAddress('');
    setNote('');
    setBirth(EMPTY_DATE);
    setBirthTime(EMPTY_TIME);
    setQuyY(EMPTY_DATE);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const birthDate = composeVnDate(birth);
    const birthTimeStr = composeVnTime(birthTime);
    const quyYDate = composeVnDate(quyY);

    if (birthDate === '__incomplete__') {
      setMsg({
        kind: 'err',
        text: 'Chọn đủ Ngày / Tháng / Năm sinh, hoặc để trống cả ba.',
      });
      return;
    }
    if (birthTimeStr === '__incomplete__') {
      setMsg({
        kind: 'err',
        text: 'Chọn đủ Giờ và Phút sinh, hoặc để trống cả hai.',
      });
      return;
    }
    if (quyYDate === '__incomplete__') {
      setMsg({
        kind: 'err',
        text: 'Chọn đủ Ngày / Tháng / Năm quy y, hoặc để trống cả ba.',
      });
      return;
    }

    start(async () => {
      const res = await registerDevoteePublic({
        fullName,
        phone,
        consent,
        dharmaName,
        birthDate,
        birthTime: birthTimeStr,
        address,
        note,
        quyYDate: quyYDate || undefined,
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
      resetForm();
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

      <label className={`block ${labelCls}`}>
        Họ và tên *
        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nguyễn Văn A"
          autoComplete="name"
          className={inputCls}
        />
      </label>

      <label className={`block ${labelCls}`}>
        Pháp danh
        <input
          value={dharmaName}
          onChange={(e) => setDharmaName(e.target.value)}
          placeholder="Thiện Tâm"
          className={inputCls}
        />
      </label>

      <VnDateDropdowns
        label="Ngày / Tháng / Năm sinh"
        labelClassName={labelCls}
        value={birth}
        years={birthYears}
        onChange={setBirth}
      />

      <VnTimeDropdowns
        labelClassName={labelCls}
        value={birthTime}
        onChange={setBirthTime}
      />

      <VnDateDropdowns
        label="Ngày quy y"
        labelClassName={labelCls}
        value={quyY}
        years={quyYYears}
        onChange={setQuyY}
      />

      <label className={`block ${labelCls}`}>
        Số điện thoại *
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

      <label className={`block ${labelCls}`}>
        Địa chỉ
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Số nhà, thôn/xóm, xã/phường…"
          className={inputCls}
        />
      </label>

      <label className={`block ${labelCls}`}>
        Ghi chú
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Ghi chú thêm (nếu có)"
          className={`${inputCls} resize-none`}
        />
      </label>

      <label className="flex items-start gap-2.5 text-sm text-ink leading-snug">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 size-4 accent-ink"
        />
        <span>
          Đồng ý cho <strong className="font-medium">{templeName}</strong> gửi
          thông tin lễ, khóa tu, thiện nguyện tới số điện thoại đã đăng ký.
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
