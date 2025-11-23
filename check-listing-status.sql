-- Check if listing was created and what status it has
-- Run this in Supabase SQL Editor

-- 1. Check the most recent listings (regardless of status)
SELECT 
  id,
  business_name,
  status,
  user_id,
  created_at,
  updated_at
FROM listings
ORDER BY created_at DESC
LIMIT 5;

-- 2. Check specifically for pending listings
SELECT 
  id,
  business_name,
  status,
  user_id,
  created_at
FROM listings
WHERE status = 'pending'
ORDER BY created_at DESC;

-- 3. Check if the listing might have been auto-approved
SELECT 
  id,
  business_name,
  status,
  user_id,
  created_at
FROM listings
WHERE status = 'approved'
ORDER BY created_at DESC
LIMIT 5;

-- 4. Get count by status
SELECT 
  status,
  COUNT(*) as count
FROM listings
GROUP BY status;
