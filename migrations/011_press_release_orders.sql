-- Migration: Press Release Orders Table
-- Description: Store press release service orders with support for both Paystack and bank transfer payments

-- Create payment method enum
CREATE TYPE press_release_payment_method AS ENUM ('paystack', 'bank_transfer');

-- Create payment status enum
CREATE TYPE press_release_payment_status AS ENUM ('pending', 'success', 'failed', 'abandoned');

-- Create order status enum
CREATE TYPE press_release_order_status AS ENUM ('pending_payment', 'paid', 'in_progress', 'completed', 'cancelled', 'refunded');

-- Create press_release_orders table
CREATE TABLE IF NOT EXISTS press_release_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User reference (nullable for guest checkout)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Package details
  package_slug TEXT NOT NULL,
  package_name TEXT NOT NULL,
  package_price INTEGER NOT NULL, -- Amount in kobo (NGN * 100)
  package_type TEXT DEFAULT 'standalone', -- standalone, bundle, reputation, copywriting

  -- Customer information (for guest checkout)
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  company_name TEXT,

  -- Payment information
  payment_method press_release_payment_method NOT NULL DEFAULT 'paystack',
  payment_reference TEXT UNIQUE,
  payment_status press_release_payment_status NOT NULL DEFAULT 'pending',

  -- Bank transfer specific
  bank_transfer_proof TEXT, -- URL to uploaded receipt image
  bank_transfer_confirmed_by UUID REFERENCES auth.users(id),
  bank_transfer_confirmed_at TIMESTAMP WITH TIME ZONE,

  -- Order details
  order_notes TEXT,
  press_release_content TEXT, -- Can be Google Docs link or raw text

  -- Admin management
  admin_notes TEXT,
  assigned_to UUID REFERENCES auth.users(id),

  -- Order status tracking
  status press_release_order_status NOT NULL DEFAULT 'pending_payment',

  -- Timestamps
  paid_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE, -- For bank transfer 48-hour expiry
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_press_release_orders_user_id ON press_release_orders(user_id);
CREATE INDEX idx_press_release_orders_status ON press_release_orders(status);
CREATE INDEX idx_press_release_orders_payment_status ON press_release_orders(payment_status);
CREATE INDEX idx_press_release_orders_payment_reference ON press_release_orders(payment_reference);
CREATE INDEX idx_press_release_orders_customer_email ON press_release_orders(customer_email);
CREATE INDEX idx_press_release_orders_created_at ON press_release_orders(created_at DESC);
CREATE INDEX idx_press_release_orders_expires_at ON press_release_orders(expires_at) WHERE expires_at IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE press_release_orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own orders (by user_id or email)
CREATE POLICY "Users can view own orders"
  ON press_release_orders
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Policy: Anyone can create orders (guest checkout)
CREATE POLICY "Anyone can create orders"
  ON press_release_orders
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update their own orders (for uploading receipts)
CREATE POLICY "Users can update own orders"
  ON press_release_orders
  FOR UPDATE
  USING (
    auth.uid() = user_id
    OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id
    OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Policy: Admins can do everything
CREATE POLICY "Admins have full access to orders"
  ON press_release_orders
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Service role has full access (for API operations)
CREATE POLICY "Service role has full access"
  ON press_release_orders
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_press_release_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_press_release_orders_updated_at
  BEFORE UPDATE ON press_release_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_press_release_orders_updated_at();

-- Create function to set expires_at for bank transfers
CREATE OR REPLACE FUNCTION set_bank_transfer_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_method = 'bank_transfer' AND NEW.expires_at IS NULL THEN
    NEW.expires_at = NOW() + INTERVAL '48 hours';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for bank transfer expiry
CREATE TRIGGER trigger_set_bank_transfer_expiry
  BEFORE INSERT ON press_release_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_bank_transfer_expiry();

-- Add comment for documentation
COMMENT ON TABLE press_release_orders IS 'Stores press release service orders with support for Paystack and manual bank transfer payments';
