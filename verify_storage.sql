-- Verify Storage Configuration
-- 1. Check Buckets
SELECT id, name, public, created_at, updated_at
FROM storage.buckets;

-- 2. Check Policies on storage.objects
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 3. Check if RLS is enabled on storage.objects
SELECT relname, relrowsecurity
FROM pg_class
WHERE oid = 'storage.objects'::regclass;
