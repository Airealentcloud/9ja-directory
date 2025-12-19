-- Fix null email for the specific user
-- We will update the email for the profile ID found in the previous step
UPDATE profiles
SET email = 'YOUR_ADMIN_EMAIL_HERE' -- Replace with your admin email
WHERE id = '48c745a0-b716-4b89-aafc-fd3405317ebf';

-- Verify
SELECT * FROM profiles WHERE id = '48c745a0-b716-4b89-aafc-fd3405317ebf';
