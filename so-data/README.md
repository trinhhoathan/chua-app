# Dữ liệu lòng sớ mẫu

Thư mục này thay cho `.next/long_so_mau` (thư mục build Next.js — sẽ bị xóa khi rebuild).

## Cấu trúc

| Thư mục | Số file | Mô tả |
|---------|---------|--------|
| `longsos/` | 763 | Lòng sớ (Quốc ngữ / Nôm / song ngữ), mỗi file có template 5 khổ giấy |
| `bosos/` | 25 | Bộ sớ (nhóm lòng sớ theo đàn lễ) |
| `liemluatsos/` | 763 | Luật hiển thị từng lòng sớ |

## Vì sao không đưa lên Vercel?

- JSON thô ~**1.1 GB** — vượt giới hạn deploy/băng thông.
- Gzip cùng nội dung còn ~**15 MB** (~98% nhỏ hơn) → phù hợp Supabase Storage CDN.
- App trên Vercel chỉ tải **một file lúc cần** (~15–30 KB gzip / lòng sớ), không bundle cả kho.

## Quy trình khuyến nghị

### 1. Local (dev)

Giữ `so-data/` trên máy. Đã có trong `.gitignore` — **không commit**.

```bash
# Sinh index + SQL metadata (không upload)
node scripts/seed-so-templates.mjs
```

Catalog nhẹ commit được: `src/data/so-templates-index.json` (~300 KB).

### 2. Nén backup / chuyển máy

```bash
node scripts/pack-so-data.mjs
```

Tạo:

- `so-data-gz/longsos/*.json.gz` — từng file gzip
- `so-data-gz/longsos-json-gz.zip` — gói ~15 MB để copy/backup

Thư mục `so-data-gz/` cũng bị gitignore.

### 3. Production (Vercel + Supabase)

1. Đảm bảo migration `so-templates` bucket đã chạy (public read).
2. Điền `SUPABASE_SERVICE_ROLE_KEY` vào `.env.local` (chỉ local, không commit).
3. Upload gzip lên Storage + seed metadata:

```bash
node scripts/seed-so-templates.mjs --upload
# rồi chạy so-data/seed-meta.sql trên Supabase SQL Editor (nếu chưa seed)
```

4. Trên Vercel chỉ cần env:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- (tuỳ chọn) `NEXT_PUBLIC_SO_TEMPLATES_FROM_STORAGE=1` — ép dùng CDN ngay cả khi local còn `so-data/`

Runtime đọc:

`{SUPABASE_URL}/storage/v1/object/public/so-templates/longsos/{id}.json.gz`

## Lưu ý

- Font chữ nằm ở [`public/fonts/so/`](../public/fonts/so/) (không ở đây).
- Không bao giờ đưa `so-data/` hoặc `SUPABASE_SERVICE_ROLE_KEY` vào Git / bundle Vercel.
