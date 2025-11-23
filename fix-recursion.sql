-- FIX INFINITE RECURSION IN PROFILES RLS POLICY
-- Run this in Supabase SQL Editor

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create a simple policy that doesn't cause recursion
-- This allows users to view their own profile and makes all profiles readable
CREATE POLICY "Users can view profiles"
  ON profiles FOR SELECT
  USING (true);

-- Verify the fix
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles';
