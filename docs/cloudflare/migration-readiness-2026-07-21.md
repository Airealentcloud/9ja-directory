# Cloudflare migration readiness — 21 July 2026

## Decision

The application code is compatible with Cloudflare Workers Free and the isolated staging deployment is healthy. Production DNS is **not ready to switch yet** because the database entitlement migration and end-to-end test services are not configured.

## Verified

- Staging URL: `https://9jadirectory-staging.israelakhas1.workers.dev`
- Deployed Worker version: `e8d119e3-e59f-423a-9a3d-6c09f10f989d`
- Compressed Worker: `2605.32 KiB`, below the 3 MiB Free-plan limit
- Static assets: `382`, below the platform limit
- Worker startup: `36 ms`
- Next.js build: all application routes built successfully
- TypeScript: passed
- Entitlement tests: 6/6 passed
- Staging homepage and pricing: HTTP 200
- Staging SEO protection: `X-Robots-Tag: noindex, nofollow`; `robots.txt` contains `Disallow: /`
- Admin import status endpoint: changed to HTTP 405, non-cacheable
- Unauthenticated admin import write: rejected
- Cron endpoints: require `CRON_SECRET`
- Cloudflare scheduled handler: every 15 minutes, disabled on staging
- Interactive staging routes: locked until test services are attached
- Live Supabase preflight: profile, payment, payment-lead, and email columns exist
- Live Supabase listings gap: `featured`, `business_hours`, and `employee_count_range` are absent; migration 012 creates them and adds the protected public `plan_tier` used for ranking
- Legacy rollback compatibility: migration 012 synchronizes `featured` with the existing `is_featured` column

## Enforced paid tiers

| Capability | Basic — ₦5,000 | Premium — ₦10,000 | Lifetime — ₦30,000 |
| --- | --- | --- | --- |
| Active listings | 1 | 5 | Unlimited |
| Photos per listing | 4 | 15 | 100 |
| Description | 400 characters | 800 characters | Unlimited |
| Website, social links, hours | No | Yes | Yes |
| Verified/highlighted badge | No | Yes, after approval | Yes, after approval |
| Analytics and AI description | No | Yes | Yes |
| Homepage feature | No | Optional paid add-on | Included |
| Priority search and AI review insights | No | No | Yes |

The rules are enforced in the pricing data, listing create/edit actions, payment fulfillment, admin approval, search/featured queries, and the Supabase migration. A customer cannot unlock a higher plan by changing browser form fields or profile flags.

## Required before production DNS cutover

1. Sign in to Supabase and run `migrations/012_plan_entitlement_enforcement.sql`. This is mandatory before any live deployment because the current listings table is missing required entitlement columns. Confirm the profile counts and the first two listing counts are zero; review (but do not delete) any legacy over-quota accounts reported by the final count.
2. Configure a test Supabase project, Paystack test key, and Resend key on staging.
3. Add the staging Auth callback URL in Supabase and the staging webhook URL in Paystack test mode.
4. Enable staging mutations and test signup, login, Basic purchase, exact one-listing quota, Premium-only fields, Lifetime placement, payment webhook, admin approval, and email delivery.
5. Verify the scheduled jobs with their Bearer secret, then enable staging cron jobs.
6. Create a production Wrangler configuration, transfer production secrets as encrypted values, and deploy without changing DNS.
7. Run the same smoke and payment tests on the production Worker hostname.
8. Switch `www.9jadirectory.org` only after every gate passes; retain Vercel for rollback for at least seven days.

## Rollback

The SQL migration stores pre-normalisation paid listings in `private.listing_entitlement_backups`. Vercel remains the live host, so the current rollback is simply to leave DNS unchanged. After cutover, restore the previous DNS record if authentication, payments, images, or Worker limits fail.
