# Supabase setup for MCMerchant

After creating your Supabase project and running the database schema (see the main prompt), do the following.

**Developer storefronts:** optional columns on `profiles` (branding, vanity URLs, custom domain fields) are documented in [STOREFRONT_PLATFORM.md](./STOREFRONT_PLATFORM.md).

## 1. Create Storage buckets

In **Storage** → **New bucket**:

| Bucket           | Public? | Purpose              |
|------------------|---------|----------------------|
| **plugin-files** | No      | Plugin `.jar` files  |
| **plugin-images**| Yes     | Plugin cover images  |

## 2. Storage RLS policies (required for uploads)

Supabase Storage uses RLS on `storage.objects`. Without policies, uploads fail with **"new row violates row-level security policy"**.

In the Supabase Dashboard open **SQL Editor** and run:

```sql
-- Allow backend (service role) and authenticated users to upload to plugin-files
CREATE POLICY "Allow uploads to plugin-files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'plugin-files');

-- Allow backend to read (for signed URLs / downloads)
CREATE POLICY "Allow read plugin-files"
ON storage.objects FOR SELECT
USING (bucket_id = 'plugin-files');

-- Same for plugin-images (cover images)
CREATE POLICY "Allow uploads to plugin-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'plugin-images');

CREATE POLICY "Allow read plugin-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'plugin-images');
```

If you prefer to restrict uploads to the service role only, use:

```sql
CREATE POLICY "Service role upload plugin-files"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'plugin-files');

CREATE POLICY "Service role select plugin-files"
ON storage.objects FOR SELECT
TO service_role
USING (bucket_id = 'plugin-files');
```

Then retry the version upload.
