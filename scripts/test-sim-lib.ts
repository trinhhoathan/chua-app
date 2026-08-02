/** Kiểm thử nhanh lib kho sim (chạy: npx tsx scripts/test-sim-lib.ts) */
import { buildSimScorePayload, suggestSimPrice, generateDemoSims } from '../src/lib/sim/scoring';
import { normalizeSimPhone, detectNetwork, detectSimTags, parseSimSearch } from '../src/lib/sim/catalog';
import { parseBirthParams, buildSimDungThan, personalizeSimScore, parseGoal } from '../src/lib/sim/bat-tu';
import { SIM_CAREERS, careerFitScore } from '../src/lib/sim/careers';

let failures = 0;
function check(name: string, cond: boolean, extra?: unknown) {
  if (cond) console.log(`  OK   ${name}`);
  else {
    failures++;
    console.log(`  FAIL ${name}`, extra ?? '');
  }
}

// --- catalog ---
check('normalize 84', normalizeSimPhone('+84 912 345 678') === '0912345678');
check('normalize 9 số', normalizeSimPhone('912345678') === '0912345678');
check('normalize sai', normalizeSimPhone('12345') === null);
check('network viettel', detectNetwork('0968686868') === 'viettel');
check('network mobifone', detectNetwork('0909123456') === 'mobifone');
check('tags tứ quý', detectSimTags('0912348888').includes('tu-quy'));
check('tags lộc phát', detectSimTags('0909096868').includes('loc-phat'));
check('search star', parseSimSearch('090*8888') === '090%8888');
check('search plain', parseSimSearch('6789') === '%6789%');

// --- scoring ---
const payload = buildSimScorePayload('0912345678');
check('payload tồn tại', payload !== null);
if (payload) {
  check('payload score 0-100', payload.overall_score >= 0 && payload.overall_score <= 100, payload.overall_score);
  check('payload element', ['kim', 'moc', 'thuy', 'hoa', 'tho'].includes(payload.element), payload.element);
  check('payload aspects đủ 5', Object.keys(payload.aspects).length >= 5, payload.aspects);
  const price = suggestSimPrice(payload);
  check('giá gợi ý hợp lệ', price >= 199_000, price);
  console.log('  · 0912345678 →', payload.overall_score, payload.verdict, payload.element, 'giá', price);
}

// --- demo sims ---
const demo = generateDemoSims(100, new Set());
check('sinh 100 sim mẫu', demo.length === 100, demo.length);
check('sim mẫu unique', new Set(demo.map((d) => d.payload.phone)).size === 100);
check('sim mẫu có giá', demo.every((d) => d.price_vnd > 0));

// --- bát tự ---
const birth = parseBirthParams({ ns: '1990-03-15', gio: '8', gt: 'nam' });
check('parse birth', birth !== null);
if (birth) {
  const v = buildSimDungThan(birth);
  check('dựng dụng thần', v !== null, v);
  if (v && payload) {
    const p = personalizeSimScore(
      { element: payload.element, overall_score: payload.overall_score, aspects: payload.aspects },
      v,
      parseGoal('tai_van'),
    );
    check('match 0-100', p.matchPercent >= 0 && p.matchPercent <= 100, p.matchPercent);
    console.log('  · Nam 15/03/1990 8h → nhật chủ', v.nhatChu, '| dụng', v.dungThan, '| hợp', `${p.matchPercent}%`, p.menhFit.label);
  }
}

// --- careers ---
check('có ngành nghề', SIM_CAREERS.length >= 8, SIM_CAREERS.length);
if (payload) {
  const fits = SIM_CAREERS.map((c) => careerFitScore(
    { element: payload.element, overall_score: payload.overall_score, aspects: payload.aspects },
    c,
  ));
  check('career fit 0-100', fits.every((f) => f >= 0 && f <= 100), fits);
}

console.log(failures === 0 ? '\nTẤT CẢ PASS' : `\n${failures} FAIL`);
process.exit(failures === 0 ? 0 : 1);
