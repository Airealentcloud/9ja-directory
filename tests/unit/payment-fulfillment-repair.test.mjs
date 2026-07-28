import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

import {
  isValidEmailAddress,
  normalizeEmailAddress,
  resolveListingEmail,
} from '../../lib/validation/email.ts'

const root = process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

test('checkout email validation rejects concatenated addresses', () => {
  assert.equal(isValidEmailAddress('anncluzy@gmail.com'), true)
  assert.equal(isValidEmailAddress('anncluzy@gmail.comanncluzy@gmail.com'), false)
  assert.equal(normalizeEmailAddress('  AnnCluzy@Gmail.com '), 'anncluzy@gmail.com')
})

test('fulfillment replaces malformed legacy listing email with the Auth email', () => {
  assert.equal(
    resolveListingEmail(
      'anncluzy@gmail.comanncluzy@gmail.com',
      'anncluzy@gmail.com'
    ),
    'anncluzy@gmail.com'
  )
  assert.equal(
    resolveListingEmail('orders@anncluzy.com', 'anncluzy@gmail.com'),
    'orders@anncluzy.com'
  )
})

test('payment fulfillment repairs a missing customer profile before activation', () => {
  assert.match(read('lib/payments/fulfill.ts'), /ensureCustomerProfile\(supabase, payment\.user_id\)/)
  assert.match(read('app/auth/callback/route.ts'), /ensureCustomerProfile/)
})

test('profile migration backfills accounts and restores the Auth signup trigger', () => {
  const migration = read('migrations/015_auth_profile_fulfillment_repair.sql')

  assert.match(migration, /CREATE OR REPLACE FUNCTION private\.handle_new_auth_user_profile/)
  assert.match(migration, /CREATE TRIGGER on_auth_user_created_profile/)
  assert.match(migration, /AFTER INSERT ON auth\.users/)
  assert.match(migration, /INSERT INTO public\.profiles/)
  assert.match(migration, /LEFT JOIN public\.profiles/)
})
