'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import type { Devotee } from '@/types/database';
import { upsertDevotee } from '@/app/actions/admin';
import { formatVnDate, formatVnTime } from '@/lib/vn-date';

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function daysInMonth(year: number, month: number): number {
  if (!year || !month) return 31;
  return new Date(year, month, 0).getDate();
}

function yearOptions(from: number, to: number): number[] {
  const years: number[] = [];
  for (let y = to; y >= from; y -= 1) years.push(y);
  return years;
}

const selectCls =
  'w-full border border-fog bg-white px-2 py-2 text-sm text-ink';
const inputCls = 'mt-1 w-full border border-fog px-3 py-2';

function DateDropdowns({
  label,
  day,
  month,
  year,
  years,
  onChange,
}: {
  label: string;
  day: string;
  month: string;
  year: string;
  years: number[];
  onChange: (next: { day: string; month: string; year: string }) => void;
}) {
  const maxDay = daysInMonth(Number(year) || 0, Number(month) || 0);
  const dayList = DAYS.filter((d) => d <= maxDay);

  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <div className="mt-1 grid grid-cols-3 gap-2">
        <select
          aria-label={`${label} — ngày`}
          value={day}
          onChange={(e) => onChange({ day: e.target.value, month, year })}
          className={selectCls}
        >
          <option value="">Ngày</option>
          {dayList.map((d) => (
            <option key={d} value={String(d)}>
              {pad2(d)}
            </option>
          ))}
        </select>
        <select
          aria-label={`${label} — tháng`}
          value={month}
          onChange={(e) => {
            const nextMonth = e.target.value;
            const max = daysInMonth(Number(year) || 0, Number(nextMonth) || 0);
            const nextDay = day && Number(day) > max ? String(max) : day;
            onChange({ day: nextDay, month: nextMonth, year });
          }}
          className={selectCls}
        >
          <option value="">Tháng</option>
          {MONTHS.map((m) => (
            <option key={m} value={String(m)}>
              {pad2(m)}
            </option>
          ))}
        </select>
        <select
          aria-label={`${label} — năm`}
          value={year}
          onChange={(e) => {
            const nextYear = e.target.value;
            const max = daysInMonth(Number(nextYear) || 0, Number(month) || 0);
            const nextDay = day && Number(day) > max ? String(max) : day;
            onChange({ day: nextDay, month, year: nextYear });
          }}
          className={selectCls}
        >
          <option value="">Năm</option>
          {years.map((y) => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function TimeDropdowns({
  hour,
  minute,
  onChange,
}: {
  hour: string;
  minute: string;
  onChange: (next: { hour: string; minute: string }) => void;
}) {
  return (
    <div>
      <p className="text-xs text-muted">Thời gian sinh</p>
      <div className="mt-1 grid grid-cols-2 gap-2">
        <select
          aria-label="Giờ sinh"
          value={hour}
          onChange={(e) => onChange({ hour: e.target.value, minute })}
          className={selectCls}
        >
          <option value="">Giờ</option>
          {HOURS.map((h) => (
            <option key={h} value={String(h)}>
              {pad2(h)} giờ
            </option>
          ))}
        </select>
        <select
          aria-label="Phút sinh"
          value={minute}
          onChange={(e) => onChange({ hour, minute: e.target.value })}
          className={selectCls}
        >
          <option value="">Phút</option>
          {MINUTES.map((m) => (
            <option key={m} value={String(m)}>
              {pad2(m)} phút
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function composeVnDate(day: string, month: string, year: string): string {
  if (!day && !month && !year) return '';
  if (!day || !month || !year) return '__incomplete__';
  return `${pad2(Number(day))}/${pad2(Number(month))}/${year}`;
}

function composeTime(hour: string, minute: string): string {
  if (!hour && !minute) return '';
  if (hour === '' || minute === '') return '__incomplete__';
  return `${pad2(Number(hour))}:${pad2(Number(minute))}`;
}

function splitVnDate(raw: string | null | undefined): {
  day: string;
  month: string;
  year: string;
} {
  if (!raw) return { day: '', month: '', year: '' };
  const vn = formatVnDate(raw);
  const m = vn.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return { day: '', month: '', year: '' };
  return {
    day: String(Number(m[1])),
    month: String(Number(m[2])),
    year: m[3],
  };
}

function splitTime(raw: string | null | undefined): {
  hour: string;
  minute: string;
} {
  const t = formatVnTime(raw);
  if (!t) return { hour: '', minute: '' };
  const [h, m] = t.split(':');
  return { hour: String(Number(h)), minute: String(Number(m)) };
}

export function DevoteeForm({
  templeId,
  editing,
  onCancelEdit,
}: {
  templeId: string;
  editing: Devotee | null;
  onCancelEdit: () => void;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const thisYear = new Date().getFullYear();
  const birthYears = useMemo(
    () => yearOptions(thisYear - 120, thisYear),
    [thisYear],
  );
  const quyYYears = useMemo(
    () => yearOptions(thisYear - 80, thisYear),
    [thisYear],
  );

  const [fullName, setFullName] = useState('');
  const [dharmaName, setDharmaName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [birth, setBirth] = useState({ day: '', month: '', year: '' });
  const [birthTime, setBirthTime] = useState({ hour: '', minute: '' });
  const [quyY, setQuyY] = useState({ day: '', month: '', year: '' });

  useEffect(() => {
    if (!editing) {
      setFullName('');
      setDharmaName('');
      setPhone('');
      setAddress('');
      setNote('');
      setBirth({ day: '', month: '', year: '' });
      setBirthTime({ hour: '', minute: '' });
      setQuyY({ day: '', month: '', year: '' });
      setMsg(null);
      return;
    }

    setFullName(editing.full_name ?? '');
    setDharmaName(editing.dharma_name ?? '');
    setPhone(editing.phone ?? '');
    setAddress(editing.address ?? '');
    setNote(editing.note ?? '');

    if (editing.birth_date) {
      setBirth(splitVnDate(editing.birth_date));
    } else if (editing.birth_year) {
      setBirth({ day: '', month: '', year: String(editing.birth_year) });
    } else {
      setBirth({ day: '', month: '', year: '' });
    }
    setBirthTime(splitTime(editing.birth_time));
    setQuyY(splitVnDate(editing.quy_y_date));
    setMsg(null);

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [editing]);

  const isEdit = Boolean(editing);

  return (
    <form
      className="border border-fog bg-paper p-5 space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        setMsg(null);

        const birthDate = composeVnDate(birth.day, birth.month, birth.year);
        const birthTimeStr = composeTime(birthTime.hour, birthTime.minute);
        const quyYDate = composeVnDate(quyY.day, quyY.month, quyY.year);

        if (birthDate === '__incomplete__') {
          // Cho phép chỉ chọn năm (dữ liệu cũ) khi sửa
          if (!(birth.year && !birth.day && !birth.month)) {
            setMsg('Chọn đủ Ngày / Tháng / Năm sinh, hoặc để trống cả ba.');
            return;
          }
        }
        if (birthTimeStr === '__incomplete__') {
          setMsg('Chọn đủ Giờ và Phút sinh, hoặc để trống cả hai.');
          return;
        }
        if (quyYDate === '__incomplete__') {
          setMsg('Chọn đủ Ngày / Tháng / Năm quy y, hoặc để trống cả ba.');
          return;
        }

        const onlyYear =
          birth.year && !birth.day && !birth.month
            ? Number(birth.year)
            : undefined;

        start(async () => {
          const res = await upsertDevotee({
            templeId,
            id: editing?.id,
            fullName,
            dharmaName,
            birthDate: birthDate === '__incomplete__' ? '' : birthDate,
            birthTime: birthTimeStr,
            birthYear: onlyYear,
            phone,
            address,
            note,
            quyYDate: quyYDate || undefined,
          });
          if (!res.ok) {
            setMsg(res.error ?? 'Lỗi');
            return;
          }
          setMsg(isEdit ? 'Đã cập nhật.' : 'Đã lưu.');
          onCancelEdit();
          window.location.reload();
        });
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-xl text-ink">
          {isEdit ? 'Sửa Phật tử' : 'Thêm Phật tử'}
        </h2>
        {isEdit ? (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-xs text-lacquer underline"
          >
            Hủy sửa
          </button>
        ) : null}
      </div>

      <label className="block text-xs text-muted">
        Họ tên *
        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={inputCls}
        />
      </label>
      <label className="block text-xs text-muted">
        Pháp danh
        <input
          value={dharmaName}
          onChange={(e) => setDharmaName(e.target.value)}
          className={inputCls}
        />
      </label>

      <DateDropdowns
        label="Ngày / Tháng / Năm sinh"
        day={birth.day}
        month={birth.month}
        year={birth.year}
        years={birthYears}
        onChange={setBirth}
      />

      <TimeDropdowns
        hour={birthTime.hour}
        minute={birthTime.minute}
        onChange={setBirthTime}
      />

      <DateDropdowns
        label="Ngày quy y"
        day={quyY.day}
        month={quyY.month}
        year={quyY.year}
        years={quyYYears}
        onChange={setQuyY}
      />

      <label className="block text-xs text-muted">
        SĐT
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputCls}
        />
      </label>
      <label className="block text-xs text-muted">
        Địa chỉ
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={inputCls}
        />
      </label>
      <label className="block text-xs text-muted">
        Ghi chú
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className={`${inputCls} resize-none`}
        />
      </label>
      {msg ? <p className="text-xs text-muted">{msg}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full py-2.5 text-sm text-white bg-ink disabled:opacity-60"
      >
        {pending
          ? 'Đang lưu…'
          : isEdit
            ? 'Cập nhật Phật tử'
            : 'Lưu Phật tử'}
      </button>
    </form>
  );
}
