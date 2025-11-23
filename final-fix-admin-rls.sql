-- FINAL FIX: Admin can see pending listings
-- The listings exist but admin can't see them due to RLS

-- First, let's check what the current SELECT policy looks like
SELECT 
  policyname,
  qual::text as using_expression
FROM pg_policies 
WHERE tablename = 'listings' 
AND cmd = 'SELECT';

-- Now let's replace it with the correct one
-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "listing_select_policy" ON listings;
DROP POLICY IF EXISTS "Approved listings are viewable by everyone" ON listings;
DROP POLICY IF EXISTS "Admins can view all listings" ON listings;

-- Create the correct policy that allows admins to see ALL listings
CREATE POLICY "listing_select_policy"
  ON listings FOR SELECT
  USING (
    -- Everyone can see approved listings
    status = 'approved'
    -- Users can see their own listings
    OR user_id = auth.uid()
    -- ADMINS can see ALL listings (this is the key part!)
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Verify the policy was created correctly
SELECT 
  policyname,
  qual::text as using_expression
FROM pg_policies 
WHERE tablename = 'listings' 
AND policyname = 'listing_select_policy';

-- Test: Check if we can see pending listings now
-- (This will work if you're logged in as admin in Supabase dashboard)
SELECT 
  id,
  business_name,
  status,
  created_at
FROM listings
WHERE status = 'pending'
ORDER BY created_at DESC;
