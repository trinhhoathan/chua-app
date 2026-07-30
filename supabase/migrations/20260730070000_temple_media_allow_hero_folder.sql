DROP POLICY IF EXISTS "Temple admins upload temple media" ON storage.objects;
CREATE POLICY "Temple admins upload temple media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'temple-media'
    AND (storage.foldername(name))[1] = ANY (ARRAY['events', 'abbott', 'gallery', 'hero']::text[])
    AND (
      public.is_super_admin()
      OR ((storage.foldername(name))[2])::uuid IN (SELECT public.user_temple_ids())
    )
  );
