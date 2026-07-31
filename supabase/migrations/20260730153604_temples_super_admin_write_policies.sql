-- SuperAdmin được tạo / sửa / xóa Phật tự và domain aliases (RLS)

CREATE POLICY "Super admins can insert temples"
  ON public.temples
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_super_admin());

CREATE POLICY "Super admins can delete temples"
  ON public.temples
  FOR DELETE
  TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "Super admins can insert temple_domains"
  ON public.temple_domains
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_super_admin());

CREATE POLICY "Super admins can update temple_domains"
  ON public.temple_domains
  FOR UPDATE
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "Super admins can delete temple_domains"
  ON public.temple_domains
  FOR DELETE
  TO authenticated
  USING (public.is_super_admin());
