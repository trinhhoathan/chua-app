import 'server-only';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Server-only Supabase client that bypasses RLS.
 * Use for admin actions: marking orders paid, writing settlement entries,
 * listing orders across a tenant, etc.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (never expose to client).
 */
export function getSupabaseAdmin() {
  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local — get it from Supabase Dashboard → Project Settings → API → service_role key.',
    );
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
