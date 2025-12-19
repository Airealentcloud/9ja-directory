-- Admin Setup Script
-- Run this in Supabase SQL Editor AFTER signing up with YOUR_ADMIN_EMAIL_HERE

-- Step 1: Add RLS policies to allow admins to manage all listings
-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Admins can view all listings" ON listings;
DROP POLICY IF EXISTS "Admins can update all listings" ON listings;
DROP POLICY IF EXISTS "Admins can delete all listings" ON listings;

-- Allow admins to view ALL listings (including pending/rejected)
CREATE POLICY "Admins can view all listings"
  ON listings FOR SELECT
  USING (
    status = 'approved' 
    OR user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to update ALL listings (for approval/rejection)
CREATE POLICY "Admins can update all listings"
  ON listings FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to delete listings (optional but useful)
CREATE POLICY "Admins can delete all listings"
  ON listings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Step 2: Make YOUR_ADMIN_EMAIL_HERE an admin
-- This will work AFTER you sign up with that email
UPDATE profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'YOUR_ADMIN_EMAIL_HERE'
);

-- Verify the admin was created
SELECT 
  auth.users.email, 
  profiles.role,
  profiles.created_at
FROM profiles
JOIN auth.users ON profiles.id = auth.users.id
WHERE auth.users.email = 'YOUR_ADMIN_EMAIL_HERE';
