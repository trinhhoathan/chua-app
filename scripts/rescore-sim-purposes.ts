/**
 * Rescore toàn bộ sim_listings: ghi lại aspects gồm 6 mục đích sâu (nhóm 2+3).
 *
 * Usage: npx --yes tsx scripts/rescore-sim-purposes.ts
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!(k in process.env)) process.env[k] = v;
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Thiếu SUPABASE URL / KEY trong .env.local');
  process.exit(1);
}

async function main() {
  // Dynamic import SAU khi đã nạp env (tránh supabase.ts khởi tạo sớm)
  const { buildSimScorePayload } = await import('../src/lib/sim/scoring');

  const db = createClient(url!, key!, { auth: { persistSession: false } });

  let from = 0;
  const pageSize = 200;
  let updated = 0;
  let skipped = 0;

  for (;;) {
    const { data, error } = await db
      .from('sim_listings')
      .select('id, phone')
      .order('created_at', { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data?.length) break;

    for (const row of data) {
      const payload = buildSimScorePayload(String(row.phone));
      if (!payload) {
        skipped++;
        continue;
      }
      const { error: updErr } = await db
        .from('sim_listings')
        .update({
          aspects: payload.aspects,
          star_summary: payload.star_summary,
          overall_score: payload.overall_score,
          du_nien_score: payload.du_nien_score,
          verdict: payload.verdict,
          nut: payload.nut,
          element: payload.element,
          so_ly_81: payload.so_ly_81,
          tags: payload.tags,
          careers: payload.careers,
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id);
      if (updErr) {
        console.error('Fail', row.phone, updErr.message);
        skipped++;
      } else {
        updated++;
      }
    }

    console.log(`… ${from + data.length} dòng (updated=${updated})`);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  console.log(`OK: updated=${updated}, skipped=${skipped}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
