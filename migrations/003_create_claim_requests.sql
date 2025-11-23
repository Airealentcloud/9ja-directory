-- Create Claim Requests Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS claim_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Claim details
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    proof_document TEXT, -- URL to uploaded document or text description
    notes TEXT,
    
    -- Admin processing
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one pending claim per user per listing
    UNIQUE(listing_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_claim_requests_listing_id ON claim_requests(listing_id);
CREATE INDEX IF NOT EXISTS idx_claim_requests_user_id ON claim_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_claim_requests_status ON claim_requests(status);

-- Add RLS policies
ALTER TABLE claim_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own claims
CREATE POLICY "Users can view own claims"
    ON claim_requests FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create claims
CREATE POLICY "Users can create claims"
    ON claim_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admins can view and manage all claims
CREATE POLICY "Admins can manage all claims"
    ON claim_requests FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Verify the table
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'claim_requests'
ORDER BY ordinal_position;
