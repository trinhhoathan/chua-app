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
  history_summary: string | null;
  abbott_name: string | null;
  abbott_title: string | null;
  abbott_bio: string | null;
  abbott_image_url: string | null;
  gallery: GalleryImage[];
  extra_sections: ExtraSection[];
  timeline: TimelineEntry[];
  features: FeatureEntry[];
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
  created_at: string;
  updated_at: string;
}

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
  created_at: string;
}
