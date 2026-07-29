-- Phone login metadata on temple_admins
ALTER TABLE public.temple_admins
  ADD COLUMN IF NOT EXISTS phone text;

CREATE UNIQUE INDEX IF NOT EXISTS temple_admins_phone_unique
  ON public.temple_admins (phone)
  WHERE phone IS NOT NULL AND is_active = TRUE;

-- Super admin can manage all membership rows
DROP POLICY IF EXISTS "Super admins manage temple admins" ON public.temple_admins;
CREATE POLICY "Super admins manage temple admins"
  ON public.temple_admins
  FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());
