/**
 * Test luồng đơn sim trên DB thật:
 *  - anon INSERT đơn pending_payment (RLS)
 *  - anon gọi RPC get_sim_order_by_code
 *  - dọn dẹp bằng service role
 * Chạy: npx tsx --env-file=.env.local scripts/test-sim-order.ts
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
  auth: { persistSession: false },
});
const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

let failures = 0;
function check(name: string, cond: boolean, extra?: unknown) {
  if (cond) console.log(`  OK   ${name}`);
  else {
    failures++;
    console.log(`  FAIL ${name}`, extra ?? '');
  }
}

async function main() {
  // Sim available bất kỳ của Lý Gia (anon đọc được qua RLS public read)
  const { data: sims, error: sErr } = await anon
    .from('sim_listings')
    .select('id, temple_id, phone, phone_display, price_vnd, status')
    .eq('status', 'available')
    .limit(1);
  check('anon đọc được kho sim', !sErr && (sims?.length ?? 0) > 0, sErr?.message);
  if (!sims?.[0]) throw new Error('không có sim để test');
  const sim = sims[0];

  const code = 'TESTSIM' + Math.floor(Math.random() * 100000);
  const { error: insErr } = await anon.from('sim_orders').insert({
    order_code: code,
    temple_id: sim.temple_id,
    sim_id: sim.id,
    phone: sim.phone,
    phone_display: sim.phone_display,
    price_vnd: sim.price_vnd,
    customer_name: 'Khách Test',
    customer_phone: '0900000000',
    status: 'pending_payment',
  });
  check('anon tạo đơn pending_payment (RLS insert)', !insErr, insErr?.message);

  // anon KHÔNG được select trực tiếp
  const { data: directRead } = await anon
    .from('sim_orders')
    .select('id')
    .eq('order_code', code);
  check('anon không đọc trực tiếp bảng đơn', (directRead?.length ?? 0) === 0, directRead);

  // nhưng đọc được qua RPC theo mã
  const { data: rpcData, error: rpcErr } = await anon.rpc('get_sim_order_by_code', {
    p_code: code.toLowerCase(),
  });
  const rows = Array.isArray(rpcData) ? rpcData : rpcData ? [rpcData] : [];
  check('anon tra cứu qua RPC (case-insensitive)', !rpcErr && rows.length === 1, rpcErr?.message);
  if (rows[0]) {
    check('RPC trả đúng đơn', rows[0].order_code === code && rows[0].phone === sim.phone);
  }

  // admin đổi trạng thái paid
  const { error: updErr } = await admin
    .from('sim_orders')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('order_code', code);
  check('service role cập nhật paid', !updErr, updErr?.message);

  const { data: after } = await anon.rpc('get_sim_order_by_code', { p_code: code });
  const a = Array.isArray(after) ? after[0] : after;
  check('RPC thấy trạng thái paid', a?.status === 'paid', a?.status);

  // dọn dẹp
  await admin.from('sim_orders').delete().eq('order_code', code);
  const { data: gone } = await anon.rpc('get_sim_order_by_code', { p_code: code });
  const g = Array.isArray(gone) ? gone : gone ? [gone] : [];
  check('đã dọn đơn test', g.length === 0);

  console.log(failures === 0 ? '\nTẤT CẢ PASS' : `\n${failures} FAIL`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
