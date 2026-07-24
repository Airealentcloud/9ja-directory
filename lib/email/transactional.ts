import { queueTransactionalEmail } from '@/lib/email/queue'
import { getPlanById, type PlanId } from '@/lib/pricing'
import { SITE_URL } from '@/lib/seo/site-url'

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function customerName(value?: string | null) {
  return value?.trim() || 'Business Owner'
}

function formatAmount(amountKobo: number, currency: string) {
  const amount = amountKobo / 100
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency || 'NGN',
    maximumFractionDigits: 0,
  }).format(amount)
}

function emailLayout(input: {
  preview: string
  heading: string
  body: string
  buttonLabel: string
  buttonUrl: string
}) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(input.preview)}</title>
</head>
<body style="margin:0;background:#f4f7f5;font-family:Arial,Helvetica,sans-serif;color:#172033;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(input.preview)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7f5;padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
        <tr><td style="background:#16a34a;padding:22px 30px;color:#ffffff;font-size:24px;font-weight:700;">9jaDirectory</td></tr>
        <tr><td style="padding:32px 30px;">
          <h1 style="margin:0 0 18px;font-size:26px;line-height:1.25;color:#0f172a;">${escapeHtml(input.heading)}</h1>
          ${input.body}
          <p style="margin:28px 0;text-align:center;">
            <a href="${escapeHtml(input.buttonUrl)}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;font-weight:700;padding:13px 22px;border-radius:8px;">${escapeHtml(input.buttonLabel)}</a>
          </p>
          <p style="margin:24px 0 0;color:#475569;line-height:1.65;">Regards,<br><strong>The 9jaDirectory Team</strong></p>
        </td></tr>
        <tr><td style="padding:18px 30px;background:#f8fafc;color:#64748b;font-size:12px;line-height:1.6;">
          This is a transactional message about your 9jaDirectory account or listing.<br>
          <a href="${SITE_URL}" style="color:#15803d;">${SITE_URL}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function queueRegistrationCompleteEmail(input: {
  userId: string
  email: string
  fullName?: string | null
}) {
  const name = customerName(input.fullName)
  const subject = 'Welcome to 9jaDirectory — your registration is complete'
  const text = `Hello ${name},

Your email has been confirmed and your 9jaDirectory registration is now complete.

You can now add and manage your business listing, choose a listing plan, update your business information and check your payment or approval status.

Go to your dashboard: ${SITE_URL}/dashboard

Regards,
The 9jaDirectory Team`

  const html = emailLayout({
    preview: 'Your 9jaDirectory account is ready.',
    heading: 'Your registration is complete',
    buttonLabel: 'Go to my dashboard',
    buttonUrl: `${SITE_URL}/dashboard`,
    body: `
      <p style="margin:0 0 16px;line-height:1.7;">Hello <strong>${escapeHtml(name)}</strong>,</p>
      <p style="margin:0 0 16px;line-height:1.7;">Your email has been confirmed and your 9jaDirectory registration is now complete.</p>
      <p style="margin:0 0 10px;line-height:1.7;">You can now:</p>
      <ul style="margin:0;padding-left:22px;line-height:1.8;">
        <li>Add and manage your business listing</li>
        <li>Choose the plan that suits your business</li>
        <li>Update your business details and photos</li>
        <li>Check payment and approval status</li>
      </ul>`,
  })

  return queueTransactionalEmail({
    eventKey: `registration-complete:${input.userId}`,
    userId: input.userId,
    email: input.email,
    type: 'registration_complete',
    subject,
    text,
    html,
  })
}

export async function queuePaymentReceivedEmail(input: {
  reference: string
  email: string
  userId?: string | null
  listingId?: string | null
  fullName?: string | null
  businessName?: string | null
  planId: PlanId
  amountKobo: number
  currency: string
  paidAt?: string | null
  requiresAccountSetup?: boolean
}) {
  const plan = getPlanById(input.planId)
  if (!plan) throw new Error(`Unknown paid plan: ${input.planId}`)

  const name = customerName(input.fullName)
  const business = input.businessName?.trim() || 'Your business listing'
  const amount = formatAmount(input.amountKobo, input.currency)
  const paidDate = input.paidAt
    ? new Date(input.paidAt).toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })
    : new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })
  const nextUrl = input.requiresAccountSetup
    ? `${SITE_URL}/payment/verify?reference=${encodeURIComponent(input.reference)}`
    : `${SITE_URL}/dashboard/my-listings`
  const nextLabel = input.requiresAccountSetup ? 'Finish account setup' : 'Check my listing status'
  const nextMessage = input.requiresAccountSetup
    ? 'Your payment is secure. Finish creating or confirming your account with the same email address so we can connect the plan to your listing.'
    : 'Your plan is active and the listing is awaiting review. Payment does not make a listing public automatically.'

  const subject = `Payment received — ${plan.name} plan | ${input.reference}`
  const text = `Hello ${name},

We received your ${amount} payment for the ${plan.name} plan.

Business: ${business}
Reference: ${input.reference}
Payment status: Confirmed
Listing status: Awaiting review
Paid: ${paidDate}

${nextMessage}

Continue: ${nextUrl}

Regards,
The 9jaDirectory Team`

  const html = emailLayout({
    preview: `Payment confirmed for your ${plan.name} plan.`,
    heading: 'Your payment has been confirmed',
    buttonLabel: nextLabel,
    buttonUrl: nextUrl,
    body: `
      <p style="margin:0 0 16px;line-height:1.7;">Hello <strong>${escapeHtml(name)}</strong>,</p>
      <p style="margin:0 0 20px;line-height:1.7;">We received your payment for the <strong>${escapeHtml(plan.name)} plan</strong>.</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 20px;">
        <tr><td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#64748b;">Amount</td><td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:700;">${escapeHtml(amount)}</td></tr>
        <tr><td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#64748b;">Plan</td><td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:700;">${escapeHtml(plan.name)}</td></tr>
        <tr><td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#64748b;">Business</td><td style="padding:10px;border-bottom:1px solid #e2e8f0;">${escapeHtml(business)}</td></tr>
        <tr><td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#64748b;">Reference</td><td style="padding:10px;border-bottom:1px solid #e2e8f0;font-family:monospace;">${escapeHtml(input.reference)}</td></tr>
        <tr><td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#64748b;">Payment</td><td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#15803d;font-weight:700;">Confirmed</td></tr>
        <tr><td style="padding:10px;color:#64748b;">Listing</td><td style="padding:10px;color:#a16207;font-weight:700;">Awaiting review</td></tr>
      </table>
      <p style="margin:0;padding:14px 16px;background:#fefce8;border-left:4px solid #eab308;line-height:1.7;">${escapeHtml(nextMessage)}</p>`,
  })

  return queueTransactionalEmail({
    eventKey: `payment-success:${input.reference}`,
    userId: input.userId,
    listingId: input.listingId,
    email: input.email,
    type: 'payment_success',
    subject,
    text,
    html,
  })
}

export async function queueListingApprovedEmail(input: {
  listingId: string
  userId?: string | null
  email: string
  fullName?: string | null
  businessName: string
  listingSlug: string
  planId: PlanId
}) {
  const plan = getPlanById(input.planId)
  if (!plan) throw new Error(`Unknown listing plan: ${input.planId}`)

  const name = customerName(input.fullName)
  const listingUrl = `${SITE_URL}/listings/${input.listingSlug}`
  const subject = `Your business is now live — ${input.businessName}`
  const text = `Hello ${name},

Your business listing, ${input.businessName}, has been reviewed and approved.

Your ${plan.name} plan is active and the features included in that plan are now available.

View your listing: ${listingUrl}
Manage your listing: ${SITE_URL}/dashboard/my-listings

Regards,
The 9jaDirectory Team`

  const html = emailLayout({
    preview: `${input.businessName} is now live on 9jaDirectory.`,
    heading: 'Your business listing is live',
    buttonLabel: 'View my business listing',
    buttonUrl: listingUrl,
    body: `
      <p style="margin:0 0 16px;line-height:1.7;">Hello <strong>${escapeHtml(name)}</strong>,</p>
      <p style="margin:0 0 16px;line-height:1.7;">Your business listing, <strong>${escapeHtml(input.businessName)}</strong>, has been reviewed and approved.</p>
      <p style="margin:0 0 16px;line-height:1.7;">Your <strong>${escapeHtml(plan.name)} plan</strong> is active, and the features included in that plan are now available.</p>
      <p style="margin:0;padding:14px 16px;background:#f0fdf4;border-left:4px solid #16a34a;line-height:1.7;">You can update the information and features allowed under your plan from your dashboard.</p>`,
  })

  return queueTransactionalEmail({
    eventKey: `listing-approved:${input.listingId}`,
    userId: input.userId,
    listingId: input.listingId,
    email: input.email,
    type: 'listing_approved',
    subject,
    text,
    html,
  })
}
