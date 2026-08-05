import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentTemple, formatVnd } from '@/lib/tenant';
import { LY_GIA } from '@/lib/ly-gia-phuc-an';
import {
  getSimWarehouseTempleId,
  isSimStoreEnabled,
} from '@/lib/sim/warehouse';
import { simStoreContact } from '@/lib/sim/branding';
import {
  getSimByPhone,
  normalizeSimPhone,
  formatSimDisplay,
  NETWORK_LABELS,
  detectNetwork,
  detectSimTags,
  SIM_TAG_LABELS,
} from '@/lib/sim/catalog';
import { analyzeBoiSim } from '@/lib/fengshui/boi-sim';
import { elementLabel, ASPECT_ORDER, ASPECT_LABELS } from '@/lib/fengshui/bat-cuc';
import { verdictLabel } from '@/lib/fengshui/bat-cuc-contexts';
import { SimScoreRing, VERDICT_COLORS, ELEMENT_BADGE } from '@/components/sim/sim-ui';
import { SimCompareForm } from '@/components/sim/SimCompareForm';
import type { SimListing } from '@/types/database';

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

export async function generateMetadata(): Promise<Metadata> {
  const temple = await getCurrentTemple();
  const brand = temple?.name ? ` | ${temple.name}` : '';
  return {
    title: `So sánh sim phong thủy — đối chiếu điểm Âm Dương Ngũ Hành${brand}`,
    description:
      'Đặt 2–4 số điện thoại cạnh nhau để so sánh điểm phong thủy, ngũ hành, tổng nút, 5 phương diện tài lộc – sự nghiệp – tình cảm – sức khỏe – quý nhân.',
  };
}

interface CompareCol {
  phone: string;
  display: string;
  network: string;
  listing: SimListing | null;
  overallScore: number;
  duNienScore: number;
  verdict: string;
  nut: number;
  element: string;
  soLy81: number;
  aspects: Record<string, number>;
  tags: string[];
}

export default async function SimComparePage({ searchParams }: Props) {
  const temple = await getCurrentTemple();
  if (!temple || !isSimStoreEnabled(temple)) notFound();
  const warehouseId = await getSimWarehouseTempleId();
  if (!warehouseId) notFound();

  const sp = await searchParams;
  const primary = temple.primary_color || LY_GIA.primary;
  const contact = simStoreContact(temple);

  const phones = (sp.so ?? '')
    .split(',')
    .map((p) => normalizeSimPhone(p))
    .filter((p): p is string => Boolean(p))
    .filter((p, i, arr) => arr.indexOf(p) === i)
    .slice(0, 4);

  const cols: CompareCol[] = [];
  for (const phone of phones) {
    const listing = await getSimByPhone(warehouseId, phone);
    if (listing) {
      cols.push({
        phone,
        display: listing.phone_display,
        network: listing.network,
        listing,
        overallScore: listing.overall_score,
        duNienScore: listing.du_nien_score,
        verdict: listing.verdict,
        nut: listing.nut,
        element: listing.element,
        soLy81: listing.so_ly_81,
        aspects: listing.aspects ?? {},
        tags: listing.tags ?? [],
      });
    } else {
      const a = analyzeBoiSim(phone);
      if ('error' in a) continue;
      const aspects: Record<string, number> = {};
      for (const item of a.aspects) aspects[item.id] = item.score;
      cols.push({
        phone,
        display: formatSimDisplay(phone),
        network: detectNetwork(phone),
        listing: null,
        overallScore: a.overallScore,
        duNienScore: a.duNienScore,
        verdict: a.verdict,
        nut: a.tongNut,
        element: a.soLyElement,
        soLy81: a.soLy81,
        aspects,
        tags: detectSimTags(phone),
      });
    }
  }

  const best =
    cols.length >= 2
      ? cols.reduce((a, b) => (b.overallScore > a.overallScore ? b : a))
      : null;

  return (
    <main className="pt-20 pb-24 md:pt-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <nav className="py-4 text-xs text-muted">
          <Link href="/" className="hover:text-ink">Trang chủ</Link>
          <span className="mx-1.5">/</span>
          <Link href="/sim" className="hover:text-ink">Kho sim phong thủy</Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink">So sánh sim</span>
        </nav>

        <h1 className="font-display text-3xl text-ink">So sánh sim phong thủy</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Đặt các dãy số cạnh nhau để thấy rõ khác biệt về điểm nguyên lý Âm Dương Ngũ Hành, Kinh dịch diệu luận,
          ngũ hành, tổng nút và năm phương diện vận số — trước khi quyết định chọn số nào.
        </p>

        <div className="mt-5">
          <SimCompareForm initial={phones} primaryColor={primary} />
        </div>

        {cols.length >= 2 ? (
          <div className="mt-8 overflow-x-auto border border-fog bg-paper">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="bg-mist text-left">
                  <th className="w-40 p-3 text-xs font-medium uppercase tracking-wider text-muted">
                    Tiêu chí
                  </th>
                  {cols.map((c) => (
                    <th key={c.phone} className="p-3">
                      <div className="flex flex-col items-start gap-1">
                        {c.listing ? (
                          <Link
                            href={`/sim/${c.phone}`}
                            className="font-display text-lg text-ink hover:text-lacquer"
                          >
                            {c.display}
                          </Link>
                        ) : (
                          <span className="font-display text-lg text-ink">{c.display}</span>
                        )}
                        {best && best.phone === c.phone ? (
                          <span
                            className="px-1.5 py-0.5 text-[0.62rem] font-semibold text-white"
                            style={{ backgroundColor: primary }}
                          >
                            {contact.roleTitle} khuyên chọn
                          </span>
                        ) : null}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-fog">
                <Row label="Điểm phong thủy">
                  {cols.map((c) => (
                    <td key={c.phone} className="p-3">
                      <SimScoreRing score={c.overallScore} size={48} />
                    </td>
                  ))}
                </Row>
                <Row label="Kết luận">
                  {cols.map((c) => (
                    <td key={c.phone} className="p-3">
                      <span
                        className="font-medium"
                        style={{ color: VERDICT_COLORS[c.verdict] ?? '#333' }}
                      >
                        {verdictLabel(c.verdict as never)}
                      </span>
                    </td>
                  ))}
                </Row>
                <Row label="Du Niên">
                  {cols.map((c) => (
                    <td key={c.phone} className="p-3 tabular-nums">
                      {c.duNienScore}/100
                    </td>
                  ))}
                </Row>
                {ASPECT_ORDER.map((id) => (
                  <Row key={id} label={ASPECT_LABELS[id]}>
                    {cols.map((c) => {
                      const v = Math.max(0, Math.min(100, Number(c.aspects[id] ?? 0)));
                      return (
                        <td key={c.phone} className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-24 bg-fog">
                              <div
                                className="h-full"
                                style={{ width: `${v}%`, backgroundColor: primary }}
                              />
                            </div>
                            <span className="text-xs tabular-nums text-muted">{v}</span>
                          </div>
                        </td>
                      );
                    })}
                  </Row>
                ))}
                <Row label="Ngũ hành sim">
                  {cols.map((c) => {
                    const badge = ELEMENT_BADGE[c.element];
                    return (
                      <td key={c.phone} className="p-3">
                        {badge ? (
                          <span
                            className="px-1.5 py-0.5 text-xs font-medium text-white"
                            style={{ backgroundColor: badge.color }}
                          >
                            {elementLabel(c.element as never)}
                          </span>
                        ) : (
                          elementLabel(c.element as never)
                        )}
                      </td>
                    );
                  })}
                </Row>
                <Row label="Tổng nút">
                  {cols.map((c) => (
                    <td key={c.phone} className="p-3 tabular-nums">
                      {c.nut === 0 ? 10 : c.nut} nút
                    </td>
                  ))}
                </Row>
                <Row label="81 số lý">
                  {cols.map((c) => (
                    <td key={c.phone} className="p-3 tabular-nums">
                      Số {c.soLy81}
                    </td>
                  ))}
                </Row>
                <Row label="Kiểu số">
                  {cols.map((c) => (
                    <td key={c.phone} className="p-3 text-xs text-muted">
                      {c.tags.length > 0
                        ? c.tags.map((t) => SIM_TAG_LABELS[t] ?? t).join(' · ')
                        : '—'}
                    </td>
                  ))}
                </Row>
                <Row label="Nhà mạng">
                  {cols.map((c) => (
                    <td key={c.phone} className="p-3">
                      {NETWORK_LABELS[c.network] ?? c.network}
                    </td>
                  ))}
                </Row>
                <Row label="Giá trong kho">
                  {cols.map((c) => (
                    <td key={c.phone} className="p-3">
                      {c.listing ? (
                        <div>
                          <p className="font-semibold text-lacquer">
                            {formatVnd(c.listing.price_vnd)}
                          </p>
                          {c.listing.status === 'available' ? (
                            <Link
                              href={`/sim/${c.phone}?dat=1`}
                              className="mt-1.5 inline-block px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                              style={{ backgroundColor: primary }}
                            >
                              Đặt mua
                            </Link>
                          ) : (
                            <p className="mt-1 text-[0.68rem] text-muted">Đã bán / giữ chỗ</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-muted">
                          Không có trong kho —{' '}
                          <Link href="/sim" className="underline hover:text-ink">
                            tìm số tương tự
                          </Link>
                        </p>
                      )}
                    </td>
                  ))}
                </Row>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-8 border border-dashed border-fog bg-mist/40 px-6 py-12 text-center">
            <p className="font-display text-xl text-ink">Nhập ít nhất 2 số để so sánh</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              Có thể dán số đang dùng và số định mua — hệ thống chấm điểm cả hai theo
              cùng một thuật toán với công cụ Bói Sim của {contact.role}.
            </p>
          </div>
        )}

        {cols.length >= 2 ? (
          <p className="mt-4 text-[0.7rem] leading-relaxed text-muted">
            Điểm số tính bằng engine Âm Dương Ngũ Hành (cặp quái, tổ hợp chế hóa, đuôi số,
            81 số lý, âm dương, tổng nút). Muốn đối chiếu thêm với ngày giờ sinh, mở trang
            chi tiết từng sim và nhập Bát Tự
            {contact.phoneDisplay
              ? `, hoặc gọi ${contact.phoneDisplay}.`
              : '.'}
          </p>
        ) : null}
      </div>
    </main>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr>
      <td className="p-3 text-xs font-medium text-muted">{label}</td>
      {children}
    </tr>
  );
}
