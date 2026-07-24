-- Branded, database-backed transactional email delivery.
-- Safe to run more than once.

ALTER TABLE public.email_notifications
  ADD COLUMN IF NOT EXISTS event_key TEXT,
  ADD COLUMN IF NOT EXISTS html_body TEXT,
  ADD COLUMN IF NOT EXISTS delivery_status TEXT NOT NULL DEFAULT 'queued',
  ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_error TEXT,
  ADD COLUMN IF NOT EXISTS next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE public.email_notifications
SET delivery_status = CASE WHEN sent THEN 'sent' ELSE 'queued' END
WHERE delivery_status IS NULL
   OR delivery_status NOT IN ('queued', 'processing', 'sent', 'failed');

ALTER TABLE public.email_notifications
  DROP CONSTRAINT IF EXISTS email_notifications_delivery_status_check;

ALTER TABLE public.email_notifications
  ADD CONSTRAINT email_notifications_delivery_status_check
  CHECK (delivery_status IN ('queued', 'processing', 'sent', 'failed'));

CREATE UNIQUE INDEX IF NOT EXISTS email_notifications_event_key_unique
  ON public.email_notifications(event_key);

CREATE INDEX IF NOT EXISTS email_notifications_delivery_queue_idx
  ON public.email_notifications(delivery_status, next_attempt_at, created_at)
  WHERE sent = FALSE;

-- Application code now creates one richer receipt with an event key. Removing the
-- old trigger prevents a second plain-text receipt when payment status changes.
DROP TRIGGER IF EXISTS on_payment_status_changed_notify ON public.payments;
DROP FUNCTION IF EXISTS public.notify_payment_success();

CREATE OR REPLACE FUNCTION public.set_email_notification_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS email_notifications_set_updated_at
  ON public.email_notifications;

CREATE TRIGGER email_notifications_set_updated_at
BEFORE UPDATE ON public.email_notifications
FOR EACH ROW
EXECUTE FUNCTION public.set_email_notification_updated_at();

CREATE OR REPLACE FUNCTION public.claim_email_notifications(batch_limit INTEGER DEFAULT 50)
RETURNS SETOF public.email_notifications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF batch_limit < 1 OR batch_limit > 100 THEN
    RAISE EXCEPTION 'batch_limit must be between 1 and 100';
  END IF;

  RETURN QUERY
  WITH candidates AS (
    SELECT id
    FROM public.email_notifications
    WHERE sent = FALSE
      AND delivery_status IN ('queued', 'failed')
      AND attempts < 5
      AND next_attempt_at <= NOW()
    ORDER BY created_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT batch_limit
  )
  UPDATE public.email_notifications AS notification
  SET delivery_status = 'processing',
      attempts = notification.attempts + 1,
      last_error = NULL,
      updated_at = NOW()
  FROM candidates
  WHERE notification.id = candidates.id
  RETURNING notification.*;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_email_notifications(INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_email_notifications(INTEGER) FROM anon;
REVOKE ALL ON FUNCTION public.claim_email_notifications(INTEGER) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.claim_email_notifications(INTEGER) TO service_role;
