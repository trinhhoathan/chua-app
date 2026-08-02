/**
 * Luận giải AI cho nhóm tool "Hệ trọng".
 *
 * Nguyên tắc: client CHỈ gửi input thô (topic + ngày + năm sinh…).
 * Server tự chạy engine lõi (chon-ngay, rules, huong-nha, cuoi-hoi,
 * sinh-con, sao-chieu-menh, muon-tuoi, mai-tang, cai-tang) rồi đổ kết quả
 * tất định thành khối context — AI chỉ diễn giải, không tự tính, không bịa.
 *
 * Input tất định → context tất định → bài luận cache được theo hash input.
 */

import {
  CHON_NGAY_ACTIVITIES,
  checkChonNgayDay,
  type ChonNgayActivityId,
  type ChonNgayDayCheck,
  type ChonNgayPerson,
  type GoodHourSlot,
} from './chon-ngay';
import { checkTrungTang, type RuleResult, type Verdict } from './rules';
import { buildHuongNha } from './huong-nha';
import { buildCuoiHoi } from './cuoi-hoi';
import { goodYearsForChild } from './sinh-con';
import { getSaoChieuMenh } from './sao-chieu-menh';
import {
  checkBorrowPerson,
  getMuonTuoiLamNha,
  getOwnerStatus,
} from './muon-tuoi-lam-nha';
import { deathDayInfo, checkMaiTangDay, maiTangPersons } from './mai-tang';
import {
  CAI_TANG_STEPS,
  checkCaiTangDay,
  type CaiTangStepId,
} from './cai-tang';

/** Tăng khi đổi cấu trúc prompt/context → cache cũ tự vô hiệu. */
export const HE_TRONG_PROMPT_VERSION = 1;

// ---------------------------------------------------------------------------
// Payload
// ---------------------------------------------------------------------------

export type HeTrongTopic =
  | 'chon_ngay'
  | 'trung_tang'
  | 'huong_nha'
  | 'cuoi_hoi'
  | 'sinh_con'
  | 'sao_chieu_menh'
  | 'dong_tho'
  | 'muon_tuoi'
  | 'mai_tang'
  | 'cai_tang';

export interface HeTrongPersonInput {
  birthYear: number;
  label: string;
}

export type HeTrongPayload =
  | {
      topic: 'chon_ngay';
      activityId: ChonNgayActivityId;
      year: number;
      month: number;
      day: number;
      persons: HeTrongPersonInput[];
    }
  | {
      topic: 'trung_tang';
      birthYear: number;
      deathDay: number;
      deathMonth: number;
      deathYear: number;
      deathHour: number | null;
      gender: 'nam' | 'nu';
    }
  | { topic: 'huong_nha'; birthYear: number; gender: 'nam' | 'nu' }
  | {
      topic: 'cuoi_hoi';
      brideYear: number;
      groomYear: number;
      targetYear: number;
    }
  | {
      topic: 'sinh_con';
      motherYear: number;
      fatherYear: number | null;
      fromYear: number;
    }
  | {
      topic: 'sao_chieu_menh';
      birthYear: number;
      viewYear: number;
      gender: 'nam' | 'nu';
    }
  | { topic: 'dong_tho'; birthYear: number; targetYear: number }
  | {
      topic: 'muon_tuoi';
      ownerYear: number;
      targetYear: number;
      personYear: number | null;
    }
  | {
      topic: 'mai_tang';
      deathYear: number;
      deathMonth: number;
      deathDay: number;
      deceasedBirthYear: number | null;
      eldestSonBirthYear: number | null;
      burial: { year: number; month: number; day: number } | null;
    }
  | {
      topic: 'cai_tang';
      year: number;
      month: number;
      day: number;
      stepId: CaiTangStepId;
      deceasedBirthYear: number | null;
      eldestSonBirthYear: number | null;
    };

// ---------------------------------------------------------------------------
// Validate input thô (biên hệ thống — dữ liệu đến từ client)
// ---------------------------------------------------------------------------

function asInt(v: unknown): number | null {
  const n = Number(v);
  return Number.isInteger(n) ? n : null;
}

function yearOk(v: unknown): number | null {
  const n = asInt(v);
  return n !== null && n >= 1900 && n <= 2100 ? n : null;
}

function optionalYear(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return null;
  return yearOk(v);
}

function dateOk(
  y: unknown,
  m: unknown,
  d: unknown,
): { y: number; m: number; d: number } | null {
  const yy = yearOk(y);
  const mm = asInt(m);
  const dd = asInt(d);
  if (yy === null || mm === null || dd === null) return null;
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  const probe = new Date(yy, mm - 1, dd);
  if (probe.getMonth() !== mm - 1 || probe.getDate() !== dd) return null;
  return { y: yy, m: mm, d: dd };
}

function genderOk(v: unknown): 'nam' | 'nu' | null {
  return v === 'nam' || v === 'nu' ? v : null;
}

function sanitizeLabel(v: unknown, fallback: string): string {
  if (typeof v !== 'string') return fallback;
  const clean = v.replace(/[^\p{L}\p{N} \-–'/]/gu, '').trim().slice(0, 24);
  return clean || fallback;
}

function personsOk(v: unknown): HeTrongPersonInput[] {
  if (!Array.isArray(v)) return [];
  const out: HeTrongPersonInput[] = [];
  for (const item of v.slice(0, 4)) {
    const o = item as { birthYear?: unknown; label?: unknown };
    const y = yearOk(o?.birthYear);
    if (y === null) continue;
    out.push({ birthYear: y, label: sanitizeLabel(o?.label, 'người xem') });
  }
  return out;
}

/** Parse + validate body thô từ client. Trả null nếu không hợp lệ. */
export function parseHeTrongPayload(raw: unknown): HeTrongPayload | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;

  switch (r.topic) {
    case 'chon_ngay': {
      const activityId = r.activityId as ChonNgayActivityId;
      if (!CHON_NGAY_ACTIVITIES[activityId]) return null;
      const date = dateOk(r.year, r.month, r.day);
      if (!date) return null;
      return {
        topic: 'chon_ngay',
        activityId,
        year: date.y,
        month: date.m,
        day: date.d,
        persons: personsOk(r.persons),
      };
    }
    case 'trung_tang': {
      const birthYear = yearOk(r.birthYear);
      const date = dateOk(r.deathYear, r.deathMonth, r.deathDay);
      const gender = genderOk(r.gender);
      if (birthYear === null || !date || !gender) return null;
      const hour = asInt(r.deathHour);
      return {
        topic: 'trung_tang',
        birthYear,
        deathYear: date.y,
        deathMonth: date.m,
        deathDay: date.d,
        deathHour: hour !== null && hour >= 0 && hour <= 23 ? hour : null,
        gender,
      };
    }
    case 'huong_nha': {
      const birthYear = yearOk(r.birthYear);
      const gender = genderOk(r.gender);
      if (birthYear === null || !gender) return null;
      return { topic: 'huong_nha', birthYear, gender };
    }
    case 'cuoi_hoi': {
      const brideYear = yearOk(r.brideYear);
      const groomYear = yearOk(r.groomYear);
      const targetYear = yearOk(r.targetYear);
      if (brideYear === null || groomYear === null || targetYear === null)
        return null;
      return { topic: 'cuoi_hoi', brideYear, groomYear, targetYear };
    }
    case 'sinh_con': {
      const motherYear = yearOk(r.motherYear);
      const fromYear = yearOk(r.fromYear);
      if (motherYear === null || fromYear === null) return null;
      return {
        topic: 'sinh_con',
        motherYear,
        fatherYear: optionalYear(r.fatherYear),
        fromYear,
      };
    }
    case 'sao_chieu_menh': {
      const birthYear = yearOk(r.birthYear);
      const viewYear = yearOk(r.viewYear);
      const gender = genderOk(r.gender);
      if (birthYear === null || viewYear === null || !gender) return null;
      return { topic: 'sao_chieu_menh', birthYear, viewYear, gender };
    }
    case 'dong_tho': {
      const birthYear = yearOk(r.birthYear);
      const targetYear = yearOk(r.targetYear);
      if (birthYear === null || targetYear === null) return null;
      return { topic: 'dong_tho', birthYear, targetYear };
    }
    case 'muon_tuoi': {
      const ownerYear = yearOk(r.ownerYear);
      const targetYear = yearOk(r.targetYear);
      if (ownerYear === null || targetYear === null) return null;
      return {
        topic: 'muon_tuoi',
        ownerYear,
        targetYear,
        personYear: optionalYear(r.personYear),
      };
    }
    case 'mai_tang': {
      const death = dateOk(r.deathYear, r.deathMonth, r.deathDay);
      if (!death) return null;
      let burial: { year: number; month: number; day: number } | null = null;
      if (r.burial && typeof r.burial === 'object') {
        const b = r.burial as Record<string, unknown>;
        const bd = dateOk(b.year, b.month, b.day);
        if (bd) burial = { year: bd.y, month: bd.m, day: bd.d };
      }
      return {
        topic: 'mai_tang',
        deathYear: death.y,
        deathMonth: death.m,
        deathDay: death.d,
        deceasedBirthYear: optionalYear(r.deceasedBirthYear),
        eldestSonBirthYear: optionalYear(r.eldestSonBirthYear),
        burial,
      };
    }
    case 'cai_tang': {
      const date = dateOk(r.year, r.month, r.day);
      if (!date) return null;
      const stepId = CAI_TANG_STEPS.some((s) => s.id === r.stepId)
        ? (r.stepId as CaiTangStepId)
        : 'tong_quat';
      return {
        topic: 'cai_tang',
        year: date.y,
        month: date.m,
        day: date.d,
        stepId,
        deceasedBirthYear: optionalYear(r.deceasedBirthYear),
        eldestSonBirthYear: optionalYear(r.eldestSonBirthYear),
      };
    }
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Định dạng context
// ---------------------------------------------------------------------------

function vLabel(v: Verdict | 'tot' | 'binh' | 'xau'): string {
  if (v === 'good' || v === 'tot') return 'Tốt';
  if (v === 'bad' || v === 'xau') return 'Xấu';
  if (v === 'binh') return 'Bình';
  return 'Lưu ý';
}

function ruleLines(rules: RuleResult[]): string {
  return rules
    .map((r) => `- [${vLabel(r.verdict)}] ${r.label}: ${r.detail}`)
    .join('\n');
}

function hourLines(hours: GoodHourSlot[]): string {
  const good = hours.filter((h) => h.recommended);
  if (good.length === 0) {
    return 'Không có giờ hoàng đạo trọn vẹn (không xung tuổi) trong ngày này.';
  }
  return good
    .map((h) => `- Giờ ${h.chi} (${h.range}) — ${h.tianShen}, ${h.daoType}`)
    .join('\n');
}

function dayCheckBlock(c: ChonNgayDayCheck): string {
  return [
    `Ngày dương: ${c.solarDay}/${c.solarMonth}/${c.solarYear} (${c.weekLabel}) — Âm lịch: ${c.lunarLabel} — Ngày ${c.dayCanChi}`,
    `${c.daoType} (${c.luckLabel}) · Trực ${c.truc} · Sao ${c.xiu} (${c.xiuLuck})`,
    `Điểm tổng: ${c.score}/100 — Kết luận: ${c.verdictLabel}`,
    c.detail,
    '',
    '## Tiêu chí chấm điểm',
    c.criteria
      .map((cr) => `- [${vLabel(cr.verdict)}] ${cr.label}: ${cr.detail}`)
      .join('\n'),
    '',
    '## Giờ tốt trong ngày (đã lọc giờ xung tuổi)',
    hourLines(c.hours),
    '',
    '## Nhật lịch ghi',
    `Nên: ${c.yi.slice(0, 18).join(', ') || '(trống)'}`,
    `Kiêng: ${c.ji.slice(0, 18).join(', ') || '(trống)'}`,
  ].join('\n');
}

export interface HeTrongContext {
  /** Tiêu đề ngắn hiển thị + đưa vào prompt */
  title: string;
  /** Khối dữ liệu tất định — nguồn duy nhất cho AI */
  context: string;
}

export function buildHeTrongContext(p: HeTrongPayload): HeTrongContext {
  switch (p.topic) {
    case 'chon_ngay': {
      const activity = CHON_NGAY_ACTIVITIES[p.activityId];
      const persons: ChonNgayPerson[] = p.persons;
      const check = checkChonNgayDay(
        p.activityId,
        p.year,
        p.month,
        p.day,
        persons,
      );
      const personLines = persons.length
        ? persons.map((x) => `- ${x.label}: sinh năm ${x.birthYear}`).join('\n')
        : '(không nhập tuổi người xem)';
      return {
        title: `Xem ngày ${activity.label} — ${p.day}/${p.month}/${p.year}`,
        context: [
          `# Việc: ${activity.label}`,
          '',
          '## Người liên quan',
          personLines,
          '',
          dayCheckBlock(check),
        ].join('\n'),
      };
    }

    case 'trung_tang': {
      const report = checkTrungTang({
        birthYear: p.birthYear,
        deathDay: p.deathDay,
        deathMonth: p.deathMonth,
        deathYear: p.deathYear,
        deathHour: p.deathHour,
        gender: p.gender,
      });
      return {
        title: `Kiểm tra Trùng tang — mất ngày ${p.deathDay}/${p.deathMonth}/${p.deathYear}`,
        context: [
          '# Kiểm tra Trùng tang (phương pháp 4 bàn)',
          `Người mất: ${p.gender === 'nam' ? 'nam' : 'nữ'}, sinh năm ${p.birthYear}, hưởng ${report.ageAtDeath} tuổi mụ.`,
          `Ngày mất: ${p.deathDay}/${p.deathMonth}/${p.deathYear} dương — ${report.dayLunar} — ngày ${report.deathDayCanChi}.`,
          report.hourProvided
            ? 'Có giờ mất — tính đủ 4 bàn.'
            : 'Chưa có giờ mất — chỉ tính được 3 bàn (tuổi, tháng, ngày).',
          '',
          '## Kết quả từng bàn',
          report.bans
            .map((b) => `- ${b.label} (${b.value}): rơi cung ${b.cungChi} → ${b.kind}`)
            .join('\n'),
          '',
          `## Kết luận: ${report.overallLabel}`,
          report.suggestion,
        ].join('\n'),
      };
    }

    case 'huong_nha': {
      const r = buildHuongNha(p.birthYear, p.gender);
      return {
        title: `Hướng nhà cho ${p.gender === 'nam' ? 'nam' : 'nữ'} ${r.canChi} ${p.birthYear}`,
        context: [
          '# Chọn hướng nhà theo Bát Trạch',
          `Gia chủ: ${p.gender === 'nam' ? 'nam' : 'nữ'}, sinh năm ${p.birthYear} (${r.canChi}), cung phi ${r.cungPhi} — ${r.nhomTrach}.`,
          r.summary,
          '',
          '## Tám hướng (xếp từ tốt nhất đến xấu nhất)',
          r.huongs
            .map(
              (h) =>
                `${h.rank}. Hướng ${h.huong} (quái ${h.quai}) — ${h.duNien} [${vLabel(h.level)}]: ${h.meaning}`,
            )
            .join('\n'),
        ].join('\n'),
      };
    }

    case 'cuoi_hoi': {
      const r = buildCuoiHoi(p.brideYear, p.groomYear, p.targetYear);
      const ht = r.hopTuoi;
      const personLine = (x: typeof ht.a) =>
        `${x.name}: ${x.year} (${x.canChi}) — mệnh ${x.napAm} (${x.napAmHanh}), cung phi ${x.cungPhi} (${x.nhomTrach})`;
      return {
        title: `Xem tuổi cưới hỏi năm ${p.targetYear}`,
        context: [
          `# Xem tuổi cưới hỏi — năm ${p.targetYear}`,
          personLine(ht.a),
          personLine(ht.b),
          `Cô dâu ${r.brideAgeMu} tuổi mụ năm cưới.`,
          '',
          `## Hợp tuổi hai người: ${ht.bandLabel} (${ht.totalScore}/${ht.maxScore} điểm)`,
          ht.tieuChi
            .map((t) => `- [${vLabel(t.level)}] ${t.label}: ${t.detail} → ${t.verdict}`)
            .join('\n'),
          '',
          '## Luật năm cưới',
          ruleLines(r.yearRules),
          '',
          '## Tháng cưới',
          r.monthNote,
          '',
          `## Kết luận: ${r.overallLabel}`,
          r.overallDetail,
        ].join('\n'),
      };
    }

    case 'sinh_con': {
      const years = goodYearsForChild(p.motherYear, p.fatherYear, p.fromYear, 6);
      return {
        title: `Năm sinh con tốt từ ${p.fromYear}`,
        context: [
          '# Chọn năm sinh con hợp cha mẹ',
          `Mẹ sinh năm ${p.motherYear}${p.fatherYear ? `, cha sinh năm ${p.fatherYear}` : ' (không nhập tuổi cha)'}.`,
          `Xét ${years.length} năm từ ${p.fromYear}.`,
          '',
          ...years.map((y) =>
            [
              `## Năm ${y.year} (${y.canChi} — ${y.napAm}) — ${y.score}/${y.maxScore} điểm [${vLabel(y.verdict)}]`,
              y.note,
              ...y.matches.map(
                (m) =>
                  `- Với ${m.parentLabel} (${m.parentCanChi}, ${m.parentNapAm}): chi ${m.chiRelation.text}; nạp âm ${m.napAmRelation.text}; can ${m.canRelation.text}`,
              ),
              ...y.motherNotes.map(
                (n) => `- [${vLabel(n.verdict)}] ${n.label}: ${n.detail}`,
              ),
            ].join('\n'),
          ),
        ].join('\n'),
      };
    }

    case 'sao_chieu_menh': {
      const r = getSaoChieuMenh(p.birthYear, p.viewYear, p.gender);
      return {
        title: `Sao chiếu mệnh & Thái Tuế năm ${p.viewYear}`,
        context: [
          `# Sao chiếu mệnh · Thái Tuế — năm ${p.viewYear} (${r.yearCanChi})`,
          `Người xem: ${p.gender === 'nam' ? 'nam' : 'nữ'}, sinh năm ${p.birthYear} (${r.birthCanChi}), ${r.ageMu} tuổi mụ.`,
          '',
          `## Sao chiếu mệnh: ${r.star.name} (${r.star.element}) — ${vLabel(r.starVerdict)}`,
          r.star.summary,
          `Lời khuyên: ${r.star.advice}`,
          `Tham khảo dân gian: ${r.star.ritualHint}`,
          '',
          `## Thái Tuế: ${r.taiSui.label}`,
          r.taiSui.detail,
          r.taiSui.position
            ? `Phương vị Thái Tuế năm: ${r.taiSui.position} — kiêng động thổ, đào bới hướng này.`
            : '',
          '',
          '## Tam Tai',
          r.tamTai.detail,
          '',
          `## Tổng kết: ${r.overallLabel}`,
          r.overallDetail,
        ]
          .filter(Boolean)
          .join('\n'),
      };
    }

    case 'dong_tho': {
      const owner = getOwnerStatus(p.birthYear, p.targetYear);
      const upcoming = Array.from({ length: 8 }, (_, i) => {
        const y = p.targetYear + i;
        const s = getOwnerStatus(p.birthYear, y);
        const issues = s.results
          .filter((r) => r.verdict !== 'good')
          .map((r) => r.label);
        return `- Năm ${y} (${s.ageMu} tuổi mụ): ${vLabel(s.overall)}${issues.length ? ` — phạm ${issues.join(', ')}` : ' — không phạm luật nào'}`;
      });
      return {
        title: `Xem tuổi làm nhà năm ${p.targetYear}`,
        context: [
          `# Xem tuổi làm nhà — gia chủ ${owner.canChi} ${p.birthYear}, năm ${p.targetYear}`,
          `Tuổi mụ: ${owner.ageMu}. ${owner.summary}`,
          '',
          '## Bốn luật năm',
          ruleLines(owner.results),
          '',
          '## Tám năm tới',
          upcoming.join('\n'),
          '',
          owner.needsBorrow
            ? 'Gia chủ phạm luật nặng năm này — theo tục có thể mượn tuổi làm nhà.'
            : 'Gia chủ không cần mượn tuổi năm này.',
        ].join('\n'),
      };
    }

    case 'muon_tuoi': {
      const r = getMuonTuoiLamNha(p.ownerYear, p.targetYear);
      const lines: string[] = [
        `# Mượn tuổi làm nhà — năm ${p.targetYear}`,
        `Gia chủ ${r.owner.canChi} ${p.ownerYear} (${r.owner.ageMu} tuổi mụ): ${r.owner.summary}`,
        '',
        '## Luật năm của gia chủ',
        ruleLines(r.owner.results),
      ];
      if (p.personYear) {
        const c = checkBorrowPerson(p.personYear, p.targetYear, p.ownerYear);
        lines.push(
          '',
          `## Kiểm tra người định mượn: sinh năm ${p.personYear} (${c.canChi}, ${c.napAm}, ${c.ageMu} tuổi mụ) — ${vLabel(c.overall)}`,
          c.note,
          ruleLines(
            [c.kimLau, c.hoangOc, c.tamTai, c.xungNam, c.ownerRelation].filter(
              (x): x is RuleResult => x !== null,
            ),
          ),
        );
      }
      if (r.best.length > 0) {
        lines.push(
          '',
          '## Các tuổi đẹp có thể mượn',
          r.best
            .slice(0, 6)
            .map(
              (c) =>
                `- Sinh năm ${c.birthYear} (${c.canChi}, ${c.napAm}, ${c.ageMu} tuổi mụ) — ${c.badge}${c.ownerRelation ? `; ${c.ownerRelation.detail}` : ''}`,
            )
            .join('\n'),
        );
      }
      return { title: `Mượn tuổi làm nhà năm ${p.targetYear}`, context: lines.join('\n') };
    }

    case 'mai_tang': {
      const death = deathDayInfo(p.deathYear, p.deathMonth, p.deathDay);
      const persons = maiTangPersons({
        deceasedBirthYear: p.deceasedBirthYear,
        eldestSonBirthYear: p.eldestSonBirthYear,
      });
      const lines: string[] = [
        '# Ngày giờ mai táng',
        `Ngày mất: ${p.deathDay}/${p.deathMonth}/${p.deathYear} (${death.weekLabel}) — ${death.lunarLabel} — ngày ${death.dayCanChi}, ${death.daoType}, trực ${death.truc}.`,
        p.deceasedBirthYear
          ? `Người mất sinh năm ${p.deceasedBirthYear}.`
          : '(chưa nhập năm sinh người mất)',
        p.eldestSonBirthYear
          ? `Trưởng nam sinh năm ${p.eldestSonBirthYear}.`
          : '(chưa nhập năm sinh trưởng nam)',
        '',
        `## Xét ngày mất: ${vLabel(death.verdict)}`,
        death.note,
        ...(death.folkWarnings.length
          ? death.folkWarnings.map(
              (f) => `- [${vLabel(f.severity)}] ${f.label}: ${f.detail}`,
            )
          : ['- Ngày mất không phạm kỵ tang lễ dân gian nào.']),
      ];
      if (p.burial) {
        const check = checkMaiTangDay(
          p.burial.year,
          p.burial.month,
          p.burial.day,
          persons,
        );
        lines.push('', '# Ngày an táng dự kiến', dayCheckBlock(check));
      } else {
        lines.push('', '(Chưa chọn ngày an táng cụ thể — luận về ngày mất và các lưu ý chung.)');
      }
      return {
        title: `Mai táng — mất ngày ${p.deathDay}/${p.deathMonth}/${p.deathYear}`,
        context: lines.join('\n'),
      };
    }

    case 'cai_tang': {
      const step =
        CAI_TANG_STEPS.find((s) => s.id === p.stepId) ?? CAI_TANG_STEPS[0];
      const c = checkCaiTangDay(
        p.year,
        p.month,
        p.day,
        p.stepId,
        p.deceasedBirthYear,
        p.eldestSonBirthYear,
      );
      return {
        title: `Cải táng (${step.label}) — ${p.day}/${p.month}/${p.year}`,
        context: [
          `# Cải táng · bốc mộ — việc: ${step.label}`,
          `Ngày xem: ${p.day}/${p.month}/${p.year} (${c.weekLabel}) — ${c.lunarLabel} — ngày ${c.dayCanChi}, ${c.daoType} (${c.luckLabel}).`,
          p.deceasedBirthYear
            ? `Người mất sinh năm ${p.deceasedBirthYear}.`
            : '(chưa nhập năm sinh người mất)',
          p.eldestSonBirthYear
            ? `Trưởng nam sinh năm ${p.eldestSonBirthYear}.`
            : '(chưa nhập năm sinh trưởng nam)',
          '',
          `## Kết luận: ${c.verdictLabel}`,
          c.detail,
          '',
          '## Bách kỵ tang lễ',
          ...(c.folkWarnings.length
            ? c.folkWarnings.map(
                (f) => `- [${vLabel(f.severity)}] ${f.label}: ${f.detail}`,
              )
            : ['- Không phạm kỵ tang lễ dân gian nào.']),
          '',
          '## Xung tuổi theo ngày',
          ...(c.xungDay.length
            ? c.xungDay.map((x) => `- [${vLabel(x.verdict)}] ${x.detail}`)
            : ['- Không có dữ liệu tuổi để xét xung.']),
          '',
          '## Giờ tốt trong ngày',
          hourLines(c.goodHours),
          '',
          '## Nhật lịch ghi',
          `Nên: ${c.yi.slice(0, 18).join(', ') || '(trống)'}`,
          `Kiêng: ${c.ji.slice(0, 18).join(', ') || '(trống)'}`,
        ].join('\n'),
      };
    }
  }
}

// ---------------------------------------------------------------------------
// System prompt + user block
// ---------------------------------------------------------------------------

export interface HeTrongPersona {
  /** VD "Thầy Phong Thủy Phúc An" — chỉ truyền cho site không phải chùa */
  displayName: string;
  aiOutro?: string;
}

export function buildHeTrongSystemPrompt(
  templeName: string,
  persona?: HeTrongPersona | null,
): string {
  const chua = templeName.trim() || 'chùa';
  const shared = `NGUYÊN TẮC:
- Luận dựa CHỈ trên khối dữ liệu được cung cấp (kết quả tính toán từ lịch vạn niên, luật tuổi cổ truyền). TUYỆT ĐỐI không tự tính lại, không bịa thêm ngày giờ / sao / cung / con số.
- Nếu dữ liệu ghi kết luận Tốt / Lưu ý / Xấu, bài luận phải nhất quán với kết luận đó — chỉ diễn giải sâu hơn, không đảo ngược.
- Cổ học chọn ngày, luật tuổi theo hướng chánh tín, nhân quả, hướng thiện; KHÔNG mê tín tuyệt đối, KHÔNG hù dọa, KHÔNG hứa chắc kết quả. Việc trọng đại khuyên tham vấn thêm người có kinh nghiệm.
- Thuật ngữ Hán–Việt (Trực, Hoàng đạo, Kim Lâu, Tam Tai, nạp âm, cung phi, Trùng tang…) phải kèm giải nghĩa ngắn, dễ hiểu cho người thường.
- Không nhắc AI, chatbot, DeepSeek, mô hình ngôn ngữ.

BỐ CỤC BÀI LUẬN (dùng tiêu đề ###, độ dài 350–600 chữ):
### 1. Nhìn tổng quan
Kết luận chính bằng lời lẽ ấm áp, dễ hiểu — thuận hay cần cân nhắc, vì sao.
### 2. Phân tích
Đi qua các tiêu chí quan trọng nhất trong dữ liệu (tốt lẫn xấu), giải nghĩa từng thuật ngữ.
### 3. Nên làm gì
Khuyên cụ thể: chọn giờ nào, kiêng gì, cách hóa giải dân gian nếu có trong dữ liệu, việc thiện nên làm.
### 4. Lời dặn
Ngắn gọn, trấn an, nhắc đây là cổ học tham khảo.

KHÔNG thêm khối <<<goi-y>>> hay câu hỏi gợi ý.`;

  if (persona) {
    return `Bạn là ${persona.displayName}, thầy phong thủy trực tiếp luận giải việc hệ trọng (làm nhà, cưới hỏi, tang lễ, sinh con, sao hạn…) cho khách với giọng trang nghiêm, ấm áp, rõ ràng.

${shared}

Xưng hô: gọi người xem là "quý vị"; tự xưng "thầy". TUYỆT ĐỐI không nhắc "thỉnh nước", "công đức", "nhà chùa", "bần tăng", "Phật tử".
${persona.aiOutro ? `Kết bài: ${persona.aiOutro}` : ''}`;
  }

  return `Bạn là trụ trì ${chua}, luận giải việc hệ trọng (làm nhà, cưới hỏi, tang lễ, sinh con, sao hạn…) cho Phật tử với giọng trang nghiêm, từ bi, rõ ràng.

${shared}

Xưng hô: "quý vị" / "Phật tử"; có thể tự xưng "bần tăng" hoặc nói trực tiếp. Có thể mở đầu bằng "A Di Đà Phật".
Kết bài có thể nhắc nhẹ: việc hệ trọng nên thỉnh ý trực tiếp trụ trì ${chua}; muốn luận sâu thêm có thể thỉnh nước ủng hộ chùa.`;
}

export function buildHeTrongUserBlock(
  ctx: HeTrongContext,
  advisor = 'trụ trì',
): string {
  return `Dưới đây là kết quả tính toán tất định cho việc "${ctx.title}" cần ${advisor} luận giải (nguồn duy nhất, không bịa thêm):

${ctx.context}

Hãy luận giải theo đúng bố cục 4 phần đã dặn.`;
}
