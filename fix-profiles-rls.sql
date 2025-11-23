-- Check existing policies on profiles
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Enable RLS on profiles if not already enabled (it should be)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create comprehensive policies for profiles

-- 1. Public can view profiles (needed for public listings to show owner info if we want, but definitely for admins)
-- Let's make it so everyone can view profiles for now to be safe, or restrict to auth users
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- 2. Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 3. Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 4. Admins can update any profile (optional, but good for management)
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Verify the admin user exists and has role 'admin'
SELECT * FROM profiles WHERE email = 'israelakhas@gmail.com';

-- If not admin, make them admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'israelakhas@gmail.com';
