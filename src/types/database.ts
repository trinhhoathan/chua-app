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
  /** Mã ngắn định danh chùa trên nội dung CK, ví dụ CV, BH. */
  payment_code: string | null;
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
