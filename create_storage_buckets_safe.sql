-- Safe Storage Setup
-- Run this in Supabase SQL Editor

-- 1. Create 'avatars' bucket (Public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create 'documents' bucket (Private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Policies for 'avatars'
-- We use DO blocks to handle "IF NOT EXISTS" for policies to avoid errors if they exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Avatar images are publicly accessible'
    ) THEN
        CREATE POLICY "Avatar images are publicly accessible"
        ON storage.objects FOR SELECT
        USING ( bucket_id = 'avatars' );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Anyone can upload an avatar'
    ) THEN
        CREATE POLICY "Anyone can upload an avatar"
        ON storage.objects FOR INSERT
        WITH CHECK ( bucket_id = 'avatars' );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Anyone can update their own avatar'
    ) THEN
        CREATE POLICY "Anyone can update their own avatar"
        ON storage.objects FOR UPDATE
        USING ( bucket_id = 'avatars' AND auth.uid() = owner );
    END IF;
END
$$;

-- 4. Policies for 'documents'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can upload verification documents'
    ) THEN
        CREATE POLICY "Users can upload verification documents"
        ON storage.objects FOR INSERT
        WITH CHECK ( bucket_id = 'documents' AND auth.uid() = owner );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can view their own documents'
    ) THEN
        CREATE POLICY "Users can view their own documents"
        ON storage.objects FOR SELECT
        USING ( bucket_id = 'documents' AND auth.uid() = owner );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Admins can view all documents'
    ) THEN
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
    END IF;
END
$$;
