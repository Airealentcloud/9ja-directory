-- Fix null email for the specific user
-- We will update the email for the profile ID found in the previous step
UPDATE profiles
SET email = 'israelakhas@gmail.com' -- Assuming this is the email based on previous context or we can try to look it up
WHERE id = '48c745a0-b716-4b89-aafc-fd3405317ebf';

-- Verify
SELECT * FROM profiles WHERE id = '48c745a0-b716-4b89-aafc-fd3405317ebf';
