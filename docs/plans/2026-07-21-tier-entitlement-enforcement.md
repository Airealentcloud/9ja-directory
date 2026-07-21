# Tier Entitlement Enforcement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make Basic, Premium, and Lifetime purchases grant only their advertised listing limits and features across checkout, listing creation/editing, approval, search, analytics, and direct database access.

**Architecture:** Keep `lib/pricing.ts` as the commercial source of truth and add pure entitlement helpers that normalize account state, validate limits, and remove fields a plan cannot use. Call those helpers from every server mutation and payment fulfillment path, then add a Supabase migration that protects entitlement columns and applies the same critical rules to direct authenticated database writes. Repair listing column mismatches so paid features can render reliably before Cloudflare becomes production.

**Tech Stack:** Next.js 15 App Router, React, TypeScript, Supabase/PostgreSQL RLS and triggers, Paystack, OpenNext Cloudflare Workers, Node test runner.

---

### Task 1: Define the authoritative tier matrix

**Files:**
- Modify: `lib/pricing.ts`
- Create: `lib/entitlements.ts`
- Test: `tests/unit/entitlements.test.ts`

**Step 1: Write failing tests for plan resolution, active status, listing limits, description limits, photo limits, and forbidden fields.**

**Step 2: Run `npm run test:unit` and verify the tests fail because the entitlement helpers do not exist.**

**Step 3: Implement pure plan-resolution, validation, and sanitization helpers. Basic permits one listing, four photos, and a 400-character description; Premium permits five listings, fifteen photos, an 800-character description, website/social/hours/analytics/search highlighting; Lifetime permits unlimited listings, 100 photos, all Premium fields, homepage featuring, verification, advanced insights, and priority support.**

**Step 4: Remove unsupported promises such as multiple categories, keyword quotas, employee count, year established, and review replies from the customer-facing feature lists until those workflows exist.**

**Step 5: Run `npm run test:unit` and verify all entitlement tests pass.**

### Task 2: Enforce tiers in listing server actions

**Files:**
- Modify: `app/actions/listings.ts`
- Modify: `app/add-business/page.tsx`
- Modify: `app/dashboard/my-listings/[id]/edit/page.tsx`

**Step 1: Fetch the authenticated user's role, subscription plan, subscription status, and expiry before creating or editing.**

**Step 2: Count active/pending listings and reject creation when the paid plan's listing quota is exhausted.**

**Step 3: Parse JSON fields safely, validate required values, enforce description/photo limits, and sanitize fields that are unavailable to the plan.**

**Step 4: Preserve admin capability while ensuring owners cannot change moderation, verification, or featured state.**

**Step 5: Run unit tests and `npx tsc --noEmit`.**

### Task 3: Enforce the purchased tier through checkout and fulfillment

**Files:**
- Modify: `app/checkout/page.tsx`
- Modify: `app/api/payments/initialize/route.ts`
- Modify: `app/api/payments/complete-signup/route.ts`
- Modify: `lib/payments/plans.ts`
- Modify: `lib/payments/fulfill.ts`

**Step 1: Hide Premium-only fields during Basic checkout and show the plan's description-length limit.**

**Step 2: Validate and sanitize listing metadata on the server before storing it with a pending payment.**

**Step 3: Mark the pending payment failed if Paystack initialization fails.**

**Step 4: Derive payment amounts and subscription descriptions from `lib/pricing.ts` to prevent pricing drift.**

**Step 5: Re-sanitize paid metadata during fulfillment, create the listing before applying Lifetime flags, and fail fulfillment when the subscription/profile entitlement update fails.**

**Step 6: Correct `profiles.phone` to `profiles.phone_number` in the paid-signup recovery flow.**

**Step 7: Run unit tests and TypeScript checks.**

### Task 4: Make approval, analytics, and public placement match the plan

**Files:**
- Modify: `app/actions/admin.ts`
- Modify: `app/dashboard/my-listings/[id]/analytics/page.tsx`
- Modify: `app/dashboard/my-listings/page.tsx`
- Modify: `app/page.tsx`
- Modify: `app/featured/page.tsx`
- Modify: `components/listings/similar-businesses.tsx`

**Step 1: Resolve the successful payment's plan during approval and set `verified`/`featured` only when the purchased plan supports them.**

**Step 2: Gate analytics to Premium and Lifetime owners and replace the invalid `views_count` reference with `view_count`.**

**Step 3: Hide Insights/Promote actions when the account lacks access.**

**Step 4: Replace invalid `image_url` projections with `logo_url` and `images`, and use the real `featured` column added by the migration.**

**Step 5: Run TypeScript and production build checks.**

### Task 5: Enforce entitlements in Supabase

**Files:**
- Create: `migrations/012_plan_entitlement_enforcement.sql`

**Step 1: Add the missing `listings.featured` column, safe indexes, and any idempotent supporting columns.**

**Step 2: Add a trigger that prevents authenticated users from changing profile role, subscription, permission, and quota fields while allowing service-role/admin fulfillment.**

**Step 3: Add a listing trigger that enforces listing count, description/photo limits, strips unavailable fields, and preserves moderation/verification/featured fields on owner updates.**

**Step 4: Backfill permission booleans from active plans and normalize paid user listings without changing unowned imported directory listings.**

**Step 5: Run the migration in the staging Supabase project, then run read-only verification queries for columns, triggers, and plan distributions.**

### Task 6: Correct pricing promises and migration safety

**Files:**
- Modify: `app/pricing/page.tsx`
- Modify: `components/pricing/pricing-checkout.tsx`
- Modify: `package.json`

**Step 1: Replace recurring-subscription, cancellation, and automatic-proration language with accurate one-time-payment wording.**

**Step 2: Add a visible comparison explaining exactly what Basic, Premium, and Lifetime unlock.**

**Step 3: Add the unit-test command to `package.json`.**

**Step 4: Run `npm run test:unit`, `npx tsc --noEmit`, and `npm run build`.**

### Task 7: Validate Cloudflare staging before production migration

**Files:**
- Modify only if required: `wrangler.jsonc`, `open-next.config.ts`, `.github/workflows/cloudflare-staging.yml`

**Step 1: Deploy the corrected build to `9jadirectory-staging` without changing production DNS.**

**Step 2: Configure staging Supabase credentials, Resend credentials, `CRON_SECRET`, and a Paystack test-mode secret using Cloudflare encrypted secrets. Never place secrets in Git or shell output.**

**Step 3: Test Basic, Premium, and Lifetime signup/payment/approval/edit flows with separate test accounts.**

**Step 4: Verify unauthorized cron calls return 401, authenticated jobs work, emails are delivered, and public pages/search/SEO return 200 without server errors.**

**Step 5: Move production DNS only after every acceptance gate passes and a rollback path to Vercel is documented.**
