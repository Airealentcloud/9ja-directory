-- Fix Storage and Permissions
-- Run this in Supabase SQL Editor

-- 1. Ensure 'avatars' bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing restrictive policies on storage.objects
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload an avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;

-- 3. Create permissive policies for avatars (for debugging/fixing)
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Allow authenticated users to upload to avatars
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

-- Allow users to update/delete their own objects
CREATE POLICY "Owner Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'avatars' AND auth.uid() = owner );

CREATE POLICY "Owner Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'avatars' AND auth.uid() = owner );

-- 4. Check the specific listing mentioned (if it exists)
SELECT id, business_name, images, updated_at 
FROM listings 
WHERE business_name ILIKE '%realent%' OR business_name ILIKE '%a.i%';
