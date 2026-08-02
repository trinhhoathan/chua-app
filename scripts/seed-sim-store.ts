/**
 * Seed 100 sim mẫu cho tenant Lý Gia Phúc An.
 * Chạy: npx tsx --env-file=.env.local scripts/seed-sim-store.ts
 * Cần: SUPABASE_SERVICE_ROLE_KEY + migration sim_store đã apply.
 */
import { createClient } from '@supabase/supabase-js';
import { generateDemoSims } from '../src/lib/sim/scoring';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  // 1) Tìm temple Lý Gia
  const { data: temples, error: tErr } = await db
    .from('temples')
    .select('id, name, domain, payment_code');
  if (tErr) throw tErr;
  const temple = (temples ?? []).find(
    (t) =>
      t.payment_code === 'LGPA' ||
      String(t.domain).includes('ly-gia-phuc-an') ||
      String(t.domain).includes('lygiaphucan'),
  );
  if (!temple) {
    console.error('Không tìm thấy tenant Lý Gia Phúc An trong bảng temples.');
    process.exit(1);
  }
  console.log('Tenant:', temple.name, '·', temple.domain, '·', temple.id);

  // 2) Kiểm tra bảng + số sim hiện có
  const { data: existing, error: probeErr } = await db
    .from('sim_listings')
    .select('phone')
    .eq('temple_id', temple.id);
  if (probeErr) {
    console.error(
      'Bảng sim_listings chưa tồn tại — hãy apply migration trước:\n' +
        '  supabase/migrations/20260731150000_sim_store.sql (SQL Editor trên Dashboard)\n' +
        `Lỗi: ${probeErr.message}`,
    );
    process.exit(1);
  }
  const existingPhones = new Set((existing ?? []).map((r) => String(r.phone)));
  console.log(`Kho hiện có ${existingPhones.size} sim.`);
  if (existingPhones.size >= 100) {
    console.log('Đã đủ >=100 sim, bỏ qua seed.');
    return;
  }

  // 3) Sinh + chèn
  const need = 100 - existingPhones.size;
  const generated = generateDemoSims(need, existingPhones);
  const rows = generated.map((g) => ({
    temple_id: temple.id,
    ...g.payload,
    price_vnd: g.price_vnd,
    original_price_vnd: g.original_price_vnd,
    featured: g.featured,
    status: 'available',
  }));

  let inserted = 0;
  for (let i = 0; i < rows.length; i += 50) {
    const chunk = rows.slice(i, i + 50);
    const { error } = await db.from('sim_listings').insert(chunk);
    if (error) {
      console.error(`Lỗi ở lô ${i / 50 + 1}:`, error.message);
      process.exit(1);
    }
    inserted += chunk.length;
    console.log(`  + ${inserted}/${rows.length}`);
  }
  console.log(`XONG: đã seed ${inserted} sim mẫu cho ${temple.name}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
