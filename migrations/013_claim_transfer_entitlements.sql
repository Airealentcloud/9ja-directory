-- Close the ownership-transfer gap left by migration 012.
-- Run this once in the Supabase SQL Editor after 012_plan_entitlement_enforcement.sql.
-- It is safe to rerun.

BEGIN;

CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.apply_owner_plan_entitlements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, auth, private
AS $$
DECLARE
  actor_id UUID := auth.uid();
  is_service BOOLEAN := COALESCE(auth.role(), '') = 'service_role';
  is_admin_actor BOOLEAN := FALSE;
  is_privileged BOOLEAN := FALSE;
  active_plan TEXT := 'free';
  listing_limit INTEGER := 0;
  active_count INTEGER := 0;
  is_approved BOOLEAN := FALSE;
  has_active_premium_add_on BOOLEAN := FALSE;
BEGIN
  IF NEW.user_id IS NOT DISTINCT FROM OLD.user_id THEN
    RETURN NEW;
  END IF;

  -- SQL Editor and controlled maintenance sessions must remain usable.
  IF session_user IN ('postgres', 'supabase_admin') THEN
    RETURN NEW;
  END IF;

  IF actor_id IS NOT NULL THEN
    SELECT COALESCE(p.role = 'admin', FALSE)
    INTO is_admin_actor
    FROM public.profiles p
    WHERE p.id = actor_id;
  END IF;

  is_privileged := is_service OR COALESCE(is_admin_actor, FALSE);
  IF NOT is_privileged THEN
    RAISE EXCEPTION 'Only an administrator may transfer a listing to another account.'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.user_id IS NULL THEN
    RAISE EXCEPTION 'A transferred listing must have a customer account.'
      USING ERRCODE = '23514';
  END IF;

  -- Lock the destination profile so concurrent transfers cannot both pass the
  -- same Basic or Premium listing allowance.
  SELECT
    CASE
      WHEN p.role = 'admin' THEN 'lifetime'
      WHEN p.subscription_plan IN ('basic', 'premium', 'lifetime')
        AND p.subscription_status = 'active'
        AND (p.subscription_expires_at IS NULL OR p.subscription_expires_at > NOW())
      THEN p.subscription_plan
      ELSE 'free'
    END
  INTO active_plan
  FROM public.profiles p
  WHERE p.id = NEW.user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'The destination account does not have a customer profile.'
      USING ERRCODE = '42501';
  END IF;

  IF active_plan = 'free' THEN
    RAISE EXCEPTION 'Activate the customer paid plan before assigning this listing.'
      USING ERRCODE = '42501';
  END IF;

  IF COALESCE(NEW.claimed, FALSE) = TRUE AND active_plan = 'basic' THEN
    RAISE EXCEPTION 'Claiming an existing listing requires a Premium or Lifetime plan.'
      USING ERRCODE = '23514';
  END IF;

  IF NEW.status IN ('pending', 'approved') THEN
    listing_limit := CASE
      WHEN active_plan = 'basic' THEN 1
      WHEN active_plan = 'premium' THEN 5
      ELSE 2147483647
    END;

    SELECT COUNT(*)::INTEGER
    INTO active_count
    FROM public.listings l
    WHERE l.user_id = NEW.user_id
      AND l.id <> OLD.id
      AND l.status IN ('pending', 'approved');

    IF active_count >= listing_limit THEN
      RAISE EXCEPTION 'The % plan listing allowance has been reached.', active_plan
        USING ERRCODE = '23514';
    END IF;
  END IF;

  is_approved := NEW.status = 'approved';
  has_active_premium_add_on := (
    active_plan = 'premium'
    AND OLD.plan_tier = 'premium'
    AND COALESCE(OLD.featured, FALSE) = TRUE
    AND OLD.featured_until IS NOT NULL
    AND OLD.featured_until > NOW()
    AND OLD.featured_until < NOW() + INTERVAL '2 years'
  );

  NEW.plan_tier := active_plan;
  NEW.verified := is_approved AND active_plan IN ('premium', 'lifetime');

  IF is_approved AND active_plan = 'lifetime' THEN
    NEW.featured := TRUE;
    NEW.is_featured := TRUE;
    NEW.featured_until := GREATEST(
      COALESCE(OLD.featured_until, NOW()),
      NOW() + INTERVAL '100 years'
    );
  ELSIF is_approved AND has_active_premium_add_on THEN
    NEW.featured := TRUE;
    NEW.is_featured := TRUE;
    NEW.featured_until := OLD.featured_until;
  ELSE
    NEW.featured := FALSE;
    NEW.is_featured := FALSE;
    NEW.featured_until := NULL;
  END IF;

  -- Keep the ownership transfer and its matching moderation record atomic. The
  -- application repeats this update as a fallback until every environment has
  -- applied this migration.
  IF COALESCE(NEW.claimed, FALSE) = TRUE THEN
    UPDATE public.claim_requests
    SET
      status = 'approved',
      reviewed_at = NOW(),
      reviewed_by = actor_id,
      rejection_reason = NULL,
      updated_at = NOW()
    WHERE listing_id = NEW.id
      AND user_id = NEW.user_id
      AND status = 'pending';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS apply_owner_plan_entitlements_trigger ON public.listings;
CREATE TRIGGER apply_owner_plan_entitlements_trigger
  BEFORE UPDATE OF user_id ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION private.apply_owner_plan_entitlements();

REVOKE ALL ON FUNCTION private.apply_owner_plan_entitlements() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.protect_claim_identity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, auth, private
AS $$
DECLARE
  actor_id UUID := auth.uid();
  is_service BOOLEAN := COALESCE(auth.role(), '') = 'service_role';
  is_admin_actor BOOLEAN := FALSE;
BEGIN
  IF session_user IN ('postgres', 'supabase_admin') OR is_service THEN
    RETURN NEW;
  END IF;

  IF actor_id IS NOT NULL THEN
    SELECT COALESCE(p.role = 'admin', FALSE)
    INTO is_admin_actor
    FROM public.profiles p
    WHERE p.id = actor_id;
  END IF;

  IF NOT COALESCE(is_admin_actor, FALSE) AND (
    NEW.user_id IS DISTINCT FROM OLD.user_id
    OR NEW.listing_id IS DISTINCT FROM OLD.listing_id
  ) THEN
    RAISE EXCEPTION 'A claim owner and business cannot be changed after submission.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_claim_identity_trigger ON public.claim_requests;
CREATE TRIGGER protect_claim_identity_trigger
  BEFORE UPDATE OF user_id, listing_id ON public.claim_requests
  FOR EACH ROW
  EXECUTE FUNCTION private.protect_claim_identity();

REVOKE ALL ON FUNCTION private.protect_claim_identity() FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "Users can resubmit rejected claims" ON public.claim_requests;
CREATE POLICY "Users can resubmit rejected claims"
  ON public.claim_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'rejected')
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
    AND reviewed_by IS NULL
    AND reviewed_at IS NULL
    AND rejection_reason IS NULL
  );

-- Back up and normalize claims that were approved before this guard existed.
CREATE TABLE IF NOT EXISTS private.claim_entitlement_backups (
  listing_id UUID PRIMARY KEY,
  previous_row JSONB NOT NULL,
  backed_up_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason TEXT NOT NULL DEFAULT '013_claim_transfer_entitlements'
);

REVOKE ALL ON TABLE private.claim_entitlement_backups FROM PUBLIC, anon, authenticated;

WITH eligible_owners AS (
  SELECT
    p.id,
    CASE
      WHEN p.role = 'admin' THEN 'lifetime'
      ELSE p.subscription_plan
    END AS effective_plan
  FROM public.profiles p
  WHERE p.role = 'admin'
     OR (
       p.subscription_plan IN ('premium', 'lifetime')
       AND p.subscription_status = 'active'
       AND (p.subscription_expires_at IS NULL OR p.subscription_expires_at > NOW())
     )
)
INSERT INTO private.claim_entitlement_backups (listing_id, previous_row)
SELECT l.id, to_jsonb(l)
FROM public.listings l
JOIN eligible_owners owner ON owner.id = l.user_id
WHERE l.claimed = TRUE
ON CONFLICT (listing_id) DO NOTHING;

WITH eligible_owners AS (
  SELECT
    p.id,
    CASE
      WHEN p.role = 'admin' THEN 'lifetime'
      ELSE p.subscription_plan
    END AS effective_plan
  FROM public.profiles p
  WHERE p.role = 'admin'
     OR (
       p.subscription_plan IN ('premium', 'lifetime')
       AND p.subscription_status = 'active'
       AND (p.subscription_expires_at IS NULL OR p.subscription_expires_at > NOW())
     )
)
UPDATE public.listings l
SET
  plan_tier = owner.effective_plan,
  verified = l.status = 'approved',
  featured = CASE
    WHEN l.status <> 'approved' THEN FALSE
    WHEN owner.effective_plan = 'lifetime' THEN TRUE
    WHEN owner.effective_plan = 'premium'
      AND l.featured = TRUE
      AND l.featured_until > NOW()
      AND l.featured_until < NOW() + INTERVAL '2 years'
    THEN TRUE
    ELSE FALSE
  END,
  is_featured = CASE
    WHEN l.status <> 'approved' THEN FALSE
    WHEN owner.effective_plan = 'lifetime' THEN TRUE
    WHEN owner.effective_plan = 'premium'
      AND l.featured = TRUE
      AND l.featured_until > NOW()
      AND l.featured_until < NOW() + INTERVAL '2 years'
    THEN TRUE
    ELSE FALSE
  END,
  featured_until = CASE
    WHEN l.status <> 'approved' THEN NULL
    WHEN owner.effective_plan = 'lifetime'
      THEN GREATEST(COALESCE(l.featured_until, NOW()), NOW() + INTERVAL '100 years')
    WHEN owner.effective_plan = 'premium'
      AND l.featured = TRUE
      AND l.featured_until > NOW()
      AND l.featured_until < NOW() + INTERVAL '2 years'
    THEN l.featured_until
    ELSE NULL
  END
FROM eligible_owners owner
WHERE l.user_id = owner.id
  AND l.claimed = TRUE;

COMMIT;

-- Verification: this should return no rows after claim approvals.
WITH owner_plans AS (
  SELECT
    p.id,
    CASE
      WHEN p.role = 'admin' THEN 'lifetime'
      ELSE p.subscription_plan
    END AS effective_plan,
    CASE
      WHEN p.role = 'admin' THEN TRUE
      ELSE (
        p.subscription_status = 'active'
        AND (p.subscription_expires_at IS NULL OR p.subscription_expires_at > NOW())
      )
    END AS is_active
  FROM public.profiles p
)
SELECT
  l.id,
  l.business_name,
  l.user_id,
  l.plan_tier,
  p.effective_plan AS account_plan,
  l.verified,
  l.featured,
  l.featured_until
FROM public.listings l
JOIN owner_plans p ON p.id = l.user_id
WHERE l.claimed = TRUE
  AND (
    p.is_active IS DISTINCT FROM TRUE
    OR p.effective_plan NOT IN ('premium', 'lifetime')
    OR l.plan_tier IS DISTINCT FROM p.effective_plan
    OR (l.status = 'approved' AND l.verified IS DISTINCT FROM TRUE)
    OR (
      p.effective_plan = 'premium'
      AND l.featured = TRUE
      AND (
        l.featured_until IS NULL
        OR l.featured_until <= NOW()
        OR l.featured_until >= NOW() + INTERVAL '2 years'
      )
    )
    OR (
      p.effective_plan = 'lifetime'
      AND l.status = 'approved'
      AND (
        l.featured IS DISTINCT FROM TRUE
        OR l.featured_until IS NULL
        OR l.featured_until <= NOW() + INTERVAL '50 years'
      )
    )
    OR (
      p.effective_plan = 'premium'
      AND (
        SELECT COUNT(*)
        FROM public.listings owned
        WHERE owned.user_id = l.user_id
          AND owned.status IN ('pending', 'approved')
      ) > 5
    )
  );
