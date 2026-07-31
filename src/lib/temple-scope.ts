import { cookies } from 'next/headers';
import {
  assertTempleAccess,
  getTempleById,
  type AdminContext,
  type TempleBrief,
} from '@/lib/auth';
import { ADMIN_TEMPLE_COOKIE } from '@/lib/platform-hq';

export type TempleScopeMode = 'all' | 'temple';

export interface TempleScope {
  mode: TempleScopeMode;
  templeId: string | null;
  temple: TempleBrief | null;
}

/**
 * Resolve ngữ cảnh làm việc:
 * query `?temple=` > cookie > (trụ trì: chùa đầu) > SuperAdmin: null = toàn hệ.
 */
export async function resolveTempleScope(
  ctx: AdminContext,
  queryTempleId?: string | null,
): Promise<TempleScope> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(ADMIN_TEMPLE_COOKIE)?.value ?? null;
  const candidate = queryTempleId?.trim() || fromCookie || null;

  if (candidate) {
    try {
      await assertTempleAccess(candidate);
      const temple = await getTempleById(candidate);
      if (temple) {
        return { mode: 'temple', templeId: temple.id, temple };
      }
    } catch {
      /* fall through */
    }
  }

  if (!ctx.isSuperAdmin && ctx.temples[0]) {
    return {
      mode: 'temple',
      templeId: ctx.temples[0].id,
      temple: ctx.temples[0],
    };
  }

  return { mode: 'all', templeId: null, temple: null };
}

/** Trụ trì luôn có temple; SuperAdmin có thể null nếu chưa chọn. */
export async function requireTempleId(
  ctx: AdminContext,
  queryTempleId?: string | null,
): Promise<{ templeId: string; temple: TempleBrief }> {
  const scope = await resolveTempleScope(ctx, queryTempleId);
  if (scope.templeId && scope.temple) {
    return { templeId: scope.templeId, temple: scope.temple };
  }
  throw new Error('TEMPLE_REQUIRED');
}
