-- Fix Profile RLS Policies
-- Run this if you still encounter "Failed to update profile" errors

-- 1. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- 3. Allow users to insert their own profile (if it doesn't exist)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 4. Allow everyone to view profiles (needed for reviews/claims display)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);
