# Cloudflare Production Cutover Implementation Plan

**Goal:** Move 9jaDirectory from Vercel to Cloudflare Workers without moving the Supabase account, losing paid-plan data, or exposing staging SEO controls on the production domain.

**Architecture:** Keep Supabase as the production database and authentication provider, Paystack as the payment provider, and Resend as the email provider. Maintain separate staging and production Worker configurations, deploy the production Worker first on a `workers.dev` hostname, apply the backward-compatible entitlement migration to Supabase, verify all workflows, and change DNS only after every gate passes.

**Tech Stack:** Next.js 15 App Router, OpenNext Cloudflare adapter, Cloudflare Workers/Wrangler, Supabase, Paystack, Resend.

---

### Task 1: Separate staging and production Worker builds

**Files:**
- Create: `wrangler.production.jsonc`
- Modify: `package.json`

**Steps:**
1. Add a complete production Wrangler configuration named `9jadirectory-production` with production deployment variables and cron disabled initially.
2. Keep all encrypted values out of both Wrangler files.
3. Add distinct staging and production build, dry-run, deploy, and smoke-test scripts.
4. Run `npm run cf:build:production` and expect a successful OpenNext bundle.
5. Run `npm run cf:dry-run:production` and expect gzip size below the Cloudflare Free 3 MiB limit.

### Task 2: Prevent staging SEO controls from reaching production

**Files:**
- Create: `scripts/verify-cloudflare-production-assets.mjs`
- Modify: `scripts/cloudflare-smoke-test.mjs`

**Steps:**
1. Make smoke-test mode explicit (`staging` or `production`) instead of assuming every `workers.dev` host is staging.
2. Require staging to send `X-Robots-Tag: noindex, nofollow`, block all crawling, and lock interactive routes.
3. Require production to omit the staging noindex header, allow public crawling, retain the production canonical, and expose the login page.
4. Fail the production build if generated `robots.txt` contains an exact `Disallow: /` rule.
5. Run the local asset guard and staging smoke test; both must pass.

### Task 3: Apply and verify the Supabase entitlement migration

**Files:**
- Modify: `migrations/012_plan_entitlement_enforcement.sql`

**Steps:**
1. Confirm the migration starts with `BEGIN`, creates the private backup table, and ends with verification queries.
2. Run the complete script once in the existing 9jaDirectory production Supabase project; Supabase itself is not being moved.
3. Choose `Run without RLS` for the private backup table because API roles are explicitly revoked and the private schema is not exposed.
4. Confirm all invalid-profile, listing-plan, and listing-benefit mismatch counts are zero.
5. Record and manually review any over-quota legacy accounts without deleting listings.

### Task 4: Configure the production Worker without exposing secrets

**Files:**
- Update: `docs/cloudflare/environment-variables.md`

**Steps:**
1. Configure build-time public Supabase values for the production Worker build.
2. Add runtime `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` values in Cloudflare.
3. Add encrypted `SUPABASE_SERVICE_ROLE_KEY`, `PAYSTACK_SECRET_KEY`, `RESEND_API_KEY`, and `CRON_SECRET` to the production Worker.
4. Add `ADMIN_EMAIL` and `RESEND_FROM_EMAIL` runtime values.
5. Keep `CRON_JOBS_ENABLED=false` until authenticated cron tests pass.

### Task 5: Verify production Worker before DNS cutover

**Files:**
- Test: `scripts/cloudflare-smoke-test.mjs`

**Steps:**
1. Deploy `9jadirectory-production` to its temporary `workers.dev` hostname without attaching `www.9jadirectory.org`.
2. Verify homepage, pricing, blog, robots, sitemap, canonical tags, and indexing headers.
3. Test signup, login, Basic purchase, Premium purchase, Lifetime purchase, webhook fulfillment, admin approval, listing editing, and approval email delivery.
4. Test scheduled endpoints using `CRON_SECRET`, then enable cron and deploy with `--keep-vars`.
5. Change the Paystack production webhook to the Cloudflare production endpoint only at cutover.

### Task 6: Switch DNS with rollback retained

**Files:**
- Update: `docs/cloudflare/migration-readiness-2026-07-21.md`

**Steps:**
1. Add `9jadirectory.org` to Cloudflare and verify the imported apex, `www`, and email-routing records before changing delegation.
2. Attach `www.9jadirectory.org` to the verified production Worker.
3. Replace the current Vercel nameservers with the Cloudflare-assigned nameservers.
4. Confirm the apex domain redirects to the canonical `www` host and Cloudflare Email Routing still receives mail.
5. Repeat the production smoke test on the custom domain.
6. Keep the Vercel deployment available for at least seven days.
7. If authentication, payments, admin, email, SEO headers, or Worker limits fail, restore the previous nameservers immediately.
