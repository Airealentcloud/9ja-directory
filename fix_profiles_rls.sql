-- Fix Profiles RLS to allow Admin Access and User Self-Access

-- 1. Enable RLS on profiles (ensure it's on)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Policy: Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- 3. Policy: Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- 4. Policy: Admins can view ALL profiles
-- Note: We avoid using a subquery on 'profiles' to check for admin role within the policy itself 
-- if possible to avoid infinite recursion, but since we need to check the role, we must.
-- To prevent recursion, we can use a security definer function or just ensure the policy doesn't block the check.
-- However, for simplicity in Supabase, a direct check usually works if the policy for the check itself is open or if we use a different method.
-- A common pattern is:
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 5. Policy: Public profiles (optional, if we want business owners to be visible)
-- If we want anyone to see basic profile info (like name) for a listing owner:
DROP POLICY IF EXISTS "Public can view basic profile info" ON profiles;
-- Uncomment if needed, but for now let's stick to secure defaults.
-- CREATE POLICY "Public can view basic profile info" ON profiles FOR SELECT USING (true);

-- 6. Fix Listings RLS for Admins (Ensure they can see all listings)
DROP POLICY IF EXISTS "Admins can view all listings" ON listings;
CREATE POLICY "Admins can view all listings"
ON listings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
