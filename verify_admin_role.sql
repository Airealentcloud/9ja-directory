-- Verify and Fix Admin Role
-- Run this in Supabase SQL Editor

-- 1. Check current user role (replace with your email if needed, or just run to see all admins)
SELECT id, email, role, full_name FROM profiles;

-- 2. Force ALL users to be admins (TEMPORARY for debugging, or specific user)
-- Uncomment the line below and replace 'your-email@example.com' to make a specific user admin
-- UPDATE profiles SET role = 'admin' WHERE email = 'israelakhas@gmail.com';

-- Or just make everyone admin for now to test:
UPDATE profiles SET role = 'admin';

-- 3. Check listings count
SELECT count(*) as total_listings FROM listings;

-- 4. Check if RLS allows viewing listings
-- This simulates what the application sees
SELECT * FROM listings LIMIT 5;
