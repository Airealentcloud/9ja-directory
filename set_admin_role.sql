-- Set Your User as Admin
-- Run this in Supabase SQL Editor

-- Check current profiles and their roles
SELECT id, email, full_name, role FROM profiles;

-- Set your user (YOUR_ADMIN_EMAIL_HERE) as admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'YOUR_ADMIN_EMAIL_HERE';

-- Verify the change
SELECT id, email, full_name, role FROM profiles WHERE email = 'YOUR_ADMIN_EMAIL_HERE';

-- Test if you're now admin
SELECT public.is_admin() as am_i_admin;
