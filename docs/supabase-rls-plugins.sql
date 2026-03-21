-- MCMerchant: RLS policies for seller dashboard (plugins, versions, storage)
-- Run in Supabase → SQL Editor after enabling RLS on these tables (if not already).
--
-- Why: Dashboard plugin APIs use the logged-in user's JWT (anon key + cookies) so
-- auth.uid() matches the seller. Without these policies, inserts fail with:
--   new row violates row-level security policy for table "plugins"
--
-- Note: Keep SUPABASE_SERVICE_ROLE_KEY as the real "service_role" secret for
-- server routes that must bypass RLS (e.g. purchase cleanup when deleting a version).

-- ---------------------------------------------------------------------------
-- public.plugins
-- ---------------------------------------------------------------------------
ALTER TABLE public.plugins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "plugins_select_published" ON public.plugins;
CREATE POLICY "plugins_select_published"
  ON public.plugins FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "plugins_select_own" ON public.plugins;
CREATE POLICY "plugins_select_own"
  ON public.plugins FOR SELECT TO authenticated
  USING (seller_id = auth.uid());

DROP POLICY IF EXISTS "plugins_insert_own" ON public.plugins;
CREATE POLICY "plugins_insert_own"
  ON public.plugins FOR INSERT TO authenticated
  WITH CHECK (seller_id = auth.uid());

DROP POLICY IF EXISTS "plugins_update_own" ON public.plugins;
CREATE POLICY "plugins_update_own"
  ON public.plugins FOR UPDATE TO authenticated
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

DROP POLICY IF EXISTS "plugins_delete_own" ON public.plugins;
CREATE POLICY "plugins_delete_own"
  ON public.plugins FOR DELETE TO authenticated
  USING (seller_id = auth.uid());

-- ---------------------------------------------------------------------------
-- public.plugin_versions
-- ---------------------------------------------------------------------------
ALTER TABLE public.plugin_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "plugin_versions_select_published" ON public.plugin_versions;
CREATE POLICY "plugin_versions_select_published"
  ON public.plugin_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.plugins p
      WHERE p.id = plugin_versions.plugin_id AND p.status = 'published'
    )
  );

DROP POLICY IF EXISTS "plugin_versions_select_own" ON public.plugin_versions;
CREATE POLICY "plugin_versions_select_own"
  ON public.plugin_versions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.plugins p
      WHERE p.id = plugin_versions.plugin_id AND p.seller_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "plugin_versions_insert_own" ON public.plugin_versions;
CREATE POLICY "plugin_versions_insert_own"
  ON public.plugin_versions FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.plugins p
      WHERE p.id = plugin_versions.plugin_id AND p.seller_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "plugin_versions_update_own" ON public.plugin_versions;
CREATE POLICY "plugin_versions_update_own"
  ON public.plugin_versions FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.plugins p
      WHERE p.id = plugin_versions.plugin_id AND p.seller_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.plugins p
      WHERE p.id = plugin_versions.plugin_id AND p.seller_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "plugin_versions_delete_own" ON public.plugin_versions;
CREATE POLICY "plugin_versions_delete_own"
  ON public.plugin_versions FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.plugins p
      WHERE p.id = plugin_versions.plugin_id AND p.seller_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Storage: plugin-images (paths like covers/<user-uuid>/...)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "plugin_images_insert_own" ON storage.objects;
CREATE POLICY "plugin_images_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'plugin-images'
    AND split_part(name, '/', 1) = 'covers'
    AND split_part(name, '/', 2) = auth.uid()::text
  );

DROP POLICY IF EXISTS "plugin_images_update_own" ON storage.objects;
CREATE POLICY "plugin_images_update_own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'plugin-images'
    AND split_part(name, '/', 1) = 'covers'
    AND split_part(name, '/', 2) = auth.uid()::text
  );

DROP POLICY IF EXISTS "plugin_images_delete_own" ON storage.objects;
CREATE POLICY "plugin_images_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'plugin-images'
    AND split_part(name, '/', 1) = 'covers'
    AND split_part(name, '/', 2) = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- Storage: plugin-files (paths like jars/<plugin-uuid>/...)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "plugin_files_insert_own" ON storage.objects;
CREATE POLICY "plugin_files_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'plugin-files'
    AND split_part(name, '/', 1) = 'jars'
    AND EXISTS (
      SELECT 1 FROM public.plugins p
      WHERE p.id::text = split_part(name, '/', 2)
        AND p.seller_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "plugin_files_delete_own" ON storage.objects;
CREATE POLICY "plugin_files_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'plugin-files'
    AND split_part(name, '/', 1) = 'jars'
    AND EXISTS (
      SELECT 1 FROM public.plugins p
      WHERE p.id::text = split_part(name, '/', 2)
        AND p.seller_id = auth.uid()
    )
  );
