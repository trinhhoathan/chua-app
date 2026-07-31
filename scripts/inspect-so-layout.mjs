import fs from 'node:fs';

const id = process.argv[2] || '732';
const j = JSON.parse(fs.readFileSync(`so-data/longsos/${id}.json`, 'utf8'));
const t = j.template.A3 || j.template[Object.keys(j.template)[0]];
console.log('lang', j.lang, 'name', j.name);
console.log('paper keys', Object.keys(t));
console.log('cells type', typeof t.cells, Array.isArray(t.cells));
if (Array.isArray(t.cells)) {
  console.log('len', t.cells.length, 'cpc', t.cellsPerColumn);
  console.log('sample0', JSON.stringify(t.cells[0]).slice(0, 500));
  console.log('sample10', JSON.stringify(t.cells[10]).slice(0, 500));
} else if (t.cells && typeof t.cells === 'object') {
  const keys = Object.keys(t.cells);
  console.log('cells object keys sample', keys.slice(0, 20), 'count', keys.length);
  console.log('first', JSON.stringify(t.cells[keys[0]]).slice(0, 800));
}

// Also check songngu template 1
const j1 = JSON.parse(fs.readFileSync('so-data/longsos/1.json', 'utf8'));
const t1 = j1.template.A3;
console.log('\n--- longso 1 ---');
console.log('cells type', typeof t1.cells, Array.isArray(t1.cells), 'len', t1.cells?.length);
console.log('cpc', t1.cellsPerColumn);
const types = {};
for (const c of t1.cells) types[c.cellType] = (types[c.cellType] || 0) + 1;
console.log('types', types);
// margin stats
let maxTop = 0, maxLeft = 0, maxRight = 0;
const tops = new Set();
for (const c of t1.cells) {
  const m = c.style?.margin;
  if (!m) continue;
  maxTop = Math.max(maxTop, m.top || 0);
  maxLeft = Math.max(maxLeft, m.left || 0);
  maxRight = Math.max(maxRight, m.right || 0);
  if (m.top) tops.add(m.top);
}
console.log('max margins top/left/right', maxTop, maxLeft, maxRight);
console.log('distinct tops', [...tops].sort((a,b)=>a-b).slice(0,30));

// How does original app layout? Check if cells are column-major with margin.right as column offset
const nonempty = t1.cells.filter(c => (c.qn?.word && c.qn.word.trim()) || (c.nom?.word && c.nom.word.trim()));
console.log('nonempty', nonempty.length);
console.log('first 8 nonempty', nonempty.slice(0,8).map(c => ({
  qn: c.qn?.word, nom: c.nom?.word, m: c.style?.margin, fs: c.style?.fontSize, a: c.anchor, t: c.cellType
})));
