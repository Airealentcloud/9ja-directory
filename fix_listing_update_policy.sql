-- Fix missing update policy for listings
-- Run this in Supabase SQL Editor

-- Allow users to update their own listings
CREATE POLICY "Users can update own listings"
ON listings
FOR UPDATE
USING (auth.uid() = user_id);

-- Verify the policy was added
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'listings' AND cmd = 'UPDATE';
