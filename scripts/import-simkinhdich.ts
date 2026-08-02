/**
 * Xóa kho sim demo + import sim đã scrape (phone + price) vào tenant Lý Gia Phúc An.
 *
 * Chiến lược gọn DB:
 * - Chấm điểm phong thủy local (engine Âm Dương Ngũ Hành) → cột filter: score, element, nut, tags, aspects
 * - star_summary = {} (chi tiết tính lại khi xem trang /sim/[phone])
 * - description = null
 *
 * Chạy:
 *   npx tsx --env-file=.env.local scripts/import-simkinhdich.ts
 *   npx tsx --env-file=.env.local scripts/import-simkinhdich.ts --dry-run
 *   npx tsx --env-file=.env.local scripts/import-simkinhdich.ts --limit=500
 */
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { buildSimScorePayload } from '../src/lib/sim/scoring';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });

const DATA_JSON = path.resolve('data/simkinhdich/sims.json');
const DATA_CSV = path.resolve('data/simkinhdich/sims.csv');
const BATCH = 200;
/** Bỏ giá bất thường (parse lỗi / số ảo) */
const MAX_PRICE = 2_000_000_000;

function parseArgs(argv: string[]) {
  const out = { dryRun: false, limit: 0, skipDelete: false };
  for (const a of argv) {
    if (a === '--dry-run') out.dryRun = true;
    else if (a === '--skip-delete') out.skipDelete = true;
    else if (a.startsWith('--limit=')) out.limit = Math.max(0, Number(a.slice(8)) || 0);
  }
  return out;
}

type RawSim = { phone: string; price_vnd: number };

function loadSims(): RawSim[] {
  if (fs.existsSync(DATA_JSON)) {
    const rows = JSON.parse(fs.readFileSync(DATA_JSON, 'utf8')) as RawSim[];
    return rows.filter(
      (r) =>
        r?.phone &&
        typeof r.price_vnd === 'number' &&
        r.price_vnd > 0 &&
        r.price_vnd <= MAX_PRICE,
    );
  }
  if (!fs.existsSync(DATA_CSV)) {
    throw new Error(`Không thấy ${DATA_JSON} hoặc ${DATA_CSV}`);
  }
  const lines = fs.readFileSync(DATA_CSV, 'utf8').split(/\r?\n/).filter(Boolean);
  const out: RawSim[] = [];
  for (let i = 1; i < lines.length; i++) {
    const [phone, priceRaw] = lines[i].split(',');
    const price_vnd = Number(priceRaw);
    if (!phone || !Number.isFinite(price_vnd) || price_vnd <= 0 || price_vnd > MAX_PRICE) continue;
    out.push({ phone, price_vnd });
  }
  return out;
}

async function findTemple() {
  const { data: temples, error } = await db
    .from('temples')
    .select('id, name, domain, payment_code');
  if (error) throw error;
  const temple = (temples ?? []).find(
    (t) =>
      t.payment_code === 'LGPA' ||
      String(t.domain).includes('ly-gia-phuc-an') ||
      String(t.domain).includes('lygiaphucan'),
  );
  if (!temple) throw new Error('Không tìm thấy tenant Lý Gia Phúc An');
  return temple;
}

async function deleteAllSims(templeId: string) {
  // Xóa theo lô để tránh timeout
  let deleted = 0;
  for (;;) {
    const { data, error } = await db
      .from('sim_listings')
      .select('id')
      .eq('temple_id', templeId)
      .limit(500);
    if (error) throw error;
    const ids = (data ?? []).map((r) => r.id);
    if (!ids.length) break;
    const { error: delErr } = await db.from('sim_listings').delete().in('id', ids);
    if (delErr) throw delErr;
    deleted += ids.length;
    console.log(`  đã xóa ${deleted}…`);
  }
  return deleted;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const temple = await findTemple();
  console.log('Tenant:', temple.name, '·', temple.domain, '·', temple.id);

  const raw = loadSims();
  const source = args.limit > 0 ? raw.slice(0, args.limit) : raw;
  console.log(`Nguồn: ${raw.length.toLocaleString('vi-VN')} sim hợp lệ (≤ ${MAX_PRICE.toLocaleString('vi-VN')}₫)`);
  if (args.limit) console.log(`Giới hạn lần này: ${source.length}`);

  if (!args.skipDelete) {
    console.log('Đang xóa toàn bộ sim hiện có trong kho…');
    if (args.dryRun) {
      const { count } = await db
        .from('sim_listings')
        .select('id', { count: 'exact', head: true })
        .eq('temple_id', temple.id);
      console.log(`[dry-run] sẽ xóa ${count ?? 0} sim`);
    } else {
      const n = await deleteAllSims(temple.id);
      console.log(`Đã xóa ${n} sim demo/cũ.`);
    }
  }

  console.log('Đang chấm điểm + chuẩn bị rows…');
  const t0 = Date.now();
  const rows: Record<string, unknown>[] = [];
  let skippedScore = 0;
  for (const item of source) {
    const payload = buildSimScorePayload(item.phone);
    if (!payload) {
      skippedScore++;
      continue;
    }
    rows.push({
      temple_id: temple.id,
      phone: payload.phone,
      phone_display: payload.phone_display,
      network: payload.network,
      price_vnd: item.price_vnd,
      original_price_vnd: null,
      status: 'available',
      featured: payload.overall_score >= 88,
      tags: payload.tags,
      overall_score: payload.overall_score,
      du_nien_score: payload.du_nien_score,
      verdict: payload.verdict,
      nut: payload.nut,
      element: payload.element,
      so_ly_81: payload.so_ly_81,
      // Giữ aspects (nhỏ, cần cho lọc mục đích).
      // star_summary/careers để rỗng — trang chi tiết tính lại từ số điện thoại.
      aspects: payload.aspects,
      star_summary: {},
      careers: [],
      description: null,
    });
  }
  console.log(
    `Chuẩn bị ${rows.length.toLocaleString('vi-VN')} rows · bỏ qua (không luận được) ${skippedScore} · ${Date.now() - t0}ms`,
  );

  if (args.dryRun) {
    console.log('[dry-run] mẫu:', rows.slice(0, 2));
    console.log('[dry-run] dừng — không ghi DB.');
    return;
  }

  console.log(`Đang import (batch ${BATCH})…`);
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const { error } = await db.from('sim_listings').upsert(chunk, {
      onConflict: 'temple_id,phone',
      ignoreDuplicates: false,
    });
    if (error) {
      console.error(`Lỗi lô ${Math.floor(i / BATCH) + 1}:`, error.message);
      process.exit(1);
    }
    inserted += chunk.length;
    if (inserted % 2000 === 0 || inserted === rows.length) {
      console.log(`  + ${inserted.toLocaleString('vi-VN')}/${rows.length.toLocaleString('vi-VN')}`);
    }
  }

  const { count } = await db
    .from('sim_listings')
    .select('id', { count: 'exact', head: true })
    .eq('temple_id', temple.id)
    .eq('status', 'available');

  console.log(`XONG: kho ${temple.name} hiện có ${count?.toLocaleString('vi-VN') ?? inserted} sim available.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
