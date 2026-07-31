import Link from 'next/link';

/** Banner khi SuperAdmin chưa chọn Phật tự cho thao tác đơn chùa. */
export function TempleRequiredNotice({
  feature = 'chức năng này',
}: {
  feature?: string;
}) {
  return (
    <div className="border border-fog bg-paper p-8 text-center max-w-lg mx-auto">
      <h2 className="font-display text-xl text-ink">Chọn Phật tự để thao tác</h2>
      <p className="mt-3 text-sm text-muted leading-relaxed">
        {feature} cần ngữ cảnh một Phật tự cụ thể. Dùng bộ chọn «Phật tự» trên
        thanh header, hoặc mở danh sách Phật tự.
      </p>
      <Link
        href="/quan-tri/chua"
        className="inline-block mt-6 px-4 py-2 bg-ink text-white text-sm"
      >
        Danh sách Phật tự
      </Link>
    </div>
  );
}
