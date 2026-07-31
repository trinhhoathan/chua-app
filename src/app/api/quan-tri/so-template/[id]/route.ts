import { promises as fs } from 'fs';
import path from 'path';
import { gunzipSync } from 'zlib';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import type { SoTemplateFile } from '@/lib/so-render/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

function storageGzUrl(id: number): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  if (!base) return null;
  return `${base}/storage/v1/object/public/so-templates/longsos/${id}.json.gz`;
}

async function loadFromLocal(id: number): Promise<SoTemplateFile | null> {
  const filePath = path.join(process.cwd(), 'so-data', 'longsos', `${id}.json`);
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as SoTemplateFile;
  } catch {
    return null;
  }
}

async function loadFromStorage(id: number): Promise<SoTemplateFile | null> {
  const url = storageGzUrl(id);
  if (!url) return null;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const text = gunzipSync(buf).toString('utf8');
    return JSON.parse(text) as SoTemplateFile;
  } catch {
    return null;
  }
}

export async function GET(_request: Request, { params }: Props) {
  try {
    await requireAdmin();
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Không có quyền.' }, { status: 403 });
  }

  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id <= 0 || !Number.isInteger(id)) {
    return NextResponse.json({ error: 'ID lòng sớ không hợp lệ.' }, { status: 400 });
  }

  const data = (await loadFromLocal(id)) ?? (await loadFromStorage(id));
  if (!data) {
    return NextResponse.json(
      { error: `Không tìm thấy lòng sớ #${id}.` },
      { status: 404 },
    );
  }

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
