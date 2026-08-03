import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const actionSource = fs.readFileSync('app/actions/listings.ts', 'utf8')
const approvalSource = fs.readFileSync('lib/listings/auto-approve.ts', 'utf8')
const fulfillmentSource = fs.readFileSync('lib/payments/fulfill.ts', 'utf8')
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
