'use server'

import { createClient } from '@/lib/supabase/server'
import { getPaymentPlan } from '@/lib/payments/plans'
import { initializePaystackTransaction } from '@/lib/payments/paystack'

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://www.9jadirectory.org'
}

function generateReference() {
  const id = crypto.randomUUID().replace(/-/g, '')
  return `9ja_${id}`
}

export async function startFeaturedPayment(input: { listingId: string; planId: string }) {
  const plan = getPaymentPlan(input.planId)
  if (!plan) throw new Error('Invalid plan selected')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.id || !user.email) {
    throw new Error('You must be logged in to make a payment')
  }

  // Ensure the listing exists and belongs to the current user
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('id')
    .eq('id', input.listingId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (listingError) {
    throw new Error(listingError.message)
  }

  if (!listing) {
    throw new Error('Listing not found (or you do not own it)')
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

  const callbackUrl = `${getSiteUrl()}/paystack/callback`
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

  const callbackUrl = `${getSiteUrl()}/paystack/callback`
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

