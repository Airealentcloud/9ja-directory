-- Phase 4: Payment Leads (pre-checkout capture)
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS payment_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,

  email TEXT NOT NULL,
  phone TEXT,
  business_name TEXT,

  plan TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  reference TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'abandoned')),
  paid_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_leads_reference ON payment_leads(reference);
CREATE INDEX IF NOT EXISTS idx_payment_leads_status ON payment_leads(status);
CREATE INDEX IF NOT EXISTS idx_payment_leads_created_at ON payment_leads(created_at DESC);

ALTER TABLE payment_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all payment leads" ON payment_leads;
CREATE POLICY "Admins can manage all payment leads"
  ON payment_leads FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

CREATE OR REPLACE FUNCTION update_payment_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS payment_leads_update_timestamp ON payment_leads;
CREATE TRIGGER payment_leads_update_timestamp
  BEFORE UPDATE ON payment_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_leads_updated_at();
