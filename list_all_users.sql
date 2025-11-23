-- List All Users
-- Run this in Supabase SQL Editor to see who is actually in your database

SELECT 
    id, 
    email, 
    full_name, 
    role, 
    created_at 
FROM profiles 
ORDER BY created_at DESC;
