-- Quick Verification: Did you run fix-admin-and-emails.sql?
-- Run this to check and fix if needed

-- First, let's see what policies exist
SELECT policyname FROM pg_policies WHERE tablename = 'listings';

-- If you see old policy names like "Approved listings are viewable by everyone",
-- then you need to run fix-admin-and-emails.sql

-- Quick fix: Just run these essential commands

-- Drop old policies
DROP POLICY IF EXISTS "Approved listings are viewable by everyone" ON listings;
DROP POLICY IF EXISTS "Users can insert own listings" ON listings;
DROP POLICY IF EXISTS "Users can update own listings" ON listings;

-- Create new SELECT policy that allows admins to see everything
CREATE POLICY "listing_select_policy"
  ON listings FOR SELECT
  USING (
    status = 'approved'
    OR auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create INSERT policy
CREATE POLICY "listing_insert_policy"
  ON listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create UPDATE policy for admins
CREATE POLICY "listing_update_policy"
  ON listings FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Now verify: Check recent listings
SELECT 
  business_name,
  status,
  user_id,
  created_at
FROM listings
ORDER BY created_at DESC
LIMIT 3;

-- Verify admin user
SELECT 
  email,
  role
FROM profiles
JOIN auth.users ON profiles.id = auth.users.id
WHERE email = 'YOUR_ADMIN_EMAIL_HERE';
