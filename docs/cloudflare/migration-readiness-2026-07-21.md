# Cloudflare migration readiness — updated 22 July 2026

## Decision

The application code is compatible with Cloudflare Workers Free, the isolated staging deployment is healthy, and an SEO-safe production Worker configuration now builds successfully. Production DNS is **not ready to switch yet** because the database entitlement migration and required production secrets are not configured, and payment/email workflows have not passed on a production Worker hostname.

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
- Separate production config: `wrangler.production.jsonc`
- Production build guard: fails on staging-wide `Disallow: /`
- Worker previews: receive `X-Robots-Tag: noindex, nofollow`
- Production-domain responses: do not inherit the preview noindex rule
- Current production dry-run bundle: `2604.98 KiB` gzip, below the 3 MiB Free-plan limit
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

## Current blockers

1. Production Supabase still reports PostgreSQL error `42703` because `public.listings.plan_tier` does not exist.
2. Cloudflare currently has only `CRON_SECRET`; the production Supabase service-role key, Paystack secret, and Resend key are not configured on a production Worker.
3. The temporary production Worker has not been deployed, so signup, login, payment, webhook, admin, and email flows have not been tested there.
4. The existing local Vercel project link cannot currently retrieve project settings, so any missing secret must be recovered from the correct Vercel account or its source dashboard.
5. `9jadirectory.org` still uses `ns1.vercel-dns.com` and `ns2.vercel-dns.com`, while the authenticated Cloudflare account currently has no DNS zone. The zone and all existing website and email records must be copied and verified before nameserver changes.

## Required before production DNS cutover

1. Run the complete `migrations/012_plan_entitlement_enforcement.sql` in the existing 9jaDirectory Supabase project. Supabase data and accounts remain in place; only the required columns, backup table, rules, and triggers are added. Confirm the profile counts and the first two listing counts are zero; review (but do not delete) any legacy over-quota accounts reported by the final count.
2. Configure the required public values and encrypted secrets on the separate `9jadirectory-production` Worker.
3. Deploy the production Worker to its `workers.dev` hostname without changing DNS; its preview responses remain noindexed.
4. Add the temporary production Auth callback URL in Supabase and test signup and login.
5. Test Basic, Premium, and Lifetime payment fulfillment, exact plan quotas, webhook handling, admin approval, listing editing, and email delivery.
6. Verify the scheduled jobs with their Bearer secret, then set `CRON_JOBS_ENABLED=true` and redeploy with `--keep-vars`.
7. Add `9jadirectory.org` to the authenticated Cloudflare account and verify that Cloudflare imported the apex, `www`, and Cloudflare Email Routing MX records. Do not change nameservers yet.
8. Switch the Paystack production webhook, then replace the Vercel nameservers with the two Cloudflare-assigned nameservers only after every gate passes.
9. Repeat the production smoke test and email-delivery checks on the custom domain, and retain Vercel for rollback for at least seven days.

## Rollback

The SQL migration stores pre-normalisation paid listings in `private.listing_entitlement_backups`. Vercel remains the live host, so the current rollback is simply to leave DNS unchanged. After cutover, restore the previous DNS record if authentication, payments, images, or Worker limits fail.
