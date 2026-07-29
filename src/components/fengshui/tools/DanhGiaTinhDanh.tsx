'use client';

import { useState } from 'react';
import {
  analyzeTinhDanh,
  getBieuLy,
  type Gender,
  type TinhDanhResult,
  type Tone,
} from '@/lib/fengshui/tinh-danh';
import { inputCls, labelCls } from '../FieldStyles';

interface Props {
  primaryColor: string;
}

function toneClass(tone: Tone): string {
  if (tone === 'cat') return 'border-emerald-800/25 bg-emerald-50/70';
  if (tone === 'hung') return 'border-stone-400/50 bg-stone-100';
  return 'border-amber-800/25 bg-amber-50/60';
}

function toneLabel(tone: Tone): string {
  if (tone === 'cat') return 'Cát';
  if (tone === 'hung') return 'Hung';
  return 'Bán cát–hung';
}

function BieuLyCard({
  label,
  number,
  blurb,
  primaryColor,
}: {
  label: string;
  number: number;
  blurb?: string;
  primaryColor: string;
}) {
  const meta = getBieuLy(number);
  return (
    <section className={`border ${toneClass(meta.tone)}`}>
      <div className="px-4 py-3 border-b border-fog/80 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted">{label}</p>
          <p className="font-display text-lg text-ink mt-0.5">
            Số biểu lý {meta.number}
            <span className="text-muted text-sm font-sans"> — {meta.title}</span>
          </p>
        </div>
        <div className="text-right">
          <p
            className="text-[10px] uppercase tracking-wide"
            style={{ color: primaryColor }}
          >
            {toneLabel(meta.tone)}
          </p>
          <p className="text-sm font-medium text-ink tabular-nums">
            {meta.score}/10
          </p>
        </div>
      </div>
      <div className="px-4 py-3 space-y-2">
        {blurb ? (
          <p className="text-xs text-muted leading-relaxed">{blurb}</p>
        ) : null}
        <p className="text-sm text-ink leading-relaxed">{meta.summary}</p>
      </div>
    </section>
  );
}

function ResultView({
  result,
  primaryColor,
}: {
  result: TinhDanhResult;
  primaryColor: string;
}) {
  const fullName = [result.ho, result.dem, result.ten].filter(Boolean).join(' ');

  return (
    <div className="mt-8 space-y-5">
      <div className="border border-fog bg-gradient-to-b from-[#faf6ef] to-white px-4 py-5 sm:px-6">
        <p className="text-[10px] uppercase tracking-wide text-muted">
          Diễn giải tính danh
        </p>
        <p className="font-display text-2xl text-ink mt-1">{fullName}</p>
        <p className="text-sm text-muted mt-1">
          Giới tính {result.gender === 'nam' ? 'nam' : 'nữ'} · điểm{' '}
          <span className="text-ink font-medium tabular-nums">
            {result.overallScore.toFixed(2)}/10
          </span>{' '}
          — {result.overallLabel}
        </p>

        <div className="mt-4 grid sm:grid-cols-3 gap-2 text-xs">
          <div className="border border-fog bg-white px-3 py-2">
            <p className="text-muted">Họ · {result.syllables.ho.text}</p>
            <p className="text-ink mt-0.5">
              {result.syllables.ho.strokes} nét
              <span className="text-muted"> ({result.syllables.ho.detail})</span>
            </p>
          </div>
          <div className="border border-fog bg-white px-3 py-2">
            <p className="text-muted">
              Đệm · {result.syllables.dem?.text || '(số giả 1)'}
            </p>
            <p className="text-ink mt-0.5">
              {result.B} nét
              {result.syllables.dem ? (
                <span className="text-muted">
                  {' '}
                  ({result.syllables.dem.detail})
                </span>
              ) : (
                <span className="text-muted"> — không đệm</span>
              )}
            </p>
          </div>
          <div className="border border-fog bg-white px-3 py-2">
            <p className="text-muted">Tên · {result.syllables.ten.text}</p>
            <p className="text-ink mt-0.5">
              {result.syllables.ten.strokes} nét
              <span className="text-muted"> ({result.syllables.ten.detail})</span>
            </p>
          </div>
        </div>

        <ul className="mt-4 grid sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-ink">
          <li>Họ vận: {result.hoVan}</li>
          <li>Tên vận: {result.tenVan}</li>
          <li>Mệnh vận: {result.menhVan}</li>
          <li>Phụ vận: {result.phuVan}</li>
          <li>Tổng vận: {result.tongVan}</li>
          <li>
            Mệnh cục tĩnh / động: {result.menhCucTinh} / {result.menhCucDong}
          </li>
          <li>Tiền vận cục: {result.tienVanCuc}</li>
          <li>Hậu vận cục: {result.hauVanCuc}</li>
          <li>
            Phúc đức tĩnh / động: {result.phucDucTinh} / {result.phucDucDong}
          </li>
          <li>
            Tử tức tĩnh / động: {result.tuTucTinh} / {result.tuTucDong}
          </li>
          <li>Linh hồn (Pythagoras): {result.linhHon}</li>
          <li>Biểu đạt · Sứ mệnh: {result.bieuDat} · {result.suMenh}</li>
        </ul>
        <p className="mt-3 text-[11px] text-muted leading-relaxed">
          (*) Số biểu lý = 0 được quy về 80 theo quy ước lý số.
        </p>
      </div>

      <section className="border border-fog bg-white px-4 py-4 space-y-2">
        <p className="text-[10px] uppercase tracking-wide text-muted">
          Âm dương ngũ hành — Mệnh vận
        </p>
        <p className="font-display text-lg text-ink">
          Đơn vị {result.menhNguHanh.digit} — {result.menhNguHanh.label}
        </p>
        <p className="text-sm text-ink leading-relaxed">
          {result.menhNguHanh.summary}
        </p>
      </section>

      <section className="border border-fog bg-white px-4 py-4 space-y-2">
        <p className="text-[10px] uppercase tracking-wide text-muted">
          Phối hợp Mệnh vận · Phụ vận
        </p>
        <p className="text-sm text-ink leading-relaxed">{result.phuHop.summary}</p>
        <p className="text-xs text-muted">Điểm: {result.phuHop.score}/10</p>
      </section>

      <section className="border border-fog bg-white px-4 py-4 space-y-2">
        <p className="text-[10px] uppercase tracking-wide text-muted">
          Tam tài — Họ · Mệnh · Tên (đơn vị)
        </p>
        <p className="text-sm text-ink leading-relaxed">{result.tamTai.summary}</p>
        <p className="text-xs text-muted">Điểm: {result.tamTai.score}/10</p>
      </section>

      <BieuLyCard
        label="Họ vận (Thiên cách · bề trên / gốc gia tộc)"
        number={result.hoVan}
        blurb="Liên quan cha mẹ, bề trên; ảnh hưởng thường nhẹ hơn Mệnh–Tên."
        primaryColor={primaryColor}
      />
      <BieuLyCard
        label="Mệnh vận (Nhân cách · chủ vận)"
        number={result.menhVan}
        blurb="Hạt nhân tính danh — tính cách, năng lực, cát hung chủ đạo."
        primaryColor={primaryColor}
      />
      <BieuLyCard
        label="Tên vận (Địa cách · tiền vận ~ trước 30 tuổi)"
        number={result.tenVan}
        blurb="Gắn bản thân lúc trẻ, nền tảng khởi đầu."
        primaryColor={primaryColor}
      />
      <BieuLyCard
        label="Phụ vận (Ngoại cách · phó vận / xã giao)"
        number={result.phuVan}
        blurb="Quan hệ bên ngoài, phúc đức hỗ trợ Mệnh vận."
        primaryColor={primaryColor}
      />
      <BieuLyCard
        label="Tổng vận (Tổng cách · hậu vận)"
        number={result.tongVan}
        blurb="Kết cục và chiều hướng sau ~30 tuổi."
        primaryColor={primaryColor}
      />
      <BieuLyCard
        label="Mệnh cục tĩnh / động"
        number={result.menhCucTinh}
        blurb="Tổng quan bẩm sinh (tĩnh) và xu thế kết cục (động) của danh xưng."
        primaryColor={primaryColor}
      />
      <BieuLyCard
        label="Tiền vận cục"
        number={result.tienVanCuc}
        blurb="Vận trình thời trẻ, thường gắn Tĩnh cục."
        primaryColor={primaryColor}
      />
      <BieuLyCard
        label="Hậu vận cục"
        number={result.hauVanCuc}
        blurb="Vận trình trung–vãn niên."
        primaryColor={primaryColor}
      />
      <BieuLyCard
        label="Phúc đức tĩnh cục"
        number={result.phucDucTinh}
        blurb="Phúc đức dòng họ tác động lên danh xưng."
        primaryColor={primaryColor}
      />
      <BieuLyCard
        label="Tử tức tĩnh cục"
        number={result.tuTucTinh}
        blurb="Gợi ý tổng quát về duyên con cái (tham khảo)."
        primaryColor={primaryColor}
      />

      <section className="border border-fog bg-white px-4 py-4 space-y-2">
        <p className="text-[10px] uppercase tracking-wide text-muted">
          Thần số Pythagoras (bổ sung)
        </p>
        <p className="text-sm text-ink leading-relaxed">
          Linh hồn <strong>{result.linhHon}</strong> · Biểu đạt{' '}
          <strong>{result.bieuDat}</strong> · Sứ mệnh{' '}
          <strong>{result.suMenh}</strong>
        </p>
        <p className="text-xs text-muted leading-relaxed">
          Lớp thần số phương Tây — đối chiếu thêm với lý số Đông phương, không
          thay thế ngũ cách.
        </p>
      </section>

      <p className="text-[11px] text-muted leading-relaxed border border-fog bg-white px-4 py-3">
        Kết luận: điểm <strong className="text-ink">{result.overallScore.toFixed(2)}</strong>{' '}
        — {result.overallLabel}. Tính danh học chỉ mang tính tham khảo; độ tin
        cậy thấp hơn ngày giờ sinh (Tử vi · Tứ trụ · Thần số đường đời). Việc
        hệ trọng nên kết hợp chánh kiến và thỉnh ý tại chùa. Tham khảo phương
        pháp số hóa nét Quốc ngữ (Vũ Đức Huynh · Việt danh học).
      </p>
    </div>
  );
}

export function DanhGiaTinhDanh({ primaryColor }: Props) {
  const [ho, setHo] = useState('');
  const [dem, setDem] = useState('');
  const [ten, setTen] = useState('');
  const [gender, setGender] = useState<Gender>('nam');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TinhDanhResult | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ho.trim() || !ten.trim()) {
      setError('Xin nhập ít nhất Họ và Tên.');
      setResult(null);
      return;
    }
    setError(null);
    setResult(
      analyzeTinhDanh({
        ho: ho.trim(),
        dem: dem.trim(),
        ten: ten.trim(),
        gender,
      }),
    );
  }

  return (
    <div>
      <p className="text-sm text-muted leading-relaxed mb-4">
        Đánh giá tính danh theo{' '}
        <span className="text-ink">số hóa nét chữ Quốc ngữ</span> — tách Họ /
        Đệm / Tên, lập Họ vận · Mệnh vận · Tên vận · Phụ vận · Tổng vận và các
        cục số. Kết quả tham khảo hướng thiện, không định mệnh tuyệt đối.
      </p>

      <form
        onSubmit={onSubmit}
        className="border border-fog bg-white p-4 sm:p-5 space-y-4"
      >
        <p className="text-xs text-muted">
          Nhập 3 phần phân cách (đệm có thể để trống).
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          <label className={labelCls()}>
            Họ
            <input
              value={ho}
              onChange={(e) => setHo(e.target.value)}
              placeholder="VD: Trịnh"
              className={`mt-1 ${inputCls}`}
              autoComplete="family-name"
            />
          </label>
          <label className={labelCls()}>
            Tên đệm
            <input
              value={dem}
              onChange={(e) => setDem(e.target.value)}
              placeholder="VD: Văn"
              className={`mt-1 ${inputCls}`}
            />
          </label>
          <label className={labelCls()}>
            Tên
            <input
              value={ten}
              onChange={(e) => setTen(e.target.value)}
              placeholder="VD: Cương"
              className={`mt-1 ${inputCls}`}
              autoComplete="given-name"
            />
          </label>
        </div>

        <fieldset>
          <legend className={labelCls()}>Giới tính</legend>
          <div className="mt-2 flex gap-4 text-sm text-ink">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                checked={gender === 'nam'}
                onChange={() => setGender('nam')}
              />
              Nam
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                checked={gender === 'nu'}
                onChange={() => setGender('nu')}
              />
              Nữ
            </label>
          </div>
        </fieldset>

        {error ? <p className="text-xs text-red-700">{error}</p> : null}

        <button
          type="submit"
          className="px-5 py-2.5 text-sm text-white"
          style={{ backgroundColor: primaryColor }}
        >
          Đánh giá tính danh
        </button>
      </form>

      {result ? (
        <ResultView result={result} primaryColor={primaryColor} />
      ) : null}
    </div>
  );
}
