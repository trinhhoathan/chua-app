/**
 * Cập nhật danh xưng cho tenant Lý Gia Phúc An:
 *   abbott_title = 'Thầy Phong Thủy', abbott_name = 'Phúc An'
 *
 * Usage: node scripts/update-lygia-abbott.mjs
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

const projectRef =
  process.env.SUPABASE_PROJECT_REF ||
  (process.env.NEXT_PUBLIC_SUPABASE_URL || '')
    .replace(/^https?:\/\//, '')
    .split('.')[0];

async function runSql(query) {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) throw new Error('Thiếu SUPABASE_ACCESS_TOKEN trong .env.local');
  if (!projectRef) throw new Error('Thiếu project ref');
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    },
  );
  const text = await res.text();
  if (!res.ok) throw new Error(`Management API ${res.status}: ${text}`);
  return text;
}

async function main() {
  const before = await runSql(`
    select id, name, domain, abbott_title, abbott_name
    from temples
    where domain ilike '%ly-gia-phuc-an%' or domain ilike '%lygiaphucan%' or payment_code = 'LGPA';
  `);
  console.log('Trước:', before);

  const after = await runSql(`
    update temples
    set abbott_title = 'Thầy Phong Thủy', abbott_name = 'Phúc An'
    where domain ilike '%ly-gia-phuc-an%' or domain ilike '%lygiaphucan%' or payment_code = 'LGPA'
    returning id, name, abbott_title, abbott_name;
  `);
  console.log('Sau:', after);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
