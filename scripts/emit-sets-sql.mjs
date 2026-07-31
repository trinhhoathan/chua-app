import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const idx = JSON.parse(
  fs.readFileSync(path.join(root, 'src/data/so-templates-index.json'), 'utf8'),
);
const esc = (s) => String(s).replace(/'/g, "''");
const lines = ['begin;'];
idx.sets.forEach((s, i) => {
  lines.push(
    [
      'insert into public.so_template_sets (id,name,longso_ids,active,sort_order,updated_at)',
      `values ('${esc(s.id)}','${esc(s.name)}',array[${s.longsoIds.join(',')}]::integer[],true,${i},now())`,
      'on conflict (id) do update set name=excluded.name, longso_ids=excluded.longso_ids, sort_order=excluded.sort_order, updated_at=now();',
    ].join(' '),
  );
});
lines.push('commit;');
const out = path.join(root, 'so-data/seed-sets-only.sql');
fs.writeFileSync(out, lines.join('\n'));
console.log('wrote', out, lines.length - 2, 'sets');
