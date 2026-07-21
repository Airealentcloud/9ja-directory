'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getPaymentPlan } from '@/lib/payments/plans'
import { initializePaystackTransaction } from '@/lib/payments/paystack'
import { SITE_URL } from '@/lib/seo/site-url'
import { getAccountPlanLimits, resolveAccountPlan } from '@/lib/entitlements'
import { isAllowedApplicationOrigin } from '@/lib/http/application-origin'

async function getSiteUrl() {
  const requestHeaders = await headers()
  const origin = requestHeaders.get('origin')
  if (origin && isAllowedApplicationOrigin(origin)) return new URL(origin).origin

  const forwardedHost = requestHeaders.get('x-forwarded-host')
  const host = forwardedHost || requestHeaders.get('host')
  const protocol = requestHeaders.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https')
  const forwardedOrigin = host ? `${protocol}://${host}` : ''
  return isAllowedApplicationOrigin(forwardedOrigin) ? forwardedOrigin : SITE_URL
}

function generateReference() {
  const id = crypto.randomUUID().replace(/-/g, '')
  return `9ja_${id}`
}

export async function startFeaturedPayment(input: { listingId: string; planId: string }) {
  const plan = getPaymentPlan(input.planId)
  if (!plan || plan.planType !== 'featured') {
    throw new Error('Select a valid featured-listing add-on.')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.id || !user.email) {
    throw new Error('You must be logged in to make a payment')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, subscription_plan, subscription_status, subscription_expires_at')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) throw new Error('Your account plan could not be verified.')

  const accountPlan = resolveAccountPlan({
    role: profile.role,
    subscriptionPlan: profile.subscription_plan,
    subscriptionStatus: profile.subscription_status,
    subscriptionExpiresAt: profile.subscription_expires_at,
  })
  const limits = getAccountPlanLimits(accountPlan)

  if (!limits.canBuyFeaturedPlacement) {
    const message = accountPlan === 'lifetime'
      ? 'Homepage featuring is already included with your Lifetime plan.'
      : 'Featured add-ons are available to Premium customers. Upgrade your plan first.'
    throw new Error(message)
  }

  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('id, status, featured, featured_until')
    .eq('id', input.listingId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (listingError) throw new Error(listingError.message)
  if (!listing) throw new Error('Listing not found (or you do not own it)')
  if (listing.status !== 'approved') throw new Error('Only approved listings can be promoted.')

  if (listing.featured && listing.featured_until && new Date(listing.featured_until) > new Date()) {
    throw new Error('This listing already has an active featured placement.')
  }

  const reference = generateReference()
  const { error: insertError } = await supabase.from('payments').insert({
    user_id: user.id,
    listing_id: input.listingId,
    provider: 'paystack',
    reference,
    plan: plan.id,
    amount: plan.amountKobo,
    currency: plan.currency,
    status: 'pending',
    metadata: { listingId: input.listingId, planId: plan.id },
  })

  if (insertError) {
    const msg = insertError.message?.toLowerCase().includes('relation') && insertError.message?.includes('payments')
      ? 'Database table `payments` is missing. Run `migrations/006_payments_and_featured.sql` in Supabase SQL Editor.'
      : insertError.message
    throw new Error(msg)
  }

  const callbackUrl = `${await getSiteUrl()}/paystack/callback`
  const paystack = await initializePaystackTransaction({
    email: user.email,
    amountKobo: plan.amountKobo,
    reference,
    callbackUrl,
    currency: plan.currency,
    metadata: { listingId: input.listingId, planId: plan.id },
  })

  return { authorizationUrl: paystack.authorization_url, reference: paystack.reference }
}

export async function startTestPayment() {
  const plan = getPaymentPlan('test_payment')
  if (!plan) throw new Error('Test payment plan not found')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.id || !user.email) {
    throw new Error('You must be logged in to make a payment')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    throw new Error('The test-payment tool is restricted to administrators.')
  }

  const reference = generateReference()
  const { error: insertError } = await supabase.from('payments').insert({
    user_id: user.id,
    listing_id: null,
    provider: 'paystack',
    reference,
    plan: plan.id,
    amount: plan.amountKobo,
    currency: plan.currency,
    status: 'pending',
    metadata: { planId: plan.id, test: true },
  })

  if (insertError) {
    const msg = insertError.message?.toLowerCase().includes('relation') && insertError.message?.includes('payments')
      ? 'Database table `payments` is missing. Run `migrations/006_payments_and_featured.sql` in Supabase SQL Editor.'
      : insertError.message
    throw new Error(msg)
  }

  const callbackUrl = `${await getSiteUrl()}/paystack/callback`
  const paystack = await initializePaystackTransaction({
    email: user.email,
    amountKobo: plan.amountKobo,
    reference,
    callbackUrl,
    currency: plan.currency,
    metadata: { planId: plan.id, test: true },
  })

  return { authorizationUrl: paystack.authorization_url, reference: paystack.reference }
}
