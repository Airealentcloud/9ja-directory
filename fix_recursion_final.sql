-- Fix Infinite Recursion in RLS Policies
-- Run this in Supabase SQL Editor

-- 1. Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Admins can view all listings" ON listings;
DROP POLICY IF EXISTS "Admins can update any listing" ON listings;
DROP POLICY IF EXISTS "Admins can delete any listing" ON listings;

-- 2. Create a security definer function to check if user is admin
-- This function runs with elevated privileges and doesn't trigger RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create simple, non-recursive policies for profiles
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (public.is_admin());

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
ON profiles FOR UPDATE
USING (public.is_admin());

-- 4. Create policies for listings
CREATE POLICY "Admins can view all listings"
ON listings FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins can update any listing"
ON listings FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Admins can delete any listing"
ON listings FOR DELETE
USING (public.is_admin());

-- 5. Verify the function works
SELECT public.is_admin() as am_i_admin;
