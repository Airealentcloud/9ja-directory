-- COMPLETE FIX FOR ADMIN DASHBOARD
-- Run this in Supabase SQL Editor

-- 1. Make the user an Admin (using the ID found)
UPDATE profiles 
SET role = 'admin' 
WHERE id = '456858d3-39ff-4c0a-b63b-e779ac7b19b0';

-- 2. Add email column to profiles if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 3. Update the handle_new_user function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'user', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Fix RLS policies for listings
DROP POLICY IF EXISTS "listing_update_policy" ON listings;
DROP POLICY IF EXISTS "Admins can update any listing" ON listings;

CREATE POLICY "Admins can update any listing"
  ON listings FOR UPDATE
  USING (
    auth.uid() = user_id
    OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 5. Fix RLS policies for profiles (to allow admins to see emails)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id
    OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 6. Backfill emails (This is tricky without direct access to auth.users in SQL)
-- We can't easily backfill emails from SQL unless we have a wrapper.
-- But for new users it will work.
