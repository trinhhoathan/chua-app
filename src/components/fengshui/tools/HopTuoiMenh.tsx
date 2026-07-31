'use client';

import { useMemo, useState } from 'react';
import {
  HOP_TUOI_PURPOSES,
  buildHopTuoi,
  buildHopTuoiPromptContext,
  type HopTuoiPersonInput,
  type HopTuoiPersonView,
  type HopTuoiPurpose,
  type HopTuoiView,
} from '@/lib/fengshui/hop-tuoi';
import { NGU_HANH_COLOR } from '@/lib/fengshui/nap-am-ngu-hanh';
import { TuViChatPanel } from '@/components/fengshui/tools/TuViChatPanel';
import { TuViEssaySection } from '@/components/fengshui/tools/TuViEssaySection';

interface Props {
  primaryColor: string;
  templeId: string;
  templeName: string;
  templeHotline?: string | null;
  templePhone?: string | null;
}

const now = new Date();
const BIRTH_YEARS = Array.from({ length: 120 }, (_, i) => now.getFullYear() - i);

function HanhChip({ hanh }: { hanh: string }) {
  const color =
    NGU_HANH_COLOR[hanh as keyof typeof NGU_HANH_COLOR] ?? '#6B7280';
  return (
    <span
      className="inline-flex items-center justify-center px-1.5 h-5 text-[0.75rem] font-medium text-white shrink-0"
      style={{ backgroundColor: color }}
    >
      {hanh}
    </span>
  );
}

function LevelBadge({ level }: { level: 'tot' | 'binh' | 'xau' }) {
  const cfg =
    level === 'tot'
      ? { label: 'Tốt', color: '#1B6B3A' }
      : level === 'binh'
        ? { label: 'Bình', color: '#6B7280' }
        : { label: 'Xấu', color: '#B3362B' };
  return (
    <span
      className="inline-flex items-center px-1.5 h-5 text-[0.72rem] font-medium text-white shrink-0"
      style={{ backgroundColor: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

function PersonCard({
  person,
  title,
  primaryColor,
}: {
  person: HopTuoiPersonView;
  title: string;
  primaryColor: string;
}) {
  return (
    <div className="border border-fog bg-white p-4 space-y-1.5">
      <p
        className="text-[0.7rem] uppercase tracking-[0.25em]"
        style={{ color: primaryColor }}
      >
        {title}
      </p>
      <p className="text-base font-medium text-ink">
        {person.name}{' '}
        <span className="text-sm font-normal text-muted">
          ({person.gender === 'nam' ? 'Nam' : 'Nữ'}, {person.year})
        </span>
      </p>
      <p className="text-sm text-ink">
        Tuổi <strong>{person.canChi}</strong>
      </p>
      <p className="text-sm text-ink flex items-center gap-1.5 flex-wrap">
        Mệnh {person.napAm} <HanhChip hanh={person.napAmHanh} />
      </p>
      <p className="text-sm text-muted">
        Cung phi <span className="text-ink">{person.cungPhi}</span> (
        {person.cungPhiHanh}) · {person.nhomTrach}
      </p>
    </div>
  );
}

function PersonForm({
  label,
  name,
  setName,
  year,
  setYear,
  gender,
  setGender,
  primaryColor,
}: {
  label: string;
  name: string;
  setName: (v: string) => void;
  year: number;
  setYear: (v: number) => void;
  gender: 'nam' | 'nu';
  setGender: (v: 'nam' | 'nu') => void;
  primaryColor: string;
}) {
  return (
    <div className="border border-fog bg-paper/60 p-3.5 space-y-3">
      <p
        className="text-[0.7rem] uppercase tracking-[0.22em]"
        style={{ color: primaryColor }}
      >
        {label}
      </p>
      <label className="block text-xs text-muted">
        Tên gọi (tùy chọn)
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={label}
          className="mt-1 w-full border border-fog px-3 py-2 text-ink text-base bg-white"
        />
      </label>
      <label className="block text-xs text-muted">
        Năm sinh (âm lịch)
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="mt-1 w-full border border-fog px-2 py-2 text-base bg-white"
        >
          {BIRTH_YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </label>
      <div className="flex gap-2">
        {(
          [
            { v: 'nam' as const, l: 'Nam' },
            { v: 'nu' as const, l: 'Nữ' },
          ]
        ).map((g) => (
          <button
            key={g.v}
            type="button"
            onClick={() => setGender(g.v)}
            className="flex-1 px-3 py-2 text-sm border"
            style={
              gender === g.v
                ? {
                    background: primaryColor,
                    borderColor: primaryColor,
                    color: '#fff',
                  }
                : undefined
            }
          >
            {g.l}
          </button>
        ))}
      </div>
    </div>
  );
}

export function HopTuoiMenh({
  primaryColor,
  templeId,
  templeName,
  templeHotline,
  templePhone,
}: Props) {
  const contactPhone = templeHotline || templePhone || null;

  const [nameA, setNameA] = useState('');
  const [yearA, setYearA] = useState(1990);
  const [genderA, setGenderA] = useState<'nam' | 'nu'>('nam');
  const [nameB, setNameB] = useState('');
  const [yearB, setYearB] = useState(1992);
  const [genderB, setGenderB] = useState<'nam' | 'nu'>('nu');
  const [purpose, setPurpose] = useState<HopTuoiPurpose>('hon_nhan');

  const [view, setView] = useState<HopTuoiView | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [sessionId, setSessionId] = useState(0);

  const chartContext = useMemo(
    () => (view ? buildHopTuoiPromptContext(view) : ''),
    [view],
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const a: HopTuoiPersonInput = {
      name: nameA,
      year: yearA,
      gender: genderA,
    };
    const b: HopTuoiPersonInput = {
      name: nameB,
      year: yearB,
      gender: genderB,
    };
    setView(buildHopTuoi(a, b, purpose));
    setChatOpen(false);
    setSessionId((n) => n + 1);
  }

  const essayQuestion = view
    ? `Hãy luận giải chuyên sâu mức hợp – xung giữa tuổi ${view.a.canChi} và tuổi ${view.b.canChi} cho việc ${view.purposeLabel.toLowerCase()}: từng tiêu chí (mệnh nạp âm, thiên can, địa chi, cung phi bát trạch) tốt xấu ra sao và vì sao; tổng hợp lại nên phát huy điểm gì; nếu có điểm xung thì cách hóa giải dân gian thế nào. Không luận lá số Tử Vi riêng từng người.`
    : '';

  return (
    <div className="space-y-8 min-w-0 max-w-full">
      <form
        onSubmit={submit}
        className="border border-fog bg-white p-5 md:p-6 space-y-4 min-w-0"
      >
        <p
          className="text-[0.72rem] uppercase tracking-[0.25em]"
          style={{ color: primaryColor }}
        >
          Thông tin hai người cần xem
        </p>
        <p className="text-sm text-muted">
          Xét hợp tuổi theo bốn tiêu chí: mệnh nạp âm, thiên can, địa chi (tam
          hợp · lục hợp · lục xung · lục hại · tương hình) và cung phi bát
          trạch. Năm sinh tính theo âm lịch — sinh trước Tết thuộc năm trước.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PersonForm
            label="Người thứ nhất"
            name={nameA}
            setName={setNameA}
            year={yearA}
            setYear={setYearA}
            gender={genderA}
            setGender={setGenderA}
            primaryColor={primaryColor}
          />
          <PersonForm
            label="Người thứ hai"
            name={nameB}
            setName={setNameB}
            year={yearB}
            setYear={setYearB}
            gender={genderB}
            setGender={setGenderB}
            primaryColor={primaryColor}
          />
        </div>

        <div className="flex gap-2">
          {HOP_TUOI_PURPOSES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPurpose(p.id)}
              title={p.hint}
              className="flex-1 px-3 py-2 text-sm border"
              style={
                purpose === p.id
                  ? {
                      background: primaryColor,
                      borderColor: primaryColor,
                      color: '#fff',
                    }
                  : undefined
              }
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="text-[0.75rem] text-muted -mt-2">
          {HOP_TUOI_PURPOSES.find((p) => p.id === purpose)?.hint}
        </p>

        <button
          type="submit"
          className="w-full py-3 text-sm text-white uppercase tracking-[0.2em]"
          style={{ background: primaryColor }}
        >
          Xem hợp tuổi · xung khắc
        </button>
      </form>

      {view ? (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PersonCard
              person={view.a}
              title="Người thứ nhất"
              primaryColor={primaryColor}
            />
            <PersonCard
              person={view.b}
              title="Người thứ hai"
              primaryColor={primaryColor}
            />
          </div>

          <div className="border border-fog bg-white overflow-x-auto">
            <div className="px-4 pt-4 pb-2">
              <p
                className="text-[0.7rem] uppercase tracking-[0.25em]"
                style={{ color: primaryColor }}
              >
                Bốn tiêu chí đối chiếu · mục đích: {view.purposeLabel}
              </p>
            </div>
            <table className="w-full text-sm min-w-[36rem]">
              <thead>
                <tr className="border-y border-fog text-left text-xs text-muted">
                  <th className="px-4 py-2 font-medium">Tiêu chí</th>
                  <th className="px-3 py-2 font-medium">Đối chiếu</th>
                  <th className="px-3 py-2 font-medium">Luận</th>
                  <th className="px-3 py-2 font-medium text-right">Điểm</th>
                </tr>
              </thead>
              <tbody>
                {view.tieuChi.map((t) => (
                  <tr key={t.key} className="border-b border-fog/70 align-top">
                    <td className="px-4 py-2.5 text-ink font-medium whitespace-nowrap">
                      {t.label}
                    </td>
                    <td className="px-3 py-2.5 text-ink whitespace-nowrap">
                      {t.detail}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-start gap-1.5">
                        <LevelBadge level={t.level} />
                        <p className="text-ink leading-snug">{t.verdict}</p>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-ink whitespace-nowrap">
                      {t.score}/2
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            className="border-2 bg-white p-4 md:p-5 space-y-1.5"
            style={{ borderColor: primaryColor }}
          >
            <p
              className="text-[0.7rem] uppercase tracking-[0.25em]"
              style={{ color: primaryColor }}
            >
              Tổng hợp
            </p>
            <p className="text-lg font-medium text-ink">
              {view.totalScore}/{view.maxScore} điểm — {view.bandLabel}
            </p>
            <p className="text-sm text-muted">
              Phép xem dân gian theo năm sinh (nạp âm · can chi · cung phi).
              Muốn tinh hơn cần so cả tứ trụ ngày giờ của hai người — bấm luận
              chuyên sâu bên dưới để trụ trì {templeName} giảng rõ từng điểm.
            </p>
          </div>

          <TuViEssaySection
            key={`essay-${sessionId}`}
            chartContext={chartContext}
            templeName={templeName}
            primaryColor={primaryColor}
            contactPhone={contactPhone}
            title="Luận hợp tuổi (mẫu)"
            subtitle="Xem thử miễn phí mức hợp – xung giữa hai tuổi — không luận lá số Tử Vi riêng từng người."
            ctaTitle="Muốn luận hợp tuổi chuyên sâu hơn?"
            question={essayQuestion}
            focusFlag="hopTuoiFocus"
            topic="hop_tuoi"
            buttonLabel="Luận hợp tuổi"
            loadingLabel={`Trụ trì ${templeName} đang luận hợp tuổi…`}
            notePrefix="Hỏi sâu hợp tuổi xung khắc"
            onAskMore={() => setChatOpen(true)}
          />

          <p className="text-[0.75rem] text-muted">
            Công cụ liên quan:{' '}
            <a
              href="/phong-thuy/xem-han-nam"
              className="underline underline-offset-2"
              style={{ color: primaryColor }}
            >
              Xem hạn năm
            </a>
            .
          </p>

          <TuViChatPanel
            key={`chat-${sessionId}`}
            open={chatOpen}
            onClose={() => setChatOpen(false)}
            primaryColor={primaryColor}
            templeName={templeName}
            templeId={templeId}
            contactPhone={contactPhone}
            chart={null}
            horoscope={null}
            hopTuoiFocus
            contextOverride={chartContext}
            freeQuestionLimit={3}
          />
        </div>
      ) : null}
    </div>
  );
}
