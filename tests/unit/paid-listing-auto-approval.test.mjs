import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const actionSource = fs.readFileSync('app/actions/listings.ts', 'utf8')
const approvalSource = fs.readFileSync('lib/listings/auto-approve.ts', 'utf8')
const fulfillmentSource = fs.readFileSync('lib/payments/fulfill.ts', 'utf8')
const leadStatusSource = fs.readFileSync('lib/payments/update-lead-status.ts', 'utf8')
const emailSource = fs.readFileSync('lib/email/transactional.ts', 'utf8')

test('complete paid listings use the server-side automatic approval path', () => {
  assert.match(actionSource, /autoApproveVerifiedPaidListing/)
  assert.match(approvalSource, /\.eq\('status', 'success'\)/)
  assert.match(approvalSource, /\.eq\('user_id', input\.userId\)/)
  assert.match(approvalSource, /getMissingListingFields\(listing\)/)
  assert.match(approvalSource, /status: 'approved'/)
  assert.match(approvalSource, /queueListingApprovedEmail/)
  assert.match(fulfillmentSource, /autoApproveVerifiedPaidListing/)
  assert.match(fulfillmentSource, /paymentReference: payment\.reference/)
})

test('payment messaging explains that required listing details must be completed', () => {
  assert.match(emailSource, /complete the business form/i)
  assert.match(emailSource, /published automatically/i)
})

test('legacy paid-at column width cannot block verified payment status', () => {
  assert.match(leadStatusSource, /character varying\\\(20\\\)/)
  assert.match(leadStatusSource, /update\(\{ status: input\.status \}\)/)
  assert.match(fs.readFileSync('app/api/payments/verify/route.ts', 'utf8'), /updateVerifiedPaymentLead/)
  assert.match(fs.readFileSync('app/api/paystack/webhook/route.ts', 'utf8'), /updateVerifiedPaymentLead/)
})

test('public payment leads are checked before legacy payment records', () => {
  const verifySource = fs.readFileSync('app/api/payments/verify/route.ts', 'utf8')
  assert.ok(verifySource.indexOf(".from('payment_leads')") < verifySource.indexOf(".from('payments')"))

  const webhookSource = fs.readFileSync('app/api/paystack/webhook/route.ts', 'utf8')
  assert.ok(webhookSource.indexOf(".from('payment_leads')") < webhookSource.indexOf(".from('payments')"))
})

test('signed-in payments use trusted Paystack metadata before matching the reference', () => {
  const verifySource = fs.readFileSync('app/api/payments/verify/route.ts', 'utf8')
  assert.match(verifySource, /paymentLookupUserId/)
  assert.match(verifySource, /paymentData\.customer\.email/)
  assert.match(verifySource, /\.eq\('user_id', paymentLookupUserId\)/)
  assert.match(verifySource, /find\(\(row\) => row\.reference === reference\)/)
  assert.match(verifySource, /\.limit\(500\)/)

  assert.match(fulfillmentSource, /input\.userId && input\.planId/)
  assert.match(fulfillmentSource, /find\(\(row\) => row\.reference === input\.reference\)/)
})
