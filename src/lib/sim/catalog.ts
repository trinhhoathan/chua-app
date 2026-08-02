/**
 * Kho Sim Phong Thủy — catalog: nhận diện nhà mạng, phân loại kiểu số đẹp,
 * parse cú pháp tìm kiếm 090*8888 và truy vấn danh sách sim.
 */

import { unstable_cache } from 'next/cache';
import { supabase } from '@/lib/supabase';
import type { SimElement, SimListing } from '@/types/database';

/** Cột đủ cho card kho + cá nhân hóa Bát Tự — bỏ description/star_summary nặng. */
const SIM_LIST_COLUMNS =
  'id,temple_id,phone,phone_display,network,tags,element,price_vnd,original_price_vnd,overall_score,verdict,nut,status,sale_ends_at,aspects,featured,que_number,created_at';

/* ------------------------------------------------------------------ */
/* Nhà mạng                                                            */
/* ------------------------------------------------------------------ */

export const NETWORK_LABELS: Record<string, string> = {
  viettel: 'Viettel',
  mobifone: 'Mobifone',
  vinaphone: 'Vinaphone',
  vietnamobile: 'Vietnamobile',
  gmobile: 'Gmobile',
  itel: 'iTel',
  wintel: 'Wintel',
  khac: 'Khác',
};

const NETWORK_PREFIXES: Array<[string, string[]]> = [
  [
    'viettel',
    ['086', '096', '097', '098', '032', '033', '034', '035', '036', '037', '038', '039'],
  ],
  [
    'mobifone',
    ['089', '090', '093', '070', '076', '077', '078', '079'],
  ],
  [
    'vinaphone',
    ['088', '091', '094', '081', '082', '083', '084', '085'],
  ],
  ['vietnamobile', ['092', '052', '056', '058']],
  ['gmobile', ['099', '059']],
  ['itel', ['087']],
  ['wintel', ['055']],
];

export function detectNetwork(phone: string): string {
  const prefix = phone.slice(0, 3);
  for (const [network, prefixes] of NETWORK_PREFIXES) {
    if (prefixes.includes(prefix)) return network;
  }
  return 'khac';
}

/* ------------------------------------------------------------------ */
/* Kiểu số đẹp (tags)                                                  */
/* ------------------------------------------------------------------ */

export const SIM_TAG_LABELS: Record<string, string> = {
  'luc-quy': 'Lục quý',
  'ngu-quy': 'Ngũ quý',
  'tu-quy': 'Tứ quý',
  'tam-hoa-kep': 'Tam hoa kép',
  'tam-hoa': 'Tam hoa',
  taxi: 'Taxi',
  'loc-phat': 'Lộc phát',
  'than-tai': 'Thần tài',
  'ong-dia': 'Ông địa',
  'ganh-dao': 'Gánh đảo',
  'lap-kep': 'Lặp kép',
  'so-tien': 'Số tiến',
  'nam-sinh': 'Năm sinh',
  'de-nho': 'Dễ nhớ',
};

/** Thứ tự ưu tiên hiển thị badge trên card sim. */
export const SIM_TAG_ORDER = Object.keys(SIM_TAG_LABELS);

export function detectSimTags(phone: string): string[] {
  const s = phone;
  const tail4 = s.slice(-4);
  const tags = new Set<string>();

  if (/(\d)\1{5}$/.test(s)) tags.add('luc-quy');
  else if (/(\d)\1{4}$/.test(s)) tags.add('ngu-quy');
  else if (/(\d)\1{3}$/.test(s)) tags.add('tu-quy');
  else if (/(\d)\1{2}(\d)\2{2}$/.test(s)) tags.add('tam-hoa-kep');
  else if (/(\d)\1{2}$/.test(s)) tags.add('tam-hoa');

  if (/(\d{2})\1\1$/.test(s) || /(\d{3})\1$/.test(s)) tags.add('taxi');
  if (/(68|86|6868|8686|6886|8668)$/.test(s)) tags.add('loc-phat');
  if (/(39|79|3939|7979)$/.test(s)) tags.add('than-tai');
  if (/(38|78|3838|7878)$/.test(s)) tags.add('ong-dia');
  if (/(\d)(\d)\2\1$/.test(tail4) && tail4[0] !== tail4[1]) tags.add('ganh-dao');
  if (/(\d)\1(\d)\2$/.test(tail4) && tail4[0] !== tail4[2]) tags.add('lap-kep');
  if (/(0123|1234|2345|3456|4567|5678|6789)$/.test(s)) tags.add('so-tien');

  const year = Number(tail4);
  if (year >= 1950 && year <= 2026) tags.add('nam-sinh');

  if (tags.size === 0) {
    // dễ nhớ: đuôi có ≥3 chữ số trùng nhau bất kỳ hoặc 2 cặp lặp
    const counts = new Map<string, number>();
    for (const c of s.slice(-6)) counts.set(c, (counts.get(c) ?? 0) + 1);
    if ([...counts.values()].some((n) => n >= 3)) tags.add('de-nho');
  }

  return [...tags];
}

/* ------------------------------------------------------------------ */
/* Chuẩn hóa + tìm kiếm                                                */
/* ------------------------------------------------------------------ */

/** Chuẩn hóa về 10 số 0xxxxxxxxx; null nếu không hợp lệ. */
export function normalizeSimPhone(raw: string): string | null {
  let d = (raw || '').replace(/\D/g, '');
  if (d.startsWith('84') && d.length === 11) d = '0' + d.slice(2);
  if (d.length === 9 && !d.startsWith('0')) d = '0' + d;
  if (d.length !== 10 || !d.startsWith('0')) return null;
  return d;
}

export function formatSimDisplay(phone: string): string {
  if (phone.length !== 10) return phone;
  return `${phone.slice(0, 4)}.${phone.slice(4, 7)}.${phone.slice(7)}`;
}

/**
 * Parse cú pháp tìm kiếm kiểu khosim:
 *  "6789"      → chứa 6789 (ưu tiên đuôi)
 *  "090*8888"  → đầu 090, đuôi 8888
 *  "0914*"     → đầu 0914
 *  "*6868*"    → chứa 6868
 *  "*888"      → đuôi 888
 */
export function parseSimSearch(q: string): string | null {
  const cleaned = (q || '').replace(/[^\d*]/g, '');
  if (!cleaned.replace(/\*/g, '')) return null;
  if (!cleaned.includes('*')) return `%${cleaned}%`;
  let pattern = cleaned.replace(/\*+/g, '%');
  if (!pattern.startsWith('%') && !pattern.startsWith('0')) {
    pattern = `%${pattern}`;
  }
  return pattern;
}

/* ------------------------------------------------------------------ */
/* Mục đích dùng sim (theo điểm phương diện luận số)                    */
/* ------------------------------------------------------------------ */

export type SimPurposeId =
  | 'tai_loc'
  | 'kinh_doanh'
  | 'cong_danh'
  | 'tinh_cam'
  | 'hoc_hanh'
  | 'suc_khoe'
  | 'quy_nhan'
  | 'giai_han'
  | 'bao_an'
  | 'xuat_hanh'
  | 'can_bang'
  | 'tinh_duyen'
  | 'gia_dao'
  | 'con_cai'
  | 'que_thinh_vuong'
  | 'que_thang_tien'
  | 'que_duyen'
  | 'que_binh_an';

export type SimPurposeGroupId = 'tai_van' | 'binh_an' | 'gia_dao' | 'kinh_dich';

export interface SimPurpose {
  id: SimPurposeId;
  label: string;
  group: SimPurposeGroupId;
  /** Khóa trong sim.aspects (bỏ trống với mục đích lọc theo quẻ) */
  aspect?: string;
  /** Ngưỡng điểm tối thiểu (0–100) */
  minScore?: number;
  /** Điều kiện phụ (vd. học hành cần thêm quý nhân) */
  alsoAspect?: string;
  alsoMinScore?: number;
  /** Lọc theo cụm quẻ Kinh Dịch (số quẻ Văn Vương 1–64) */
  queNumbers?: number[];
  blurb: string;
}

export const SIM_PURPOSE_GROUPS: Array<{
  id: SimPurposeGroupId;
  label: string;
}> = [
  { id: 'tai_van', label: 'Tài vận · Sự nghiệp · Học hành' },
  { id: 'binh_an', label: 'Bình An · Cải Vận · Giải Hạn' },
  { id: 'gia_dao', label: 'Gia Đạo · Tình Duyên' },
  { id: 'kinh_dich', label: 'Theo Quẻ Kinh Dịch (Mai Hoa Dịch Số)' },
];

/**
 * Ngưỡng minScore được hiệu chỉnh theo phân bố điểm thật của kho
 * (phân vị ~p75–p85) để mỗi mục đích chỉ chọn ~15–25% sim — giữ đúng
 * tinh thần "sim tuyển chọn", không phải sim nào cũng đạt.
 */
export const SIM_PURPOSES: SimPurpose[] = [
  // —— Nhóm 1: Tài vận · Sự nghiệp · Học hành ——
  {
    id: 'tai_loc',
    label: 'Tài lộc',
    group: 'tai_van',
    aspect: 'tai_loc',
    minScore: 70,
    blurb: 'Ưu tiên dãy số mạnh về tài lộc — Thiên Y, tiền bạc, làm ăn.',
  },
  {
    id: 'kinh_doanh',
    label: 'Kinh doanh · buôn bán',
    group: 'tai_van',
    aspect: 'tai_loc',
    minScore: 72,
    alsoAspect: 'su_nghiep',
    alsoMinScore: 68,
    blurb:
      'Sim cho người làm chủ: tài lộc mạnh đi kèm sự nghiệp vững — vừa hút khách kiếm tiền, vừa đủ bản lĩnh điều hành giữ nghiệp.',
  },
  {
    id: 'cong_danh',
    label: 'Công danh',
    group: 'tai_van',
    aspect: 'su_nghiep',
    minScore: 72,
    blurb: 'Ưu tiên sự nghiệp – công danh – thăng tiến.',
  },
  {
    id: 'hoc_hanh',
    label: 'Học hành',
    group: 'tai_van',
    aspect: 'su_nghiep',
    minScore: 65,
    alsoAspect: 'quy_nhan',
    alsoMinScore: 68,
    blurb: 'Ưu tiên học vấn, thi cử — sự nghiệp vững và quý nhân phù trợ.',
  },
  {
    id: 'quy_nhan',
    label: 'Quý nhân · quan hệ',
    group: 'tai_van',
    aspect: 'quy_nhan',
    minScore: 70,
    blurb: 'Ưu tiên quý nhân phù trợ, quan hệ rộng, được nâng đỡ.',
  },
  // —— Nhóm 2: Bình An, Cải Vận & Giải Hạn ——
  {
    id: 'giai_han',
    label: 'Giải hạn · Trừ tà · Vượng khí',
    group: 'binh_an',
    aspect: 'giai_han',
    minScore: 95,
    blurb:
      'Chỉ nhận dãy đạt 95/100 trở lên: cát át hung tuyệt đối, nhiều Sinh Khí/Thiên Y và tổ hợp chế hóa — hóa giải xung khắc, tăng vượng khí.',
  },
  {
    id: 'bao_an',
    label: 'Bảo an sức khỏe',
    group: 'binh_an',
    aspect: 'bao_an',
    minScore: 80,
    blurb:
      'Điểm sức khỏe cao, Phục Vị/Diên Niên ổn định, âm dương cân — phù hợp người lớn tuổi hoặc cầu sức khỏe.',
  },
  {
    id: 'xuat_hanh',
    label: 'Bình an xuất hành',
    group: 'binh_an',
    aspect: 'bao_an',
    minScore: 78,
    alsoAspect: 'giai_han',
    alsoMinScore: 90,
    blurb:
      'Cho tài xế, người hay đi xa, đi công tác: bảo an cao kèm khí giải hạn mạnh — thượng lộ bình an, chuyến đi thuận lợi.',
  },
  {
    id: 'can_bang',
    label: 'Cân bằng âm dương',
    group: 'binh_an',
    aspect: 'can_bang',
    minScore: 85,
    blurb:
      'Điều hòa âm dương và trường khí — giúp tâm trí bình tĩnh, minh mẫn khi quyết định.',
  },
  {
    id: 'suc_khoe',
    label: 'Sức khỏe (cơ bản)',
    group: 'binh_an',
    aspect: 'suc_khoe',
    minScore: 66,
    blurb: 'Lọc theo phương diện sức khỏe thuần của Âm Dương Ngũ Hành.',
  },
  // —— Nhóm 3: Gia Đạo & Tình Duyên ——
  {
    id: 'tinh_duyen',
    label: 'Kích tình duyên',
    group: 'gia_dao',
    aspect: 'tinh_duyen',
    minScore: 75,
    blurb:
      'Thiên Y (chính đào hoa) + Sinh Khí mạnh — hỗ trợ người độc thân bén duyên lành, hợp mệnh.',
  },
  {
    id: 'gia_dao',
    label: 'Gia đạo hòa thuận',
    group: 'gia_dao',
    aspect: 'gia_dao',
    minScore: 82,
    blurb:
      'Tình cảm – quý nhân – Diên Niên/Phục Vị vững, ít Họa Hại — hóa xung đột, gắn kết gia đình.',
  },
  {
    id: 'con_cai',
    label: 'Vượng con cái (cầu tự)',
    group: 'gia_dao',
    aspect: 'con_cai',
    minScore: 72,
    blurb:
      'Sinh Khí vượng (sinh khí / sinh nở), tránh Tuyệt Mệnh — mang may mắn đường con cái.',
  },
  {
    id: 'tinh_cam',
    label: 'Tình cảm (cơ bản)',
    group: 'gia_dao',
    aspect: 'tinh_cam',
    minScore: 68,
    blurb: 'Lọc theo phương diện tình cảm thuần của Âm Dương Ngũ Hành.',
  },
  // —— Nhóm 4: Theo Quẻ Kinh Dịch (Mai Hoa Dịch Số) ——
  {
    id: 'que_thinh_vuong',
    label: 'Quẻ thịnh vượng · tài lộc',
    group: 'kinh_dich',
    queNumbers: [11, 14, 26, 42, 45, 50, 55],
    blurb:
      'Cụm quẻ đại cát về của cải: Địa Thiên Thái (hanh thông), Hỏa Thiên Đại Hữu (sở hữu lớn), Sơn Thiên Đại Súc (tích chứa), Phong Lôi Ích (tăng ích), Trạch Địa Tụy (tụ hội), Hỏa Phong Đỉnh (phú quý), Lôi Hỏa Phong (phong túc).',
  },
  {
    id: 'que_thang_tien',
    label: 'Quẻ thăng tiến · công danh',
    group: 'kinh_dich',
    queNumbers: [1, 19, 34, 35, 46, 53],
    blurb:
      'Cụm quẻ đường quan lộ: Thuần Càn (khí lãnh đạo), Địa Trạch Lâm (vận đang lên), Lôi Thiên Đại Tráng (khí thế), Hỏa Địa Tấn (tiến như mặt trời mọc), Địa Phong Thăng (thăng từng bậc), Phong Sơn Tiệm (tiến vững không lùi).',
  },
  {
    id: 'que_duyen',
    label: 'Quẻ duyên lành · gia đạo',
    group: 'kinh_dich',
    queNumbers: [8, 13, 31, 32, 37, 61],
    blurb:
      'Cụm quẻ nhân duyên – tổ ấm: Thủy Địa Tỷ (người theo về), Thiên Hỏa Đồng Nhân (đồng tâm), Trạch Sơn Hàm (cảm ứng lứa đôi), Lôi Phong Hằng (bền lâu), Phong Hỏa Gia Nhân (tề gia), Phong Trạch Trung Phù (thành tín).',
  },
  {
    id: 'que_binh_an',
    label: 'Quẻ bình an · hóa giải',
    group: 'kinh_dich',
    queNumbers: [15, 24, 40, 63],
    blurb:
      'Cụm quẻ an lành: Địa Sơn Khiêm (quẻ hiếm hoi cả 6 hào đều tốt), Địa Lôi Phục (vận hồi sinh), Lôi Thủy Giải (cởi bỏ hoạn nạn), Thủy Hỏa Ký Tế (viên mãn đâu vào đấy).',
  },
];

export function purposeById(id?: string): SimPurpose | undefined {
  return SIM_PURPOSES.find((p) => p.id === id);
}

export function purposesByGroup(group: SimPurposeGroupId): SimPurpose[] {
  return SIM_PURPOSES.filter((p) => p.group === group);
}

/* ------------------------------------------------------------------ */
/* Truy vấn kho sim (public, anon client)                              */
/* ------------------------------------------------------------------ */

export interface SimQueryFilters {
  q?: string;
  network?: string;
  tag?: string;
  element?: SimElement;
  /** Lọc theo nhiều hành (dùng cho lọc ngành nghề) */
  elements?: SimElement[];
  verdict?: string;
  priceMin?: number;
  priceMax?: number;
  minScore?: number;
  /** Đuôi sim là năm sinh, ví dụ "1990" → phone LIKE %1990 */
  tailYear?: string;
  /** Tổng nút (0-9; 10 nút truyền vào 0) */
  nut?: number;
  /** Quẻ Kinh Dịch chủ (1–64, Mai Hoa Dịch Số) */
  que?: number;
  /** Loại sim có chứa số 4 hoặc 7 */
  avoid47?: boolean;
  /** Lọc theo mục đích: tài lộc / công danh / tình cảm / học hành */
  purpose?: SimPurposeId;
  sort?: 'score' | 'price_asc' | 'price_desc' | 'newest';
  page?: number;
  pageSize?: number;
  /** Chỉ lấy sim đang bán (mặc định true) */
  onlyAvailable?: boolean;
}

export interface SimQueryResult {
  sims: SimListing[];
  total: number;
  page: number;
  pageSize: number;
}

/** Browse mặc định (không lọc) — dùng exact count đã cache, không estimated. */
function isBroadBrowse(filters: SimQueryFilters): boolean {
  return (
    !filters.q &&
    !filters.network &&
    !filters.tag &&
    !filters.element &&
    !(filters.elements && filters.elements.length > 0) &&
    !filters.verdict &&
    filters.priceMin == null &&
    filters.priceMax == null &&
    filters.minScore == null &&
    !filters.tailYear &&
    filters.nut == null &&
    filters.que == null &&
    !filters.avoid47 &&
    !filters.purpose &&
    filters.onlyAvailable !== false &&
    (!filters.sort || filters.sort === 'score')
  );
}

/** Exact COUNT available — cache 5 phút (hiển thị "Tìm thấy N sim" chuẩn khi không lọc). */
export async function getAvailableSimCount(templeId: string): Promise<number> {
  return unstable_cache(
    async () => {
      const { count, error } = await supabase
        .from('sim_listings')
        .select('id', { count: 'exact', head: true })
        .eq('temple_id', templeId)
        .eq('status', 'available');
      if (error) return 0;
      return count ?? 0;
    },
    ['sim-available-count', templeId],
    { revalidate: 300, tags: ['sims', `sims-${templeId}`] },
  )();
}

async function querySimsUncached(
  templeId: string,
  filters: SimQueryFilters,
): Promise<SimQueryResult> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(60, Math.max(6, filters.pageSize ?? 24));
  const broad = isBroadBrowse(filters);

  // Browse mặc định: không COUNT trong query list (lấy exact song song từ cache).
  // Có lọc: estimated — tránh COUNT(*) exact đắt trên tập lớn.
  let query = supabase
    .from('sim_listings')
    .select(SIM_LIST_COLUMNS, broad ? undefined : { count: 'estimated' })
    .eq('temple_id', templeId);

  if (filters.onlyAvailable !== false) {
    query = query.eq('status', 'available');
  } else {
    query = query.neq('status', 'hidden');
  }

  const pattern = filters.q ? parseSimSearch(filters.q) : null;
  if (pattern) query = query.like('phone', pattern);
  if (filters.network) query = query.eq('network', filters.network);
  if (filters.tag) query = query.contains('tags', [filters.tag]);
  if (filters.element) query = query.eq('element', filters.element);
  if (filters.elements && filters.elements.length > 0) {
    query = query.in('element', filters.elements);
  }
  if (filters.verdict) query = query.eq('verdict', filters.verdict);
  if (filters.priceMin != null) query = query.gte('price_vnd', filters.priceMin);
  if (filters.priceMax != null) query = query.lte('price_vnd', filters.priceMax);
  if (filters.minScore != null) query = query.gte('overall_score', filters.minScore);
  if (filters.tailYear && /^\d{4}$/.test(filters.tailYear)) {
    query = query.like('phone', `%${filters.tailYear}`);
  }
  if (filters.nut != null && filters.nut >= 0 && filters.nut <= 9) {
    query = query.eq('nut', filters.nut);
  }
  if (filters.que != null && filters.que >= 1 && filters.que <= 64) {
    query = query.eq('que_number', filters.que);
  }
  if (filters.avoid47) {
    query = query.not('phone', 'like', '%4%').not('phone', 'like', '%7%');
  }

  const purpose = filters.purpose ? purposeById(filters.purpose) : undefined;
  if (purpose) {
    if (purpose.queNumbers && purpose.queNumbers.length > 0) {
      // Mục đích theo cụm quẻ Kinh Dịch
      query = query.in('que_number', purpose.queNumbers);
    }
    if (purpose.aspect && purpose.minScore != null) {
      // aspects lưu jsonb số — dùng -> (không phải ->>) để so sánh numeric
      query = query.filter(
        `aspects->${purpose.aspect}`,
        'gte',
        purpose.minScore,
      );
    }
    if (purpose.alsoAspect && purpose.alsoMinScore != null) {
      query = query.filter(
        `aspects->${purpose.alsoAspect}`,
        'gte',
        purpose.alsoMinScore,
      );
    }
  }

  switch (filters.sort) {
    case 'price_asc':
      query = query.order('price_vnd', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price_vnd', { ascending: false });
      break;
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    default:
      if (purpose?.aspect) {
        // Ưu tiên điểm đúng mục đích đang lọc
        query = query
          .order(`aspects->${purpose.aspect}`, { ascending: false })
          .order('overall_score', { ascending: false });
      } else if (purpose) {
        // Mục đích theo quẻ — xếp theo điểm tổng
        query = query
          .order('overall_score', { ascending: false })
          .order('featured', { ascending: false });
      } else {
        query = query
          .order('featured', { ascending: false })
          .order('overall_score', { ascending: false });
      }
  }

  const from = (page - 1) * pageSize;
  const listPromise = query.range(from, from + pageSize - 1);
  const exactPromise = broad ? getAvailableSimCount(templeId) : Promise.resolve(null);

  const [{ data, count, error }, exactTotal] = await Promise.all([
    listPromise,
    exactPromise,
  ]);
  if (error) {
    return { sims: [], total: 0, page, pageSize };
  }
  return {
    sims: (data ?? []) as SimListing[],
    total: exactTotal ?? count ?? 0,
    page,
    pageSize,
  };
}

/** Cache kết quả kho 90s — view mặc định / filter phổ biến không đập DB mỗi click. */
export async function querySims(
  templeId: string,
  filters: SimQueryFilters = {},
): Promise<SimQueryResult> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(60, Math.max(6, filters.pageSize ?? 24));
  const normalized: SimQueryFilters = {
    ...filters,
    page,
    pageSize,
    elements: filters.elements ? [...filters.elements].sort() : undefined,
  };
  const cacheKey = JSON.stringify(normalized);

  return unstable_cache(
    () => querySimsUncached(templeId, normalized),
    ['query-sims', templeId, cacheKey],
    { revalidate: 90, tags: ['sims', `sims-${templeId}`] },
  )();
}

/** Sim nổi bật cho trang chủ / khối đề xuất. */
export async function getFeaturedSims(
  templeId: string,
  limit = 8,
): Promise<SimListing[]> {
  return unstable_cache(
    async () => {
      const { data } = await supabase
        .from('sim_listings')
        .select(SIM_LIST_COLUMNS)
        .eq('temple_id', templeId)
        .eq('status', 'available')
        .order('featured', { ascending: false })
        .order('overall_score', { ascending: false })
        .limit(limit);
      return (data ?? []) as SimListing[];
    },
    ['featured-sims', templeId, String(limit)],
    { revalidate: 120, tags: ['sims', `sims-${templeId}`] },
  )();
}

export async function getSimByPhone(
  templeId: string,
  phone: string,
): Promise<SimListing | null> {
  const normalized = normalizeSimPhone(phone);
  if (!normalized) return null;
  const { data } = await supabase
    .from('sim_listings')
    .select('*')
    .eq('temple_id', templeId)
    .eq('phone', normalized)
    .neq('status', 'hidden')
    .maybeSingle();
  return (data as SimListing | null) ?? null;
}

/** Ghi nhận một lượt xem trang chi tiết sim (bỏ qua lỗi). */
export async function recordSimView(
  templeId: string,
  phone: string,
): Promise<void> {
  try {
    await supabase.rpc('increment_sim_view', {
      p_temple_id: templeId,
      p_phone: phone,
    });
  } catch {
    // đếm lượt xem là phụ trợ — không chặn render
  }
}

/** Sim tương tự: cùng tầm giá hoặc cùng hành, điểm cao, loại trừ chính nó. */
export async function getSimilarSims(
  sim: Pick<SimListing, 'id' | 'temple_id' | 'price_vnd' | 'element'>,
  limit = 4,
): Promise<SimListing[]> {
  return unstable_cache(
    async () => {
      const { data } = await supabase
        .from('sim_listings')
        .select(SIM_LIST_COLUMNS)
        .eq('temple_id', sim.temple_id)
        .eq('status', 'available')
        .neq('id', sim.id)
        .gte('price_vnd', Math.floor(sim.price_vnd * 0.4))
        .lte('price_vnd', Math.ceil(sim.price_vnd * 2.5))
        .order('overall_score', { ascending: false })
        .limit(limit * 3);
      const rows = ((data ?? []) as SimListing[]).sort((a, b) => {
        const aSame = a.element === sim.element ? 1 : 0;
        const bSame = b.element === sim.element ? 1 : 0;
        if (aSame !== bSame) return bSame - aSame;
        return b.overall_score - a.overall_score;
      });
      return rows.slice(0, limit);
    },
    [
      'similar-sims',
      sim.temple_id,
      sim.id,
      String(sim.price_vnd),
      sim.element,
      String(limit),
    ],
    { revalidate: 120, tags: ['sims', `sims-${sim.temple_id}`] },
  )();
}

/* ------------------------------------------------------------------ */
/* Khoảng giá chuẩn (theo các trang sim phổ biến)                      */
/* ------------------------------------------------------------------ */

export const PRICE_RANGES: Array<{
  id: string;
  label: string;
  min?: number;
  max?: number;
}> = [
  { id: 'duoi-500k', label: 'Dưới 500 nghìn', max: 500_000 },
  { id: '500k-1tr', label: '500k – 1 triệu', min: 500_000, max: 1_000_000 },
  { id: '1-3tr', label: '1 – 3 triệu', min: 1_000_000, max: 3_000_000 },
  { id: '3-5tr', label: '3 – 5 triệu', min: 3_000_000, max: 5_000_000 },
  { id: '5-10tr', label: '5 – 10 triệu', min: 5_000_000, max: 10_000_000 },
  { id: '10-50tr', label: '10 – 50 triệu', min: 10_000_000, max: 50_000_000 },
  { id: 'tren-50tr', label: 'Trên 50 triệu', min: 50_000_000 },
];

export function priceRangeById(id?: string) {
  return PRICE_RANGES.find((r) => r.id === id);
}
