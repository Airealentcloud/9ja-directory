-- Fix Storage Buckets
-- Run this in Supabase SQL Editor to create the missing buckets

-- 1. Create 'avatars' bucket (Public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create 'documents' bucket (Private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Enable RLS on objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 4. Policies for 'avatars'
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

DROP POLICY IF EXISTS "Anyone can upload an avatar" ON storage.objects;
CREATE POLICY "Anyone can upload an avatar"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'avatars' );

DROP POLICY IF EXISTS "Anyone can update their own avatar" ON storage.objects;
CREATE POLICY "Anyone can update their own avatar"
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'avatars' AND auth.uid() = owner );

-- 5. Policies for 'documents'
DROP POLICY IF EXISTS "Users can upload verification documents" ON storage.objects;
CREATE POLICY "Users can upload verification documents"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'documents' AND auth.uid() = owner );

DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
CREATE POLICY "Users can view their own documents"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'documents' AND auth.uid() = owner );

-- 6. Allow Admins to view all documents (for verification)
DROP POLICY IF EXISTS "Admins can view all documents" ON storage.objects;
CREATE POLICY "Admins can view all documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents' 
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
