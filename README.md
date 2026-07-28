# Chùa App — Nền tảng White-label cho hàng trăm ngôi chùa

Nền tảng Next.js 16 + Supabase, phục vụ **nhiều chùa trên cùng một codebase**. Mỗi domain (ví dụ `chuacovien.vn`, `chuaquanambachong.vn`) tự động render đúng thương hiệu, nội dung, QR công đức và tài khoản ngân hàng của chùa đó.

## Tính năng Phase 1

- White-label theo domain (proxy → `x-current-domain` → resolve tenant qua bảng `temple_domains`).
- CMS lưu trực tiếp trong Supabase (`temples`) — thêm chùa mới **không cần deploy code**.
- Trang giới thiệu chùa (hero, trụ trì, lịch sử timeline, kiến trúc, đường tới, công đức) — ảnh/nội dung lấy từ CMS `temples`, không hard-code theo chùa.
- Minh bạch quỹ nước trên trang chủ: tổng thùng đã thanh toán + lịch sử đơn thành công gần đây.
- Thanh sticky "Cúng nước" mobile-first — đặt 10 / 100 / 1000 / 5000 thùng hoặc số tự chọn (tối thiểu 10), mở modal nhập họ tên + SĐT, tạo đơn có mã, hiện QR VietQR công ty.
- Sổ quyết toán 50% giá trị đơn cho chùa (`settlement_ledger`), xem tại `/quan-tri/doi-soat`.
- Bộ công cụ Phong thủy — Nghi lễ (10 tool): xem tuổi làm nhà, khởi công, hướng nhà, cưới hỏi, mai táng, trùng tang, nhập trạch, khai trương, mở cửa hàng, năm sinh con.

## Chạy local

```bash
npm install
npm run dev
```

Mở `http://covien.localhost:3000` — thấy Chùa Cổ Viễn.
Mở `http://bachong.localhost:3000` — thấy Chùa Quan Âm Bắc Hồng (đa số trình duyệt hiện đại phân giải `*.localhost` mà không cần chỉnh file `hosts`).
Mở `http://localhost:3000` — trang “Chưa kết nối website” (mỗi chùa gắn domain riêng, không dùng `localhost` làm mặc định).

## Biến môi trường

`.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service_role — bắt buộc webhook/thông báo>
ADMIN_KEY=<legacy key, tuỳ chọn>
PAYMENT_WEBHOOK_SECRET=<secret cho POST /api/payments/webhook>
SEPAY_WEBHOOK_API_KEY=<API Key cấu hình trên SePay Dashboard>
ZALO_OA_ACCESS_TOKEN=   # tuỳ chọn — OA CS (cần user_id follower)
ZALO_ZNS_ACCESS_TOKEN=  # khuyến nghị — Zalo ZNS gửi theo SĐT
ZALO_ZNS_TEMPLATE_ID=   # template ZNS đã duyệt trên Zalo
SMS_API_URL=            # tuỳ chọn — endpoint SMS Brandname
SMS_API_KEY=            # tuỳ chọn
EMAIL_API_URL=          # tuỳ chọn
EMAIL_API_KEY=          # tuỳ chọn

# 1 tài khoản ngân hàng công ty (chung mọi chùa)
COMPANY_BANK_NAME=VietinBank
COMPANY_BANK_BIN=970415
COMPANY_BANK_ACCOUNT_NUMBER=105887225239
COMPANY_BANK_ACCOUNT_HOLDER=CÔNG TY CP QUAN ÂM TRANG VIỆN
COMPANY_VIETQR_URL=     # để trống — app tự sinh VietQR từ STK ở trên
```

Phân biệt chùa trên sao kê bằng **mã đơn** dạng `CV-A3K9MP` / `BH-X7Q2TR`:

- `CV` = `temples.payment_code` của Chùa Cổ Viễn  
- `BH` = Chùa Quan Âm Bắc Hồng  
- Phần sau dấu `-` là mã đơn duy nhất  

Webhook nhận `order_code` / `content` = nội dung CK → map về đúng chùa + ghi sổ quyết toán 50%.

```
## Kiến trúc thư mục

```
src/
  proxy.ts                              # bắt Host → x-current-domain
  lib/
    supabase.ts                         # anon client (đọc công khai)
    supabase-admin.ts                   # service role (server-only)
    tenant.ts                           # getCurrentTemple() + cache
    fengshui/
      lunar.ts                          # dương ↔ âm, can chi
      rules.ts                          # Kim Lâu, Hoang Ốc, Tam Tai, Bát trạch, Trùng tang…
      tools.ts                          # metadata 10 công cụ
  types/database.ts                     # kiểu Temple, WaterOrder, SettlementEntry
  components/
    temple/…                            # TempleHero, TempleStory, AbbottSection, VisitSection…
    water/WaterStickyBar.tsx            # thanh cúng nước
    fengshui/…                          # ToolShell, VerdictBadge, 7 tool components
  app/
    (tenant)/
      layout.tsx                        # nav + sticky + footer + generateMetadata
      page.tsx                          # landing
      dat-nuoc/page.tsx                 # trang đặt nước
      dat-nuoc/[code]/page.tsx          # xác nhận đơn
      phong-thuy/page.tsx               # hub công cụ
      phong-thuy/[tool]/page.tsx        # từng công cụ (static params)
    quan-tri/
      doi-soat/page.tsx                 # sổ quyết toán 50%
      doi-soat/MarkPaidButton.tsx       # đánh dấu đã thanh toán
    actions/orders.ts                   # createWaterOrder, markOrderPaid
```

## Playbook: thêm một chùa mới

Không cần sửa code — chỉ cần thao tác trên Supabase + DNS.

### 1. Insert row vào `temples`

Trên Supabase Dashboard → SQL Editor:

```sql
INSERT INTO public.temples (
  domain, name, temple_alt_name, slogan, tagline,
  primary_color, address, maps_url, hero_image_url,
  history_summary, abbott_name, abbott_title, abbott_bio, abbott_image_url,
  timeline, features, bank_name, bank_account_number, bank_account_holder,
  qr_donate, water_price_vnd, water_profit_share_pct, is_active
) VALUES (
  'chuavidu.vn',                                    -- domain chính (unique)
  'Chùa Ví Dụ',
  'Tên chữ Hán/Nôm nếu có',
  'Slogan ngắn dưới tên chùa',
  'Ví dụ: Di tích văn hoá quốc gia',
  '#7A1F1F',                                        -- màu thương hiệu
  'Địa chỉ đầy đủ',
  'https://www.google.com/maps/search/?api=1&query=...',
  'https://.../hero.jpg',                           -- ảnh hero full-bleed
  'Đoạn văn giới thiệu / lịch sử chùa (nhiều dòng).',
  'Thầy Thích ...',
  'Trụ trì Chùa Ví Dụ',
  'Tiểu sử trụ trì (nhiều dòng).',
  'https://.../abbott.jpg',
  '[{"year":"...", "title":"...", "body":"..."}]'::jsonb,
  '[{"title":"...", "body":"..."}]'::jsonb,
  'Vietcombank',
  '0000000000000',
  'CHUA VI DU',
  'https://.../vietqr.png',
  80000,
  50.00,
  TRUE
);
```

### 2. Đăng ký domain phụ (tuỳ chọn)

```sql
INSERT INTO public.temple_domains (temple_id, domain, is_primary)
SELECT id, 'aliaskhac.vn', FALSE
FROM public.temples WHERE domain = 'chuavidu.vn';
```

### 3. Trỏ DNS domain về Vercel

- Ở registrar: thêm `A` record trỏ `chuavidu.vn` về IP của Vercel, hoặc `CNAME` `www.chuavidu.vn` → `cname.vercel-dns.com`.
- Trong Vercel Project → Settings → Domains → **Add** `chuavidu.vn` (Vercel sẽ tự cấp SSL).

### 4. Ảnh & nội dung CMS

Mỗi chùa tự chỉnh trong bảng `temples` (không đụng code):

| Trường | Dùng cho |
|--------|----------|
| `hero_image_url` | Hero full-bleed trang chủ |
| `abbott_image_url` + `abbott_*` | Ảnh & tiểu sử trụ trì |
| `history_summary`, `timeline`, `features` | Nội dung chữ các section |
| `gallery[0]` | Ảnh cột lịch sử / story |
| `gallery[cuối]` | Ảnh section “Đường tới chùa” |
| `qr_donate` | QR riêng (nếu dùng); thanh toán nước dùng STK công ty |

- Upload ảnh lên Supabase Storage (bucket public) hoặc CDN, dán URL vào các cột trên.
- Ảnh trong `public/images/` chỉ để test local.

### 5. Kiểm tra

- Vào `https://chuavidu.vn` → thấy branding riêng của chùa.
- Vào `/phong-thuy` → 10 công cụ phong thuỷ hoạt động ngay, dùng màu thương hiệu chùa.
- Vào `/quan-tri/doi-soat?key=<ADMIN_KEY>` → chọn chùa từ dropdown để xem sổ đối soát.

## Trang quản trị nội bộ

`/quan-tri/doi-soat?key=<ADMIN_KEY>`

- Chọn chùa + tháng.
- Xem tổng số thùng đã bán, doanh thu, phần chùa nhận trong tháng.
- Đơn chờ thanh toán → nút **Đã trả** để cập nhật status + ghi `settlement_ledger` (50% giá trị đơn).

Cần đăng nhập trụ trì (Phase 2) hoặc `ADMIN_KEY` legacy.

## Schema chính

- `temples` — 1 hàng / 1 chùa, chứa branding + CMS + cấu hình kinh doanh.
- `temple_domains` — nhiều domain alias / 1 temple.
- `water_orders` — đơn cúng nước (INSERT công khai; SELECT/UPDATE cho temple admin).
- `settlement_ledger` — bút toán quyết toán 50%.
- `temple_admins` — gắn `auth.users` ↔ `temples` (role admin/staff, `is_super_admin`).
- `devotees` — sổ Phật tử / quy y.
- `prayer_requests` — sổ cầu an / cầu siêu.
- `inventory_items` + `inventory_movements` — kho vận.
- `notification_logs` — nhật ký Zalo/SMS/log.

## Phase 2 — Admin Auth & Dashboard

### Tạo tài khoản trụ trì

1. Supabase Dashboard → **Authentication → Users → Add user** (email + password).
2. Copy `user_id` (UUID).
3. Gắn với chùa:

```sql
INSERT INTO public.temple_admins (user_id, temple_id, role, display_name, is_super_admin)
SELECT
  '<USER_UUID>',
  id,
  'admin',
  'Thầy Thích Minh Thành',
  FALSE
FROM public.temples
WHERE domain = 'covien.localhost';
```

4. Đăng nhập tại `/quan-tri/dang-nhap`.

### Menu quản trị (`/quan-tri`)

| Route | Chức năng |
|-------|-----------|
| `/quan-tri` | Tổng quan (đơn chờ, thùng bán, phần chùa, sớ, Phật tử, kho thấp) |
| `/quan-tri/don-hang` | Danh sách đơn nước + đánh dấu đã trả |
| `/quan-tri/doi-soat` | Sổ quyết toán theo tháng |
| `/quan-tri/so-cau` | Duyệt sớ + in |
| `/quan-tri/phat-tu` | CRUD Phật tử / Pháp danh / quy y |
| `/quan-tri/kho` | Kho vận + nhập/xuất |

RLS: mỗi admin chỉ thấy dữ liệu `temple_id` được gán. `is_super_admin = TRUE` thấy tất cả.

## Phase 3 — Sớ, kho, thông báo, webhook

### Đăng ký sớ công khai

- Phật tử: `/so-cau` (Cầu an / Cầu siêu).
- Trụ trì duyệt tại `/quan-tri/so-cau`, in tại `/quan-tri/so-cau/[id]/in` (Ctrl+P / nút In sớ).

### Kho vận

Seed sẵn cho mỗi chùa: nước 20L, hương trầm, kinh A Di Đà. Quản lý tại `/quan-tri/kho`.

### Thông báo Zalo / SMS

`src/lib/notifications.ts` gửi theo thứ tự:

1. Nếu có `ZALO_OA_ACCESS_TOKEN` → Zalo OA API  
2. Else nếu có `SMS_API_URL` + `SMS_API_KEY` → SMS HTTP  
3. Else → ghi `notification_logs` với `channel=log` (an toàn local)

Hook vào: tạo đơn nước, đánh dấu đã trả, nhận sớ.

### Webhook thanh toán (SePay — tự động nhận diện CK)

1. Đăng ký [SePay](https://my.sepay.vn), liên kết STK VietinBank `105887225239`.
2. Tạo Webhook:
   - URL: `https://<domain-của-bạn>/api/payments/sepay`
   - Sự kiện: **Có tiền vào**
   - Auth: `API Key` → dán vào `.env.local` `SEPAY_WEBHOOK_API_KEY`
3. Bắt buộc có `SUPABASE_SERVICE_ROLE_KEY` trong `.env.local` (Dashboard → Settings → API).
4. Local: dùng ngrok/cloudflare tunnel vì SePay cần URL public HTTPS.

Khi khách CK với nội dung chứa mã đơn (`CV-XXXXXX`), SePay bắn webhook → app đánh dấu **đã thanh toán** → trang chờ tự chuyển sang **thành công**.

Webhook nội bộ cũ vẫn còn: `POST /api/payments/webhook` (secret `PAYMENT_WEBHOOK_SECRET`).

### UI thanh toán

- **Mobile:** chọn ngân hàng → mở app ngân hàng (deeplink VietQR) → vòng chờ nhận diện.
- **PC:** hiện QR + vòng quay poll mỗi 2,5s; khi paid → `/dat-nuoc/[code]/thanh-cong`.

## Ghi chú nội dung

- **Chùa Cổ Viễn** — thông tin lịch sử từ nguồn công khai; tiểu sử Thầy Thích Minh Thành là bản tạm.
- **Chùa Quan Âm Bắc Hồng** — tổng hợp từ nguồn công khai về làng Quan Âm, Bắc Hồng, Đông Anh.
- **Công cụ phong thuỷ** — rule-based dân gian, mang tính tham khảo.
- **In sớ** Phase 3 xuất Quốc ngữ chuẩn; Hán Nôm nâng cao để Phase sau.
