-- Set Your User as Admin
-- Run this in Supabase SQL Editor

-- Check current profiles and their roles
SELECT id, email, full_name, role FROM profiles;

-- Set your user (israelakhas@gmail.com) as admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'israelakhas@gmail.com';

-- Verify the change
SELECT id, email, full_name, role FROM profiles WHERE email = 'israelakhas@gmail.com';

-- Test if you're now admin
SELECT public.is_admin() as am_i_admin;
