-- Phase 3: Subscriptions + Profile Permissions
-- Run this in Supabase SQL Editor

-- 1) Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  plan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),

  amount INTEGER,
  currency TEXT NOT NULL DEFAULT 'NGN',
  interval TEXT NOT NULL DEFAULT 'monthly' CHECK (interval IN ('one_time', 'monthly')),

  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,

  paystack_subscription_code TEXT,
  paystack_customer_code TEXT,
  paystack_email_token TEXT,
  authorization_code TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_user_id_unique ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can manage all subscriptions
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON subscriptions;
CREATE POLICY "Admins can manage all subscriptions"
  ON subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- 2) Add subscription/permission fields to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS can_add_listings BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS can_claim_listings BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS can_feature_listings BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS featured_posts_remaining INTEGER DEFAULT 0;

-- 3) Auto-update updated_at on subscriptions
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS subscriptions_update_timestamp ON subscriptions;
CREATE TRIGGER subscriptions_update_timestamp
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

