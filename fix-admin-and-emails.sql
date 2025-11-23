-- Fix Admin Listing Visibility & Add Email Notifications
-- Run this in Supabase SQL Editor

-- ============================================
-- PART 1: Fix RLS Policies for Admin Access
-- ============================================

-- Drop ALL existing listing policies to start fresh
DROP POLICY IF EXISTS "Approved listings are viewable by everyone" ON listings;
DROP POLICY IF EXISTS "Users can insert own listings" ON listings;
DROP POLICY IF EXISTS "Users can update own listings" ON listings;
DROP POLICY IF EXISTS "Admins can view all listings" ON listings;
DROP POLICY IF EXISTS "Admins can update all listings" ON listings;
DROP POLICY IF EXISTS "Admins can delete all listings" ON listings;

-- Create new comprehensive policies

-- 1. SELECT Policy: Admins see ALL, users see approved + their own
CREATE POLICY "listing_select_policy"
  ON listings FOR SELECT
  USING (
    -- Everyone can see approved listings
    status = 'approved'
    -- Users can see their own listings regardless of status
    OR auth.uid() = user_id
    -- Admins can see ALL listings
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 2. INSERT Policy: Authenticated users can create listings
CREATE POLICY "listing_insert_policy"
  ON listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. UPDATE Policy: Users update own, admins update all
CREATE POLICY "listing_update_policy"
  ON listings FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 4. DELETE Policy: Only admins can delete
CREATE POLICY "listing_delete_policy"
  ON listings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- PART 2: Email Notification Functions
-- ============================================

-- Function to send email notification when listing is submitted
CREATE OR REPLACE FUNCTION notify_listing_submitted()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
BEGIN
  -- Only send email for new pending listings
  IF NEW.status = 'pending' AND TG_OP = 'INSERT' THEN
    -- Get user email and name
    SELECT 
      auth.users.email,
      COALESCE(profiles.full_name, auth.users.email)
    INTO user_email, user_name
    FROM auth.users
    LEFT JOIN profiles ON profiles.id = auth.users.id
    WHERE auth.users.id = NEW.user_id;

    -- Note: Supabase doesn't have a built-in send_email function
    -- You'll need to use a webhook or Edge Function for actual email sending
    -- For now, we'll log this to a notifications table
    
    -- Insert notification record (you can process this with a cron job or Edge Function)
    INSERT INTO email_notifications (
      user_id,
      email,
      type,
      subject,
      body,
      listing_id
    ) VALUES (
      NEW.user_id,
      user_email,
      'listing_submitted',
      'Your business listing is pending approval',
      'Hello ' || user_name || ',

Thank you for submitting "' || NEW.business_name || '" to 9jaDirectory.

Your listing is currently under review by our team. We will notify you once it has been approved.

Business Details:
- Name: ' || NEW.business_name || '
- Category: ' || COALESCE(NEW.category_id::TEXT, 'N/A') || '
- Status: Pending Approval

Thank you for your patience!

Best regards,
9jaDirectory Team',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send email notification when listing status changes
CREATE OR REPLACE FUNCTION notify_listing_status_changed()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  email_subject TEXT;
  email_body TEXT;
BEGIN
  -- Only send email if status changed
  IF OLD.status != NEW.status THEN
    -- Get user email and name
    SELECT 
      auth.users.email,
      COALESCE(profiles.full_name, auth.users.email)
    INTO user_email, user_name
    FROM auth.users
    LEFT JOIN profiles ON profiles.id = auth.users.id
    WHERE auth.users.id = NEW.user_id;

    -- Prepare email based on new status
    IF NEW.status = 'approved' THEN
      email_subject := 'Your business listing has been approved! 🎉';
      email_body := 'Hello ' || user_name || ',

Great news! Your business listing "' || NEW.business_name || '" has been approved and is now live on 9jaDirectory.

You can view your listing at: https://yourdomain.com/listings/' || NEW.slug || '

Thank you for being part of 9jaDirectory!

Best regards,
9jaDirectory Team';
    
    ELSIF NEW.status = 'rejected' THEN
      email_subject := 'Update on your business listing submission';
      email_body := 'Hello ' || user_name || ',

Unfortunately, your business listing "' || NEW.business_name || '" could not be approved at this time.

Reason: ' || COALESCE(NEW.rejection_reason, 'No reason provided') || '

You can edit and resubmit your listing from your dashboard.

If you have any questions, please contact our support team.

Best regards,
9jaDirectory Team';
    ELSE
      -- For other status changes, don't send email
      RETURN NEW;
    END IF;

    -- Insert notification record
    INSERT INTO email_notifications (
      user_id,
      email,
      type,
      subject,
      body,
      listing_id
    ) VALUES (
      NEW.user_id,
      user_email,
      'listing_' || NEW.status,
      email_subject,
      email_body,
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PART 3: Create Email Notifications Table
-- ============================================

CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  type TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_email_notifications_sent ON email_notifications(sent);
CREATE INDEX IF NOT EXISTS idx_email_notifications_user ON email_notifications(user_id);

-- ============================================
-- PART 4: Create Triggers
-- ============================================

-- Trigger for new listing submissions
DROP TRIGGER IF EXISTS on_listing_submitted ON listings;
CREATE TRIGGER on_listing_submitted
  AFTER INSERT ON listings
  FOR EACH ROW
  EXECUTE FUNCTION notify_listing_submitted();

-- Trigger for listing status changes
DROP TRIGGER IF EXISTS on_listing_status_changed ON listings;
CREATE TRIGGER on_listing_status_changed
  AFTER UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION notify_listing_status_changed();

-- ============================================
-- PART 5: Verification Queries
-- ============================================

-- Check if admin user exists
SELECT 
  auth.users.email,
  profiles.role
FROM profiles
JOIN auth.users ON profiles.id = auth.users.id
WHERE profiles.role = 'admin';

-- Check pending listings (should be visible to admin)
SELECT 
  id,
  business_name,
  status,
  created_at
FROM listings
WHERE status = 'pending'
ORDER BY created_at DESC
LIMIT 5;

-- Check email notifications table
SELECT COUNT(*) as total_notifications FROM email_notifications;

SELECT 'Setup complete! Admin can now see all listings and email notifications are enabled.' as status;
