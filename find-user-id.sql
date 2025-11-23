-- STEP 1: Find your user ID and current role
-- Run this first to see your current user information
SELECT 
    id,
    email,
    raw_user_meta_data->>'full_name' as full_name
FROM auth.users
WHERE email = 'israelakhas@gmail.com';

-- STEP 2: Check if you have a profile
-- Run this to see if you have a profile record
SELECT * FROM profiles WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'israelakhas@gmail.com'
);
