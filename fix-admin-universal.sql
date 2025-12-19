-- UNIVERSAL FIX FOR ADMIN DASHBOARD
-- Replace YOUR_ADMIN_EMAIL_HERE with your admin email before running.
-- Run this in Supabase SQL Editor

-- 1. Create or update profile to admin role for the specific email
-- This uses a subquery to find the user ID automatically
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Get the user ID from auth.users
    SELECT id INTO user_uuid
    FROM auth.users
    WHERE email = 'YOUR_ADMIN_EMAIL_HERE';
    
    IF user_uuid IS NOT NULL THEN
        -- Insert or update the profile
        INSERT INTO profiles (id, role, full_name, email, updated_at)
        SELECT 
            user_uuid,
            'admin',
            raw_user_meta_data->>'full_name',
            email,
            NOW()
        FROM auth.users
        WHERE id = user_uuid
        ON CONFLICT (id) 
        DO UPDATE SET 
            role = 'admin',
            email = EXCLUDED.email,
            updated_at = NOW();
        
        RAISE NOTICE 'User % updated to admin role', user_uuid;
    ELSE
        RAISE NOTICE 'User with email YOUR_ADMIN_EMAIL_HERE not found';
    END IF;
END $$;

-- 2. Add email column to profiles if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 3. Update the handle_new_user function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'user', new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Fix RLS policies for listings
DROP POLICY IF EXISTS "listing_update_policy" ON listings;
DROP POLICY IF EXISTS "Admins can update any listing" ON listings;
DROP POLICY IF EXISTS "listing_select_policy" ON listings;
DROP POLICY IF EXISTS "Admins can view all listings" ON listings;

-- Allow admins to view all listings
CREATE POLICY "Admins can view all listings"
  ON listings FOR SELECT
  USING (
    auth.uid() = user_id
    OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to update any listing
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

-- 5. Fix RLS policies for profiles (to allow admins to see all profiles)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

-- Allow users to view their own profile and admins to view all
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

-- 6. Verify the changes
SELECT 
    p.id,
    p.role,
    p.email,
    p.full_name,
    u.email as auth_email
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'YOUR_ADMIN_EMAIL_HERE';
