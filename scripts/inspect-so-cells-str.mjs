import fs from 'node:fs';

for (const id of ['732', '748', '40', '1', '6']) {
  const j = JSON.parse(fs.readFileSync(`so-data/longsos/${id}.json`, 'utf8'));
  const size = Object.keys(j.template)[0];
  const cells = j.template[size].cells;
  console.log(
    `#${id}`,
    j.lang,
    j.kind,
    j.name,
    'cells:',
    typeof cells,
    Array.isArray(cells) ? `array(${cells.length})` : `str(${String(cells).length})`,
  );
  if (typeof cells === 'string') {
    console.log('  starts:', cells.slice(0, 120).replace(/\n/g, '\\n'));
    // try parse
    try {
      const p = JSON.parse(cells);
      console.log('  parsed type', typeof p, Array.isArray(p), Array.isArray(p) ? p.length : Object.keys(p).slice(0,5));
    } catch {
      console.log('  not JSON');
    }
  }
}

// Count how many have string cells vs array
let strN = 0, arrN = 0;
for (const f of fs.readdirSync('so-data/longsos')) {
  if (!f.endsWith('.json')) continue;
  const j = JSON.parse(fs.readFileSync(`so-data/longsos/${f}`, 'utf8'));
  const t = j.template[Object.keys(j.template)[0]];
  if (typeof t.cells === 'string') strN++;
  else if (Array.isArray(t.cells)) arrN++;
}
console.log('\nstring cells:', strN, 'array cells:', arrN);
