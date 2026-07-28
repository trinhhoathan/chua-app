/**
 * Nhật lịch chi tiết từ lunar-typescript (6tail), đã Việt hóa.
 */

import {
  Solar,
  SolarMonth,
  type LunarTime,
  type NineStar,
} from 'lunar-typescript';
import { viGanZhi, viList, viTerm } from './lunar-zh-vi';

export type DayLuck = 'good' | 'bad' | 'neutral';

export interface AlmanacHour {
  ganZhi: string;
  chi: string;
  animal: string;
  range: string;
  tianShen: string;
  daoType: string;
  luck: DayLuck;
  luckLabel: string;
  yi: string[];
  ji: string[];
  chong: string;
  sha: string;
  naYin: string;
  xun: string;
  xunKong: string;
  nineStar: string;
  positionXi: string;
  positionFu: string;
  positionCai: string;
}

export interface NineStarInfo {
  /** Ngũ Hoàng Thổ */
  name: string;
  /** Trung (Trung cung) */
  position: string;
  /** Ngọc Hành */
  beiDou: string;
  /** Liêm Trinh · Xấu */
  xuanKong: string;
  /** Thiên Cầm · Đại cát · Dương */
  qiMen: string;
  /** Thiên Phù · Hung thần */
  taiYi: string;
  baMen: string;
  song: string;
  /** Dòng hiển thị đầy đủ, đã cách khoảng */
  full: string;
}

export interface AlmanacDay {
  solarYear: number;
  solarMonth: number;
  solarDay: number;
  weekLabel: string;
  xingZuo: string;
  julianDay: number;

  lunarDay: number;
  lunarMonth: number;
  lunarYear: number;
  lunarLeap: boolean;
  lunarLabel: string;
  lunarDayChinese: string;

  yearCanChi: string;
  yearCanChiLiChun: string;
  yearCanChiExact: string;
  monthCanChi: string;
  monthCanChiExact: string;
  dayCanChi: string;
  dayCanChiExact: string;
  yearAnimal: string;
  monthAnimal: string;
  dayAnimal: string;
  yearNaYin: string;
  monthNaYin: string;
  dayNaYin: string;

  baZi: string[];
  baZiWuXing: string[];
  baZiNaYin: string[];
  baZiShiShenGan: string[];
  baZiShiShenZhi: string[];
  baZiShiShenYearZhi: string[];
  baZiShiShenMonthZhi: string[];
  baZiShiShenDayZhi: string[];
  baZiShiShenTimeZhi: string[];

  zhiXing: string;
  tianShen: string;
  daoType: string;
  luck: DayLuck;
  luckLabel: string;

  yi: string[];
  ji: string[];
  jiShen: string[];
  xiongSha: string[];

  chong: string;
  chongAnimal: string;
  sha: string;

  positionXi: string;
  positionXiBagua: string;
  positionYangGui: string;
  positionYinGui: string;
  positionFu: string;
  positionCai: string;
  positionTaiSuiYear: string;
  positionTaiSuiMonth: string;
  positionTaiSuiDay: string;
  positionTai: string;
  positionTaiMonth: string;

  xiu: string;
  xiuLuck: string;
  xiuSong: string;
  xiuAnimal: string;
  xiuGong: string;
  xiuShou: string;
  xiuZheng: string;

  pengZuGan: string;
  pengZuZhi: string;

  yueXiang: string;
  liuYao: string;
  wuHou: string;
  hou: string;
  dayLu: string;
  season: string;

  dayXun: string;
  dayXunKong: string;
  yearXun: string;
  yearXunKong: string;
  monthXun: string;
  monthXunKong: string;

  nineStarYear: NineStarInfo;
  nineStarMonth: NineStarInfo;
  nineStarDay: NineStarInfo;
  /** @deprecated dùng nineStarDay.full */
  nineStar: string;

  jieQi: string | null;
  prevJie: string | null;
  nextJie: string | null;
  prevQi: string | null;
  nextQi: string | null;
  prevJieQi: string | null;
  nextJieQi: string | null;
  fu: string | null;
  shuJiu: string | null;

  festivals: string[];
  otherFestivals: string[];
  solarFestivals: string[];
  taoFestivals: string[];
  fotoYear: string;
  taoYear: string;
  fotoNotes: string[];
  taoNotes: string[];

  hours: AlmanacHour[];
}

export interface MonthCell {
  solarYear: number;
  solarMonth: number;
  solarDay: number;
  lunarDay: number;
  lunarMonth: number;
  lunarLeap: boolean;
  inMonth: boolean;
  luck: DayLuck;
  jieQi: string | null;
  dayCanChi: string;
}

const WEEK_VI = [
  'Chủ nhật',
  'Thứ hai',
  'Thứ ba',
  'Thứ tư',
  'Thứ năm',
  'Thứ sáu',
  'Thứ bảy',
] as const;

const TAI_YI_SONG_VI: Record<string, string> = {
  门中太乙明: 'Thái Ất sáng giữa cửa, sao Tham Lang — tài hỷ, hôn nhân tốt, ra vào thuận.',
  门前见摄提: 'Nhiếp Đề trước cửa — nhiều nghi lo; nên ẩn nhẫn, tránh đại sự.',
  出入会轩辕: 'Gặp Hiên Viên — dễ vướng mắc; đi xa, đánh bạc kém lợi.',
  招摇号木星: 'Chiêu Dao — việc lớn nên dừng; dễ miệng tiếng, kinh sợ.',
  五鬼为天符: 'Ngũ Quỷ / Thiên Phù — đường đi trở ngại, mất mát; thận trọng mọi sự.',
  神光跃青龙: 'Thanh Long thần quang — tài khí tốt, gặp quý, nhiều việc hanh thông.',
  吾将为咸池: 'Hàm Trì — nhiều việc bất lợi; cầu tài dễ về không.',
  坐临太阴星: 'Thái Âm — tránh họa; cầu mưu dễ thành, đi lại nên thận trọng.',
  迎来天乙星: 'Thiên Ất — trăm việc hưng; cưới hỏi, cầu mưu tốt.',
};

function toLuck(raw: string): DayLuck {
  if (raw === '吉') return 'good';
  if (raw === '凶') return 'bad';
  return 'neutral';
}

function mapNineStar(n: NineStar): NineStarInfo {
  // Dịch nguyên cụm 五黄土 → Ngũ Hoàng Thổ (tránh 黄 = Vàng)
  const name = viTerm(`${n.getNumber()}${n.getColor()}${n.getWuXing()}`);
  const position = `${viTerm(n.getPosition())} (${viTerm(n.getPositionDesc())})`;
  const beiDou = viTerm(n.getNameInBeiDou());
  const xuanKong = `${viTerm(n.getNameInXuanKong())} · ${viTerm(n.getLuckInXuanKong())}`;
  const qiMenParts = [
    viTerm(n.getNameInQiMen()),
    viTerm(n.getLuckInQiMen()),
    viTerm(n.getYinYangInQiMen()),
  ].filter(Boolean);
  const baMen = viTerm(n.getBaMenInQiMen());
  if (baMen) qiMenParts.push(baMen);
  const qiMen = qiMenParts.join(' · ');
  const taiYi = `${viTerm(n.getNameInTaiYi())} · ${viTerm(n.getTypeInTaiYi())}`;
  const songRaw = n.getSongInTaiYi() || '';
  const songKey = Object.keys(TAI_YI_SONG_VI).find((k) => songRaw.startsWith(k));
  const song = songKey ? TAI_YI_SONG_VI[songKey] : viTerm(songRaw);

  const full = [
    name,
    position,
    beiDou,
    `Huyền Không [${xuanKong}]`,
    `Kỳ Môn [${qiMen}]`,
    `Thái Ất [${taiYi}]`,
  ].join(' ');

  return {
    name,
    position,
    beiDou,
    xuanKong,
    qiMen,
    taiYi,
    baMen,
    song,
    full,
  };
}

function mapHour(t: LunarTime): AlmanacHour {
  const luckRaw = t.getTianShenLuck();
  const nine = mapNineStar(t.getNineStar());
  return {
    ganZhi: viGanZhi(t.getGanZhi()),
    chi: viTerm(t.getZhi()),
    animal: viTerm(t.getShengXiao()),
    range: `${t.getMinHm()}–${t.getMaxHm()}`,
    tianShen: viTerm(t.getTianShen()),
    daoType: viTerm(t.getTianShenType()),
    luck: toLuck(luckRaw),
    luckLabel: viTerm(luckRaw) || '—',
    yi: viList(t.getYi()),
    ji: viList(t.getJi()),
    chong: viTerm(t.getChongDesc()),
    sha: viTerm(t.getSha()),
    naYin: viTerm(t.getNaYin()),
    xun: viGanZhi(t.getXun()),
    xunKong: viTerm(t.getXunKong()),
    nineStar: `${nine.name} · ${nine.beiDou}`,
    positionXi: viTerm(t.getPositionXiDesc()),
    positionFu: viTerm(t.getPositionFuDesc()),
    positionCai: viTerm(t.getPositionCaiDesc()),
  };
}

function jqLabel(
  jq: { getName: () => string; getSolar: () => { toYmd: () => string } } | null,
): string | null {
  if (!jq) return null;
  return `${viTerm(jq.getName())} (${jq.getSolar().toYmd()})`;
}

export function getAlmanacDay(
  year: number,
  month: number,
  day: number,
): AlmanacDay {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  const luckRaw = lunar.getDayTianShenLuck();
  const luck = toLuck(luckRaw);
  const jieQiRaw = lunar.getJieQi();
  const fu = lunar.getFu();
  const shuJiu = lunar.getShuJiu();
  const foto = lunar.getFoto();
  const tao = lunar.getTao();

  const nineStarYear = mapNineStar(lunar.getYearNineStar());
  const nineStarMonth = mapNineStar(lunar.getMonthNineStar());
  const nineStarDay = mapNineStar(lunar.getDayNineStar());

  const fotoNotes: string[] = [];
  if (foto.isMonthZhai()) fotoNotes.push('Tháng trai');
  if (foto.isDayZhaiShuoWang()) fotoNotes.push('Ngày trai sóc/vọng');
  if (foto.isDayZhaiSix()) fotoNotes.push('Ngày trai lục');
  if (foto.isDayZhaiTen()) fotoNotes.push('Ngày trai thập');
  if (foto.isDayZhaiGuanYin()) fotoNotes.push('Ngày trai Quán Âm');
  if (foto.isDayYangGong()) fotoNotes.push('Ngày Dương Công');

  const taoNotes: string[] = [];
  if (tao.isDaySanHui()) taoNotes.push('Tam hội');
  if (tao.isDaySanYuan()) taoNotes.push('Tam nguyên');
  if (tao.isDayBaJie()) taoNotes.push('Bát tiết');
  if (tao.isDayWuLa()) taoNotes.push('Ngũ lạp');
  if (tao.isDayBaHui()) taoNotes.push('Bát hội');
  if (tao.isDayMingWu()) taoNotes.push('Minh ngộ');
  if (tao.isDayAnWu()) taoNotes.push('Ám ngộ');
  if (tao.isDayWu()) taoNotes.push('Ngày Ngộ');
  if (tao.isDayTianShe()) taoNotes.push('Thiên xá');

  return {
    solarYear: year,
    solarMonth: month,
    solarDay: day,
    weekLabel: WEEK_VI[solar.getWeek()] ?? '',
    xingZuo: viTerm(solar.getXingZuo()),
    julianDay: solar.getJulianDay(),

    lunarDay: lunar.getDay(),
    lunarMonth: Math.abs(lunar.getMonth()),
    lunarYear: lunar.getYear(),
    lunarLeap: lunar.getMonth() < 0,
    lunarLabel: `${lunar.getDay()}/${Math.abs(lunar.getMonth())}${
      lunar.getMonth() < 0 ? ' nhuận' : ''
    }/${lunar.getYear()} (ÂL)`,
    lunarDayChinese: `ngày ${lunar.getDay()} âm`,

    yearCanChi: viGanZhi(lunar.getYearInGanZhi()),
    yearCanChiLiChun: viGanZhi(lunar.getYearInGanZhiByLiChun()),
    yearCanChiExact: viGanZhi(lunar.getYearInGanZhiExact()),
    monthCanChi: viGanZhi(lunar.getMonthInGanZhi()),
    monthCanChiExact: viGanZhi(lunar.getMonthInGanZhiExact()),
    dayCanChi: viGanZhi(lunar.getDayInGanZhi()),
    dayCanChiExact: viGanZhi(lunar.getDayInGanZhiExact()),
    yearAnimal: viTerm(lunar.getYearShengXiao()),
    monthAnimal: viTerm(lunar.getMonthShengXiao()),
    dayAnimal: viTerm(lunar.getDayShengXiao()),
    yearNaYin: viTerm(lunar.getYearNaYin()),
    monthNaYin: viTerm(lunar.getMonthNaYin()),
    dayNaYin: viTerm(lunar.getDayNaYin()),

    baZi: lunar.getBaZi().map(viGanZhi),
    baZiWuXing: viList(lunar.getBaZiWuXing()),
    baZiNaYin: viList(lunar.getBaZiNaYin()),
    baZiShiShenGan: viList(lunar.getBaZiShiShenGan()),
    baZiShiShenZhi: viList(lunar.getBaZiShiShenZhi()),
    baZiShiShenYearZhi: viList(lunar.getBaZiShiShenYearZhi()),
    baZiShiShenMonthZhi: viList(lunar.getBaZiShiShenMonthZhi()),
    baZiShiShenDayZhi: viList(lunar.getBaZiShiShenDayZhi()),
    baZiShiShenTimeZhi: viList(lunar.getBaZiShiShenTimeZhi()),

    zhiXing: viTerm(lunar.getZhiXing()),
    tianShen: viTerm(lunar.getDayTianShen()),
    daoType: viTerm(lunar.getDayTianShenType()),
    luck,
    luckLabel: viTerm(luckRaw) || '—',

    yi: viList(lunar.getDayYi()),
    ji: viList(lunar.getDayJi()),
    jiShen: viList(lunar.getDayJiShen()),
    xiongSha: viList(lunar.getDayXiongSha()),

    chong: viTerm(lunar.getDayChongDesc()),
    chongAnimal: viTerm(lunar.getDayChongShengXiao()),
    sha: viTerm(lunar.getDaySha()),

    positionXi: viTerm(lunar.getDayPositionXiDesc()),
    positionXiBagua: viTerm(lunar.getDayPositionXi()),
    positionYangGui: viTerm(lunar.getDayPositionYangGuiDesc()),
    positionYinGui: viTerm(lunar.getDayPositionYinGuiDesc()),
    positionFu: viTerm(lunar.getDayPositionFuDesc()),
    positionCai: viTerm(lunar.getDayPositionCaiDesc()),
    positionTaiSuiYear: viTerm(lunar.getYearPositionTaiSuiDesc()),
    positionTaiSuiMonth: viTerm(lunar.getMonthPositionTaiSuiDesc()),
    positionTaiSuiDay: viTerm(lunar.getDayPositionTaiSuiDesc()),
    positionTai: viTerm(lunar.getDayPositionTai()),
    positionTaiMonth: viTerm(lunar.getMonthPositionTai()),

    xiu: viTerm(lunar.getXiu()),
    xiuLuck: viTerm(lunar.getXiuLuck()),
    xiuSong: viTerm(lunar.getXiuSong()),
    xiuAnimal: viTerm(lunar.getAnimal()),
    xiuGong: viTerm(lunar.getGong()),
    xiuShou: viTerm(lunar.getShou()),
    xiuZheng: viTerm(lunar.getZheng()),

    pengZuGan: viTerm(lunar.getPengZuGan()),
    pengZuZhi: viTerm(lunar.getPengZuZhi()),

    yueXiang: viTerm(lunar.getYueXiang()),
    liuYao: viTerm(lunar.getLiuYao()),
    wuHou: viTerm(lunar.getWuHou()),
    hou: viTerm(lunar.getHou()),
    dayLu: viTerm(lunar.getDayLu()),
    season: viTerm(lunar.getSeason()),

    dayXun: viGanZhi(lunar.getDayXun()),
    dayXunKong: viTerm(lunar.getDayXunKong()),
    yearXun: viGanZhi(lunar.getYearXun()),
    yearXunKong: viTerm(lunar.getYearXunKong()),
    monthXun: viGanZhi(lunar.getMonthXun()),
    monthXunKong: viTerm(lunar.getMonthXunKong()),

    nineStarYear,
    nineStarMonth,
    nineStarDay,
    nineStar: nineStarDay.full,

    jieQi: jieQiRaw ? viTerm(jieQiRaw) : null,
    prevJie: jqLabel(lunar.getPrevJie(true)),
    nextJie: jqLabel(lunar.getNextJie(true)),
    prevQi: jqLabel(lunar.getPrevQi(true)),
    nextQi: jqLabel(lunar.getNextQi(true)),
    prevJieQi: jqLabel(lunar.getPrevJieQi(true)),
    nextJieQi: jqLabel(lunar.getNextJieQi(true)),
    fu: fu ? `${viTerm(fu.getName())} · ngày ${fu.getIndex()}` : null,
    shuJiu: shuJiu
      ? `${viTerm(shuJiu.getName())} · ngày ${shuJiu.getIndex()}`
      : null,

    festivals: viList(lunar.getFestivals()),
    otherFestivals: viList(lunar.getOtherFestivals()),
    solarFestivals: viList(solar.getFestivals()),
    taoFestivals: tao.getFestivals().map((f) => viTerm(f.getName())),
    fotoYear: `${foto.getDay()}/${Math.abs(foto.getMonth())}/${foto.getYear()} (Phật lịch)`,
    taoYear: `${tao.getDay()}/${Math.abs(tao.getMonth())}/${tao.getYear()} (Đạo lịch)`,
    fotoNotes,
    taoNotes,

    hours: lunar.getTimes().map(mapHour),
  };
}

export function getMonthGrid(year: number, month: number): MonthCell[] {
  const days = SolarMonth.fromYm(year, month).getDays();
  const first = days[0];
  const firstWeek = first.getWeek();
  const lead = (firstWeek + 6) % 7;

  const cells: MonthCell[] = [];

  for (let i = lead; i > 0; i--) {
    cells.push(cellFromSolar(first.next(-i), false));
  }
  for (const s of days) {
    cells.push(cellFromSolar(s, true));
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1];
    cells.push(
      cellFromSolar(
        Solar.fromYmd(last.solarYear, last.solarMonth, last.solarDay).next(1),
        false,
      ),
    );
  }
  return cells;
}

function cellFromSolar(solar: Solar, inMonth: boolean): MonthCell {
  const lunar = solar.getLunar();
  const jieQiRaw = lunar.getJieQi();
  return {
    solarYear: solar.getYear(),
    solarMonth: solar.getMonth(),
    solarDay: solar.getDay(),
    lunarDay: lunar.getDay(),
    lunarMonth: Math.abs(lunar.getMonth()),
    lunarLeap: lunar.getMonth() < 0,
    inMonth,
    luck: toLuck(lunar.getDayTianShenLuck()),
    jieQi: jieQiRaw ? viTerm(jieQiRaw) : null,
    dayCanChi: viGanZhi(lunar.getDayInGanZhi()),
  };
}

export function todayParts(): { y: number; m: number; d: number } {
  const n = new Date();
  return { y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate() };
}
