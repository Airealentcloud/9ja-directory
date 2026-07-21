# Cloudflare Free Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move 9jaDirectory from Vercel to Cloudflare Workers without changing public URLs, losing SEO signals, interrupting Supabase authentication, or missing Paystack payments.

**Architecture:** Deploy the existing Next.js 15 App Router application through `@opennextjs/cloudflare` to a staging `workers.dev` hostname first. Supabase remains the database and authentication provider, Paystack remains the payment provider, and Resend remains the email provider. The production domain stays on Vercel until the Cloudflare build, bundle-size, CPU, authentication, payment, email, admin, and SEO acceptance gates all pass.

**Tech Stack:** Next.js 15.5, OpenNext for Cloudflare, Cloudflare Workers Free, Wrangler, Supabase, Paystack, Resend, GitHub Actions, Playwright.

---

## Non-negotiable migration rules

- Do not change the `www.9jadirectory.org` DNS route during initial implementation.
- Do not remove the Vercel project until Cloudflare has served production successfully for at least seven days.
- Do not commit `.env`, `.dev.vars`, API keys, service-role keys, or Cloudflare tokens.
- Do not test real Paystack charges on the staging hostname. Use Paystack test keys and a test transaction.
- Preserve every current path, canonical URL, redirect, sitemap URL, and robots rule.
- Staging must send `X-Robots-Tag: noindex, nofollow` and must not be submitted to search engines.
- Stop the migration if the Free plan repeatedly returns Worker errors `1102` (CPU) or `1027` (daily requests), or if the compressed Worker exceeds 3 MB.

## Free-plan decision gate

Cloudflare Free is acceptable only if all of these pass:

1. The uploaded compressed Worker is at or below 3 MB.
2. Static assets remain below 20,000 files and 25 MiB per file.
3. Repeated authenticated admin, checkout, listing, and SSR requests do not produce CPU-limit errors.
4. Expected dynamic traffic remains well below 100,000 Worker requests per day.
5. The application needs no more than 64 environment variables.
6. Image usage stays within the free transformation allowance or images have a tested unoptimized fallback.

If bundle size or CPU fails, do not point the domain at Cloudflare. Use the fallback design in Task 10.

### Task 1: Create an isolated migration branch and baseline

**Files:**
- Create: `docs/cloudflare/baseline.md`
- Create: `scripts/cloudflare-smoke-test.mjs`
- Test: existing production URLs

**Steps:**

1. Create branch `codex/cloudflare-migration` from the latest `main`.
2. Record the current production deployment, Git commit, DNS provider, nameservers, CNAME/A records, MX records, SPF, DKIM, DMARC, Paystack webhook URL, Supabase redirect URLs, and Resend sender domain in `docs/cloudflare/baseline.md`.
3. Record HTTP status, canonical, title, robots, sitemap membership, and JSON-LD for `/`, `/pricing`, `/blog`, three blog posts, three listing pages, `/login`, and `/admin/listings`.
4. Add a read-only smoke script that checks these URLs and fails on incorrect status, canonical host, or missing security headers.
5. Run `npm run build` and `node scripts/cloudflare-smoke-test.mjs https://www.9jadirectory.org`.
6. Commit only the baseline and smoke test.

**Expected:** Vercel production remains unchanged and the baseline test passes.

### Task 2: Add OpenNext and Wrangler without deploying

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `wrangler.jsonc`
- Create: `open-next.config.ts`
- Modify: `.gitignore`
- Create: `public/_headers`
- Modify: `next.config.js`

**Steps:**

1. Install `@opennextjs/cloudflare@latest` and `wrangler@latest` as development dependencies.
2. Add scripts:
   - `cf:build`: `opennextjs-cloudflare build`
   - `cf:preview`: `opennextjs-cloudflare build && opennextjs-cloudflare preview`
   - `cf:deploy:staging`: `opennextjs-cloudflare deploy`
   - `cf:typegen`: `wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts`
3. Configure `wrangler.jsonc` with:
   - Worker name `9jadirectory-staging`.
   - Entrypoint `.open-next/worker.js`.
   - Assets directory `.open-next/assets`.
   - A current compatibility date.
   - `nodejs_compat` compatibility flag.
   - `workers_dev: true`.
   - No production custom-domain route.
   - An `IMAGES` binding only after confirming Cloudflare Images Free is enabled.
4. Start with the Workers Static Assets incremental cache in `open-next.config.ts`. Do not provision R2, D1, Queues, or Durable Objects during the first test.
5. Add `/.open-next`, `/.wrangler`, `.dev.vars*`, and `cloudflare-env.d.ts` to `.gitignore` as appropriate. Keep generated types only if the project imports them.
6. Add immutable one-year caching for `/_next/static/*` in `public/_headers`.
7. Add OpenNext's local-development initializer to `next.config.js` using the adapter's documented CommonJS-compatible pattern.
8. Run `npm run build`, `npm run cf:build`, and `npm run cf:typegen`.
9. Commit the adapter configuration only after both Next and OpenNext builds pass.

**Expected:** `.open-next/worker.js` and `.open-next/assets` are generated locally, but no Cloudflare deployment exists yet.

### Task 3: Remove unsupported Edge Runtime declarations

**Files:**
- Modify: `app/opengraph-image.tsx`
- Modify: `app/twitter-image.tsx`
- Modify: `app/logo.png/route.ts`

**Steps:**

1. Remove each `export const runtime = 'edge'` declaration because the OpenNext Cloudflare adapter expects the Node.js runtime.
2. Leave the existing Node.js runtime declarations on webhook and cron routes.
3. Run `npm run build` and `npm run cf:build`.
4. Request `/opengraph-image`, `/twitter-image`, and `/logo.png` in local Cloudflare preview and verify `200` plus the expected image content type.
5. Commit the runtime compatibility changes.

### Task 4: Configure variables and encrypted secrets

**Files:**
- Modify: `wrangler.jsonc`
- Create locally only: `.dev.vars` (never commit)
- Document: `docs/cloudflare/environment-variables.md`

**Public/configuration variables:**

- `NEXT_PUBLIC_SITE_URL=https://www.9jadirectory.org`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` if it is intentionally public and domain-restricted
- `ADMIN_EMAIL`
- `RESEND_FROM_EMAIL`
- `DEPLOYMENT_ENV=staging` for staging and `production` after cutover

**Encrypted secrets:**

- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYSTACK_SECRET_KEY`
- `RESEND_API_KEY`
- `ANTHROPIC_API_KEY`
- `CRON_SECRET`

**Steps:**

1. Copy names—not values—from the current Vercel configuration.
2. Store sensitive values with `wrangler secret put`; do not place them under `vars`.
3. Add a `secrets.required` declaration so deployment fails when a required secret is absent.
4. Restrict the Google Maps key to the production domain and staging hostname if staging map tests are required.
5. Verify no secret appears in `git diff`, `.open-next`, client JavaScript, build output, or console logs.
6. Commit only variable documentation and non-secret configuration.

### Task 5: Protect staging from indexing and preserve SEO behavior

**Files:**
- Modify: `middleware.ts`
- Test: `scripts/cloudflare-smoke-test.mjs`

**Steps:**

1. When `DEPLOYMENT_ENV !== 'production'`, add `X-Robots-Tag: noindex, nofollow` to every response.
2. Do not change canonical URLs: they must continue to point to `https://www.9jadirectory.org` during staging.
3. Preserve the existing apex-to-`www` redirect and malformed ampersand redirects.
4. Add smoke assertions for `/robots.txt`, `/sitemap.xml`, canonical host, one H1, metadata, structured data, and redirects.
5. Run the tests against local preview.
6. Commit staging SEO protection.

### Task 6: Deploy the staging Worker and test Free-tier feasibility

**Files:**
- No production DNS changes.
- Update: `docs/cloudflare/baseline.md` with staging URL and measurements.

**Steps:**

1. Authenticate Wrangler with a narrowly scoped Cloudflare API token.
2. Deploy to `9jadirectory-staging.<account>.workers.dev`.
3. Record Wrangler's compressed Worker upload size and asset count.
4. Stop immediately if compressed size exceeds the Free limit.
5. Run the smoke test against the staging URL.
6. Exercise every dynamic flow at least ten times while monitoring Worker logs and CPU:
   - Sign up and email confirmation with a test account.
   - Login, logout, cookie refresh, and password reset.
   - Dashboard and profile.
   - Add and edit a test listing.
   - Admin dashboard and Manage Listings.
   - Search, categories, states, listings, blog and pricing.
   - AI description and review analysis with controlled test data.
7. Fail the Free-tier gate if errors `1102`, `1027`, uncaught Node compatibility errors, or missing environment variables appear.
8. Commit only documentation of results; never commit logs containing personal data or secrets.

### Task 7: Verify payments, webhooks, email, and background jobs

**Files:**
- Test: `scripts/cloudflare-smoke-test.mjs`
- Potentially create: `cloudflare/cron-worker/wrangler.jsonc`
- Potentially create: `cloudflare/cron-worker/src/index.ts`

**Steps:**

1. Add the staging Auth callback URL to Supabase's allowed redirect URLs.
2. Use Paystack test mode to initialize, complete, verify, and fulfil a Basic payment.
3. Confirm webhook signature verification works with Node compatibility enabled.
4. Confirm a successful payment creates or links exactly one pending listing.
5. Confirm Manage Listings shows the registered Auth email and allows payment linking and approval.
6. Confirm approval and rejection emails are sent through Resend to the test account.
7. Confirm callback URLs use the expected staging host during tests and the canonical production host in production.
8. Determine how the two cron endpoints are currently scheduled. If Vercel was scheduling them, replace it with a tiny Cloudflare scheduled Worker that sends authenticated requests using `CRON_SECRET`.
9. Test `/api/cron/abandon-payments` and `/api/cron/expire-featured` manually with the Bearer token before enabling schedules.
10. Commit payment tests and cron configuration separately.

### Task 8: Add Cloudflare CI/CD with no automatic production cutover

**Files:**
- Create: `.github/workflows/cloudflare-staging.yml`
- Create later: `.github/workflows/cloudflare-production.yml`

**Steps:**

1. Add GitHub repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
2. On pull requests, run `npm ci`, `npx tsc --noEmit`, `npm run build`, and `npm run cf:build` without deployment.
3. On pushes to the migration branch, deploy only the staging Worker.
4. Do not create the production workflow until the Free-tier gate passes.
5. Make production deployment manual (`workflow_dispatch`) for the first month.
6. Commit and test the staging workflow.

### Task 9: Production cutover with a tested rollback

**Files:**
- Modify: `wrangler.jsonc` or create `wrangler.production.jsonc`
- Update: `docs/cloudflare/cutover-runbook.md`
- Update: `docs/cloudflare/rollback-runbook.md`

**Steps:**

1. Export and save the current DNS zone before changing nameservers or records.
2. Preserve MX, SPF, DKIM, DMARC, domain verification, and all non-web subdomains exactly.
3. Add the Cloudflare zone without immediately proxying production traffic.
4. Configure the production Worker custom domains for `www.9jadirectory.org` and the apex redirect.
5. Set `DEPLOYMENT_ENV=production` and verify that the staging `noindex` header is absent.
6. Keep the Vercel deployment reachable through its Vercel hostname for rollback.
7. Perform cutover during a low-traffic period.
8. Immediately run smoke tests for public pages, Auth, admin, one Paystack test transaction, webhook delivery, email, robots and sitemap.
9. Monitor Worker errors, CPU, Paystack events, Supabase Auth logs and Resend for at least two hours.
10. Roll back immediately on payment failure, login loops, missing images, widespread `1102` errors, 5xx responses, or incorrect canonical/robots output.
11. After seven stable days, remove Vercel DNS routing but retain the project until backups and final acceptance are complete.

### Task 10: Free-tier fallback if the full Next.js Worker fails

Do not pay or force the production cutover. Choose the failure-specific option:

- **Bundle exceeds 3 MB:** remove test/debug routes from production; move Anthropic-backed AI endpoints into a separate small Worker; reduce server imports; reassess the large `lib/blog-data.ts` bundle; rebuild and remeasure.
- **Authenticated SSR exceeds 10 ms CPU:** client-render dashboard/admin data through narrowly scoped API Workers while keeping public SEO pages static or cached.
- **Public SSR exceeds 10 ms CPU:** pre-render blog, category and location pages at build time and serve them as static assets; keep only auth, admin, payment and webhook routes dynamic.
- **Image transformations exceed the free allowance:** use a finite set of pre-generated WebP/AVIF sizes or temporarily set selected images to unoptimized originals with explicit width, height and caching.
- **The refactor becomes too risky:** keep Vercel temporarily while building the hybrid static/public + small dynamic Workers architecture. Do not switch DNS until it passes the same acceptance suite.

### Task 11: Final acceptance and decommissioning

**Files:**
- Update: `docs/cloudflare/baseline.md`
- Update: `docs/cloudflare/cutover-runbook.md`
- Update: `README.md`

**Acceptance criteria:**

- `npx tsc --noEmit`, `npm run build`, and `npm run cf:build` pass.
- All important public and authenticated routes return expected status codes.
- No Worker size, CPU, request, environment-variable, or image-limit failures occur.
- Supabase signup/login/logout/password reset work.
- Paystack initialization, callback, webhook, fulfilment, payment linking and approval work exactly once.
- Resend approval, rejection and admin notifications work.
- Cron tasks run with authenticated requests.
- Canonicals, sitemap, robots, redirects, structured data and security headers match the Vercel baseline.
- Search engines never index the `workers.dev` hostname.
- DNS email records remain intact.
- The rollback procedure has been tested before Vercel is removed.

After seven stable production days, document final Cloudflare ownership and deployment procedures. Remove Vercel only when the owner explicitly approves decommissioning.
