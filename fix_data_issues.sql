-- Fix Data Issues: Assign Users and Reset Status
-- Run this in Supabase SQL Editor

-- 1. Get an admin user ID (we'll use the first one found)
DO $$
DECLARE
    admin_id UUID;
BEGIN
    SELECT id INTO admin_id FROM profiles WHERE role = 'admin' LIMIT 1;
    
    -- If no admin found, try any user
    IF admin_id IS NULL THEN
        SELECT id INTO admin_id FROM profiles LIMIT 1;
    END IF;

    -- If still null, raise notice
    IF admin_id IS NULL THEN
        RAISE NOTICE 'No users found in profiles table! Please sign up a user first.';
    ELSE
        RAISE NOTICE 'Assigning listings to user ID: %', admin_id;
        
        -- 2. Update listings with NULL user_id to belong to this user
        UPDATE listings 
        SET user_id = admin_id 
        WHERE user_id IS NULL;
        
        -- 3. Set some listings to 'pending' so they show up in the default Admin Dashboard view
        -- We'll set the 2 most recent ones to pending
        UPDATE listings
        SET status = 'pending'
        WHERE id IN (
            SELECT id FROM listings 
            ORDER BY created_at DESC 
            LIMIT 2
        );
        
        RAISE NOTICE 'Updated listings. Check the Admin Dashboard now.';
    END IF;
END $$;
