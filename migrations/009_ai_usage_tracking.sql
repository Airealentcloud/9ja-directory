-- Migration: AI Usage Tracking
-- Description: Track AI feature usage for rate limiting
-- Run this in Supabase SQL Editor

-- Create AI usage tracking table
CREATE TABLE IF NOT EXISTS ai_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature TEXT NOT NULL,  -- 'description_generator', 'review_insights', etc.
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    usage_count INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Unique constraint to ensure one record per user/feature/day
    UNIQUE(user_id, feature, usage_date)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date
ON ai_usage(user_id, usage_date);

CREATE INDEX IF NOT EXISTS idx_ai_usage_feature
ON ai_usage(feature);

-- Enable RLS
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage
CREATE POLICY "Users can view own AI usage"
ON ai_usage FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own usage (via API)
CREATE POLICY "Users can insert own AI usage"
ON ai_usage FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own usage (via API)
CREATE POLICY "Users can update own AI usage"
ON ai_usage FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all usage (for analytics)
CREATE POLICY "Admins can view all AI usage"
ON ai_usage FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Grant permissions
GRANT ALL ON ai_usage TO authenticated;
GRANT ALL ON ai_usage TO service_role;

-- Add comment
COMMENT ON TABLE ai_usage IS 'Tracks AI feature usage for rate limiting and analytics';
