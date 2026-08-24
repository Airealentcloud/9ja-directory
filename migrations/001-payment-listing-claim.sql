-- Prevents duplicate listings being created from a single payment.
--
-- Both the Paystack webhook and the /api/payments/verify callback call
-- fulfillPaystackSuccess(), and in the normal checkout flow they run within
-- milliseconds of each other. Without a claim flag both read listing_id as
-- NULL and both insert a listing.
--
-- listings.slug is UNIQUE but cannot prevent this, because generateSlug()
-- appends a random suffix — the two rows never collide.
--
-- Run this BEFORE deploying the matching fulfill.ts change.

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS listing_creation_started BOOLEAN DEFAULT NULL;

COMMENT ON COLUMN payments.listing_creation_started IS
  'Claim flag. Set to true by whichever fulfillment path creates the listing first; NULL means unclaimed. Reset to NULL if creation fails so a retry can proceed.';

-- Backfill: payments that already produced a listing are already claimed,
-- so a replayed webhook cannot create a second one.
UPDATE payments
   SET listing_creation_started = TRUE
 WHERE listing_id IS NOT NULL
   AND listing_creation_started IS NULL;
