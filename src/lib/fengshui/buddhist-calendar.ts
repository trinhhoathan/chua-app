/**
 * Ngày vía / đại lễ Phật giáo thường niên (âm lịch).
 * Danh mục tham khảo phổ biến tại chùa Việt — có thể mở rộng theo từng tenant.
 */

export interface BuddhistObservance {
  lunarMonth: number;
  lunarDay: number;
  title: string;
  note?: string;
}

export const BUDDHIST_OBSERVANCES: BuddhistObservance[] = [
  { lunarMonth: 1, lunarDay: 1, title: 'Tết Nguyên đán', note: 'Xuân tiết · lễ chùa' },
  { lunarMonth: 1, lunarDay: 15, title: 'Rằm tháng Giêng · Vía Di Lặc' },
  { lunarMonth: 2, lunarDay: 8, title: 'Vía Đức Phật Thích Ca xuất gia' },
  { lunarMonth: 2, lunarDay: 15, title: 'Vía Đức Phật Thích Ca nhập Niết-bàn' },
  { lunarMonth: 2, lunarDay: 19, title: 'Vía Đức Quán Thế Âm Bồ-tát' },
  { lunarMonth: 3, lunarDay: 16, title: 'Vía Đức Chuẩn Đề Bồ-tát' },
  { lunarMonth: 4, lunarDay: 8, title: 'Đại lễ Phật Đản', note: 'Vía Đức Phật Thích Ca đản sinh' },
  { lunarMonth: 4, lunarDay: 15, title: 'Vía Đức Phật Di Đà' },
  { lunarMonth: 6, lunarDay: 19, title: 'Vía Đức Quán Thế Âm thành đạo' },
  { lunarMonth: 7, lunarDay: 15, title: 'Vu Lan · Xá tội vong nhân', note: 'Rằm tháng Bảy' },
  { lunarMonth: 7, lunarDay: 30, title: 'Vía Địa Tạng Vương Bồ-tát' },
  { lunarMonth: 9, lunarDay: 19, title: 'Vía Đức Quán Thế Âm xuất gia' },
  { lunarMonth: 9, lunarDay: 30, title: 'Vía Đức Dược Sư' },
  { lunarMonth: 11, lunarDay: 17, title: 'Vía Đức A Di Đà Phật' },
  { lunarMonth: 12, lunarDay: 8, title: 'Vía Đức Phật Thích Ca thành đạo' },
  { lunarMonth: 12, lunarDay: 23, title: 'Ông Táo về trời', note: 'Dân gian · nhiều chùa cúng' },
  { lunarMonth: 12, lunarDay: 29, title: 'Tất niên', note: 'Hoặc 30 tùy năm' },
];

export function observancesInLunarYear(
  list: BuddhistObservance[] = BUDDHIST_OBSERVANCES,
): BuddhistObservance[] {
  return [...list].sort((a, b) =>
    a.lunarMonth !== b.lunarMonth
      ? a.lunarMonth - b.lunarMonth
      : a.lunarDay - b.lunarDay,
  );
}
