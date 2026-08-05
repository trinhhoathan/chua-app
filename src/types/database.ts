export interface TimelineEntry {
  year: string;
  title: string;
  body: string;
}

export interface FeatureEntry {
  title: string;
  body: string;
}

export interface GalleryImage {
  url: string;
  alt?: string;
}

export interface ExtraSection {
  title: string;
  body: string;
  image_url?: string;
}

export interface TempleVideo {
  url: string;
  title: string;
  description?: string;
}

export interface TempleReview {
  author: string;
  rating?: number;
  text: string;
  relative_time?: string;
}

export interface TempleContactLinks {
  youtube: string | null;
  tiktok: string | null;
  facebook: string | null;
  messenger: string | null;
  zalo: string | null;
  zalo_community: string | null;
  instagram: string | null;
  threads: string | null;
  x: string | null;
  phone: string | null;
}

export interface Temple {
  id: string;
  domain: string;
  name: string;
  temple_alt_name: string | null;
  slogan: string | null;
  tagline: string | null;
  primary_color: string | null;
  logo_url: string | null;
  hero_image_url: string | null;
  qr_donate: string | null;
  address: string | null;
  maps_url: string | null;
  maps_embed_url: string | null;
  google_rating: number | null;
  google_review_count: number | null;
  reviews: TempleReview[];
  history_summary: string | null;
  abbott_name: string | null;
  abbott_title: string | null;
  abbott_bio: string | null;
  abbott_image_url: string | null;
  /** Số điện thoại trụ trì / hotline liên hệ. */
  hotline: string | null;
  /** Các kênh liên hệ hiển thị trên thanh công cụ phải. */
  contact_links: TempleContactLinks;
  gallery: GalleryImage[];
  extra_sections: ExtraSection[];
  timeline: TimelineEntry[];
  features: FeatureEntry[];
  videos: TempleVideo[];
  bank_name: string | null;
  bank_account_number: string | null;
  bank_account_holder: string | null;
  /** Mã BIN NAPAS của ngân hàng (sinh VietQR về TK riêng của chùa/tenant). */
  bank_bin: string | null;
  /** Mã ngắn định danh chùa trên nội dung CK, ví dụ CV, BH. */
  payment_code: string | null;
  /** Bật kho sim công khai (bán từ kho trung tâm LGPA). */
  sim_store_enabled: boolean;
  /** % hoa hồng đại lý trên đơn sim phát sinh từ domain này. */
  sim_agent_commission_pct: number;
  water_price_vnd: number;
  water_profit_share_pct: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type WaterOrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'shipping'
  | 'delivered'
  | 'cancelled';

export interface WaterOrder {
  id: string;
  order_code: string;
  temple_id: string;
  customer_name: string;
  customer_phone: string;
  /** Địa chỉ Phật tử — thu thập sau TT, không dùng giao hàng. */
  customer_address: string | null;
  /** Phường / xã / khu vực — thu thập sau TT. */
  customer_ward: string | null;
  note: string | null;
  quantity: number;
  unit_price: number;
  total_amount: number;
  temple_share_amount: number;
  platform_share_amount: number;
  profit_share_pct: number;
  status: WaterOrderStatus;
  payment_ref: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SettlementEntry {
  id: string;
  temple_id: string;
  order_id: string | null;
  period_month: string;
  entry_type: 'water_profit' | 'manual_adjust' | 'payout';
  amount: number;
  note: string | null;
  created_at: string;
}

export type DevoteeSource = 'admin' | 'web' | 'event' | 'import';
export type DevoteeChannel = 'zalo' | 'sms' | 'phone' | 'email';

export interface Devotee {
  id: string;
  temple_id: string;
  full_name: string;
  dharma_name: string | null;
  birth_year: number | null;
  /** YYYY-MM-DD */
  birth_date: string | null;
  /** HH:mm:ss */
  birth_time: string | null;
  phone: string | null;
  address: string | null;
  note: string | null;
  quy_y_date: string | null;
  source: DevoteeSource;
  consent_contact: boolean;
  preferred_channel: DevoteeChannel | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export type TempleEventType =
  | 'dang_sao'
  | 'cau_sieu'
  | 'vu_lan'
  | 'gio_to'
  | 'phat_dan'
  | 'khoa_tu'
  | 'via'
  | 'khanh_thanh'
  | 'tu_thien'
  | 'le_hoi'
  | 'khac';

export interface TempleEvent {
  id: string;
  temple_id: string;
  title: string;
  summary: string | null;
  image_url: string | null;
  event_type: TempleEventType;
  starts_at: string;
  ends_at: string;
  location: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const TEMPLE_EVENT_TYPE_LABELS: Record<TempleEventType, string> = {
  dang_sao: 'Dâng sao giải hạn',
  cau_sieu: 'Lễ cầu siêu',
  vu_lan: 'Lễ Vu Lan',
  gio_to: 'Lễ giỗ Tổ',
  phat_dan: 'Đại lễ Phật Đản',
  khoa_tu: 'Khóa tu',
  via: 'Ngày vía',
  khanh_thanh: 'Khánh thành · An vị',
  tu_thien: 'Từ thiện · Cứu trợ',
  le_hoi: 'Lễ hội chùa',
  khac: 'Hoạt động khác',
};

export type PrayerRequestType = 'cau_an' | 'cau_sieu';
export type PrayerRequestStatus =
  | 'pending'
  | 'approved'
  | 'printed'
  | 'completed'
  | 'cancelled';

export interface PrayerRequest {
  id: string;
  temple_id: string;
  request_type: PrayerRequestType;
  requester_name: string;
  requester_phone: string | null;
  devotee_names: string;
  birth_years: string | null;
  address: string | null;
  ceremony_date: string | null;
  note: string | null;
  status: PrayerRequestStatus;
  created_at: string;
  updated_at: string;
}

export type InventoryCategory =
  | 'water'
  | 'incense'
  | 'flower'
  | 'book'
  | 'other';

export interface InventoryItem {
  id: string;
  temple_id: string;
  sku: string | null;
  name: string;
  category: InventoryCategory;
  unit: string;
  quantity_on_hand: number;
  reorder_level: number;
  unit_cost: number | null;
  note: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryMovement {
  id: string;
  item_id: string;
  temple_id: string;
  movement_type: 'in' | 'out' | 'adjust';
  quantity: number;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

export interface NotificationLog {
  id: string;
  temple_id: string;
  channel: 'zalo' | 'sms' | 'email' | 'log';
  recipient: string;
  template_key: string;
  payload: Record<string, unknown>;
  status: 'queued' | 'sent' | 'failed' | 'skipped';
  error_message: string | null;
  related_order_id: string | null;
  campaign_id: string | null;
  created_at: string;
}

export type BroadcastChannel = 'auto' | 'zalo' | 'sms' | 'email' | 'log';
export type BroadcastStatus =
  | 'draft'
  | 'queued'
  | 'sending'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface BroadcastCampaign {
  id: string;
  temple_id: string;
  title: string;
  body: string;
  channel: BroadcastChannel;
  event_id: string | null;
  status: BroadcastStatus;
  audience_filter: {
    consent_only?: boolean;
    source?: string | null;
  };
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  skipped_count: number;
  created_by: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Hồi hướng / bảng vàng gõ mõ */
export interface GoMoDedicationRow {
  id: string;
  temple_id: string;
  devotee_name: string;
  wish: string | null;
  session_count: number;
  day_count: number;
  created_at: string;
}

/** Điểm gõ mõ theo ngày (thiết bị ẩn danh) */
export interface GoMoDailyScoreRow {
  id: string;
  temple_id: string;
  client_key: string;
  display_name: string | null;
  day: string;
  strike_count: number;
  updated_at: string;
}

export type ChantingRecurrence = 'daily' | 'weekly' | 'once';
export type ChantingDisplayScope = 'both' | 'home' | 'go_mo' | 'hidden';

/** Lịch tụng kinh livestream YouTube */
export interface ChantingSchedule {
  id: string;
  temple_id: string;
  title: string;
  description: string | null;
  youtube_channel_id: string | null;
  youtube_channel_url: string | null;
  recurrence: ChantingRecurrence;
  /** 0=CN … 6=T7 (theo Date.getDay) */
  days_of_week: number[];
  /** YYYY-MM-DD — bắt buộc khi recurrence = once */
  start_date: string | null;
  /** HH:mm:ss */
  start_time: string;
  duration_minutes: number;
  display_scope: ChantingDisplayScope;
  is_live: boolean;
  live_video_url: string | null;
  live_started_at: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const CHANTING_RECURRENCE_LABELS: Record<ChantingRecurrence, string> = {
  daily: 'Hằng ngày',
  weekly: 'Theo thứ trong tuần',
  once: 'Một lần',
};

export const CHANTING_SCOPE_LABELS: Record<ChantingDisplayScope, string> = {
  both: 'Trang chủ + Gõ mõ',
  home: 'Chỉ trang chủ',
  go_mo: 'Chỉ trang gõ mõ',
  hidden: 'Ẩn (không công bố)',
};

export const WEEKDAY_LABELS: Record<number, string> = {
  0: 'CN',
  1: 'T2',
  2: 'T3',
  3: 'T4',
  4: 'T5',
  5: 'T6',
  6: 'T7',
};

/** Vai trò thành viên hộ viết sớ */
export type SoMemberRole = 'chu_ho' | 'chinh_tien' | 'gia_quyen';
export type SoGender = 'nam' | 'nu';

export const SO_MEMBER_ROLE_LABELS: Record<SoMemberRole, string> = {
  chu_ho: 'Chủ hộ',
  chinh_tien: 'Chính tiến',
  gia_quyen: 'Gia quyến',
};

export const SO_GENDER_LABELS: Record<SoGender, string> = {
  nam: 'Nam',
  nu: 'Nữ',
};

/** Hộ gia đình viết sớ */
export interface SoHousehold {
  id: string;
  temple_id: string;
  chu_ho: string;
  phone: string | null;
  dia_chi_tinh: string | null;
  dia_chi_huyen: string | null;
  dia_chi_xa: string | null;
  dia_chi_chi_tiet: string | null;
  /** Địa chỉ đã dịch Hán/Nôm (in sớ) */
  dia_chi_nho: string | null;
  noi_cung: string | null;
  nam_cung: number | null;
  thang_cung: number | null;
  ngay_cung: number | null;
  gio_cung: string | null;
  ngach_so_rieng: string | null;
  ghi_chu: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Thành viên / tín chủ trong hộ */
export interface SoHouseholdMember {
  id: string;
  household_id: string;
  temple_id: string;
  print_selected: boolean;
  is_chu_ho: boolean;
  xung_ho: string | null;
  ho_ten: string;
  ho_ten_nho: string | null;
  gioi_tinh: SoGender | null;
  nam_sinh: number | null;
  ngay_sinh: number | null;
  thang_sinh: number | null;
  vai_tro: SoMemberRole;
  phap_danh: string | null;
  phap_danh_nho: string | null;
  ngach_so_rieng: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/* ------------------------------------------------------------------ */
/* Kho Sim Phong Thủy (Lý Gia Phúc An)                                  */
/* ------------------------------------------------------------------ */

export type SimStatus = 'available' | 'reserved' | 'sold' | 'hidden';
export type SimVerdict = 'tot' | 'kha' | 'trung_binh' | 'yeu';
export type SimElement = 'kim' | 'moc' | 'thuy' | 'hoa' | 'tho';

/** Nhà cung cấp / kho sim nguồn (hoa hồng khi bán) */
export interface SimSource {
  id: string;
  temple_id: string;
  name: string;
  contact_name: string | null;
  contact_phone: string | null;
  contact_note: string | null;
  /** % hoa hồng khi bán thành công */
  commission_percent: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SimListing {
  id: string;
  temple_id: string;
  /** 10 chữ số chuẩn hóa 0xxxxxxxxx */
  phone: string;
  phone_display: string;
  network: string;
  price_vnd: number;
  original_price_vnd: number | null;
  /** Thời điểm kết thúc flash sale (đếm ngược); null = không có sale */
  sale_ends_at: string | null;
  status: SimStatus;
  featured: boolean;
  tags: string[];
  overall_score: number;
  du_nien_score: number;
  verdict: SimVerdict;
  nut: number;
  element: SimElement;
  so_ly_81: number;
  /** { tai_loc, su_nghiep, tinh_cam, suc_khoe, quy_nhan } 0-100 */
  aspects: Record<string, number>;
  /** { catPairs, hungPairs, starCounts } */
  star_summary: Record<string, unknown>;
  careers: string[];
  /** Quẻ Kinh Dịch chủ 1–64 theo Mai Hoa Dịch Số (null với dữ liệu cũ chưa backfill) */
  que_number: number | null;
  description: string | null;
  /** Lượt xem trang chi tiết */
  view_count: number;
  /** Nguồn / kho sim (nullable) */
  source_id: string | null;
  created_at: string;
  updated_at: string;
}

export type SimOrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'delivering'
  | 'completed'
  | 'cancelled';

export interface SimOrder {
  id: string;
  order_code: string;
  temple_id: string;
  sim_id: string | null;
  phone: string;
  phone_display: string;
  price_vnd: number;
  customer_name: string;
  customer_phone: string;
  note: string | null;
  birth_date: string | null;
  birth_time: string | null;
  gender: 'nam' | 'nu' | null;
  status: SimOrderStatus;
  payment_ref: string | null;
  paid_at: string | null;
  /** Snapshot nguồn sim lúc đặt đơn */
  source_id: string | null;
  source_name: string | null;
  /** Snapshot % HH nguồn kho (supplier). */
  commission_percent: number | null;
  /** Snapshot % HH đại lý (trụ trì / site giới thiệu). */
  agent_commission_percent: number | null;
  created_at: string;
  updated_at: string;
}

export const SIM_ORDER_STATUS_LABELS: Record<SimOrderStatus, string> = {
  pending_payment: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  delivering: 'Đang giao sim',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
};

export const SIM_STATUS_LABELS: Record<SimStatus, string> = {
  available: 'Đang bán',
  reserved: 'Đang giữ chỗ',
  sold: 'Đã bán',
  hidden: 'Ẩn',
};

/** Gia tiên / chính tiến */
export interface SoAncestor {
  id: string;
  household_id: string;
  temple_id: string;
  print_selected: boolean;
  xung_ho: string | null;
  ten_hieu: string;
  ten_nho: string | null;
  nam_mat: number | null;
  thang_mat: number | null;
  ngay_mat: number | null;
  gio_mat: string | null;
  an_tang: string | null;
  an_tang_nho: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
