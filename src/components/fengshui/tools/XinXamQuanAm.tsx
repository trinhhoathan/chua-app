'use client';

import { XinXamDrawPanel } from '@/components/temple/XinXamDrawPanel';

interface Props {
  primaryColor: string;
  templeName?: string;
  templeId?: string;
}

export function XinXamQuanAm({
  primaryColor,
  templeName,
  templeId,
}: Props) {
  return (
    <div>
      <p className="text-sm text-muted leading-relaxed mb-6">
        Thành tâm niệm Quán Thế Âm Bồ Tát, rồi lắc ống để rút 1 trong 100 quẻ
        Quan Âm Linh Xăm. Kết quả mang tính tham khảo tâm linh.
      </p>
      <XinXamDrawPanel
        primaryColor={primaryColor}
        templeName={templeName}
        templeId={templeId}
      />
    </div>
  );
}
