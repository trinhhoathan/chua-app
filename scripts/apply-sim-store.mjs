/**
 * Apply migration sim_store (sim_listings, sim_orders, RPC, temples.bank_bin)
 * lên remote Supabase qua Management API.
 *
 * Usage: node scripts/apply-sim-store.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

const sqlPath = path.join(
  root,
  'supabase/migrations/20260731150000_sim_store.sql',
);
const sql = fs.readFileSync(sqlPath, 'utf8');
const projectRef =
  process.env.SUPABASE_PROJECT_REF ||
  (process.env.NEXT_PUBLIC_SUPABASE_URL || '')
    .replace(/^https?:\/\//, '')
    .split('.')[0];

async function main() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) {
    console.error(
      'Thiếu SUPABASE_ACCESS_TOKEN — dán SQL trong supabase/migrations/20260731150000_sim_store.sql vào SQL Editor trên Dashboard.',
    );
    process.exit(1);
  }
  if (!projectRef) throw new Error('Thiếu project ref');

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    },
  );
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Management API ${res.status}: ${text}`);
  }
  console.log('OK: sim_store migration applied');
  console.log(text.slice(0, 300));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
