-- Create Reviews Table for Listings
-- Run this in Supabase SQL Editor after running 001_enhanced_listings_schema.sql

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Review content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    comment TEXT NOT NULL,
    
    -- Reviewer info (for non-logged-in users)
    reviewer_name VARCHAR(100),
    reviewer_email VARCHAR(255),
    
    -- Moderation
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
    moderated_by UUID REFERENCES auth.users(id),
    moderated_at TIMESTAMP WITH TIME ZONE,
    
    -- Helpful votes
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reviews_listing_id ON reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Create helpful votes tracking table
CREATE TABLE IF NOT EXISTS review_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('helpful', 'not_helpful')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one vote per user per review
    UNIQUE(review_id, user_id)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON review_votes(review_id);

-- Function to update review helpful counts
CREATE OR REPLACE FUNCTION update_review_helpful_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.vote_type = 'helpful' THEN
            UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
        ELSE
            UPDATE reviews SET not_helpful_count = not_helpful_count + 1 WHERE id = NEW.review_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.vote_type = 'helpful' THEN
            UPDATE reviews SET helpful_count = helpful_count - 1 WHERE id = OLD.review_id;
        ELSE
            UPDATE reviews SET not_helpful_count = not_helpful_count - 1 WHERE id = OLD.review_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for helpful counts
DROP TRIGGER IF EXISTS review_votes_update_counts ON review_votes;
CREATE TRIGGER review_votes_update_counts
    AFTER INSERT OR DELETE ON review_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_review_helpful_counts();

-- Function to calculate average rating for a listing
CREATE OR REPLACE FUNCTION calculate_listing_rating(listing_uuid UUID)
RETURNS TABLE(average_rating DECIMAL, review_count INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROUND(AVG(rating)::DECIMAL, 1) as average_rating,
        COUNT(*)::INTEGER as review_count
    FROM reviews
    WHERE listing_id = listing_uuid
    AND status = 'approved';
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved reviews
CREATE POLICY "Anyone can view approved reviews"
    ON reviews FOR SELECT
    USING (status = 'approved');

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews"
    ON reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
    ON reviews FOR UPDATE
    USING (auth.uid() = user_id);

-- Admins can moderate all reviews
CREATE POLICY "Admins can moderate reviews"
    ON reviews FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- RLS for review_votes
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all votes"
    ON review_votes FOR SELECT
    USING (true);

CREATE POLICY "Users can manage own votes"
    ON review_votes FOR ALL
    USING (auth.uid() = user_id);

-- Verify the tables
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('reviews', 'review_votes')
ORDER BY table_name, ordinal_position;
