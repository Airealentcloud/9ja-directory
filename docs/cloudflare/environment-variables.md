# Cloudflare environment variables

Keep secret values out of Git. Public `NEXT_PUBLIC_*` values are compiled into the browser bundle during `npm run cf:build`; they must therefore be test-project values when building staging.

## Current staging state

The deployed staging Worker intentionally has only these non-secret values:

- `DEPLOYMENT_ENV=staging`
- `CRON_JOBS_ENABLED=false`
- `STAGING_MUTATIONS_ENABLED=false`
- `NEXT_PUBLIC_SITE_URL=https://www.9jadirectory.org`

The only encrypted staging secret currently present is `CRON_SECRET`. Interactive account, admin, payment, email, AI, and mutation routes remain locked with HTTP `503` so the staging UI cannot modify production data.

The production configuration is stored separately in `wrangler.production.jsonc`. It has not been deployed or attached to `www.9jadirectory.org`. Production builds use `npm run cf:build:production`, which fails if the generated `robots.txt` contains the staging-wide `Disallow: /` rule.

## Required for an interactive test environment

Build-time public values:

- `NEXT_PUBLIC_SUPABASE_URL` — a test Supabase project
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — the test project's anonymous key
- `NEXT_PUBLIC_SITE_URL=https://www.9jadirectory.org` — keep canonical URLs on production
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — optional and hostname-restricted
- `NEXT_PUBLIC_GA_ID` — optional; omit on staging to avoid polluting analytics

Encrypted runtime secrets, set with `npx wrangler secret put NAME`:

- `SUPABASE_SERVICE_ROLE_KEY` — from the same test Supabase project
- `PAYSTACK_SECRET_KEY` — Paystack test mode only
- `RESEND_API_KEY` — a staging-capable key
- `ANTHROPIC_API_KEY` — optional; needed only for AI features
- `CRON_SECRET` — already configured

Optional runtime values:

- `ADMIN_EMAIL`
- `RESEND_FROM_EMAIL`

After the test services are configured and the database migration has been applied to the test database, set `STAGING_MUTATIONS_ENABLED=true`. Set `CRON_JOBS_ENABLED=true` only after the three scheduled endpoints have passed authenticated tests.

## Production cutover

Production uses the separate `wrangler.production.jsonc` configuration with `DEPLOYMENT_ENV=production`. Transfer production secrets directly from their source dashboards or from Vercel into encrypted Cloudflare secrets; never copy secret values into Git or command history. Public Supabase values must be available both while Next.js builds and at Worker runtime.

Required production runtime configuration:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (encrypted)
- `PAYSTACK_SECRET_KEY` (encrypted)
- `RESEND_API_KEY` (encrypted)
- `CRON_SECRET` (encrypted)
- `ADMIN_EMAIL`
- `RESEND_FROM_EMAIL`

Keep `CRON_JOBS_ENABLED=false` until authenticated cron checks pass. Do not attach the production custom domain until signup, login, payment initialization, webhook fulfillment, admin approval, listing editing, and approval-email delivery pass on the temporary production Worker.

Keep `PREVIEW_MUTATIONS_ENABLED=false` for the public `workers.dev` production preview. Set it to `true` only during a supervised end-to-end test window, then return it to `false`. The custom production domain is not treated as a preview host.

Deploy with `--keep-vars` if variables are managed in the Cloudflare dashboard, as recommended by the [OpenNext environment-variable guide](https://opennext.js.org/cloudflare/howtos/env-vars).
