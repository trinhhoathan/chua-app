-- Nhật ký đổi mật khẩu / SĐT đăng nhập (super admin + tự đổi)
-- Hiện app ghi qua notification_logs (template_key admin.credential.*).
-- Bảng này dành cho migrate sạch khi sẵn sàng chuyển hẳn.

CREATE TABLE IF NOT EXISTS public.admin_credential_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL CHECK (
    action IN ('password_reset', 'password_change', 'phone_change')
  ),
  actor_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  actor_phone text,
  actor_display_name text,
  target_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  target_admin_id uuid REFERENCES public.temple_admins (id) ON DELETE SET NULL,
  target_phone text,
  target_display_name text,
  temple_id uuid REFERENCES public.temples (id) ON DELETE SET NULL,
  old_phone text,
  new_phone text,
  ip text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_credential_logs_created_at_idx
  ON public.admin_credential_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS admin_credential_logs_target_user_idx
  ON public.admin_credential_logs (target_user_id, created_at DESC);

ALTER TABLE public.admin_credential_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admins read credential logs"
  ON public.admin_credential_logs;
CREATE POLICY "Super admins read credential logs"
  ON public.admin_credential_logs
  FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

-- Ghi chỉ qua service role (server actions); không mở INSERT cho authenticated.
