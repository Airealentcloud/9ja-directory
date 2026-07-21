import { createAdminClient } from '@/lib/supabase/admin'
import { getPaymentPlan } from '@/lib/payments/plans'
import { getPlanById as getSubscriptionPlanById, type PlanId } from '@/lib/pricing'
import {
  PLAN_LIMITS,
  canCreateAnotherListing,
  getMissingListingFields,
  sanitizeListingForPlan,
} from '@/lib/entitlements'

type PaymentStatus = 'pending' | 'success' | 'failed' | 'abandoned'

type PaymentRow = {
  id: string
  reference: string
  user_id: string
  listing_id: string | null
  plan: string
  amount: number
  currency: string
  status: PaymentStatus
  paid_at: string | null
  metadata?: {
    listing_data?: string | Record<string, unknown>
    [key: string]: unknown
  } | null
}

const PLAN_RANK: Record<PlanId, number> = {
  basic: 1,
  premium: 2,
  lifetime: 3,
}

function generateSlug(businessName: string): string {
  return `${businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 70) || 'business-listing'}-${Math.random().toString(36).substring(2, 7)}`
}

function parseListingData(value: unknown) {
  if (!value) return null
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as Record<string, unknown>
    } catch {
      throw new Error('Paid listing data is invalid and could not be restored.')
    }
  }
  if (typeof value === 'object') return value as Record<string, unknown>
  return null
}

function chooseHigherPlan(
  currentProfile: {
    subscription_plan?: unknown
    subscription_status?: unknown
    subscription_expires_at?: unknown
  },
  purchasedPlan: PlanId,
  now: Date
): PlanId {
  const currentPlan = currentProfile.subscription_plan
  const expiryValue = currentProfile.subscription_expires_at
  const expiry = typeof expiryValue === 'string' ? new Date(expiryValue) : null
  const currentPlanIsActive =
    currentProfile.subscription_status === 'active' &&
    (!expiry || (!Number.isNaN(expiry.getTime()) && expiry > now))

  if (
    currentPlanIsActive &&
    typeof currentPlan === 'string' &&
    currentPlan in PLAN_RANK &&
    PLAN_RANK[currentPlan as PlanId] > PLAN_RANK[purchasedPlan]
  ) {
    return currentPlan as PlanId
  }
  return purchasedPlan
}

export async function fulfillPaystackSuccess(input: {
  reference: string
  amountKobo: number
  currency: string
  paidAt?: string | null
}) {
  const supabase = createAdminClient()

  const { data: paymentRaw, error: paymentError } = await supabase
    .from('payments')
    .select('id, reference, user_id, listing_id, plan, amount, currency, status, paid_at, metadata')
    .eq('reference', input.reference)
    .single()

  if (paymentError || !paymentRaw) {
    throw new Error(`Payment not found for reference: ${input.reference}`)
  }

  const payment = paymentRaw as PaymentRow
  const paymentPlan = getPaymentPlan(payment.plan)
  if (!paymentPlan) throw new Error(`Unknown payment plan: ${payment.plan}`)

  if (
    payment.amount !== input.amountKobo ||
    payment.currency !== input.currency ||
    paymentPlan.amountKobo !== input.amountKobo ||
    paymentPlan.currency !== input.currency
  ) {
    throw new Error('Payment amount/currency does not match the selected plan')
  }

  if (payment.status !== 'success') {
    const { error: updateError } = await supabase
      .from('payments')
      .update({ status: 'success', paid_at: input.paidAt ?? new Date().toISOString() })
      .eq('id', payment.id)
    if (updateError) throw updateError
  }

  if (paymentPlan.planType === 'test') {
    return { paymentId: payment.id, listingId: payment.listing_id, listingSlug: null }
  }

  if (paymentPlan.planType === 'featured') {
    if (!payment.listing_id || !paymentPlan.featuredDays) {
      throw new Error('Featured payment is not linked to a listing')
    }

    const featuredUntil = new Date(
      Date.now() + paymentPlan.featuredDays * 24 * 60 * 60 * 1000
    ).toISOString()
    const { data: listing, error: featureError } = await supabase
      .from('listings')
      .update({ featured: true, featured_until: featuredUntil })
      .eq('id', payment.listing_id)
      .eq('user_id', payment.user_id)
      .select('id, slug')
      .single()

    if (featureError || !listing) {
      throw new Error(featureError?.message || 'Could not feature the paid listing')
    }
    return { paymentId: payment.id, listingId: listing.id, listingSlug: listing.slug }
  }

  const purchasedPlan = getSubscriptionPlanById(payment.plan as PlanId)
  if (!purchasedPlan) throw new Error(`Invalid subscription plan: ${payment.plan}`)

  const { data: existingProfile, error: profileSelectError } = await supabase
    .from('profiles')
    .select('id, subscription_plan, subscription_status, subscription_expires_at')
    .eq('id', payment.user_id)
    .single()

  if (profileSelectError || !existingProfile) {
    throw new Error(profileSelectError?.message || 'Customer profile is missing')
  }

  const now = new Date()
  const effectivePlanId = chooseHigherPlan(existingProfile, purchasedPlan.id, now)
  const effectivePlan = getSubscriptionPlanById(effectivePlanId)
  if (!effectivePlan) throw new Error('Could not resolve the active subscription plan')

  const periodEnd = new Date(now)
  periodEnd.setFullYear(periodEnd.getFullYear() + 100)

  const { error: subscriptionError } = await supabase
    .from('subscriptions')
    .upsert(
      {
        user_id: payment.user_id,
        plan: effectivePlan.id,
        status: 'active',
        amount: payment.amount,
        currency: payment.currency,
        interval: effectivePlan.interval,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
      },
      { onConflict: 'user_id' }
    )

  if (subscriptionError) throw new Error(`Could not activate subscription: ${subscriptionError.message}`)

  const limits = PLAN_LIMITS[effectivePlanId]
  const { data: updatedProfile, error: profileError } = await supabase
    .from('profiles')
    .update({
      subscription_plan: effectivePlanId,
      subscription_status: 'active',
      subscription_expires_at: periodEnd.toISOString(),
      can_add_listings: true,
      can_claim_listings: limits.canClaimListings,
      can_feature_listings: limits.canBuyFeaturedPlacement || limits.hasFeaturedHomepage,
      featured_posts_remaining: 0,
    })
    .eq('id', payment.user_id)
    .select('id')
    .single()

  if (profileError || !updatedProfile) {
    throw new Error(profileError?.message || 'Could not apply account entitlements')
  }

  // A paid tier belongs to the account, not only to the listing attached to the
  // checkout. Keep every active listing's public tier and approval benefits aligned.
  const { error: tierSyncError } = await supabase
    .from('listings')
    .update({ plan_tier: effectivePlanId })
    .eq('user_id', payment.user_id)
    .in('status', ['pending', 'approved'])
  if (tierSyncError) throw new Error(`Could not synchronize listing tiers: ${tierSyncError.message}`)

  const approvedFlags: Record<string, unknown> = {
    plan_tier: effectivePlanId,
    verified: limits.hasVerifiedBadge,
  }
  if (effectivePlanId === 'basic') {
    approvedFlags.featured = false
    approvedFlags.featured_until = null
  } else if (effectivePlanId === 'lifetime') {
    approvedFlags.featured = true
    approvedFlags.featured_until = periodEnd.toISOString()
  }

  const { error: approvalBenefitError } = await supabase
    .from('listings')
    .update(approvedFlags)
    .eq('user_id', payment.user_id)
    .eq('status', 'approved')
  if (approvalBenefitError) {
    throw new Error(`Could not synchronize approved listing benefits: ${approvalBenefitError.message}`)
  }

  let listingId = payment.listing_id
  let listingSlug: string | null = null

  if (!listingId && payment.metadata?.listing_data) {
    const rawListing = parseListingData(payment.metadata.listing_data)
    if (!rawListing) throw new Error('Paid listing data is missing')

    const missingFields = getMissingListingFields(rawListing)
    if (missingFields.length > 0) {
      throw new Error(`Paid listing is missing: ${missingFields.join(', ')}`)
    }

    const sanitized = sanitizeListingForPlan(effectivePlanId, rawListing)
    if (sanitized.errors.length > 0) throw new Error(sanitized.errors.join(' '))

    const { count, error: countError } = await supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', payment.user_id)
      .in('status', ['pending', 'approved'])

    if (countError) throw new Error(`Could not check listing allowance: ${countError.message}`)
    if (!canCreateAnotherListing(effectivePlanId, count || 0)) {
      throw new Error(`The ${effectivePlanId} listing allowance has already been used.`)
    }

    const listingData = sanitized.value
    const { data: newListing, error: listingError } = await supabase
      .from('listings')
      .insert({
        ...listingData,
        user_id: payment.user_id,
        business_name: String(listingData.business_name).trim(),
        slug: generateSlug(String(listingData.business_name)),
        status: 'pending',
        verified: false,
        featured: false,
        featured_until: null,
      })
      .select('id, slug')
      .single()

    if (listingError || !newListing) {
      throw new Error(listingError?.message || 'Could not create the paid listing')
    }

    listingId = newListing.id
    listingSlug = newListing.slug
    const { error: linkError } = await supabase
      .from('payments')
      .update({ listing_id: newListing.id })
      .eq('id', payment.id)
    if (linkError) throw new Error(`Could not link payment to listing: ${linkError.message}`)
  }

  if (listingId) {
    const { data: listing, error: listingSelectError } = await supabase
      .from('listings')
      .select('id, slug, status, user_id, description, images, website_url, website, opening_hours, business_hours, facebook_url, instagram_url, twitter_url, linkedin_url, year_established, established_year, employee_count, employee_count_range, keywords, featured, featured_until')
      .eq('id', listingId)
      .eq('user_id', payment.user_id)
      .single()

    if (listingSelectError || !listing) {
      throw new Error(listingSelectError?.message || 'Paid listing does not belong to this customer')
    }

    listingSlug = listing.slug
    const normalized = sanitizeListingForPlan(effectivePlanId, {
      description: listing.description,
      images: listing.images,
      website_url: listing.website_url,
      website: listing.website,
      opening_hours: listing.opening_hours,
      business_hours: listing.business_hours,
      facebook_url: listing.facebook_url,
      instagram_url: listing.instagram_url,
      twitter_url: listing.twitter_url,
      linkedin_url: listing.linkedin_url,
      year_established: listing.year_established,
      established_year: listing.established_year,
      employee_count: listing.employee_count,
      employee_count_range: listing.employee_count_range,
      keywords: listing.keywords,
    }).value
    const existingDescription = typeof listing.description === 'string' ? listing.description.trim() : ''
    const cappedDescription = limits.maxDescriptionLength === -1
      ? existingDescription
      : existingDescription.slice(0, limits.maxDescriptionLength)

    const planFlags: Record<string, unknown> = {
      description: cappedDescription,
      images: normalized.images,
      website_url: normalized.website_url,
      website: normalized.website,
      opening_hours: normalized.opening_hours,
      business_hours: normalized.business_hours,
      facebook_url: normalized.facebook_url,
      instagram_url: normalized.instagram_url,
      twitter_url: normalized.twitter_url,
      linkedin_url: normalized.linkedin_url,
      year_established: normalized.year_established,
      established_year: normalized.established_year,
      employee_count: normalized.employee_count,
      employee_count_range: normalized.employee_count_range,
      keywords: normalized.keywords,
      verified: listing.status === 'approved' && limits.hasVerifiedBadge,
    }
    const hasActiveFeaturedAddOn = Boolean(
      effectivePlanId === 'premium' &&
      listing.featured &&
      listing.featured_until &&
      new Date(listing.featured_until) > now
    )
    planFlags.featured = limits.hasFeaturedHomepage || hasActiveFeaturedAddOn
    planFlags.featured_until = limits.hasFeaturedHomepage
      ? periodEnd.toISOString()
      : (hasActiveFeaturedAddOn ? listing.featured_until : null)

    const { error: flagError } = await supabase
      .from('listings')
      .update(planFlags)
      .eq('id', listingId)
    if (flagError) throw new Error(`Could not apply listing entitlements: ${flagError.message}`)
  }

  return { paymentId: payment.id, listingId, listingSlug }
}
