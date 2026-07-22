-- Enforce paid-plan entitlements at the database boundary.
-- Run once in the Supabase SQL Editor before deploying the tier-separated application.
-- Safe to rerun: objects are created idempotently and existing paid listings are backed up.

BEGIN;

CREATE SCHEMA IF NOT EXISTS private;

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS plan_tier TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS business_hours JSONB,
  ADD COLUMN IF NOT EXISTS opening_hours JSONB,
  ADD COLUMN IF NOT EXISTS facebook_url TEXT,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS twitter_url TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS year_established INTEGER,
  ADD COLUMN IF NOT EXISTS established_year INTEGER,
  ADD COLUMN IF NOT EXISTS employee_count TEXT,
  ADD COLUMN IF NOT EXISTS employee_count_range TEXT,
  ADD COLUMN IF NOT EXISTS keywords TEXT[],
  ADD COLUMN IF NOT EXISTS claimed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS claimed_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;

ALTER TABLE public.listings
  DROP CONSTRAINT IF EXISTS listings_plan_tier_check;
ALTER TABLE public.listings
  ADD CONSTRAINT listings_plan_tier_check
  CHECK (plan_tier IN ('free', 'basic', 'premium', 'lifetime'));

-- Preserve a currently active legacy promotion before the application switches from
-- is_featured to featured. Rows without a future expiry are not treated as paid placement.
UPDATE public.listings
SET featured = TRUE
WHERE COALESCE(is_featured, FALSE) = TRUE
  AND featured_until IS NOT NULL
  AND featured_until > NOW();

CREATE INDEX IF NOT EXISTS idx_listings_user_active_status
  ON public.listings (user_id, status)
  WHERE user_id IS NOT NULL AND status IN ('pending', 'approved');

CREATE INDEX IF NOT EXISTS idx_listings_active_featured
  ON public.listings (featured_until DESC)
  WHERE featured = TRUE AND status = 'approved';

-- Keep a one-time, non-API-accessible snapshot before normalising existing paid listings.
CREATE TABLE IF NOT EXISTS private.listing_entitlement_backups (
  listing_id UUID PRIMARY KEY,
  owner_id UUID,
  previous_row JSONB NOT NULL,
  backed_up_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason TEXT NOT NULL DEFAULT '012_plan_entitlement_enforcement'
);

REVOKE ALL ON TABLE private.listing_entitlement_backups FROM PUBLIC, anon, authenticated;

INSERT INTO private.listing_entitlement_backups (listing_id, owner_id, previous_row)
SELECT l.id, l.user_id, to_jsonb(l)
FROM public.listings l
JOIN public.profiles p ON p.id = l.user_id
WHERE p.subscription_plan IN ('basic', 'premium', 'lifetime')
   OR EXISTS (
     SELECT 1
     FROM public.payments paid
     WHERE paid.user_id = l.user_id
       AND paid.status = 'success'
       AND paid.plan IN ('basic', 'premium', 'lifetime')
   )
ON CONFLICT (listing_id) DO NOTHING;

-- Restore account plans from successful Paystack records. Keep the highest plan ever paid.
WITH successful_plans AS (
  SELECT
    user_id,
    plan,
    COALESCE(paid_at, created_at) AS purchased_at,
    CASE plan WHEN 'basic' THEN 1 WHEN 'premium' THEN 2 WHEN 'lifetime' THEN 3 END AS plan_rank
  FROM public.payments
  WHERE status = 'success'
    AND plan IN ('basic', 'premium', 'lifetime')
), best_plan AS (
  SELECT DISTINCT ON (user_id) user_id, plan
  FROM successful_plans
  ORDER BY user_id, plan_rank DESC, purchased_at DESC
)
UPDATE public.profiles p
SET
  subscription_plan = b.plan,
  subscription_status = 'active',
  subscription_expires_at = GREATEST(
    COALESCE(p.subscription_expires_at, NOW()),
    NOW() + INTERVAL '100 years'
  )
FROM best_plan b
WHERE p.id = b.user_id;

-- Derive legacy permission flags from the canonical active plan. Application code also
-- checks the canonical fields, so these booleans are no longer trusted on their own.
UPDATE public.profiles
SET
  can_add_listings = (
    subscription_plan IN ('basic', 'premium', 'lifetime')
    AND subscription_status = 'active'
    AND (subscription_expires_at IS NULL OR subscription_expires_at > NOW())
  ),
  can_claim_listings = (
    subscription_plan IN ('premium', 'lifetime')
    AND subscription_status = 'active'
    AND (subscription_expires_at IS NULL OR subscription_expires_at > NOW())
  ),
  can_feature_listings = (
    subscription_plan IN ('premium', 'lifetime')
    AND subscription_status = 'active'
    AND (subscription_expires_at IS NULL OR subscription_expires_at > NOW())
  ),
  featured_posts_remaining = 0;

-- A signed-in customer may edit contact/profile fields, but may not grant themselves
-- an admin role, paid plan, listing allowance, claim access, or featured access.
CREATE OR REPLACE FUNCTION private.protect_profile_entitlements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, auth, private
AS $$
DECLARE
  actor_id UUID := auth.uid();
  actor_role TEXT := COALESCE(auth.role(), '');
BEGIN
  -- current_user is the function owner inside SECURITY DEFINER; session_user remains
  -- the original SQL/PostgREST role and therefore cannot accidentally bypass this trigger.
  IF session_user IN ('postgres', 'supabase_admin') OR actor_role = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- The auth.users -> profiles signup trigger is nested and has no end-user JWT.
  -- Do not allow an ordinary anonymous direct write to use that exception.
  IF actor_id IS NULL AND pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;

  IF actor_id IS NULL THEN
    RAISE EXCEPTION 'Authentication is required to change a profile.' USING ERRCODE = '42501';
  END IF;

  IF NEW.id IS DISTINCT FROM actor_id THEN
    RAISE EXCEPTION 'A profile may only be changed by its owner.' USING ERRCODE = '42501';
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.role := 'user';
    NEW.subscription_plan := 'free';
    NEW.subscription_status := 'none';
    NEW.subscription_expires_at := NULL;
    NEW.can_add_listings := FALSE;
    NEW.can_claim_listings := FALSE;
    NEW.can_feature_listings := FALSE;
    NEW.featured_posts_remaining := 0;
  ELSE
    NEW.role := OLD.role;
    NEW.subscription_plan := OLD.subscription_plan;
    NEW.subscription_status := OLD.subscription_status;
    NEW.subscription_expires_at := OLD.subscription_expires_at;
    NEW.can_add_listings := OLD.can_add_listings;
    NEW.can_claim_listings := OLD.can_claim_listings;
    NEW.can_feature_listings := OLD.can_feature_listings;
    NEW.featured_posts_remaining := OLD.featured_posts_remaining;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_entitlements_trigger ON public.profiles;
CREATE TRIGGER protect_profile_entitlements_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION private.protect_profile_entitlements();

REVOKE ALL ON FUNCTION private.protect_profile_entitlements() FROM PUBLIC, anon, authenticated;

-- Enforce listing quantity and field access even when someone bypasses the web form and
-- writes directly through PostgREST. Privileged moderation may change status, while plan limits still apply.
CREATE OR REPLACE FUNCTION private.enforce_listing_plan()
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
  owner_id UUID;
  active_plan TEXT := 'free';
  active_count INTEGER := 0;
  listing_limit INTEGER := 0;
  photo_limit INTEGER := 0;
  description_limit INTEGER := 0;
  photo_value JSONB;
  photo_count INTEGER := 0;
BEGIN
  -- SQL Editor/maintenance sessions may perform controlled migrations. PostgREST
  -- service-role writes still pass through quota and field enforcement below.
  IF session_user IN ('postgres', 'supabase_admin') THEN
    RETURN NEW;
  END IF;

  IF actor_id IS NULL AND NOT is_service THEN
    RAISE EXCEPTION 'Authentication is required to change a listing.' USING ERRCODE = '42501';
  END IF;

  IF actor_id IS NOT NULL THEN
    SELECT COALESCE(p.role = 'admin', FALSE)
    INTO is_admin_actor
    FROM public.profiles p
    WHERE p.id = actor_id;
  END IF;
  is_privileged := is_service OR COALESCE(is_admin_actor, FALSE);

  owner_id := CASE
    WHEN TG_OP = 'INSERT' THEN NEW.user_id
    WHEN is_privileged THEN COALESCE(NEW.user_id, OLD.user_id)
    ELSE OLD.user_id
  END;

  IF NOT is_privileged THEN
    IF TG_OP = 'INSERT' AND NEW.user_id IS DISTINCT FROM actor_id THEN
      RAISE EXCEPTION 'A listing may only be created for the signed-in account.' USING ERRCODE = '42501';
    END IF;
    IF TG_OP = 'UPDATE' AND OLD.user_id IS DISTINCT FROM actor_id THEN
      RAISE EXCEPTION 'A listing may only be changed by its owner.' USING ERRCODE = '42501';
    END IF;
  END IF;

  -- Imported directory rows may intentionally have no owner. They remain free and
  -- cannot receive paid badges through the service-role import path.
  IF owner_id IS NULL THEN
    IF is_privileged THEN
      NEW.plan_tier := 'free';
      NEW.verified := FALSE;
      NEW.featured := FALSE;
      NEW.is_featured := FALSE;
      NEW.featured_until := NULL;
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'A listing owner is required.' USING ERRCODE = '23514';
  END IF;

  -- Lock one profile row so two concurrent fulfillment requests cannot both pass
  -- the same listing allowance check.
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
  WHERE p.id = owner_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'A customer profile is required before changing a listing.' USING ERRCODE = '42501';
  END IF;

  IF active_plan = 'free' THEN
    -- Service jobs must be able to expire/remove stale paid flags. They cannot add
    -- a new customer-owned listing until that customer has an active paid plan.
    IF is_privileged AND TG_OP = 'UPDATE' THEN
      NEW.plan_tier := 'free';
      NEW.verified := FALSE;
      NEW.featured := FALSE;
      NEW.is_featured := FALSE;
      NEW.featured_until := NULL;
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'Choose and pay for a listing plan before creating or editing a business.' USING ERRCODE = '42501';
  END IF;

  NEW.plan_tier := active_plan;

  IF TG_OP = 'INSERT' THEN
    listing_limit := CASE active_plan WHEN 'basic' THEN 1 WHEN 'premium' THEN 5 ELSE 2147483647 END;
    SELECT COUNT(*)::INTEGER
    INTO active_count
    FROM public.listings l
    WHERE l.user_id = owner_id
      AND l.status IN ('pending', 'approved');

    IF active_count >= listing_limit THEN
      RAISE EXCEPTION 'The % plan listing allowance has been reached.', active_plan USING ERRCODE = '23514';
    END IF;

    IF NOT is_privileged THEN
      NEW.status := 'pending';
      NEW.verified := FALSE;
      NEW.featured := FALSE;
      NEW.is_featured := FALSE;
      NEW.featured_until := NULL;
      NEW.rejection_reason := NULL;
      NEW.claimed := FALSE;
      NEW.claimed_by := NULL;
      NEW.claimed_at := NULL;
    END IF;
  ELSIF NOT is_privileged THEN
    NEW.user_id := OLD.user_id;
    NEW.status := OLD.status;
    NEW.verified := OLD.verified;
    NEW.featured := OLD.featured;
    NEW.is_featured := OLD.is_featured;
    NEW.featured_until := OLD.featured_until;
    NEW.rejection_reason := OLD.rejection_reason;
    NEW.claimed := OLD.claimed;
    NEW.claimed_by := OLD.claimed_by;
    NEW.claimed_at := OLD.claimed_at;
  END IF;

  photo_limit := CASE active_plan WHEN 'basic' THEN 4 WHEN 'premium' THEN 15 ELSE 100 END;
  description_limit := CASE active_plan WHEN 'basic' THEN 400 WHEN 'premium' THEN 800 ELSE 2147483647 END;

  IF CHAR_LENGTH(COALESCE(NEW.description, '')) > description_limit THEN
    RAISE EXCEPTION 'The % plan description limit is % characters.', active_plan, description_limit USING ERRCODE = '23514';
  END IF;

  photo_value := COALESCE(to_jsonb(NEW.images), '[]'::JSONB);
  IF jsonb_typeof(photo_value) <> 'array' THEN
    RAISE EXCEPTION 'Listing images must be an array.' USING ERRCODE = '23514';
  END IF;

  photo_count := jsonb_array_length(photo_value);
  IF photo_count > photo_limit THEN
    RAISE EXCEPTION 'The % plan allows at most % photos per listing.', active_plan, photo_limit USING ERRCODE = '23514';
  END IF;

  -- These fields are not offered by any current plan. Keep the product promise exact.
  NEW.year_established := NULL;
  NEW.established_year := NULL;
  NEW.employee_count := NULL;
  NEW.employee_count_range := NULL;
  NEW.keywords := NULL;

  IF active_plan = 'basic' THEN
    NEW.website := NULL;
    NEW.website_url := NULL;
    NEW.facebook_url := NULL;
    NEW.instagram_url := NULL;
    NEW.twitter_url := NULL;
    NEW.linkedin_url := NULL;
    NEW.opening_hours := NULL;
    NEW.business_hours := NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_listing_plan_trigger ON public.listings;
CREATE TRIGGER enforce_listing_plan_trigger
  BEFORE INSERT OR UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION private.enforce_listing_plan();

REVOKE ALL ON FUNCTION private.enforce_listing_plan() FROM PUBLIC, anon, authenticated;

-- Keep the new canonical flag and the legacy flag synchronized during the Vercel rollback
-- window. The entitlement trigger runs first alphabetically and prevents customers from
-- changing either moderation-controlled flag themselves.
CREATE OR REPLACE FUNCTION private.sync_listing_featured_flags()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public, private
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF COALESCE(NEW.featured, FALSE) = TRUE THEN
      NEW.is_featured := TRUE;
    ELSE
      NEW.featured := COALESCE(NEW.is_featured, FALSE);
      NEW.is_featured := NEW.featured;
    END IF;
  ELSIF NEW.featured IS DISTINCT FROM OLD.featured THEN
    NEW.is_featured := NEW.featured;
  ELSIF NEW.is_featured IS DISTINCT FROM OLD.is_featured THEN
    NEW.featured := NEW.is_featured;
  ELSE
    NEW.is_featured := NEW.featured;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_listing_featured_flags_trigger ON public.listings;
CREATE TRIGGER sync_listing_featured_flags_trigger
  BEFORE INSERT OR UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION private.sync_listing_featured_flags();

REVOKE ALL ON FUNCTION private.sync_listing_featured_flags() FROM PUBLIC, anon, authenticated;

-- Normalise fields already owned by active paid customers. The backup above makes this
-- reversible without touching imported/unowned directory records.
UPDATE public.listings l
SET
  plan_tier = p.subscription_plan,
  description = CASE
    WHEN p.subscription_plan = 'basic' THEN LEFT(COALESCE(l.description, ''), 400)
    WHEN p.subscription_plan = 'premium' THEN LEFT(COALESCE(l.description, ''), 800)
    ELSE l.description
  END,
  website = CASE WHEN p.subscription_plan = 'basic' THEN NULL ELSE l.website END,
  website_url = CASE WHEN p.subscription_plan = 'basic' THEN NULL ELSE l.website_url END,
  facebook_url = CASE WHEN p.subscription_plan = 'basic' THEN NULL ELSE l.facebook_url END,
  instagram_url = CASE WHEN p.subscription_plan = 'basic' THEN NULL ELSE l.instagram_url END,
  twitter_url = CASE WHEN p.subscription_plan = 'basic' THEN NULL ELSE l.twitter_url END,
  linkedin_url = CASE WHEN p.subscription_plan = 'basic' THEN NULL ELSE l.linkedin_url END,
  opening_hours = CASE WHEN p.subscription_plan = 'basic' THEN NULL ELSE l.opening_hours END,
  business_hours = CASE WHEN p.subscription_plan = 'basic' THEN NULL ELSE l.business_hours END,
  year_established = NULL,
  established_year = NULL,
  employee_count = NULL,
  employee_count_range = NULL,
  keywords = NULL,
  verified = CASE
    WHEN l.status = 'approved' AND p.subscription_plan IN ('premium', 'lifetime') THEN TRUE
    ELSE FALSE
  END,
  featured = CASE
    WHEN l.status = 'approved' AND p.subscription_plan = 'lifetime' THEN TRUE
    WHEN l.featured = TRUE AND l.featured_until > NOW() THEN TRUE
    ELSE FALSE
  END,
  featured_until = CASE
    WHEN l.status = 'approved' AND p.subscription_plan = 'lifetime'
      THEN GREATEST(COALESCE(l.featured_until, NOW()), NOW() + INTERVAL '100 years')
    WHEN l.featured = TRUE AND l.featured_until > NOW() THEN l.featured_until
    ELSE NULL
  END
FROM public.profiles p
WHERE p.id = l.user_id
  AND p.subscription_plan IN ('basic', 'premium', 'lifetime')
  AND p.subscription_status = 'active'
  AND (p.subscription_expires_at IS NULL OR p.subscription_expires_at > NOW());

-- Cap existing image arrays for both historical JSONB and TEXT[] schemas.
DO $$
DECLARE
  images_type TEXT;
BEGIN
  SELECT c.udt_name
  INTO images_type
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'listings'
    AND c.column_name = 'images';

  IF images_type = 'jsonb' THEN
    EXECUTE $sql$
      UPDATE public.listings l
      SET images = (
        SELECT COALESCE(jsonb_agg(item.value ORDER BY item.ordinality), '[]'::JSONB)
        FROM jsonb_array_elements(
          CASE WHEN jsonb_typeof(l.images) = 'array' THEN l.images ELSE '[]'::JSONB END
        ) WITH ORDINALITY AS item(value, ordinality)
        WHERE item.ordinality <= CASE p.subscription_plan
          WHEN 'basic' THEN 4 WHEN 'premium' THEN 15 ELSE 100 END
      )
      FROM public.profiles p
      WHERE p.id = l.user_id
        AND p.subscription_plan IN ('basic', 'premium', 'lifetime')
        AND p.subscription_status = 'active'
        AND (p.subscription_expires_at IS NULL OR p.subscription_expires_at > NOW())
    $sql$;
  ELSIF images_type = '_text' THEN
    EXECUTE $sql$
      UPDATE public.listings l
      SET images = l.images[1:(CASE p.subscription_plan
        WHEN 'basic' THEN 4 WHEN 'premium' THEN 15 ELSE 100 END)]
      FROM public.profiles p
      WHERE p.id = l.user_id
        AND p.subscription_plan IN ('basic', 'premium', 'lifetime')
        AND p.subscription_status = 'active'
        AND (p.subscription_expires_at IS NULL OR p.subscription_expires_at > NOW())
    $sql$;
  END IF;
END;
$$;

COMMIT;

-- Verification result 1: all three profile counts should be zero.
SELECT
  COUNT(*) FILTER (
    WHERE subscription_status = 'active'
      AND subscription_plan NOT IN ('basic', 'premium', 'lifetime')
  ) AS invalid_active_plans,
  COUNT(*) FILTER (
    WHERE can_claim_listings = TRUE
      AND subscription_plan NOT IN ('premium', 'lifetime')
  ) AS invalid_claim_permissions,
  COUNT(*) FILTER (
    WHERE can_add_listings = TRUE
      AND subscription_plan NOT IN ('basic', 'premium', 'lifetime')
  ) AS invalid_listing_permissions
FROM public.profiles;

-- Verification result 2: the first two counts should be zero. Existing accounts over
-- quota are reported for manual review; their listings are preserved to avoid data loss.
WITH paid_listing_state AS (
  SELECT
    p.id AS owner_id,
    p.subscription_plan,
    l.id AS listing_id,
    l.status,
    l.plan_tier,
    l.verified,
    l.featured,
    l.featured_until,
    l.website,
    l.website_url,
    l.facebook_url,
    l.instagram_url,
    l.twitter_url,
    l.linkedin_url,
    l.opening_hours,
    l.business_hours
  FROM public.profiles p
  JOIN public.listings l ON l.user_id = p.id
  WHERE p.subscription_plan IN ('basic', 'premium', 'lifetime')
    AND p.subscription_status = 'active'
    AND (p.subscription_expires_at IS NULL OR p.subscription_expires_at > NOW())
    AND l.status IN ('pending', 'approved')
), owner_counts AS (
  SELECT owner_id, subscription_plan, COUNT(*) AS active_listing_count
  FROM paid_listing_state
  GROUP BY owner_id, subscription_plan
)
SELECT
  COUNT(*) FILTER (
    WHERE plan_tier IS DISTINCT FROM subscription_plan
  ) AS listing_plan_mismatches,
  COUNT(*) FILTER (
    WHERE
      (subscription_plan = 'basic' AND (
        verified = TRUE
        OR featured = TRUE
        OR website IS NOT NULL
        OR website_url IS NOT NULL
        OR facebook_url IS NOT NULL
        OR instagram_url IS NOT NULL
        OR twitter_url IS NOT NULL
        OR linkedin_url IS NOT NULL
        OR opening_hours IS NOT NULL
        OR business_hours IS NOT NULL
      ))
      OR (subscription_plan = 'premium' AND status = 'approved' AND verified IS DISTINCT FROM TRUE)
      OR (subscription_plan = 'lifetime' AND status = 'approved' AND (
        verified IS DISTINCT FROM TRUE
        OR featured IS DISTINCT FROM TRUE
        OR featured_until IS NULL
        OR featured_until <= NOW()
      ))
  ) AS listing_benefit_mismatches,
  (
    SELECT COUNT(*)
    FROM owner_counts
    WHERE (subscription_plan = 'basic' AND active_listing_count > 1)
       OR (subscription_plan = 'premium' AND active_listing_count > 5)
  ) AS over_quota_accounts_to_review
FROM paid_listing_state;
