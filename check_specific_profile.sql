-- Check profile for the user who owns the listing
SELECT * 
FROM profiles 
WHERE id = '48c745a0-b716-4b89-aafc-fd3405317ebf';

-- Also check if this ID exists in auth.users (if possible, though we can't always query auth schema directly depending on permissions, but we can try or infer)
-- We will just check profiles first.
