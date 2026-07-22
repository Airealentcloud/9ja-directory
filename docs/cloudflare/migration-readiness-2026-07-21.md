# Cloudflare migration readiness — updated 22 July 2026

## Decision

The application code is compatible with Cloudflare Workers Free. Both the locked staging Worker and the locked, no-index production-preview Worker are deployed on the correct Cloudflare account and pass their public smoke tests. Production DNS is **not ready to switch yet** because the database entitlement migration, live Paystack key, Resend key, and interactive workflow checks are still outstanding.

## Verified

- Staging URL: `https://9jadirectory-staging.israelakhas.workers.dev`
- Deployed Worker version: `35c7ffc2-7c65-4e91-9466-1f14651db874`
- Compressed Worker: `2604.96 KiB`, below the 3 MiB Free-plan limit
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
- Production preview URL: `https://9jadirectory-production.israelakhas.workers.dev`
- Production Worker version: `65c4890b-d6cb-49a8-830b-d7be9fecc5bb`
- Production preview public smoke test: passed
- All `workers.dev` login, checkout, admin, cron, and write routes: locked and non-cacheable
- Production-domain responses: do not inherit the preview noindex rule
- Current deployed production bundle: `2605.53 KiB` gzip, below the 3 MiB Free-plan limit
- Live Supabase preflight: profile, payment, payment-lead, and email columns exist
- Live Supabase listings gap: `featured`, `business_hours`, and `employee_count_range` are absent; migration 012 creates them and adds the protected public `plan_tier` used for ranking
- Legacy rollback compatibility: migration 012 synchronizes `featured` with the existing `is_featured` column
- Live entitlement preflight: 3 profiles, 5 paid users missing profiles, 7 successful payments, and 6 paid listings observed
- Expected repaired paid tiers: 4 Basic, 1 Premium, and 1 Lifetime
- Cloudflare zone: added on the Free plan; 17 website and email DNS records imported
- Assigned Cloudflare nameservers: `janet.ns.cloudflare.com` and `joel.ns.cloudflare.com`
- Registrar: Namecheap; current Vercel nameserver delegation remains unchanged

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
2. The production Worker has Supabase, cron, admin sender, and Paystack **test-mode** bindings. It still needs the live Paystack secret and a new Resend API key.
3. Signup, login, payment, webhook, admin, and email flows remain intentionally locked on the public preview until the live credentials and database migration are complete.
4. The existing local Vercel project link cannot currently retrieve project settings, so any missing secret must be recovered from the correct Vercel account or its source dashboard.
5. `9jadirectory.org` still uses `ns1.vercel-dns.com` and `ns2.vercel-dns.com`. The Cloudflare zone is prepared, but Namecheap delegation must not change until all workflow gates pass.
6. Paystack's current live webhook points to `landforsaleinabuja.com`; it must be changed to the verified 9jaDirectory Cloudflare endpoint at cutover.

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

The SQL migration records newly repaired profiles in `private.profile_creation_backups`, stores every pre-change profile in `private.profile_entitlement_backups`, and stores pre-normalisation paid listings in `private.listing_entitlement_backups`. Vercel remains the live host, so the current rollback is simply to leave DNS unchanged. After cutover, restore the previous nameservers if authentication, payments, images, or Worker limits fail.
