-- Phase 2: Email Notifications (Signup + Payments)
-- Run this in Supabase SQL Editor

-- 1) Email notifications table (queue)
CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE INDEX IF NOT EXISTS idx_email_notifications_sent ON email_notifications(sent);
CREATE INDEX IF NOT EXISTS idx_email_notifications_user ON email_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_created_at ON email_notifications(created_at DESC);

ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
DROP POLICY IF EXISTS "Users can view own email notifications" ON email_notifications;
CREATE POLICY "Users can view own email notifications"
  ON email_notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view and manage all notifications
DROP POLICY IF EXISTS "Admins can manage all email notifications" ON email_notifications;
CREATE POLICY "Admins can manage all email notifications"
  ON email_notifications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- 2) Notify admins on new user signup (via profiles insert)
CREATE OR REPLACE FUNCTION notify_admin_on_new_profile()
RETURNS TRIGGER AS $$
DECLARE
  admin_rec RECORD;
  new_user_label TEXT;
BEGIN
  new_user_label := COALESCE(NEW.full_name, NEW.email, NEW.id::TEXT);

  FOR admin_rec IN
    SELECT id, email FROM profiles WHERE role = 'admin' AND email IS NOT NULL
  LOOP
    INSERT INTO email_notifications (user_id, email, type, subject, body)
    VALUES (
      admin_rec.id,
      admin_rec.email,
      'admin_new_signup',
      'New signup on 9jaDirectory',
      'A new user just signed up on 9jaDirectory.\n\n' ||
      'User: ' || new_user_label || '\n' ||
      'Email: ' || COALESCE(NEW.email, 'N/A') || '\n' ||
      'User ID: ' || NEW.id::TEXT || '\n' ||
      'Time: ' || NOW()::TEXT
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created_notify_admin ON profiles;
CREATE TRIGGER on_profile_created_notify_admin
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_on_new_profile();

-- 3) Notify user + admins on successful payment
CREATE OR REPLACE FUNCTION notify_payment_success()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  business_name TEXT;
  admin_rec RECORD;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'success' THEN
    SELECT email INTO user_email FROM profiles WHERE id = NEW.user_id;

    IF NEW.listing_id IS NOT NULL THEN
      SELECT listings.business_name INTO business_name FROM listings WHERE id = NEW.listing_id;
    END IF;

    -- User receipt
    IF user_email IS NOT NULL THEN
      INSERT INTO email_notifications (user_id, email, type, subject, body, listing_id)
      VALUES (
        NEW.user_id,
        user_email,
        'payment_success',
        'Payment received — 9jaDirectory',
        'Thanks! We received your payment.\n\n' ||
        'Plan: ' || NEW.plan || '\n' ||
        'Listing: ' || COALESCE(business_name, 'N/A') || '\n' ||
        'Reference: ' || NEW.reference || '\n',
        NEW.listing_id
      );
    END IF;

    -- Admin alert
    FOR admin_rec IN
      SELECT id, email FROM profiles WHERE role = 'admin' AND email IS NOT NULL
    LOOP
      INSERT INTO email_notifications (user_id, email, type, subject, body, listing_id)
      VALUES (
        admin_rec.id,
        admin_rec.email,
        'admin_payment_success',
        'New payment received — 9jaDirectory',
        'A payment was completed.\n\n' ||
        'User ID: ' || NEW.user_id::TEXT || '\n' ||
        'Listing: ' || COALESCE(business_name, 'N/A') || '\n' ||
        'Plan: ' || NEW.plan || '\n' ||
        'Amount (kobo): ' || NEW.amount::TEXT || ' ' || NEW.currency || '\n' ||
        'Reference: ' || NEW.reference || '\n',
        NEW.listing_id
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_payment_status_changed_notify ON payments;
CREATE TRIGGER on_payment_status_changed_notify
  AFTER UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION notify_payment_success();

