'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  bulkAssignSimSourceAction,
  bulkUpdateSimPriceAction,
  createSimAction,
  deleteSimAction,
  endFlashSaleAction,
  exportSimsCsvAction,
  importSimsAction,
  listSimSourcesAction,
  listSimsAdminAction,
  seedDemoSimsAction,
  startFlashSaleAction,
  updateSimAction,
  upsertSimSourceAction,
  type ImportSimRow,
} from '@/app/actions/sim-admin';
import { SIM_TAG_LABELS, NETWORK_LABELS } from '@/lib/sim/catalog';
import { verdictLabel } from '@/lib/fengshui/bat-cuc-contexts';
import { simQueBadge } from '@/lib/fengshui/sim-kinh-dich';
import {
  SIM_STATUS_LABELS,
  type SimListing,
  type SimSource,
  type SimStatus,
} from '@/types/database';

const PAGE_SIZE = 50;

function formatVnd(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(n);
}

function parsePriceInput(raw: string): number | null {
  const cleaned = raw.replace(/[^\d.,]/g, '').replace(/[.,]/g, '');
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** Parse dán tay: mỗi dòng `số[,giá[,giá gạch]]` hoặc tab. */
function parsePastedRows(text: string): ImportSimRow[] {
  const rows: ImportSimRow[] = [];
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    const parts = t.split(/[,;\t|]+/).map((p) => p.trim());
    const phone = parts[0];
    if (!phone) continue;
    rows.push({
      phone,
      priceVnd: parts[1] ? (parsePriceInput(parts[1]) ?? undefined) : undefined,
      originalPriceVnd: parts[2]
        ? (parsePriceInput(parts[2]) ?? undefined)
        : undefined,
    });
  }
  return rows;
}

type Tab = 'kho' | 'them' | 'import' | 'nguon';

export function SimAdminPanel({
  templeId,
  initialSims,
  initialTotal,
  initialSources,
}: {
  templeId: string;
  initialSims: SimListing[];
  initialTotal: number;
  initialSources: SimSource[];
}) {
  const [tab, setTab] = useState<Tab>('kho');
  const [sims, setSims] = useState<SimListing[]>(initialSims);
  const [total, setTotal] = useState(initialTotal);
  const [sources, setSources] = useState<SimSource[]>(initialSources);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkSourceId, setBulkSourceId] = useState('');

  const activeSources = useMemo(
    () => sources.filter((s) => s.active),
    [sources],
  );
  const sourceById = useMemo(() => {
    const m = new Map<string, SimSource>();
    for (const s of sources) m.set(s.id, s);
    return m;
  }, [sources]);

  const notify = useCallback((kind: 'ok' | 'err', text: string) => {
    setMessage({ kind, text });
    window.setTimeout(() => setMessage(null), 6000);
  }, []);

  const reloadSources = useCallback(async () => {
    const res = await listSimSourcesAction({
      templeId,
      includeInactive: true,
    });
    if (res.ok && res.sources) setSources(res.sources);
  }, [templeId]);

  const reload = useCallback(
    async (opts?: {
      page?: number;
      q?: string;
      status?: string;
      sourceId?: string;
    }) => {
      const p = opts?.page ?? page;
      const res = await listSimsAdminAction({
        templeId,
        q: opts?.q ?? q,
        status: opts?.status ?? statusFilter,
        sourceId: opts?.sourceId ?? sourceFilter,
        page: p,
        pageSize: PAGE_SIZE,
      });
      if (res.ok && res.sims) {
        setSims(res.sims);
        setTotal(res.total ?? 0);
        setPage(p);
        setSelected(new Set());
      } else if (res.error) {
        notify('err', res.error);
      }
    },
    [templeId, page, q, statusFilter, sourceFilter, notify],
  );

  /* ---------------- Thêm 1 sim ---------------- */
  const [newPhone, setNewPhone] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newOriginal, setNewOriginal] = useState('');
  const [newFeatured, setNewFeatured] = useState(false);
  const [newSourceId, setNewSourceId] = useState(
    () => initialSources.find((s) => s.active)?.id ?? '',
  );
  const [importSourceId, setImportSourceId] = useState(
    () => initialSources.find((s) => s.active)?.id ?? '',
  );

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await createSimAction({
      templeId,
      phone: newPhone,
      priceVnd: parsePriceInput(newPrice) ?? undefined,
      originalPriceVnd: parsePriceInput(newOriginal),
      featured: newFeatured,
      sourceId: newSourceId || null,
    });
    setBusy(false);
    if (res.ok) {
      notify('ok', `Đã thêm sim ${newPhone} (tự chấm điểm xong).`);
      setNewPhone('');
      setNewPrice('');
      setNewOriginal('');
      setNewFeatured(false);
      setTab('kho');
      await reload({ page: 1 });
    } else {
      notify('err', res.error);
    }
  }

  /* ---------------- Seed 100 sim mẫu ---------------- */
  async function seedDemo() {
    if (!window.confirm('Tạo 100 sim mẫu ngẫu nhiên (đuôi đẹp, đã chấm điểm + định giá)?')) return;
    setBusy(true);
    const res = await seedDemoSimsAction({ templeId, count: 100 });
    setBusy(false);
    if (res.ok) {
      notify('ok', `Đã tạo ${res.inserted} sim mẫu.`);
      await reload({ page: 1 });
    } else {
      notify('err', res.error ?? 'Không tạo được sim mẫu.');
    }
  }

  /* ---------------- Xuất Excel ---------------- */
  async function exportExcel() {
    setBusy(true);
    try {
      const res = await exportSimsCsvAction({ templeId, status: statusFilter });
      if (!res.ok || !res.csv) {
        notify('err', res.error ?? 'Không xuất được kho sim.');
        return;
      }
      const XLSX = await import('xlsx');
      const parsed = XLSX.read(res.csv, { type: 'string', raw: true });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, parsed.Sheets[parsed.SheetNames[0]], 'Kho sim');
      const stamp = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `kho-sim-${stamp}.xlsx`);
      notify('ok', `Đã xuất ${res.count ?? 0} sim ra Excel.`);
    } catch {
      notify('err', 'Không xuất được file Excel.');
    } finally {
      setBusy(false);
    }
  }

  /* ---------------- Import ---------------- */
  const [pasteText, setPasteText] = useState('');
  const [importPreview, setImportPreview] = useState<ImportSimRow[]>([]);
  const [importSkipped, setImportSkipped] = useState<string[]>([]);

  function previewPaste() {
    const rows = parsePastedRows(pasteText);
    setImportPreview(rows);
    setImportSkipped([]);
    if (rows.length === 0) notify('err', 'Không đọc được dòng nào.');
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const XLSX = await import('xlsx');
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json<Array<string | number>>(ws, {
        header: 1,
        raw: false,
      });
      const rows: ImportSimRow[] = [];
      for (const line of raw) {
        if (!Array.isArray(line) || line.length === 0) continue;
        const phone = String(line[0] ?? '').trim();
        if (!phone || /số|sim|phone|stt/i.test(phone)) continue; // bỏ header
        rows.push({
          phone,
          priceVnd: line[1] != null ? (parsePriceInput(String(line[1])) ?? undefined) : undefined,
          originalPriceVnd:
            line[2] != null ? (parsePriceInput(String(line[2])) ?? undefined) : undefined,
        });
      }
      setImportPreview(rows);
      setImportSkipped([]);
      if (rows.length === 0) notify('err', 'File không có dòng dữ liệu hợp lệ.');
    } catch {
      notify('err', 'Không đọc được file. Hỗ trợ .xlsx, .xls, .csv.');
    }
  }

  async function runImport() {
    if (importPreview.length === 0) return;
    setBusy(true);
    const res = await importSimsAction({
      templeId,
      rows: importPreview,
      sourceId: importSourceId || null,
    });
    setBusy(false);
    if (res.ok) {
      notify('ok', `Đã import ${res.inserted} sim. Bỏ qua ${res.skipped?.length ?? 0} dòng.`);
      setImportPreview([]);
      setImportSkipped(res.skipped ?? []);
      setPasteText('');
      setTab('kho');
      await reload({ page: 1 });
    } else {
      notify('err', res.error ?? 'Import thất bại.');
      setImportSkipped(res.skipped ?? []);
    }
  }

  /* ---------------- Sửa inline ---------------- */
  async function saveField(sim: SimListing, patch: Parameters<typeof updateSimAction>[0]) {
    const res = await updateSimAction({ ...patch, id: sim.id, templeId });
    if (res.ok) {
      await reload();
    } else {
      notify('err', res.error);
    }
  }

  async function removeSim(sim: SimListing) {
    if (!window.confirm(`Xóa sim ${sim.phone_display} khỏi kho?`)) return;
    const res = await deleteSimAction({ id: sim.id, templeId });
    if (res.ok) {
      notify('ok', `Đã xóa ${sim.phone_display}.`);
      await reload();
    } else {
      notify('err', res.error);
    }
  }

  /* ---------------- Sửa giá hàng loạt ---------------- */
  const [bulkMode, setBulkMode] = useState<'percent' | 'amount' | 'set'>('percent');
  const [bulkValue, setBulkValue] = useState('');

  async function applyBulk() {
    const value = Number(bulkValue.replace(/[^\d\-.,]/g, '').replace(/,/g, ''));
    if (!Number.isFinite(value)) {
      notify('err', 'Nhập giá trị số hợp lệ.');
      return;
    }
    setBusy(true);
    const res = await bulkUpdateSimPriceAction({
      templeId,
      ids: [...selected],
      mode: bulkMode,
      value,
    });
    setBusy(false);
    if (res.ok) {
      notify('ok', `Đã cập nhật giá ${res.updated} sim.`);
      setBulkValue('');
      await reload();
    } else {
      notify('err', res.error ?? 'Không cập nhật được.');
    }
  }

  /* ---------------- Flash sale ---------------- */
  const [salePercent, setSalePercent] = useState('');
  const [saleHours, setSaleHours] = useState('24');

  async function applyFlashSale() {
    const percent = Number(salePercent.replace(/[^\d]/g, ''));
    const hours = Number(saleHours.replace(/[^\d]/g, ''));
    if (!percent || percent < 1 || percent > 90) {
      notify('err', 'Nhập % giảm từ 1 đến 90.');
      return;
    }
    if (!hours || hours < 1) {
      notify('err', 'Nhập số giờ đếm ngược (≥ 1).');
      return;
    }
    setBusy(true);
    const res = await startFlashSaleAction({
      templeId,
      ids: [...selected],
      percentOff: percent,
      hours,
    });
    setBusy(false);
    if (res.ok) {
      notify('ok', `Đã bật flash sale -${percent}% trong ${hours} giờ cho ${res.updated} sim.`);
      await reload();
    } else {
      notify('err', res.error ?? 'Không bật được flash sale.');
    }
  }

  async function clearFlashSale() {
    setBusy(true);
    const res = await endFlashSaleAction({ templeId, ids: [...selected] });
    setBusy(false);
    if (res.ok) {
      notify('ok', `Đã kết thúc sale, khôi phục giá gốc cho ${res.updated} sim.`);
      await reload();
    } else {
      notify('err', res.error ?? 'Không kết thúc được sale.');
    }
  }

  async function applyBulkSource() {
    setBusy(true);
    const res = await bulkAssignSimSourceAction({
      templeId,
      ids: [...selected],
      sourceId: bulkSourceId || null,
    });
    setBusy(false);
    if (res.ok) {
      const label =
        bulkSourceId === ''
          ? 'Chưa gán kho'
          : (sourceById.get(bulkSourceId)?.name ?? 'kho đã chọn');
      notify('ok', `Đã gán kho “${label}” cho ${res.updated} sim.`);
      await reload();
    } else {
      notify('err', res.error ?? 'Không gán được kho sim.');
    }
  }

  /* ---------------- Nguồn kho sim ---------------- */
  const [srcName, setSrcName] = useState('');
  const [srcContactName, setSrcContactName] = useState('');
  const [srcContactPhone, setSrcContactPhone] = useState('');
  const [srcNote, setSrcNote] = useState('');
  const [srcCommission, setSrcCommission] = useState('30');
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);

  function startEditSource(s: SimSource) {
    setEditingSourceId(s.id);
    setSrcName(s.name);
    setSrcContactName(s.contact_name ?? '');
    setSrcContactPhone(s.contact_phone ?? '');
    setSrcNote(s.contact_note ?? '');
    setSrcCommission(String(s.commission_percent ?? 30));
    setTab('nguon');
  }

  function resetSourceForm() {
    setEditingSourceId(null);
    setSrcName('');
    setSrcContactName('');
    setSrcContactPhone('');
    setSrcNote('');
    setSrcCommission('30');
  }

  async function submitSource(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await upsertSimSourceAction({
      templeId,
      id: editingSourceId ?? undefined,
      name: srcName,
      contactName: srcContactName,
      contactPhone: srcContactPhone,
      contactNote: srcNote,
      commissionPercent: Number(srcCommission) || 30,
      active: true,
    });
    setBusy(false);
    if (res.ok) {
      notify(
        'ok',
        editingSourceId
          ? `Đã cập nhật kho “${srcName}”.`
          : `Đã thêm kho “${srcName}”.`,
      );
      resetSourceForm();
      await reloadSources();
      if (!newSourceId && res.source) setNewSourceId(res.source.id);
      if (!importSourceId && res.source) setImportSourceId(res.source.id);
    } else {
      notify('err', res.error);
    }
  }

  async function toggleSourceActive(s: SimSource) {
    setBusy(true);
    const res = await upsertSimSourceAction({
      templeId,
      id: s.id,
      name: s.name,
      contactName: s.contact_name ?? '',
      contactPhone: s.contact_phone ?? '',
      contactNote: s.contact_note ?? '',
      commissionPercent: Number(s.commission_percent) || 30,
      active: !s.active,
    });
    setBusy(false);
    if (res.ok) {
      notify('ok', s.active ? `Đã ẩn kho “${s.name}”.` : `Đã bật lại kho “${s.name}”.`);
      await reloadSources();
    } else {
      notify('err', res.error);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const allChecked = sims.length > 0 && sims.every((s) => selected.has(s.id));

  const inputCls =
    'h-9 border border-fog bg-white px-2.5 text-sm text-ink outline-none focus:border-lacquer';

  const tabs = useMemo(
    () => [
      { id: 'kho' as Tab, label: `Kho sim (${total})` },
      { id: 'them' as Tab, label: '+ Thêm 1 sim' },
      { id: 'import' as Tab, label: 'Import hàng loạt' },
      { id: 'nguon' as Tab, label: `Kho nguồn (${sources.length})` },
    ],
    [total, sources.length],
  );

  return (
    <div>
      {message ? (
        <div
          className={`mb-4 border px-4 py-2.5 text-sm ${
            message.kind === 'ok'
              ? 'border-green-300 bg-green-50 text-green-800'
              : 'border-red-300 bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-fog">
        <div className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`border-b-2 px-4 py-2.5 text-sm ${
                tab === t.id
                  ? 'border-lacquer font-medium text-ink'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={exportExcel}
            disabled={busy}
            className="mb-1 border border-fog px-3 py-1.5 text-xs text-ink hover:border-ink/40 disabled:opacity-50"
          >
            Xuất Excel
          </button>
          <button
            type="button"
            onClick={seedDemo}
            disabled={busy}
            className="mb-1 border border-dashed border-lacquer/50 px-3 py-1.5 text-xs text-lacquer hover:bg-lacquer hover:text-white disabled:opacity-50"
          >
            {busy ? 'Đang xử lý…' : 'Tạo 100 sim mẫu'}
          </button>
        </div>
      </div>

      {/* ============ TAB KHO ============ */}
      {tab === 'kho' ? (
        <div className="mt-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void reload({ page: 1 });
            }}
            className="flex flex-wrap gap-2"
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm số: 6868 hoặc 090*8888"
              className={`${inputCls} w-56`}
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                void reload({ page: 1, status: e.target.value });
              }}
              className={inputCls}
            >
              <option value="">Mọi trạng thái</option>
              {Object.entries(SIM_STATUS_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                void reload({ page: 1, sourceId: e.target.value });
              }}
              className={inputCls}
            >
              <option value="">Mọi kho sim</option>
              <option value="__none__">Chưa gán kho</option>
              {sources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {!s.active ? ' (ẩn)' : ''} · HH {Number(s.commission_percent)}%
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="h-9 bg-lacquer px-4 text-sm text-white hover:opacity-90"
            >
              Lọc
            </button>
          </form>

          {selected.size > 0 ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 border border-lacquer/40 bg-lacquer/5 px-3 py-2 text-sm">
              <span className="font-medium text-ink">{selected.size} sim đã chọn</span>
              <select
                value={bulkMode}
                onChange={(e) => setBulkMode(e.target.value as typeof bulkMode)}
                className={inputCls}
              >
                <option value="percent">± % giá</option>
                <option value="amount">± số tiền (đ)</option>
                <option value="set">Đặt giá mới (đ)</option>
              </select>
              <input
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                placeholder={bulkMode === 'percent' ? 'VD: -10 hoặc 15' : 'VD: 500000'}
                className={`${inputCls} w-36`}
              />
              <button
                type="button"
                onClick={applyBulk}
                disabled={busy}
                className="h-9 bg-lacquer px-4 text-sm text-white hover:opacity-90 disabled:opacity-50"
              >
                Áp dụng
              </button>
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="text-xs text-muted underline"
              >
                Bỏ chọn
              </button>

              <span className="mx-1 hidden h-5 w-px bg-lacquer/30 sm:block" />

              <span className="text-xs font-medium text-[#C44A1F]">Flash sale:</span>
              <input
                value={salePercent}
                onChange={(e) => setSalePercent(e.target.value)}
                placeholder="Giảm %"
                className={`${inputCls} w-20`}
              />
              <input
                value={saleHours}
                onChange={(e) => setSaleHours(e.target.value)}
                placeholder="Số giờ"
                className={`${inputCls} w-20`}
              />
              <button
                type="button"
                onClick={applyFlashSale}
                disabled={busy}
                className="h-9 bg-[#C44A1F] px-3 text-sm text-white hover:opacity-90 disabled:opacity-50"
              >
                Bật sale
              </button>
              <button
                type="button"
                onClick={clearFlashSale}
                disabled={busy}
                className="h-9 border border-[#C44A1F]/50 px-3 text-sm text-[#C44A1F] hover:bg-[#C44A1F]/10 disabled:opacity-50"
              >
                Kết thúc sale
              </button>

              <span className="mx-1 hidden h-5 w-px bg-lacquer/30 sm:block" />

              <span className="text-xs font-medium text-ink">Gán kho sim:</span>
              <select
                value={bulkSourceId}
                onChange={(e) => setBulkSourceId(e.target.value)}
                className={inputCls}
              >
                <option value="">Chưa gán kho</option>
                {activeSources.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · HH {Number(s.commission_percent)}%
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={applyBulkSource}
                disabled={busy}
                className="h-9 border border-ink/20 px-3 text-sm text-ink hover:bg-mist disabled:opacity-50"
              >
                Gán kho sim
              </button>
            </div>
          ) : null}

          <div className="mt-3 overflow-x-auto border border-fog bg-paper">
            <table className="w-full text-sm">
              <thead className="bg-mist text-left text-muted">
                <tr>
                  <th className="p-2.5">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      onChange={(e) => {
                        setSelected(
                          e.target.checked ? new Set(sims.map((s) => s.id)) : new Set(),
                        );
                      }}
                    />
                  </th>
                  <th className="p-2.5">Số sim</th>
                  <th className="p-2.5">Kho sim</th>
                  <th className="p-2.5">Mạng / Kiểu</th>
                  <th className="p-2.5 text-center">Điểm PT</th>
                  <th className="p-2.5">Quẻ dịch</th>
                  <th className="p-2.5 text-right">Giá bán</th>
                  <th className="p-2.5 text-right">Giá gạch</th>
                  <th className="p-2.5">Trạng thái</th>
                  <th className="p-2.5 text-center">Nổi bật</th>
                  <th className="p-2.5" />
                </tr>
              </thead>
              <tbody>
                {sims.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-muted">
                      Kho trống — bấm &ldquo;Tạo 100 sim mẫu&rdquo; hoặc import số thật.
                    </td>
                  </tr>
                ) : (
                  sims.map((sim) => (
                    <SimRow
                      key={sim.id}
                      sim={sim}
                      sources={activeSources}
                      source={sim.source_id ? sourceById.get(sim.source_id) : undefined}
                      checked={selected.has(sim.id)}
                      onCheck={(v) => {
                        setSelected((cur) => {
                          const next = new Set(cur);
                          if (v) next.add(sim.id);
                          else next.delete(sim.id);
                          return next;
                        });
                      }}
                      onSave={saveField}
                      onDelete={() => removeSim(sim)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 ? (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => void reload({ page: page - 1 })}
                className="border border-fog px-3 py-1.5 disabled:opacity-40"
              >
                ← Trước
              </button>
              <span className="text-muted">
                Trang {page}/{totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => void reload({ page: page + 1 })}
                className="border border-fog px-3 py-1.5 disabled:opacity-40"
              >
                Sau →
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ============ TAB THÊM 1 SIM ============ */}
      {tab === 'them' ? (
        <form onSubmit={submitCreate} className="mt-5 max-w-lg space-y-4 border border-fog bg-paper p-5">
          <label className="block">
            <span className="mb-1 block text-xs text-muted">Số điện thoại *</span>
            <input
              required
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="0912345678"
              inputMode="tel"
              className={`${inputCls} w-full`}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs text-muted">
                Giá bán (đ) — bỏ trống để hệ thống định giá
              </span>
              <input
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="Tự định giá"
                className={`${inputCls} w-full`}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-muted">Giá gạch (đ)</span>
              <input
                value={newOriginal}
                onChange={(e) => setNewOriginal(e.target.value)}
                placeholder="Không bắt buộc"
                className={`${inputCls} w-full`}
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs text-muted">Kho sim</span>
            <select
              value={newSourceId}
              onChange={(e) => setNewSourceId(e.target.value)}
              className={`${inputCls} w-full`}
            >
              <option value="">Chưa gán kho</option>
              {activeSources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · HH {Number(s.commission_percent)}%
                  {s.contact_phone ? ` · ${s.contact_phone}` : ''}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={newFeatured}
              onChange={(e) => setNewFeatured(e.target.checked)}
            />
            Đánh dấu &ldquo;Thầy tuyển&rdquo; (hiện ở trang chủ)
          </label>
          <button
            type="submit"
            disabled={busy}
            className="bg-lacquer px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {busy ? 'Đang chấm điểm…' : 'Thêm vào kho (tự chấm điểm)'}
          </button>
        </form>
      ) : null}

      {/* ============ TAB IMPORT ============ */}
      {tab === 'import' ? (
        <div className="mt-5 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="border border-fog bg-paper p-5">
              <p className="text-sm font-medium text-ink">Dán danh sách</p>
              <p className="mt-1 text-xs text-muted">
                Mỗi dòng: <span className="font-mono">số[,giá[,giá gạch]]</span> — ví dụ{' '}
                <span className="font-mono">0912345678,2500000,3200000</span>
              </p>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={8}
                className="mt-2 w-full border border-fog bg-white p-2.5 font-mono text-xs text-ink outline-none focus:border-lacquer"
                placeholder={'0912345678,2500000\n0987654321\n0909090909,5000000,6500000'}
              />
              <button
                type="button"
                onClick={previewPaste}
                className="mt-2 border border-lacquer px-4 py-2 text-xs text-lacquer hover:bg-lacquer hover:text-white"
              >
                Xem trước
              </button>
            </div>

            <div className="border border-fog bg-paper p-5">
              <p className="text-sm font-medium text-ink">Hoặc tải file Excel / CSV</p>
              <p className="mt-1 text-xs text-muted">
                Cột A: số sim · Cột B: giá bán (tùy chọn) · Cột C: giá gạch (tùy chọn).
                Dòng tiêu đề sẽ tự bỏ qua.
              </p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={onFileChange}
                className="mt-3 block w-full text-xs text-muted file:mr-3 file:border file:border-fog file:bg-mist file:px-3 file:py-2 file:text-xs file:text-ink"
              />
              <p className="mt-4 text-xs leading-relaxed text-muted">
                Khi import, từng số được chuẩn hóa, chấm điểm Âm Dương Ngũ Hành, phân loại kiểu số
                và định giá tự động nếu bỏ trống giá. Số trùng kho sẽ bỏ qua.
              </p>
            </div>
          </div>

          {importPreview.length > 0 ? (
            <div className="border border-fog bg-paper p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm text-ink">
                    <span className="font-semibold">{importPreview.length}</span> dòng sẵn
                    sàng import
                  </p>
                  <select
                    value={importSourceId}
                    onChange={(e) => setImportSourceId(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Chưa gán kho</option>
                    {activeSources.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} · HH {Number(s.commission_percent)}%
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={runImport}
                  disabled={busy}
                  className="bg-lacquer px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {busy ? 'Đang import + chấm điểm…' : `Import ${importPreview.length} số`}
                </button>
              </div>
              <div className="mt-3 max-h-56 overflow-y-auto border border-fog">
                <table className="w-full text-xs">
                  <thead className="bg-mist text-left text-muted">
                    <tr>
                      <th className="p-2">Số</th>
                      <th className="p-2 text-right">Giá</th>
                      <th className="p-2 text-right">Giá gạch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importPreview.slice(0, 200).map((r, i) => (
                      <tr key={i} className="border-t border-fog">
                        <td className="p-2 font-mono">{r.phone}</td>
                        <td className="p-2 text-right">
                          {r.priceVnd ? formatVnd(r.priceVnd) : <span className="text-muted">tự định giá</span>}
                        </td>
                        <td className="p-2 text-right">
                          {r.originalPriceVnd ? formatVnd(r.originalPriceVnd) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {importSkipped.length > 0 ? (
            <div className="border border-amber-300 bg-amber-50 p-4 text-xs text-amber-800">
              <p className="font-medium">Các dòng bị bỏ qua ({importSkipped.length}):</p>
              <p className="mt-1 leading-relaxed">{importSkipped.slice(0, 30).join(' · ')}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ============ TAB NGUỒN KHO SIM ============ */}
      {tab === 'nguon' ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <form onSubmit={submitSource} className="space-y-3 border border-fog bg-paper p-5">
            <p className="text-sm font-medium text-ink">
              {editingSourceId ? 'Sửa kho sim' : 'Thêm kho sim'}
            </p>
            <p className="text-xs text-muted">
              Mỗi kho sim là một nơi lấy hàng (VD: simkinhdich.com). Lưu SĐT liên hệ để biết
              đường mua. Hoa hồng mặc định 30% khi bán thành công (snapshot vào đơn).
            </p>
            <label className="block">
              <span className="mb-1 block text-xs text-muted">Tên kho sim *</span>
              <input
                required
                value={srcName}
                onChange={(e) => setSrcName(e.target.value)}
                placeholder="VD: simkinhdich.com, Kho anh Minh…"
                className={`${inputCls} w-full`}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs text-muted">Người liên hệ</span>
                <input
                  value={srcContactName}
                  onChange={(e) => setSrcContactName(e.target.value)}
                  className={`${inputCls} w-full`}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-muted">SĐT / Zalo</span>
                <input
                  value={srcContactPhone}
                  onChange={(e) => setSrcContactPhone(e.target.value)}
                  inputMode="tel"
                  className={`${inputCls} w-full`}
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-xs text-muted">Ghi chú liên hệ</span>
              <textarea
                value={srcNote}
                onChange={(e) => setSrcNote(e.target.value)}
                rows={3}
                placeholder="Cách đặt hàng, tài khoản chuyển, lưu ý…"
                className="w-full border border-fog bg-white p-2.5 text-sm text-ink outline-none focus:border-lacquer"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-muted">Hoa hồng khi bán (%)</span>
              <input
                value={srcCommission}
                onChange={(e) => setSrcCommission(e.target.value)}
                inputMode="decimal"
                className={`${inputCls} w-32`}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={busy}
                className="bg-lacquer px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {busy
                  ? 'Đang lưu…'
                  : editingSourceId
                    ? 'Cập nhật kho'
                    : 'Thêm kho'}
              </button>
              {editingSourceId ? (
                <button
                  type="button"
                  onClick={resetSourceForm}
                  className="border border-fog px-4 py-2.5 text-sm text-muted hover:text-ink"
                >
                  Hủy sửa
                </button>
              ) : null}
            </div>
          </form>

          <div className="border border-fog bg-paper">
            <div className="border-b border-fog bg-mist px-4 py-2.5 text-sm font-medium text-ink">
              Danh sách kho sim
            </div>
            {sources.length === 0 ? (
              <p className="p-6 text-sm text-muted">Chưa có kho nào. Thêm kho đầu tiên bên trái.</p>
            ) : (
              <ul className="divide-y divide-fog">
                {sources.map((s) => (
                  <li key={s.id} className="px-4 py-3 text-sm">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-ink">
                          {s.name}
                          {!s.active ? (
                            <span className="ml-2 text-xs text-muted">(đã ẩn)</span>
                          ) : null}
                        </p>
                        <p className="mt-0.5 text-xs text-muted">
                          HH {Number(s.commission_percent)}%
                          {s.contact_name ? ` · ${s.contact_name}` : ''}
                          {s.contact_phone ? ` · ${s.contact_phone}` : ''}
                        </p>
                        {s.contact_note ? (
                          <p className="mt-1 text-xs leading-relaxed text-muted">
                            {s.contact_note}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => startEditSource(s)}
                          className="text-lacquer underline"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => void toggleSourceActive(s)}
                          className="text-muted underline"
                        >
                          {s.active ? 'Ẩn' : 'Bật'}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function SimRow({
  sim,
  sources,
  source,
  checked,
  onCheck,
  onSave,
  onDelete,
}: {
  sim: SimListing;
  sources: SimSource[];
  source?: SimSource;
  checked: boolean;
  onCheck: (v: boolean) => void;
  onSave: (
    sim: SimListing,
    patch: { templeId: string; id: string } & Record<string, unknown>,
  ) => Promise<void>;
  onDelete: () => void;
}) {
  const [price, setPrice] = useState(String(sim.price_vnd));
  const [original, setOriginal] = useState(
    sim.original_price_vnd ? String(sim.original_price_vnd) : '',
  );
  const [saving, setSaving] = useState(false);

  async function commit(patch: Record<string, unknown>) {
    setSaving(true);
    await onSave(sim, { id: sim.id, templeId: sim.temple_id, ...patch });
    setSaving(false);
  }

  const priceChanged = parsePriceInput(price) !== sim.price_vnd;
  const originalChanged =
    (parsePriceInput(original) ?? null) !== (sim.original_price_vnd ?? null);
  const que = simQueBadge(sim.phone);

  return (
    <tr className={`border-t border-fog ${saving ? 'opacity-50' : ''}`}>
      <td className="p-2.5">
        <input type="checkbox" checked={checked} onChange={(e) => onCheck(e.target.checked)} />
      </td>
      <td className="p-2.5">
        <a
          href={`/sim/${sim.phone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-sm font-semibold text-ink hover:text-lacquer"
        >
          {sim.phone_display}
        </a>
        {(sim.view_count ?? 0) > 0 ? (
          <span className="ml-1.5 text-[0.65rem] text-muted">
            {Number(sim.view_count).toLocaleString('vi-VN')} lượt xem
          </span>
        ) : null}
      </td>
      <td className="p-2.5">
        <select
          value={sim.source_id ?? ''}
          onChange={(e) => void commit({ sourceId: e.target.value || null })}
          className="h-8 max-w-[9.5rem] border border-fog bg-white px-1.5 text-xs"
          title={
            source
              ? [
                  source.name,
                  source.contact_phone ? `LH: ${source.contact_phone}` : null,
                  `HH ${Number(source.commission_percent)}%`,
                ]
                  .filter(Boolean)
                  .join(' · ')
              : 'Chưa gán kho'
          }
        >
          <option value="">— Chưa gán —</option>
          {sources.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
          {sim.source_id && source && !sources.some((s) => s.id === source.id) ? (
            <option value={source.id}>{source.name} (ẩn)</option>
          ) : null}
        </select>
        {source?.contact_phone ? (
          <p className="mt-0.5 truncate text-[0.65rem] text-muted" title={source.contact_phone}>
            {source.contact_phone} · HH {Number(source.commission_percent)}%
          </p>
        ) : source ? (
          <p className="mt-0.5 text-[0.65rem] text-muted">
            HH {Number(source.commission_percent)}%
          </p>
        ) : null}
      </td>
      <td className="p-2.5 text-xs text-muted">
        {NETWORK_LABELS[sim.network] ?? sim.network}
        {sim.tags.length > 0 ? (
          <span className="ml-1 text-[0.65rem]">
            · {sim.tags.map((t) => SIM_TAG_LABELS[t] ?? t).slice(0, 2).join(', ')}
          </span>
        ) : null}
      </td>
      <td className="p-2.5 text-center">
        <span
          className="inline-block min-w-9 px-1.5 py-0.5 text-xs font-semibold text-white"
          style={{
            backgroundColor:
              sim.overall_score >= 80
                ? '#1B6B3A'
                : sim.overall_score >= 65
                  ? '#B08D42'
                  : sim.overall_score >= 45
                    ? '#8a6d3b'
                    : '#9b3535',
          }}
          title={verdictLabel(sim.verdict)}
        >
          {sim.overall_score}
        </span>
      </td>
      <td className="p-2.5 text-xs">
        {que ? (
          <span
            className="inline-flex items-center gap-1 whitespace-nowrap font-medium"
            style={{ color: que.rankMeta.color }}
            title={`${que.hex.nameFull} · ${que.rankMeta.label} — ${que.hex.meaning}`}
          >
            <span className="text-base leading-none">{que.hex.unicode}</span>
            {que.hex.nameFull}
          </span>
        ) : (
          <span className="text-muted">—</span>
        )}
      </td>
      <td className="p-2.5 text-right">
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onBlur={() => {
            const v = parsePriceInput(price);
            if (v != null && priceChanged) void commit({ priceVnd: v });
          }}
          className={`h-8 w-28 border px-2 text-right text-xs outline-none ${
            priceChanged ? 'border-lacquer' : 'border-fog'
          }`}
        />
      </td>
      <td className="p-2.5 text-right">
        <input
          value={original}
          onChange={(e) => setOriginal(e.target.value)}
          onBlur={() => {
            if (originalChanged) {
              void commit({ originalPriceVnd: parsePriceInput(original) });
            }
          }}
          placeholder="—"
          className={`h-8 w-28 border px-2 text-right text-xs outline-none ${
            originalChanged ? 'border-lacquer' : 'border-fog'
          }`}
        />
      </td>
      <td className="p-2.5">
        <select
          value={sim.status}
          onChange={(e) => void commit({ status: e.target.value as SimStatus })}
          className="h-8 border border-fog bg-white px-1.5 text-xs"
        >
          {Object.entries(SIM_STATUS_LABELS).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </td>
      <td className="p-2.5 text-center">
        <input
          type="checkbox"
          checked={sim.featured}
          onChange={(e) => void commit({ featured: e.target.checked })}
          title="Sim thầy tuyển — hiện ở trang chủ"
        />
      </td>
      <td className="p-2.5 text-right">
        <button
          type="button"
          onClick={onDelete}
          className="text-xs text-red-700 underline underline-offset-2 hover:text-red-900"
        >
          Xóa
        </button>
      </td>
    </tr>
  );
}
