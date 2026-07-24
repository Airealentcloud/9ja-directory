# Transactional Email Workflow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Send branded, database-backed, idempotent emails when a customer verifies an account, completes payment, and receives listing approval.

**Architecture:** Store every transactional email in `email_notifications` with a deterministic `event_key`. Attempt delivery immediately through Resend and let the existing Cloudflare cron retry queued or failed messages. Resend receives the same idempotency key so callback/webhook retries cannot produce duplicate customer receipts.

**Tech Stack:** Next.js App Router, TypeScript, Supabase/PostgreSQL, Paystack webhooks, Resend, Cloudflare scheduled workers.

---

### Task 1: Upgrade the notification queue

**Files:**
- Create: `migrations/014_transactional_email_workflow.sql`
- Modify: `app/api/send-emails/route.ts`

1. Add event keys, HTML bodies, delivery state, retry metadata, and a unique index.
2. Add an atomic `claim_email_notifications` database function.
3. Remove the legacy payment trigger that can create a second receipt.
4. Update the processor to claim, send, mark sent, and retain failures for retry.

### Task 2: Add branded transactional email builders

**Files:**
- Create: `lib/email/queue.ts`
- Create: `lib/email/transactional.ts`
- Modify: `lib/email/resend.ts`

1. Add Resend idempotency-key support.
2. Add safe shared HTML layout and plain-text alternatives.
3. Add registration-complete, payment-received, and listing-approved messages.
4. Queue each event with a deterministic key and attempt immediate delivery.

### Task 3: Wire business events

**Files:**
- Modify: `app/auth/callback/route.ts`
- Modify: `lib/payments/fulfill.ts`
- Modify: `app/api/payments/verify/route.ts`
- Modify: `app/api/paystack/webhook/route.ts`
- Modify: `app/actions/admin.ts`

1. Queue the welcome email after successful Auth code exchange.
2. Queue the registered-customer receipt after payment entitlements and listing linkage succeed.
3. Queue a pre-account receipt for successful public payment leads.
4. Replace direct listing approval delivery with the database-backed event.

### Task 4: Verify behavior

**Files:**
- Create: `tests/unit/email-workflow.test.mjs`

1. Test deterministic event keys and wiring from source.
2. Run `npm run test:unit`.
3. Run `npx tsc --noEmit`.
4. Run `npm run build`.
5. Apply migration 014 to Supabase and run a controlled delivery test.
