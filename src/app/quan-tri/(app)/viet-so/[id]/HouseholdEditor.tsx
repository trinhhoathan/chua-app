'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type {
  SoAncestor,
  SoGender,
  SoHousehold,
  SoHouseholdMember,
  SoMemberRole,
} from '@/types/database';
import {
  SO_GENDER_LABELS,
  SO_MEMBER_ROLE_LABELS,
} from '@/types/database';
import {
  deleteAncestor,
  deleteHousehold,
  deleteMember,
  upsertAncestor,
  upsertHousehold,
  upsertMember,
} from '@/app/actions/so';
import { hasLatinResidue, toHanName } from '@/lib/so-render/han-names';
import { translateToNom } from '@/lib/so-render/to-nom';

type MemberDraft = {
  id?: string;
  print_selected: boolean;
  is_chu_ho: boolean;
  xung_ho: string;
  ho_ten: string;
  ho_ten_nho: string;
  gioi_tinh: SoGender | '';
  nam_sinh: string;
  vai_tro: SoMemberRole;
  phap_danh: string;
  localKey: string;
};

type AncestorDraft = {
  id?: string;
  print_selected: boolean;
  xung_ho: string;
  ten_hieu: string;
  ten_nho: string;
  nam_mat: string;
  thang_mat: string;
  ngay_mat: string;
  gio_mat: string;
  an_tang: string;
  an_tang_nho: string;
  localKey: string;
};

type AstroInfo = { tuoi?: string; sao?: string; namAm?: string };

type Props = {
  templeId: string;
  household: SoHousehold;
  members: SoHouseholdMember[];
  ancestors: SoAncestor[];
};

function newKey() {
  return `k-${Math.random().toString(36).slice(2, 10)}`;
}

function memberToDraft(m: SoHouseholdMember): MemberDraft {
  return {
    id: m.id,
    print_selected: m.print_selected,
    is_chu_ho: m.is_chu_ho,
    xung_ho: m.xung_ho ?? '',
    ho_ten: m.ho_ten,
    ho_ten_nho: m.ho_ten_nho ?? '',
    gioi_tinh: m.gioi_tinh ?? '',
    nam_sinh: m.nam_sinh != null ? String(m.nam_sinh) : '',
    vai_tro: m.vai_tro,
    phap_danh: m.phap_danh ?? '',
    localKey: m.id,
  };
}

function ancestorToDraft(a: SoAncestor): AncestorDraft {
  return {
    id: a.id,
    print_selected: a.print_selected,
    xung_ho: a.xung_ho ?? '',
    ten_hieu: a.ten_hieu,
    ten_nho: a.ten_nho ?? '',
    nam_mat: a.nam_mat != null ? String(a.nam_mat) : '',
    thang_mat: a.thang_mat != null ? String(a.thang_mat) : '',
    ngay_mat: a.ngay_mat != null ? String(a.ngay_mat) : '',
    gio_mat: a.gio_mat ?? '',
    an_tang: a.an_tang ?? '',
    an_tang_nho: a.an_tang_nho ?? '',
    localKey: a.id,
  };
}

const inputCls =
  'w-full px-2 py-1.5 text-sm border border-fog bg-paper min-w-[5rem]';
const labelCls = 'block text-xs text-muted mb-1';

export function HouseholdEditor({
  templeId,
  household,
  members: initialMembers,
  ancestors: initialAncestors,
}: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState({
    chu_ho: household.chu_ho,
    phone: household.phone ?? '',
    dia_chi_tinh: household.dia_chi_tinh ?? '',
    dia_chi_huyen: household.dia_chi_huyen ?? '',
    dia_chi_xa: household.dia_chi_xa ?? '',
    dia_chi_chi_tiet: household.dia_chi_chi_tiet ?? '',
    dia_chi_nho: household.dia_chi_nho ?? '',
    noi_cung: household.noi_cung ?? '',
    nam_cung: household.nam_cung != null ? String(household.nam_cung) : '',
    thang_cung: household.thang_cung != null ? String(household.thang_cung) : '',
    ngay_cung: household.ngay_cung != null ? String(household.ngay_cung) : '',
    gio_cung: household.gio_cung ?? '',
    ngach_so_rieng: household.ngach_so_rieng ?? '',
    ghi_chu: household.ghi_chu ?? '',
  });
  const [nomBusy, setNomBusy] = useState(false);

  const [members, setMembers] = useState<MemberDraft[]>(() =>
    initialMembers.map(memberToDraft),
  );
  const [ancestors, setAncestors] = useState<AncestorDraft[]>(() =>
    initialAncestors.map(ancestorToDraft),
  );
  const [astroMap, setAstroMap] = useState<Record<string, AstroInfo>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mod = await import('@/lib/so-render/astro');
        if (!mod?.memberAstro || cancelled) return;
        const next: Record<string, AstroInfo> = {};
        for (const m of members) {
          const nam = m.nam_sinh ? Number(m.nam_sinh) : NaN;
          if (!Number.isFinite(nam)) {
            next[m.localKey] = { tuoi: '—', sao: '—' };
            continue;
          }
          const gender =
            m.gioi_tinh === 'nam' || m.gioi_tinh === 'nu' ? m.gioi_tinh : null;
          const info = mod.memberAstro(nam, gender);
          next[m.localKey] = {
            tuoi: String(info.tuoiAm),
            sao: info.sao,
            namAm: info.namAm,
          };
        }
        if (!cancelled) setAstroMap(next);
      } catch {
        /* astro chưa sẵn sàng */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [members]);

  function setMember(key: string, patch: Partial<MemberDraft>) {
    setMembers((prev) =>
      prev.map((m) => (m.localKey === key ? { ...m, ...patch } : m)),
    );
  }

  function setAncestor(key: string, patch: Partial<AncestorDraft>) {
    setAncestors((prev) =>
      prev.map((a) => (a.localKey === key ? { ...a, ...patch } : a)),
    );
  }

  function joinDiaChiQn() {
    return [
      form.dia_chi_chi_tiet,
      form.dia_chi_xa,
      form.dia_chi_huyen,
      form.dia_chi_tinh,
    ]
      .map((s) => s.trim())
      .filter(Boolean)
      .join(', ');
  }

  async function refreshDiaChiNom(force = false) {
    const qn = joinDiaChiQn();
    if (!qn) {
      setForm((f) => ({ ...f, dia_chi_nho: '' }));
      return;
    }
    if (!force && form.dia_chi_nho.trim() && !hasLatinResidue(form.dia_chi_nho)) {
      return;
    }
    const local = toHanName(qn);
    setForm((f) => ({ ...f, dia_chi_nho: local }));
    if (!hasLatinResidue(local)) return;
    const { text } = await translateToNom(qn, 'address');
    setForm((f) => ({ ...f, dia_chi_nho: text }));
  }

  async function translateMemberName(key: string, hoTen: string, force = false) {
    const m = members.find((x) => x.localKey === key);
    if (!m || !hoTen.trim()) return;
    if (
      !force &&
      m.ho_ten_nho.trim() &&
      !hasLatinResidue(m.ho_ten_nho)
    ) {
      return;
    }
    const local = toHanName(hoTen);
    setMember(key, { ho_ten_nho: local });
    if (!hasLatinResidue(local)) return;
    const { text } = await translateToNom(hoTen, 'name');
    setMember(key, { ho_ten_nho: text });
  }

  async function dichTatCaNom() {
    setNomBusy(true);
    setMsg(null);
    setErr(null);
    try {
      await refreshDiaChiNom(true);
      for (const m of members) {
        if (!m.ho_ten.trim()) continue;
        await translateMemberName(m.localKey, m.ho_ten, true);
      }
      for (const a of ancestors) {
        if (!a.ten_hieu.trim()) continue;
        if (a.ten_nho.trim() && !hasLatinResidue(a.ten_nho)) continue;
        const local = toHanName(a.ten_hieu);
        setAncestor(a.localKey, { ten_nho: local });
        if (hasLatinResidue(local)) {
          const { text } = await translateToNom(a.ten_hieu, 'name');
          setAncestor(a.localKey, { ten_nho: text });
        }
        if (a.an_tang.trim()) {
          const atLocal = toHanName(a.an_tang);
          setAncestor(a.localKey, { an_tang_nho: atLocal });
          if (hasLatinResidue(atLocal)) {
            const { text } = await translateToNom(a.an_tang, 'address');
            setAncestor(a.localKey, { an_tang_nho: text });
          }
        }
      }
      setMsg('Đã dịch sang chữ Nôm (từ điển + AI nếu cần). Nhớ Lưu.');
    } finally {
      setNomBusy(false);
    }
  }

  function saveHousehold() {
    setMsg(null);
    setErr(null);
    start(async () => {
      const qn = joinDiaChiQn();
      let diaChiNho = form.dia_chi_nho.trim();
      if (qn && (!diaChiNho || hasLatinResidue(diaChiNho))) {
        const { text } = await translateToNom(qn, 'address');
        diaChiNho = text;
        setForm((f) => ({ ...f, dia_chi_nho: text }));
      }
      const res = await upsertHousehold({
        templeId,
        id: household.id,
        chuHo: form.chu_ho,
        phone: form.phone,
        diaChiTinh: form.dia_chi_tinh,
        diaChiHuyen: form.dia_chi_huyen,
        diaChiXa: form.dia_chi_xa,
        diaChiChiTiet: form.dia_chi_chi_tiet,
        diaChiNho,
        noiCung: form.noi_cung,
        namCung: form.nam_cung ? Number(form.nam_cung) : null,
        thangCung: form.thang_cung ? Number(form.thang_cung) : null,
        ngayCung: form.ngay_cung ? Number(form.ngay_cung) : null,
        gioCung: form.gio_cung,
        ngachSoRieng: form.ngach_so_rieng,
        ghiChu: form.ghi_chu,
      });
      if (!res.ok) {
        setErr(res.error ?? 'Không lưu được hộ.');
        return;
      }
      setMsg('Đã lưu thông tin hộ.');
      router.refresh();
    });
  }

  function saveMembers() {
    setMsg(null);
    setErr(null);
    start(async () => {
      for (let i = 0; i < members.length; i++) {
        const m = members[i];
        if (!m.ho_ten.trim()) continue;
        const res = await upsertMember({
          templeId,
          householdId: household.id,
          id: m.id,
          printSelected: m.print_selected,
          isChuHo: m.is_chu_ho,
          xungHo: m.xung_ho,
          hoTen: m.ho_ten,
          hoTenNho: m.ho_ten_nho,
          gioiTinh: m.gioi_tinh || null,
          namSinh: m.nam_sinh ? Number(m.nam_sinh) : null,
          vaiTro: m.vai_tro,
          phapDanh: m.phap_danh,
          sortOrder: i,
        });
        if (!res.ok) {
          setErr(res.error ?? 'Không lưu được thành viên.');
          return;
        }
        if (res.id && !m.id) {
          setMembers((prev) =>
            prev.map((x) =>
              x.localKey === m.localKey ? { ...x, id: res.id } : x,
            ),
          );
        }
      }
      setMsg('Đã lưu danh sách tín chủ.');
      router.refresh();
    });
  }

  function saveAncestors() {
    setMsg(null);
    setErr(null);
    start(async () => {
      for (let i = 0; i < ancestors.length; i++) {
        const a = ancestors[i];
        if (!a.ten_hieu.trim()) continue;
        const res = await upsertAncestor({
          templeId,
          householdId: household.id,
          id: a.id,
          printSelected: a.print_selected,
          xungHo: a.xung_ho,
          tenHieu: a.ten_hieu,
          tenNho: a.ten_nho,
          namMat: a.nam_mat ? Number(a.nam_mat) : null,
          thangMat: a.thang_mat ? Number(a.thang_mat) : null,
          ngayMat: a.ngay_mat ? Number(a.ngay_mat) : null,
          gioMat: a.gio_mat,
          anTang: a.an_tang,
          anTangNho: a.an_tang_nho,
          sortOrder: i,
        });
        if (!res.ok) {
          setErr(res.error ?? 'Không lưu được gia tiên.');
          return;
        }
        if (res.id && !a.id) {
          setAncestors((prev) =>
            prev.map((x) =>
              x.localKey === a.localKey ? { ...x, id: res.id } : x,
            ),
          );
        }
      }
      setMsg('Đã lưu danh sách gia tiên.');
      router.refresh();
    });
  }

  function removeMember(m: MemberDraft) {
    if (!confirm('Xóa thành viên này?')) return;
    start(async () => {
      if (m.id) {
        const res = await deleteMember({ templeId, id: m.id });
        if (!res.ok) {
          setErr(res.error ?? 'Không xóa được.');
          return;
        }
      }
      setMembers((prev) => prev.filter((x) => x.localKey !== m.localKey));
      setMsg('Đã xóa thành viên.');
      router.refresh();
    });
  }

  function removeAncestor(a: AncestorDraft) {
    if (!confirm('Xóa gia tiên này?')) return;
    start(async () => {
      if (a.id) {
        const res = await deleteAncestor({ templeId, id: a.id });
        if (!res.ok) {
          setErr(res.error ?? 'Không xóa được.');
          return;
        }
      }
      setAncestors((prev) => prev.filter((x) => x.localKey !== a.localKey));
      setMsg('Đã xóa gia tiên.');
      router.refresh();
    });
  }

  function softDeleteHousehold() {
    if (!confirm('Xóa hộ này? (có thể khôi phục sau từ DB)')) return;
    start(async () => {
      const res = await deleteHousehold({ templeId, id: household.id });
      if (!res.ok) {
        setErr(res.error ?? 'Không xóa được hộ.');
        return;
      }
      router.push('/quan-tri/viet-so');
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      {msg ? (
        <p className="text-sm text-ink border border-fog bg-mist px-3 py-2">{msg}</p>
      ) : null}
      {err ? (
        <p className="text-sm text-red-800 border border-red-200 bg-red-50 px-3 py-2">
          {err}
        </p>
      ) : null}

      <section className="border border-fog bg-paper p-4 md:p-6">
        <h2 className="font-display text-xl text-ink mb-4">Thông tin hộ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Chủ hộ</label>
            <input
              className={inputCls}
              value={form.chu_ho}
              onChange={(e) => setForm((f) => ({ ...f, chu_ho: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>Điện thoại</label>
            <input
              className={inputCls}
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>Tỉnh / thành</label>
            <input
              className={inputCls}
              value={form.dia_chi_tinh}
              onChange={(e) =>
                setForm((f) => ({ ...f, dia_chi_tinh: e.target.value }))
              }
              onBlur={() => void refreshDiaChiNom(true)}
            />
          </div>
          <div>
            <label className={labelCls}>Quận / huyện</label>
            <input
              className={inputCls}
              value={form.dia_chi_huyen}
              onChange={(e) =>
                setForm((f) => ({ ...f, dia_chi_huyen: e.target.value }))
              }
              onBlur={() => void refreshDiaChiNom(true)}
            />
          </div>
          <div>
            <label className={labelCls}>Phường / xã</label>
            <input
              className={inputCls}
              value={form.dia_chi_xa}
              onChange={(e) =>
                setForm((f) => ({ ...f, dia_chi_xa: e.target.value }))
              }
              onBlur={() => void refreshDiaChiNom(true)}
            />
          </div>
          <div>
            <label className={labelCls}>Địa chỉ chi tiết</label>
            <input
              className={inputCls}
              value={form.dia_chi_chi_tiet}
              onChange={(e) =>
                setForm((f) => ({ ...f, dia_chi_chi_tiet: e.target.value }))
              }
              onBlur={() => void refreshDiaChiNom(true)}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Địa chỉ (chữ Nôm) — dùng khi in</label>
            <div className="flex gap-2">
              <input
                className={`${inputCls} font-[inherit]`}
                value={form.dia_chi_nho}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dia_chi_nho: e.target.value }))
                }
                title="Có thể sửa tay chữ Hán/Nôm"
              />
              <button
                type="button"
                className="shrink-0 px-3 py-1.5 text-sm border border-fog bg-paper hover:bg-fog/40"
                disabled={nomBusy}
                onClick={() => void refreshDiaChiNom(true)}
              >
                Dịch
              </button>
            </div>
          </div>
          <div>
            <label className={labelCls}>Nơi cúng</label>
            <input
              className={inputCls}
              value={form.noi_cung}
              onChange={(e) =>
                setForm((f) => ({ ...f, noi_cung: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className={labelCls}>Năm cúng</label>
              <input
                className={inputCls}
                value={form.nam_cung}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nam_cung: e.target.value }))
                }
              />
            </div>
            <div>
              <label className={labelCls}>Tháng</label>
              <input
                className={inputCls}
                value={form.thang_cung}
                onChange={(e) =>
                  setForm((f) => ({ ...f, thang_cung: e.target.value }))
                }
              />
            </div>
            <div>
              <label className={labelCls}>Ngày</label>
              <input
                className={inputCls}
                value={form.ngay_cung}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ngay_cung: e.target.value }))
                }
              />
            </div>
            <div>
              <label className={labelCls}>Giờ</label>
              <input
                className={inputCls}
                value={form.gio_cung}
                onChange={(e) =>
                  setForm((f) => ({ ...f, gio_cung: e.target.value }))
                }
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Ngạch sớ riêng</label>
            <input
              className={inputCls}
              value={form.ngach_so_rieng}
              onChange={(e) =>
                setForm((f) => ({ ...f, ngach_so_rieng: e.target.value }))
              }
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Ghi chú</label>
            <textarea
              className={`${inputCls} min-h-[4rem]`}
              value={form.ghi_chu}
              onChange={(e) =>
                setForm((f) => ({ ...f, ghi_chu: e.target.value }))
              }
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={saveHousehold}
            className="px-4 py-2 bg-ink text-white text-sm disabled:opacity-50"
          >
            Lưu hộ
          </button>
          <button
            type="button"
            disabled={pending || nomBusy}
            onClick={() => void dichTatCaNom()}
            className="px-4 py-2 border border-ink text-sm hover:bg-mist disabled:opacity-50"
            title="Từ điển ~2100 âm + AI (DeepSeek) khi thiếu"
          >
            {nomBusy ? 'Đang dịch Nôm…' : 'Dịch tất cả sang Nôm'}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={softDeleteHousehold}
            className="px-4 py-2 border border-fog text-sm text-muted hover:bg-mist disabled:opacity-50"
          >
            Xóa hộ
          </button>
        </div>
      </section>

      <section className="border border-fog bg-paper p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 className="font-display text-xl text-ink">Tín chủ / thành viên</h2>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-3 py-1.5 text-sm border border-fog hover:bg-mist"
              onClick={() =>
                setMembers((prev) => [
                  ...prev,
                  {
                    print_selected: true,
                    is_chu_ho: prev.length === 0,
                    xung_ho: '',
                    ho_ten: '',
                    ho_ten_nho: '',
                    gioi_tinh: '',
                    nam_sinh: '',
                    vai_tro: 'gia_quyen',
                    phap_danh: '',
                    localKey: newKey(),
                  },
                ])
              }
            >
              + Thêm dòng
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={saveMembers}
              className="px-3 py-1.5 bg-ink text-white text-sm disabled:opacity-50"
            >
              Lưu thành viên
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[60rem]">
            <thead className="text-left text-muted bg-mist">
              <tr>
                <th className="p-2">In</th>
                <th className="p-2 whitespace-nowrap">Chủ hộ</th>
                <th className="p-2">Xưng hô</th>
                <th className="p-2">Họ tên</th>
                <th className="p-2">Họ tên (Nho)</th>
                <th className="p-2">Giới tính</th>
                <th className="p-2">Năm sinh</th>
                <th className="p-2">Tuổi</th>
                <th className="p-2 whitespace-nowrap min-w-[5.5rem]">Sao</th>
                <th className="p-2">Vai trò</th>
                <th className="p-2">Pháp danh</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-4 text-center text-muted">
                    Chưa có thành viên.
                  </td>
                </tr>
              ) : (
                members.map((m) => {
                  const astro = astroMap[m.localKey];
                  return (
                    <tr key={m.localKey} className="border-t border-fog">
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={m.print_selected}
                          onChange={(e) =>
                            setMember(m.localKey, {
                              print_selected: e.target.checked,
                            })
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={m.is_chu_ho}
                          onChange={(e) =>
                            setMember(m.localKey, {
                              is_chu_ho: e.target.checked,
                            })
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          className={inputCls}
                          value={m.xung_ho}
                          onChange={(e) =>
                            setMember(m.localKey, { xung_ho: e.target.value })
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          className={inputCls}
                          value={m.ho_ten}
                          onChange={(e) => {
                            const ho_ten = e.target.value;
                            const patch: Partial<MemberDraft> = { ho_ten };
                            // Luôn gợi ý Nôm từ từ điển khi đang gõ (AI khi blur)
                            if (ho_ten.trim()) {
                              patch.ho_ten_nho = toHanName(ho_ten);
                            } else {
                              patch.ho_ten_nho = '';
                            }
                            setMember(m.localKey, patch);
                          }}
                          onBlur={(e) => {
                            const v = e.currentTarget.value.trim();
                            if (v) void translateMemberName(m.localKey, v, true);
                          }}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          className={inputCls}
                          value={m.ho_ten_nho}
                          onChange={(e) =>
                            setMember(m.localKey, {
                              ho_ten_nho: e.target.value,
                            })
                          }
                          title="Chữ Hán/Nôm — có thể sửa tay"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          className={inputCls}
                          value={m.gioi_tinh}
                          onChange={(e) =>
                            setMember(m.localKey, {
                              gioi_tinh: e.target.value as SoGender | '',
                            })
                          }
                        >
                          <option value="">—</option>
                          {(Object.keys(SO_GENDER_LABELS) as SoGender[]).map(
                            (g) => (
                              <option key={g} value={g}>
                                {SO_GENDER_LABELS[g]}
                              </option>
                            ),
                          )}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          className={inputCls}
                          value={m.nam_sinh}
                          onChange={(e) =>
                            setMember(m.localKey, { nam_sinh: e.target.value })
                          }
                        />
                      </td>
                      <td className="p-2 text-muted tabular-nums">
                        {astro?.tuoi ?? '—'}
                      </td>
                      <td className="p-2 text-muted whitespace-nowrap min-w-[5.5rem]">
                        {astro?.sao ?? '—'}
                      </td>
                      <td className="p-2">
                        <select
                          className={inputCls}
                          value={m.vai_tro}
                          onChange={(e) =>
                            setMember(m.localKey, {
                              vai_tro: e.target.value as SoMemberRole,
                            })
                          }
                        >
                          {(
                            Object.keys(SO_MEMBER_ROLE_LABELS) as SoMemberRole[]
                          ).map((r) => (
                            <option key={r} value={r}>
                              {SO_MEMBER_ROLE_LABELS[r]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          className={inputCls}
                          value={m.phap_danh}
                          onChange={(e) =>
                            setMember(m.localKey, { phap_danh: e.target.value })
                          }
                        />
                      </td>
                      <td className="p-2">
                        <button
                          type="button"
                          className="text-xs text-muted hover:text-ink"
                          onClick={() => removeMember(m)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border border-fog bg-paper p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 className="font-display text-xl text-ink">Gia tiên / chính tiến</h2>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-3 py-1.5 text-sm border border-fog hover:bg-mist"
              onClick={() =>
                setAncestors((prev) => [
                  ...prev,
                  {
                    print_selected: true,
                    xung_ho: '',
                    ten_hieu: '',
                    ten_nho: '',
                    nam_mat: '',
                    thang_mat: '',
                    ngay_mat: '',
                    gio_mat: '',
                    an_tang: '',
                    an_tang_nho: '',
                    localKey: newKey(),
                  },
                ])
              }
            >
              + Thêm dòng
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={saveAncestors}
              className="px-3 py-1.5 bg-ink text-white text-sm disabled:opacity-50"
            >
              Lưu gia tiên
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[52rem]">
            <thead className="text-left text-muted bg-mist">
              <tr>
                <th className="p-2">In</th>
                <th className="p-2">Xưng hô</th>
                <th className="p-2">Tên hiệu</th>
                <th className="p-2">Tên (Nho)</th>
                <th className="p-2">Năm mất</th>
                <th className="p-2">Tháng</th>
                <th className="p-2">Ngày</th>
                <th className="p-2">Giờ</th>
                <th className="p-2">An táng</th>
                <th className="p-2">An táng (Nho)</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {ancestors.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-4 text-center text-muted">
                    Chưa có gia tiên.
                  </td>
                </tr>
              ) : (
                ancestors.map((a) => (
                  <tr key={a.localKey} className="border-t border-fog">
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={a.print_selected}
                        onChange={(e) =>
                          setAncestor(a.localKey, {
                            print_selected: e.target.checked,
                          })
                        }
                      />
                    </td>
                    <td className="p-2">
                      <input
                        className={inputCls}
                        value={a.xung_ho}
                        onChange={(e) =>
                          setAncestor(a.localKey, { xung_ho: e.target.value })
                        }
                      />
                    </td>
                    <td className="p-2">
                      <input
                        className={inputCls}
                        value={a.ten_hieu}
                        onChange={(e) =>
                          setAncestor(a.localKey, { ten_hieu: e.target.value })
                        }
                      />
                    </td>
                    <td className="p-2">
                      <input
                        className={inputCls}
                        value={a.ten_nho}
                        onChange={(e) =>
                          setAncestor(a.localKey, { ten_nho: e.target.value })
                        }
                      />
                    </td>
                    <td className="p-2">
                      <input
                        className={inputCls}
                        value={a.nam_mat}
                        onChange={(e) =>
                          setAncestor(a.localKey, { nam_mat: e.target.value })
                        }
                      />
                    </td>
                    <td className="p-2">
                      <input
                        className={inputCls}
                        value={a.thang_mat}
                        onChange={(e) =>
                          setAncestor(a.localKey, { thang_mat: e.target.value })
                        }
                      />
                    </td>
                    <td className="p-2">
                      <input
                        className={inputCls}
                        value={a.ngay_mat}
                        onChange={(e) =>
                          setAncestor(a.localKey, { ngay_mat: e.target.value })
                        }
                      />
                    </td>
                    <td className="p-2">
                      <input
                        className={inputCls}
                        value={a.gio_mat}
                        onChange={(e) =>
                          setAncestor(a.localKey, { gio_mat: e.target.value })
                        }
                      />
                    </td>
                    <td className="p-2">
                      <input
                        className={inputCls}
                        value={a.an_tang}
                        onChange={(e) =>
                          setAncestor(a.localKey, { an_tang: e.target.value })
                        }
                      />
                    </td>
                    <td className="p-2">
                      <input
                        className={inputCls}
                        value={a.an_tang_nho}
                        onChange={(e) =>
                          setAncestor(a.localKey, {
                            an_tang_nho: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td className="p-2">
                      <button
                        type="button"
                        className="text-xs text-muted hover:text-ink"
                        onClick={() => removeAncestor(a)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
