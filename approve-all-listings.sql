-- APPROVE ALL PENDING LISTINGS
-- This will make all pending listings visible in public search
-- Run this in Supabase SQL Editor

UPDATE listings 
SET status = 'approved' 
WHERE status = 'pending';

-- Check the results
SELECT 
    status,
    COUNT(*) as count
FROM listings
GROUP BY status;
