/**
 * Nén so-data/longsos → gzip (~98% nhỏ hơn) để backup / chuyển máy / upload Storage.
 *
 * Usage:
 *   node scripts/pack-so-data.mjs           # ghi so-data-gz/longsos/*.json.gz + zip
 *   node scripts/pack-so-data.mjs --no-zip  # chỉ ghi từng file .gz
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'so-data', 'longsos');
const OUT = path.join(ROOT, 'so-data-gz', 'longsos');
const ZIP = path.join(ROOT, 'so-data-gz', 'longsos-json-gz.zip');

const args = new Set(process.argv.slice(2));
const noZip = args.has('--no-zip');

if (!fs.existsSync(SRC)) {
  console.error('Missing so-data/longsos — copy data first.');
  process.exit(1);
}

const files = fs.readdirSync(SRC).filter((f) => f.endsWith('.json'));
fs.mkdirSync(OUT, { recursive: true });

let rawTotal = 0;
let gzTotal = 0;
let i = 0;

console.log(`Gzip ${files.length} files → ${path.relative(ROOT, OUT)}`);

for (const f of files) {
  const raw = fs.readFileSync(path.join(SRC, f));
  const gz = zlib.gzipSync(raw, { level: 9 });
  // 1.json → 1.json.gz
  fs.writeFileSync(path.join(OUT, `${f}.gz`), gz);
  rawTotal += raw.length;
  gzTotal += gz.length;
  i++;
  if (i % 100 === 0) console.log(`  ${i}/${files.length}`);
}

console.log(
  `Done: ${(rawTotal / 1e9).toFixed(3)} GB → ${(gzTotal / 1e6).toFixed(1)} MB` +
    ` (saved ${((1 - gzTotal / rawTotal) * 100).toFixed(1)}%)`,
);

if (noZip) {
  console.log('Skip zip (--no-zip).');
  process.exit(0);
}

if (fs.existsSync(ZIP)) fs.unlinkSync(ZIP);

try {
  // Windows: Compress-Archive; Unix: zip
  if (process.platform === 'win32') {
    execFileSync(
      'powershell',
      [
        '-NoProfile',
        '-Command',
        `Compress-Archive -Path '${OUT.replace(/'/g, "''")}\\*.json.gz' -DestinationPath '${ZIP.replace(/'/g, "''")}' -Force`,
      ],
      { stdio: 'inherit' },
    );
  } else {
    execFileSync('zip', ['-j', '-q', ZIP, ...fs.readdirSync(OUT).filter((f) => f.endsWith('.gz')).map((f) => path.join(OUT, f))], {
      stdio: 'inherit',
    });
  }
  const zipSize = fs.statSync(ZIP).size;
  console.log(`Archive: ${path.relative(ROOT, ZIP)} (${(zipSize / 1e6).toFixed(1)} MB)`);
} catch (err) {
  console.warn('Zip failed (gzip files vẫn dùng được):', err instanceof Error ? err.message : err);
}
