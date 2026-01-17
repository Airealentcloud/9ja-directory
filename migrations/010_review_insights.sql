-- Migration: Review Insights Storage
-- Phase 5: AI Review Insights for Lifetime users

-- Create review_insights table to cache AI analysis results
CREATE TABLE IF NOT EXISTS review_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    insights JSONB NOT NULL,
    review_count INTEGER NOT NULL DEFAULT 0,
    analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Only one insight record per listing
    UNIQUE(listing_id)
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_review_insights_listing_id ON review_insights(listing_id);
CREATE INDEX IF NOT EXISTS idx_review_insights_user_id ON review_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_review_insights_analyzed_at ON review_insights(analyzed_at DESC);

-- Enable RLS
ALTER TABLE review_insights ENABLE ROW LEVEL SECURITY;

-- Policies for review_insights
-- Users can only see their own insights
CREATE POLICY "Users can view own review insights"
    ON review_insights
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own insights
CREATE POLICY "Users can insert own review insights"
    ON review_insights
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own insights
CREATE POLICY "Users can update own review insights"
    ON review_insights
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own insights
CREATE POLICY "Users can delete own review insights"
    ON review_insights
    FOR DELETE
    USING (auth.uid() = user_id);

-- Admin can view all insights
CREATE POLICY "Admin can view all review insights"
    ON review_insights
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_review_insights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER review_insights_updated_at
    BEFORE UPDATE ON review_insights
    FOR EACH ROW
    EXECUTE FUNCTION update_review_insights_updated_at();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON review_insights TO authenticated;

-- Add comment
COMMENT ON TABLE review_insights IS 'Stores AI-generated review analysis results for Lifetime plan users';
