-- Add user_id column to link listings to users
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Add city column to store text-based city names (since the form collects text)
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS city TEXT;

-- Enable Row Level Security (RLS) if not already enabled
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to insert their own listings
CREATE POLICY "Users can insert their own listings" 
ON listings 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to view their own pending listings (optional, but good practice)
CREATE POLICY "Users can view their own listings" 
ON listings 
FOR SELECT 
USING (auth.uid() = user_id OR status = 'approved');
