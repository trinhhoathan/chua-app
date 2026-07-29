'use client';

import { useMemo, useState } from 'react';
import {
  analyzeThanSo,
  getProfile,
  isValidBirthDate,
  type MasterOrDigit,
  type NumberProfile,
  type ThanSoResult,
} from '@/lib/fengshui/than-so-hoc';
import { inputCls, labelCls } from '../FieldStyles';

interface Props {
  primaryColor: string;
}

function NumberBadge({
  n,
  primaryColor,
  large,
}: {
  n: MasterOrDigit;
  primaryColor: string;
  large?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center font-display tabular-nums text-white ${
        large ? 'size-16 text-3xl' : 'size-10 text-lg'
      }`}
      style={{ backgroundColor: primaryColor }}
    >
      {n}
    </span>
  );
}

function ProfileCard({
  label,
  profile,
  primaryColor,
  step,
}: {
  label: string;
  profile: NumberProfile;
  primaryColor: string;
  step?: string;
}) {
  return (
    <section className="border border-fog bg-white">
      <div className="px-4 py-3 border-b border-fog flex items-start gap-3">
        <NumberBadge n={profile.number} primaryColor={primaryColor} large />
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wide text-muted">
            {label}
          </p>
          <p className="font-display text-xl text-ink mt-0.5">
            Số {profile.number} — {profile.title}
          </p>
          {step ? (
            <p className="text-[11px] text-muted mt-1 leading-relaxed">
              {step}
            </p>
          ) : null}
        </div>
      </div>
      <div className="px-4 py-4 space-y-3">
        <p className="text-sm text-ink leading-relaxed">{profile.summary}</p>
        <ul className="flex flex-wrap gap-1">
          {profile.keywords.map((k) => (
            <li
              key={k}
              className="px-2 py-0.5 text-[11px] border border-fog bg-paper text-ink"
            >
              {k}
            </li>
          ))}
        </ul>
        <div className="grid sm:grid-cols-3 gap-3 text-xs leading-relaxed">
          <div className="border border-fog bg-paper/60 p-3">
            <p className="text-[10px] uppercase tracking-wide text-muted mb-1">
              Thế mạnh
            </p>
            <p className="text-ink">{profile.strength}</p>
          </div>
          <div className="border border-fog bg-paper/60 p-3">
            <p className="text-[10px] uppercase tracking-wide text-muted mb-1">
              Thách thức
            </p>
            <p className="text-ink">{profile.challenge}</p>
          </div>
          <div className="border border-fog bg-paper/60 p-3">
            <p className="text-[10px] uppercase tracking-wide text-muted mb-1">
              Lời khuyên
            </p>
            <p className="text-ink">{profile.advice}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniStat({
  label,
  n,
  primaryColor,
}: {
  label: string;
  n: MasterOrDigit;
  primaryColor: string;
}) {
  const p = getProfile(n);
  return (
    <div className="border border-fog bg-white px-3 py-3 flex items-center gap-3">
      <NumberBadge n={n} primaryColor={primaryColor} />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-muted">{label}</p>
        <p className="text-sm text-ink font-medium truncate">{p.title}</p>
      </div>
    </div>
  );
}

export function ThanSoHoc({ primaryColor }: Props) {
  const now = new Date();
  const [fullName, setFullName] = useState('');
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(1990);
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ThanSoResult | null>(null);

  const lifeProfile = useMemo(
    () => (result ? getProfile(result.lifePath) : null),
    [result],
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidBirthDate(day, month, year)) {
      setError('Ngày sinh không hợp lệ. Xin kiểm tra lại.');
      setResult(null);
      return;
    }
    if (viewYear < 1900 || viewYear > 2100) {
      setError('Năm xem không hợp lệ.');
      setResult(null);
      return;
    }
    setError(null);
    setResult(
      analyzeThanSo({
        fullName,
        day,
        month,
        year,
        viewYear,
      }),
    );
  }

  return (
    <div>
      <p className="text-sm text-muted leading-relaxed mb-4">
        Thần số học Pythagoras — tính{' '}
        <span className="text-ink">số đường đời</span>, số ngày sinh, năm cá
        nhân và (nếu có) số từ họ tên. Giữ master{' '}
        <span className="text-ink">11 · 22 · 33</span>. Kết quả mang tính tham
        khảo hướng thiện, không thay cho quyết định tuyệt đối.
      </p>

      <form
        onSubmit={onSubmit}
        className="border border-fog bg-white p-4 sm:p-5 space-y-4"
      >
        <label className={labelCls()}>
          Họ và tên (không bắt buộc — càng đủ càng rõ số vận mệnh / linh hồn)
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="VD: Nguyễn Văn An"
            className={`mt-1 ${inputCls}`}
            autoComplete="name"
          />
        </label>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          <label className={labelCls()}>
            Ngày
            <input
              type="number"
              min={1}
              max={31}
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
              className={`mt-1 ${inputCls}`}
            />
          </label>
          <label className={labelCls()}>
            Tháng
            <input
              type="number"
              min={1}
              max={12}
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className={`mt-1 ${inputCls}`}
            />
          </label>
          <label className={labelCls()}>
            Năm sinh
            <input
              type="number"
              min={1900}
              max={2100}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className={`mt-1 ${inputCls}`}
            />
          </label>
          <label className={`${labelCls()} col-span-3 sm:col-span-1`}>
            Năm xem
            <input
              type="number"
              min={1900}
              max={2100}
              value={viewYear}
              onChange={(e) => setViewYear(Number(e.target.value))}
              className={`mt-1 ${inputCls}`}
            />
          </label>
        </div>

        {error ? <p className="text-xs text-red-700">{error}</p> : null}

        <button
          type="submit"
          className="px-5 py-2.5 text-sm text-white"
          style={{ backgroundColor: primaryColor }}
        >
          Xem thần số
        </button>
      </form>

      {result && lifeProfile ? (
        <div className="mt-8 space-y-5">
          <div className="border border-fog bg-gradient-to-b from-[#faf6ef] to-white px-4 py-5 sm:px-6">
            <p className="text-[10px] uppercase tracking-wide text-muted">
              Kết quả
            </p>
            <p className="font-display text-2xl text-ink mt-1">
              {result.fullName ? `${result.fullName} · ` : ''}
              {String(result.birthDay).padStart(2, '0')}/
              {String(result.birthMonth).padStart(2, '0')}/{result.birthYear}
            </p>
            <div className="mt-4 grid sm:grid-cols-3 gap-2">
              <MiniStat
                label="Đường đời"
                n={result.lifePath}
                primaryColor={primaryColor}
              />
              <MiniStat
                label="Ngày sinh"
                n={result.birthday}
                primaryColor={primaryColor}
              />
              <MiniStat
                label={`Năm cá nhân ${result.viewYear}`}
                n={result.personalYear}
                primaryColor={primaryColor}
              />
            </div>
            {result.name ? (
              <div className="mt-2 grid sm:grid-cols-3 gap-2">
                <MiniStat
                  label="Vận mệnh (tên)"
                  n={result.name.expression}
                  primaryColor={primaryColor}
                />
                <MiniStat
                  label="Linh hồn (nguyên âm)"
                  n={result.name.soul}
                  primaryColor={primaryColor}
                />
                <MiniStat
                  label="Nhân cách (phụ âm)"
                  n={result.name.personality}
                  primaryColor={primaryColor}
                />
              </div>
            ) : (
              <p className="mt-3 text-xs text-muted">
                Chưa nhập họ tên — chỉ luận theo ngày sinh. Bổ sung tên để xem số
                vận mệnh · linh hồn · nhân cách.
              </p>
            )}
          </div>

          <ProfileCard
            label="Số đường đời (Life Path)"
            profile={lifeProfile}
            primaryColor={primaryColor}
            step={result.steps.lifePath}
          />

          <ProfileCard
            label="Số ngày sinh (Birthday)"
            profile={getProfile(result.birthday)}
            primaryColor={primaryColor}
            step={result.steps.birthday}
          />

          <ProfileCard
            label={`Năm cá nhân ${result.viewYear}`}
            profile={getProfile(result.personalYear)}
            primaryColor={primaryColor}
            step={result.steps.personalYear}
          />

          {result.name ? (
            <>
              <ProfileCard
                label="Số vận mệnh — tổng cả tên (Expression)"
                profile={getProfile(result.name.expression)}
                primaryColor={primaryColor}
                step={result.steps.name}
              />
              <ProfileCard
                label="Số linh hồn — nguyên âm (Soul Urge)"
                profile={getProfile(result.name.soul)}
                primaryColor={primaryColor}
              />
              <ProfileCard
                label="Số nhân cách — phụ âm (Personality)"
                profile={getProfile(result.name.personality)}
                primaryColor={primaryColor}
              />
            </>
          ) : null}

          <p className="text-[11px] text-muted leading-relaxed border border-fog bg-white px-4 py-3">
            Thần số học là hệ tham chiếu hiện đại (Pythagoras), khác Kinh Dịch /
            Tử vi. Quý vị dùng để soi tính khí và hướng tu dưỡng — việc hệ trọng
            nên kết hợp chánh kiến và thỉnh ý tại chùa.
          </p>
        </div>
      ) : null}
    </div>
  );
}
