-- Debug Script: Check Admin Listing Visibility
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check if the listing was created
SELECT 
  id,
  business_name,
  status,
  user_id,
  created_at
FROM listings
ORDER BY created_at DESC
LIMIT 5;

-- 2. Check if admin user exists and has correct role
SELECT 
  auth.users.id,
  auth.users.email,
  profiles.role
FROM profiles
JOIN auth.users ON profiles.id = auth.users.id
WHERE auth.users.email = 'YOUR_ADMIN_EMAIL_HERE';

-- 3. Check current RLS policies on listings table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'listings';

-- 4. Test if admin can see pending listings (run this while logged in as admin)
-- This simulates what the admin panel query does
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "YOUR_ADMIN_USER_ID"}';

SELECT 
  id,
  business_name,
  status,
  created_at
FROM listings
WHERE status = 'pending'
ORDER BY created_at DESC;

-- 5. Check if email_notifications table exists
SELECT COUNT(*) as notification_count 
FROM email_notifications;
