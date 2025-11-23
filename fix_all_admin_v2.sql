-- Comprehensive Admin Fix V2
-- Run this in Supabase SQL Editor

-- 1. Create the Security Definer Function (The Key Fix)
-- This allows checking admin status without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Grant execute permission to everyone (authenticated users need to call it)
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- 2. Fix Profiles RLS (Remove Recursion)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Use the function instead of a direct query to avoid recursion
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (public.is_admin());

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
ON profiles FOR UPDATE
USING (public.is_admin());

-- 3. Fix Listings RLS
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all listings" ON listings;
DROP POLICY IF EXISTS "Admins can update any listing" ON listings;
DROP POLICY IF EXISTS "Admins can delete any listing" ON listings;
DROP POLICY IF EXISTS "Approved listings are viewable by everyone" ON listings;

-- Allow admins to see EVERYTHING (including pending/rejected)
CREATE POLICY "Admins can view all listings"
ON listings FOR SELECT
USING (public.is_admin());

-- Allow public to see ONLY approved listings
CREATE POLICY "Public can view approved listings"
ON listings FOR SELECT
USING (status = 'approved');

-- Allow users to see their OWN listings (regardless of status)
CREATE POLICY "Users can view own listings"
ON listings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any listing"
ON listings FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Admins can delete any listing"
ON listings FOR DELETE
USING (public.is_admin());

-- 4. Fix Reviews RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can update any review" ON reviews;
DROP POLICY IF EXISTS "Admins can delete any review" ON reviews;

CREATE POLICY "Admins can view all reviews"
ON reviews FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins can update any review"
ON reviews FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Admins can delete any review"
ON reviews FOR DELETE
USING (public.is_admin());

-- 5. Fix Data Issues (Null User IDs)
DO $$
DECLARE
    admin_id UUID;
BEGIN
    -- Get the first admin user (or any user if no admin)
    SELECT id INTO admin_id FROM profiles WHERE role = 'admin' LIMIT 1;
    IF admin_id IS NULL THEN
        SELECT id INTO admin_id FROM profiles LIMIT 1;
    END IF;

    IF admin_id IS NOT NULL THEN
        UPDATE listings SET user_id = admin_id WHERE user_id IS NULL;
    END IF;
END $$;

-- 6. Ensure YOU are Admin (Replace email if needed, but this covers the one you mentioned)
UPDATE profiles SET role = 'admin' WHERE email = 'israelakhas@gmail.com';

-- 7. Verify
SELECT public.is_admin() as am_i_admin_now;
