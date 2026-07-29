INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'temple-media',
  'temple-media',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read temple media" ON storage.objects;
CREATE POLICY "Public read temple media"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'temple-media');

DROP POLICY IF EXISTS "Temple admins upload temple media" ON storage.objects;
CREATE POLICY "Temple admins upload temple media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'temple-media'
    AND (storage.foldername(name))[1] = 'events'
    AND (
      public.is_super_admin()
      OR ((storage.foldername(name))[2])::uuid IN (SELECT public.user_temple_ids())
    )
  );

DROP POLICY IF EXISTS "Temple admins update temple media" ON storage.objects;
CREATE POLICY "Temple admins update temple media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'temple-media'
    AND (
      public.is_super_admin()
      OR ((storage.foldername(name))[2])::uuid IN (SELECT public.user_temple_ids())
    )
  )
  WITH CHECK (
    bucket_id = 'temple-media'
    AND (
      public.is_super_admin()
      OR ((storage.foldername(name))[2])::uuid IN (SELECT public.user_temple_ids())
    )
  );

DROP POLICY IF EXISTS "Temple admins delete temple media" ON storage.objects;
CREATE POLICY "Temple admins delete temple media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'temple-media'
    AND (
      public.is_super_admin()
      OR ((storage.foldername(name))[2])::uuid IN (SELECT public.user_temple_ids())
    )
  );
