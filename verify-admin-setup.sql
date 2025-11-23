-- Verification Script: Check if admin setup is working
-- Run this to verify everything is configured correctly

-- 1. Check what RLS policies exist
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'listings'
ORDER BY policyname;

-- 2. Verify your admin role
SELECT 
  auth.users.email,
  profiles.role,
  profiles.created_at
FROM profiles
JOIN auth.users ON profiles.id = auth.users.id
WHERE auth.users.email = 'israelakhas@gmail.com';

-- 3. Check if there are any pending listings
SELECT 
  id,
  business_name,
  status,
  user_id,
  created_at
FROM listings
WHERE status = 'pending'
ORDER BY created_at DESC;

-- 4. Check ALL recent listings (to see if any were created)
SELECT 
  id,
  business_name,
  status,
  user_id,
  created_at
FROM listings
ORDER BY created_at DESC
LIMIT 10;
