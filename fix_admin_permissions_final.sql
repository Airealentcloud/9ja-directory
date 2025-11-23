-- Fix Admin Permissions for Listings and Profiles

-- 1. Ensure RLS is enabled
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Allow Admins to UPDATE any listing
-- Drop existing policy if it exists to avoid conflicts (optional, but safer to use DO block or just create new name)
DROP POLICY IF EXISTS "Admins can update any listing" ON listings;

CREATE POLICY "Admins can update any listing"
ON listings
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- 3. Allow Admins to SELECT any profile (to see user details in admin dashboard)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- 4. Allow Admins to UPDATE any profile (for future admin user management)
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

CREATE POLICY "Admins can update any profile"
ON profiles
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- 5. Allow Admins to DELETE listings (if needed)
DROP POLICY IF EXISTS "Admins can delete any listing" ON listings;

CREATE POLICY "Admins can delete any listing"
ON listings
FOR DELETE
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);
