-- Phase 6: Enhanced Profiles & Storage
-- Run this in Supabase SQL Editor

-- 1. Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(100);

-- 2. Create Storage Buckets (if they don't exist)
-- Note: This requires the storage extension to be enabled (usually is by default)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false) -- Private bucket for verification docs
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Policies for Avatars
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

CREATE POLICY "Anyone can upload an avatar"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'avatars' );

CREATE POLICY "Anyone can update their own avatar"
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'avatars' AND auth.uid() = owner );

-- 4. Storage Policies for Documents (CAC, etc.)
-- Only the user who uploaded can see it (and admins via service role/dashboard)
CREATE POLICY "Users can upload verification documents"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'documents' AND auth.uid() = owner );

CREATE POLICY "Users can view their own documents"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'documents' AND auth.uid() = owner );

-- Verify changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('avatar_url', 'phone_number', 'bio');
