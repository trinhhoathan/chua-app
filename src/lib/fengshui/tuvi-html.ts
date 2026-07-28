import {
  BRANCH_BOARD_LAYOUT,
  formatCanChi,
  type IztroChartView,
  type IztroHoroscopeView,
  type IztroPalaceView,
  type IztroStarView,
} from '@/lib/fengshui/iztro-chart';

export type TuViShareTemple = {
  name: string;
  address?: string | null;
  hotline?: string | null;
  phone?: string | null;
  zalo?: string | null;
  facebook?: string | null;
};

export type PalaceEssay = { name: string; content: string };
export type ChatEssay = { question: string; answer: string };

export type BuildTuViHtmlOptions = {
  primaryColor: string;
  chart: IztroChartView;
  horoscope: IztroHoroscopeView | null;
  temple: TuViShareTemple;
  chatEssays?: ChatEssay[];
  palaceEssays?: PalaceEssay[];
  includeInterpretation: boolean;
};

export const TUVI_UNLOCK_ORDER_KEY = (templeId: string) =>
  `tuvi-unlock-order:${templeId}`;

export const TUVI_LAST_PAID_ORDER_KEY = 'tuvi-last-paid-order';

export function savePaidOrderCode(orderCode: string, templeId?: string) {
  try {
    localStorage.setItem(TUVI_LAST_PAID_ORDER_KEY, orderCode);
    if (templeId) {
      localStorage.setItem(TUVI_UNLOCK_ORDER_KEY(templeId), orderCode);
    }
  } catch {
    /* ignore */
  }
}

export function getSavedUnlockOrderCode(templeId: string): string {
  try {
    return (
      localStorage.getItem(TUVI_UNLOCK_ORDER_KEY(templeId)) ||
      localStorage.getItem(TUVI_LAST_PAID_ORDER_KEY) ||
      ''
    );
  } catch {
    return '';
  }
}

export function chartSessionKey(chart: {
  fullName: string;
  solarDate: string;
  lunarDate: string;
  time: string;
  chineseDate: string;
}): string {
  return [
    chart.fullName,
    chart.solarDate,
    chart.lunarDate,
    chart.time,
    chart.chineseDate,
  ].join('|');
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function templePlace(name: string) {
  const t = name.trim();
  return /^chùa\b/i.test(t) ? t : `chùa ${t}`;
}

function mutagenColor(mutagen: string): string {
  const map: Record<string, string> = {
    Lộc: '#C44A1F',
    Quyền: '#2F6FE0',
    Khoa: '#1B6B3A',
    Kỵ: '#1A1A1A',
  };
  const key = Object.keys(map).find((k) => mutagen.includes(k));
  return key ? map[key] : '#6B7280';
}

function starHtml(star: IztroStarView): string {
  const bright = star.brightness
    ? `<span class="bright">${esc(star.brightness)}</span>`
    : '';
  const mut = star.mutagen
    ? `<span class="mut" style="background:${mutagenColor(star.mutagen)}">${esc(star.mutagen)}</span>`
    : '';
  return `${esc(star.name)}${bright}${mut}`;
}

function palaceCellHtml(
  palace: IztroPalaceView,
  primaryColor: string,
): string {
  const highlight =
    palace.isSoulPalace || palace.isBodyPalace
      ? ` style="border-color:${primaryColor}"`
      : '';

  const badges = [
    palace.isSoulPalace
      ? `<span class="badge" style="background:${primaryColor}">Mệnh</span>`
      : '',
    palace.isBodyPalace
      ? `<span class="badge badge-outline">Thân</span>`
      : '',
  ]
    .filter(Boolean)
    .join('');

  const majors = palace.majorStars.length
    ? `<ul class="majors">${palace.majorStars
        .map((s) => `<li>${starHtml(s)}</li>`)
        .join('')}</ul>`
    : `<p class="empty">—</p>`;

  const minors = palace.minorStars.length
    ? `<ul class="minors">${palace.minorStars
        .map((s) => `<li>${starHtml(s)}</li>`)
        .join('')}</ul>`
    : '';

  const adjectives = palace.adjectiveStars.length
    ? `<p class="adj">${palace.adjectiveStars.map((s) => esc(s.name)).join(' · ')}</p>`
    : '';

  const rings = [
    palace.changsheng12 && `TS:${palace.changsheng12}`,
    palace.boshi12 && `BS:${palace.boshi12}`,
    palace.jiangqian12 && `TQ:${palace.jiangqian12}`,
    palace.suiqian12 && `Tuế:${palace.suiqian12}`,
  ].filter(Boolean);

  const ringHtml = rings.length
    ? `<p class="rings">${rings.map(esc).join(' · ')}</p>`
    : '';

  const ages = palace.ages.length
    ? `<p class="ages">${palace.ages.map(String).join(' ')}</p>`
    : '';

  return `<div class="palace"${highlight}>
  <div class="palace-head">
    <div>
      <p class="pname" style="color:${primaryColor}">${esc(palace.name)}</p>
      <p class="canchi">${esc(formatCanChi(palace.heavenlyStem, palace.earthlyBranch))}</p>
    </div>
    <div class="badges">${badges}</div>
  </div>
  ${majors}
  ${minors}
  ${adjectives}
  ${ringHtml}
  <div class="palace-foot">
    <p class="dh">ĐH ${palace.decadal.range[0]}–${palace.decadal.range[1]}</p>
    ${ages}
  </div>
</div>`;
}

function centerHtml(
  chart: IztroChartView,
  horoscope: IztroHoroscopeView | null,
  temple: TuViShareTemple,
  primaryColor: string,
): string {
  const phone = temple.hotline || temple.phone;
  const ageLine =
    horoscope?.nominalAge != null
      ? `<p class="meta">Tuổi hư ${horoscope.nominalAge} · thời gian xem ${esc(horoscope.solarDate)} · ${esc(horoscope.timeLabel)}</p>`
      : '';

  const contact = [
    temple.address ? `<p class="meta">${esc(temple.address)}</p>` : '',
    phone ? `<p class="meta">Điện thoại: <strong>${esc(phone)}</strong></p>` : '',
    temple.zalo
      ? `<p class="meta">Zalo: <strong>${esc(temple.zalo.replace(/^https?:\/\/(www\.)?zalo\.me\//i, ''))}</strong></p>`
      : '',
    temple.facebook
      ? `<p class="meta">Facebook: <strong>Fanpage</strong></p>`
      : '',
  ]
    .filter(Boolean)
    .join('');

  return `<div class="center">
  <p class="label" style="color:${primaryColor}">Lá số tử vi</p>
  <p class="name" style="color:${primaryColor}">${esc(chart.fullName)}</p>
  <p class="meta">(${esc(chart.gender)})</p>
  <p class="cuc">${esc(chart.fiveElementsClass)}</p>
  <p class="meta">Chủ ${esc(chart.soul)} · Thân ${esc(chart.body)}</p>
  <p class="pillars">${esc(chart.chineseDate)}</p>
  <p class="meta">DL ${esc(chart.solarDate)} · ÂL ${esc(chart.lunarDate)} · ${esc(chart.time)}</p>
  ${ageLine}
  <div class="temple-box">
    <p class="meta">Lá số được lập tại ${esc(templePlace(temple.name))}</p>
    ${contact}
  </div>
</div>`;
}

function boardHtml(opts: BuildTuViHtmlOptions): string {
  const { chart, horoscope, temple, primaryColor } = opts;
  const byBranch = new Map<string, IztroPalaceView>();
  for (const p of chart.palaces) {
    if (p.earthlyBranch) byBranch.set(p.earthlyBranch, p);
  }

  const cells: string[] = [];
  BRANCH_BOARD_LAYOUT.forEach((row, ri) => {
    row.forEach((branch, ci) => {
      if (!branch) {
        if (ri === 1 && ci === 1) {
          cells.push(centerHtml(chart, horoscope, temple, primaryColor));
        }
        return;
      }
      const palace = byBranch.get(branch);
      if (!palace) {
        cells.push(`<div class="palace empty-cell">${esc(branch)}</div>`);
        return;
      }
      cells.push(palaceCellHtml(palace, primaryColor));
    });
  });

  return `<section class="board-wrap">
  <h2 class="section-title" style="color:${primaryColor}">Bảng lá số 12 cung</h2>
  <div class="board">${cells.join('\n')}</div>
  <p class="legend">ĐH: Đại hạn · TS: Trường Sinh · BS: Bác Sĩ · TQ: Tướng Quân</p>
</section>`;
}

function decadalTableHtml(
  chart: IztroChartView,
  primaryColor: string,
): string {
  const rows = [...chart.palaces]
    .filter((p) => p.index >= 0)
    .sort((a, b) => a.index - b.index)
    .map((p) => {
      const flags = [
        p.isSoulPalace ? ' (Mệnh)' : '',
        p.isBodyPalace ? ' (Thân)' : '',
      ].join('');
      return `<tr>
  <td><strong>${esc(p.name)}${esc(flags)}</strong></td>
  <td>${esc(formatCanChi(p.heavenlyStem, p.earthlyBranch))}</td>
  <td>${p.decadal.range[0]}–${p.decadal.range[1]}</td>
  <td>${p.majorStars.map((s) => esc(s.name)).join(', ') || '—'}</td>
</tr>`;
    })
    .join('\n');

  return `<section class="section">
  <h2 class="section-title" style="color:${primaryColor}">Đại hạn theo cung</h2>
  <table>
    <thead style="background:${primaryColor}14">
      <tr><th>Cung</th><th>Can chi</th><th>Đại hạn</th><th>Chính tinh</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</section>`;
}

function inlineMarkdown(escapedLine: string): string {
  return escapedLine
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}

/** Chuyển markdown luận giải → HTML (đậm, tiêu đề màu, danh sách). */
function markdownToHtml(text: string, primaryColor: string): string {
  const lines = (text || '').replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let inList = false;

  function closeList() {
    if (inList) {
      out.push('</ul>');
      inList = false;
    }
  }

  for (const raw of lines) {
    const line = raw ?? '';
    const trimmed = line.trim();

    if (!trimmed) {
      closeList();
      out.push('<div class="sp"></div>');
      continue;
    }

    const escaped = esc(line);
    const inline = inlineMarkdown(escaped);

    const h3 = trimmed.match(/^###\s+(.+)$/);
    if (h3) {
      closeList();
      out.push(
        `<h4 class="md-h3" style="color:${primaryColor}">${inlineMarkdown(esc(h3[1]))}</h4>`,
      );
      continue;
    }
    const h2 = trimmed.match(/^##\s+(.+)$/);
    if (h2) {
      closeList();
      out.push(
        `<h3 class="md-h2" style="color:${primaryColor}">${inlineMarkdown(esc(h2[1]))}</h3>`,
      );
      continue;
    }
    const h1 = trimmed.match(/^#\s+(.+)$/);
    if (h1) {
      closeList();
      out.push(
        `<h2 class="md-h1" style="color:${primaryColor}">${inlineMarkdown(esc(h1[1]))}</h2>`,
      );
      continue;
    }

    const bullet = trimmed.match(/^[-*•]\s+(.+)$/);
    if (bullet) {
      if (!inList) {
        out.push('<ul class="md-ul">');
        inList = true;
      }
      out.push(`<li>${inlineMarkdown(esc(bullet[1]))}</li>`);
      continue;
    }

    const numbered = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (numbered) {
      closeList();
      out.push(`<p class="md-p md-num">${inline}</p>`);
      continue;
    }

    closeList();
    // Dòng kiểu **Kết luận:** ở đầu đoạn
    out.push(`<p class="md-p">${inlineMarkdown(escaped.trimStart())}</p>`);
  }

  closeList();
  return out.join('\n');
}

function essaysHtml(opts: BuildTuViHtmlOptions): string {
  if (!opts.includeInterpretation) return '';
  const parts: string[] = [];
  const { primaryColor, chatEssays = [], palaceEssays = [] } = opts;

  chatEssays.forEach((essay, i) => {
    parts.push(`<section class="section essay">
  <h2 class="section-title" style="color:${primaryColor}">Luận giải · phần ${i + 1}</h2>
  <p class="q"><strong>Hỏi:</strong> ${esc(essay.question)}</p>
  <div class="a md-body">${markdownToHtml(essay.answer, primaryColor)}</div>
</section>`);
  });

  palaceEssays.forEach((essay) => {
    parts.push(`<section class="section essay">
  <h2 class="section-title" style="color:${primaryColor}">Luận giải chi tiết 12 cung</h2>
  <h3 class="palace-essay-title" style="color:${primaryColor}">Cung ${esc(essay.name)}</h3>
  <div class="a md-body">${markdownToHtml(essay.content, primaryColor)}</div>
</section>`);
  });

  return parts.join('\n');
}

const CSS = `
:root { color-scheme: light; }
* { box-sizing: border-box; }
body {
  margin: 0;
  padding: 24px 16px 48px;
  font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
  background: #f7f5f2;
  color: #1a1a1a;
  line-height: 1.45;
}
.page {
  max-width: 1100px;
  margin: 0 auto;
  background: #fff;
  border: 1px solid #e5e2dc;
  padding: 28px 24px 36px;
}
.cover-label {
  font-size: 11px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  margin: 0 0 8px;
}
.cover h1 {
  font-family: "Segoe UI", system-ui, -apple-system, "Roboto", "Helvetica Neue", sans-serif;
  font-size: 1.65rem;
  font-weight: 700;
  margin: 0 0 10px;
  letter-spacing: -0.01em;
  line-height: 1.25;
}
.cover .who {
  font-family: "Segoe UI", system-ui, -apple-system, "Roboto", "Helvetica Neue", sans-serif;
  font-size: 1.85rem;
  font-weight: 800;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  line-height: 1.2;
}
.cover .meta { color: #666; margin: 6px 0 0; font-size: 0.9rem; }
.info {
  margin-top: 20px;
  border: 1px solid #eceae6;
  padding: 4px 14px;
}
.info-row {
  display: flex;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0eeea;
  font-size: 13px;
}
.info-row:last-child { border-bottom: 0; }
.info-row span { width: 120px; flex-shrink: 0; color: #777; }
.info-row strong { font-weight: 600; }
.note { margin-top: 18px; font-size: 12px; color: #777; }
.section { margin-top: 28px; }
.section-title {
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  margin: 0 0 12px;
}
.board-wrap { margin-top: 28px; }
.board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, minmax(160px, auto));
  gap: 4px;
  border: 1px solid #e5e2dc;
  padding: 6px;
  background: #fff;
}
.palace {
  border: 1px solid #e5e2dc;
  background: #faf9f7;
  padding: 8px;
  display: flex;
  flex-direction: column;
  min-height: 160px;
  font-size: 11px;
}
.palace-head {
  display: flex;
  justify-content: space-between;
  gap: 4px;
  align-items: flex-start;
}
.pname {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.canchi {
  margin: 1px 0 0;
  font-size: 10px;
  font-style: italic;
  color: #777;
}
.badges { display: flex; flex-direction: column; gap: 2px; align-items: flex-end; }
.badge {
  font-size: 9px;
  text-transform: uppercase;
  color: #fff;
  padding: 1px 5px;
  line-height: 1.3;
}
.badge-outline {
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
}
.majors, .minors { list-style: none; margin: 8px 0 0; padding: 0; }
.majors li {
  font-size: 11px;
  font-weight: 600;
  line-height: 1.35;
  margin: 0;
}
.minors li {
  font-size: 10px;
  color: #333;
  line-height: 1.35;
  margin: 0;
}
.bright { margin-left: 3px; font-style: italic; font-weight: 400; color: #777; font-size: 0.92em; }
.mut {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  min-width: 1.9rem;
  height: 0.95rem;
  padding: 0 3px;
  font-size: 9px;
  font-weight: 600;
  color: #fff;
  vertical-align: middle;
}
.adj { margin: 6px 0 0; font-size: 10px; color: #777; line-height: 1.35; }
.rings { margin: 8px 0 0; font-size: 10px; color: #888; line-height: 1.35; }
.palace-foot { margin-top: auto; padding-top: 8px; }
.dh { margin: 0; font-size: 10px; color: #777; }
.ages { margin: 2px 0 0; font-size: 9.5px; color: #888; font-variant-numeric: tabular-nums; word-break: break-word; }
.empty { margin: 8px 0 0; color: #999; }
.center {
  grid-column: 2 / 4;
  grid-row: 2 / 4;
  border: 1px solid #e5e2dc;
  background: #f7f4ef;
  padding: 14px 12px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.center .label {
  margin: 0;
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
.center .name {
  margin: 6px 0 0;
  font-family: "Segoe UI", system-ui, -apple-system, "Roboto", "Helvetica Neue", sans-serif;
  font-size: 1.35rem;
  font-weight: 800;
  line-height: 1.2;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
.center .cuc { margin: 8px 0 0; font-size: 12px; font-weight: 500; }
.center .pillars { margin: 8px 0 0; font-size: 11px; font-weight: 600; }
.center .meta { margin: 3px 0 0; font-size: 10px; color: #666; }
.temple-box {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid #e5e2dc;
  width: 100%;
}
.temple-box .meta { font-size: 9.5px; }
.legend { margin: 10px 0 0; font-size: 11px; color: #888; }
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
th, td {
  border: 1px solid #e5e2dc;
  padding: 6px 8px;
  text-align: left;
  vertical-align: top;
}
.essay h3, .palace-essay-title { margin: 0 0 10px; font-size: 1.15rem; font-weight: 700; }
.essay .q { margin: 0 0 12px; font-size: 13px; color: #444; }
.essay .a, .md-body { font-size: 13.5px; line-height: 1.6; color: #2a2a2a; }
.md-body .md-h1 {
  margin: 1.1em 0 0.45em;
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.35;
}
.md-body .md-h2 {
  margin: 1em 0 0.4em;
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.35;
}
.md-body .md-h3 {
  margin: 0.95em 0 0.35em;
  font-size: 0.98rem;
  font-weight: 700;
  line-height: 1.35;
}
.md-body .md-p {
  margin: 0.35em 0;
}
.md-body .md-num { padding-left: 0.15em; }
.md-body .sp { height: 0.55em; }
.md-body .md-ul {
  margin: 0.35em 0 0.55em;
  padding-left: 1.15em;
  list-style: disc;
}
.md-body .md-ul li {
  margin: 0.2em 0;
  padding-left: 0.15em;
}
.md-body strong {
  font-weight: 700;
  color: #111;
}
.md-body em {
  font-style: italic;
  color: #444;
}
.md-body code {
  font-family: ui-monospace, Consolas, monospace;
  font-size: 0.92em;
  background: #f3f1ec;
  padding: 0.05em 0.3em;
}
.footer {
  margin-top: 28px;
  padding-top: 12px;
  border-top: 1px solid #eceae6;
  font-size: 11px;
  color: #777;
}
@media print {
  body { background: #fff; padding: 0; }
  .page { border: 0; max-width: none; }
  .board { break-inside: avoid; }
}
@media (max-width: 800px) {
  .board {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: none;
  }
  .center {
    grid-column: 1 / -1;
    grid-row: auto;
    order: -1;
  }
  .palace { min-height: 0; }
}
`;

function coverHtml(opts: BuildTuViHtmlOptions): string {
  const { chart, horoscope, temple, primaryColor } = opts;
  const rows: [string, string][] = [
    ['Phương pháp', chart.yearDivideLabel],
    ['Dương lịch', chart.solarDate],
    ['Âm lịch', chart.lunarDate],
    ['Tứ trụ', chart.chineseDate],
    ['Giờ sinh', `${chart.time} · ${chart.timeRange}`],
    ['Ngũ hành cục', chart.fiveElementsClass],
    ['Chủ mệnh / thân', `${chart.soul} · ${chart.body}`],
    ['Con giáp', `${chart.zodiac} · ${chart.sign}`],
  ];
  if (horoscope) {
    rows.push([
      'Thời gian xem',
      `${horoscope.solarDate} · ${horoscope.timeLabel}${
        horoscope.nominalAge != null
          ? ` · tuổi hư ${horoscope.nominalAge}`
          : ''
      }`,
    ]);
  }

  return `<header class="cover">
  <p class="cover-label" style="color:${primaryColor}">${esc(templePlace(temple.name))}</p>
  <h1>Lá số Tử Vi Đẩu Số</h1>
  <p class="who" style="color:${primaryColor}">${esc(chart.fullName)}</p>
  <p class="meta">(${esc(chart.gender)})</p>
  <div class="info">
    ${rows
      .map(
        ([k, v]) =>
          `<div class="info-row"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`,
      )
      .join('')}
  </div>
  <p class="note">Tài liệu tham khảo theo Tử Vi Đẩu Số, lập tại ${esc(templePlace(temple.name))}. Kết quả mang tính tham khảo — đại sự nên tham vấn trực tiếp trụ trì.</p>
</header>`;
}

function footerHtml(temple: TuViShareTemple): string {
  const phone = temple.hotline || temple.phone;
  const bits = [
    phone ? `ĐT: ${phone}` : '',
    temple.zalo ? `Zalo: ${temple.zalo}` : '',
    temple.facebook ? 'Facebook: Fanpage' : '',
  ].filter(Boolean);
  return `<footer class="footer">
  <p>Lá số được lập tại ${esc(templePlace(temple.name))}${
    temple.address ? ` · ${esc(temple.address)}` : ''
  }</p>
  ${bits.length ? `<p>${esc(bits.join(' · '))}</p>` : ''}
</footer>`;
}

/** Tạo file HTML tự chứa (inline CSS), mở được offline. */
export function buildTuViHtmlDocument(opts: BuildTuViHtmlOptions): string {
  const title = `Lá số tử vi — ${opts.chart.fullName}`;
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${esc(title)}</title>
<style>${CSS}</style>
</head>
<body>
<main class="page">
${coverHtml(opts)}
${boardHtml(opts)}
${decadalTableHtml(opts.chart, opts.primaryColor)}
${essaysHtml(opts)}
${footerHtml(opts.temple)}
</main>
</body>
</html>`;
}

/** Chia sẻ / tải file .html */
export async function exportTuViHtml(
  html: string,
  fileName: string,
): Promise<'shared' | 'downloaded'> {
  const safeName =
    fileName.replace(/[^\w\-À-ỹ ]+/gi, '').trim() || 'la-so-tu-vi';
  const fullName = `${safeName}.html`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const file = new File([blob], fullName, { type: 'text/html' });

  const nav = typeof navigator !== 'undefined' ? navigator : null;
  if (
    nav &&
    typeof nav.share === 'function' &&
    (!nav.canShare || nav.canShare({ files: [file] }))
  ) {
    try {
      await nav.share({
        files: [file],
        title: fullName,
        text: 'Lá số tử vi',
      });
      return 'shared';
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'downloaded';
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fullName;
  a.click();
  URL.revokeObjectURL(url);
  return 'downloaded';
}
