'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import {
  importHouseholds,
  type SoImportRow,
} from '@/app/actions/so';
import { parseSoExcelRows } from './parse-so-excel';

type Props = {
  templeId: string;
  templeName: string;
};

export function ImportExcelBoard({ templeId, templeName }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [rows, setRows] = useState<SoImportRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function onFile(file: File | null) {
    setErr(null);
    setMsg(null);
    setRows([]);
    setFileName(null);
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const sheetName = wb.SheetNames[0];
      if (!sheetName) {
        setErr('File không có sheet.');
        return;
      }
      const sheet = wb.Sheets[sheetName];
      const aoa = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
        header: 1,
        defval: '',
        raw: false,
      });
      const parsed = parseSoExcelRows(aoa);
      if (parsed.length === 0) {
        setErr(
          'Không đọc được dòng nào. Kiểm tra header có cột chủ hộ / tên.',
        );
        return;
      }
      setRows(parsed);
      setFileName(file.name);
      setMsg(`Đã phân tích ${parsed.length} hộ từ «${file.name}».`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Không đọc được file Excel.');
    }
  }

  function confirmImport() {
    if (rows.length === 0) return;
    setErr(null);
    setMsg(null);
    start(async () => {
      const res = await importHouseholds({ templeId, rows });
      if (!res.ok) {
        setErr(
          `${res.error ?? 'Import thất bại.'}${
            res.imported ? ` (đã nhập ${res.imported} hộ trước khi lỗi)` : ''
          }`,
        );
        return;
      }
      setMsg(`Đã import ${res.imported ?? 0} hộ.`);
      setRows([]);
      router.push('/quan-tri/viet-so');
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="border border-fog bg-paper p-4 md:p-6">
        <h2 className="font-display text-xl text-ink">Tải file Excel</h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          {templeName} — hỗ trợ định dạng «Nhap du lieu.xlsx» (một dòng một hộ)
          hoặc bảng đơn giản có cột chủ hộ + địa chỉ + thành viên.
        </p>
        <ul className="mt-3 text-sm text-muted list-disc pl-5 space-y-1">
          <li>
            <strong className="text-ink font-medium">Địa chỉ nhà:</strong> Tỉnh
            thành, Quận huyện, Phường xã, địa chỉ nhỏ
          </li>
          <li>
            <strong className="text-ink font-medium">Tín chủ:</strong> Người số N
            (Tên / Năm sinh / Giới tính / Xưng hô)
          </li>
          <li>
            <strong className="text-ink font-medium">Thông tin cúng:</strong> Nơi
            cúng, Năm / Tháng / Ngày / Giờ cúng
          </li>
          <li>
            <strong className="text-ink font-medium">Gia tiên:</strong> cột Chính
            tiến / Gia tiên / Tên hiệu (nếu có)
          </li>
          <li>
            Tối thiểu cần cột tên chủ hộ; các cột khác tùy chọn.
          </li>
        </ul>
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          className="mt-4 block text-sm"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {msg ? (
        <p className="text-sm border border-fog bg-mist px-3 py-2 text-ink">
          {msg}
        </p>
      ) : null}
      {err ? (
        <p className="text-sm border border-red-200 bg-red-50 px-3 py-2 text-red-800">
          {err}
        </p>
      ) : null}

      {rows.length > 0 ? (
        <div className="border border-fog bg-paper">
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 border-b border-fog bg-mist">
            <p className="text-sm text-ink">
              Xem trước {rows.length} hộ
              {fileName ? ` · ${fileName}` : ''}
            </p>
            <button
              type="button"
              disabled={pending}
              onClick={confirmImport}
              className="px-4 py-2 bg-ink text-white text-sm disabled:opacity-50"
            >
              {pending ? 'Đang import…' : 'Xác nhận import'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Chủ hộ</th>
                  <th className="p-3">Địa chỉ</th>
                  <th className="p-3">Nơi cúng</th>
                  <th className="p-3">Thành viên</th>
                  <th className="p-3">Gia tiên</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 50).map((r, i) => {
                  const addr = [
                    r.diaChiChiTiet,
                    r.diaChiXa,
                    r.diaChiHuyen,
                    r.diaChiTinh,
                  ]
                    .filter(Boolean)
                    .join(', ');
                  return (
                    <tr key={`${r.chuHo}-${i}`} className="border-t border-fog">
                      <td className="p-3 text-muted">{i + 1}</td>
                      <td className="p-3 font-medium">{r.chuHo}</td>
                      <td className="p-3 text-muted text-xs max-w-xs truncate">
                        {addr || '—'}
                      </td>
                      <td className="p-3 text-muted">{r.noiCung || '—'}</td>
                      <td className="p-3 text-muted">
                        {r.members?.length ?? 0}
                      </td>
                      <td className="p-3 text-muted">
                        {r.ancestors?.length ?? 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {rows.length > 50 ? (
            <p className="p-3 text-xs text-muted border-t border-fog">
              Chỉ hiện 50 dòng đầu; khi xác nhận sẽ import toàn bộ{' '}
              {rows.length} hộ.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
