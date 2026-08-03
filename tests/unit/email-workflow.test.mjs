import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const root = process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

test('transactional email events use deterministic database keys', () => {
  const source = read('lib/email/transactional.ts')

  assert.match(source, /registration-complete:\$\{input\.userId\}/)
  assert.match(source, /payment-success:\$\{input\.reference\}/)
  assert.match(source, /listing-approved:\$\{input\.listingId\}/)
  assert.match(source, /Payment status:[\s\S]*Confirmed/)
  assert.match(source, /Listing status:[\s\S]*Complete your business details/)
})

test('database migration enforces queue idempotency and atomic claiming', () => {
  const migration = read('migrations/014_transactional_email_workflow.sql')

  assert.match(migration, /CREATE UNIQUE INDEX IF NOT EXISTS email_notifications_event_key_unique/)
  assert.match(migration, /CREATE OR REPLACE FUNCTION public\.claim_email_notifications/)
  assert.match(migration, /FOR UPDATE SKIP LOCKED/)
  assert.match(migration, /DROP TRIGGER IF EXISTS on_payment_status_changed_notify/)
})

test('registration, payment and approval events are wired to the queue', () => {
  assert.match(read('app/auth/callback/route.ts'), /queueRegistrationCompleteEmail/)
  assert.match(read('lib/payments/fulfill.ts'), /queuePaymentReceivedEmail/)
  assert.match(read('app/api/paystack/webhook/route.ts'), /queuePaymentReceivedEmail/)
  assert.match(read('app/actions/admin.ts'), /queueListingApprovedEmail/)
})

test('Resend receives a deterministic idempotency header', () => {
  const source = read('lib/email/resend.ts')

  assert.match(source, /idempotencyKey\?: string/)
  assert.match(source, /'Idempotency-Key': input\.idempotencyKey/)
})
