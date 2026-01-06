import { createAdminClient } from '@/lib/supabase/admin'
import { getPaymentPlan } from '@/lib/payments/plans'
import { getPlanById as getSubscriptionPlanById, type PlanId } from '@/lib/pricing'

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
    listing_data?: string
    [key: string]: unknown
  } | null
}

type ListingData = {
  business_name: string
  category_id: string
  description: string
  phone: string
  email?: string
  website_url?: string
  whatsapp_number?: string
  address?: string
  state_id: string
  city: string
}

function generateSlug(businessName: string): string {
  return businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 7)
}

function getMissingColumnName(message?: string | null) {
  if (!message) return null
  const schemaCacheMatch = message.match(/Could not find the '([^']+)' column/i)
  if (schemaCacheMatch?.[1]) return schemaCacheMatch[1]

  const relationMatch = message.match(/column \"([^\"]+)\" of relation/i)
  if (relationMatch?.[1]) return relationMatch[1]

  return null
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

  if (payment.amount !== input.amountKobo || payment.currency !== input.currency) {
    throw new Error('Payment amount/currency mismatch')
  }

  if (payment.status !== 'success') {
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'success',
        paid_at: input.paidAt ?? new Date().toISOString(),
      })
      .eq('id', payment.id)

    if (updateError) throw updateError
  }

  let listingSlug: string | null = null

  const plan = getPaymentPlan(payment.plan)
  if (plan?.featuredDays && payment.listing_id) {
    const featuredUntil = new Date(Date.now() + plan.featuredDays * 24 * 60 * 60 * 1000).toISOString()
    let updatePayload: Record<string, unknown> = { featured: true, featured_until: featuredUntil }

    const attemptUpdate = async () =>
      supabase.from('listings').update(updatePayload).eq('id', payment.listing_id as string)

    let { error: listingError } = await attemptUpdate()
    if (listingError) {
      const missingColumn = getMissingColumnName((listingError as { message?: string }).message)
      if (missingColumn === 'featured_until') {
        updatePayload = { featured: true }
        ;({ error: listingError } = await attemptUpdate())
      }
      if (listingError) throw listingError
    }

    const { data: listingData } = await supabase
      .from('listings')
      .select('slug')
      .eq('id', payment.listing_id)
      .maybeSingle()

    listingSlug = (listingData as { slug?: string } | null)?.slug ?? null
  }

  try {
    const subscriptionPlan = getSubscriptionPlanById(payment.plan as PlanId)
    if (subscriptionPlan) {
      const now = new Date()
      const periodEnd = new Date(now)

      if (subscriptionPlan.interval === 'monthly') {
        periodEnd.setMonth(periodEnd.getMonth() + 1)
      } else {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1)
      }

      const { data: existingSub, error: subSelectError } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', payment.user_id)
        .maybeSingle()

      if (subSelectError) {
        console.error('Subscription select error:', subSelectError)
      } else if (existingSub?.id) {
        const { error: subUpdateError } = await supabase
          .from('subscriptions')
          .update({
            plan: subscriptionPlan.id,
            status: 'active',
            amount: payment.amount,
            currency: payment.currency,
            interval: subscriptionPlan.interval,
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
          })
          .eq('id', existingSub.id)

        if (subUpdateError) console.error('Subscription update error:', subUpdateError)
      } else {
        const { error: subInsertError } = await supabase.from('subscriptions').insert({
          user_id: payment.user_id,
          plan: subscriptionPlan.id,
          status: 'active',
          amount: payment.amount,
          currency: payment.currency,
          interval: subscriptionPlan.interval,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
        })

        if (subInsertError) console.error('Subscription insert error:', subInsertError)
      }

      const profileUpdate: Record<string, unknown> = {
        subscription_plan: subscriptionPlan.id,
        subscription_status: 'active',
        subscription_expires_at: periodEnd.toISOString(),
        can_add_listings: true,
        can_claim_listings: subscriptionPlan.id === 'standard' || subscriptionPlan.id === 'premium',
        can_feature_listings: subscriptionPlan.id === 'premium',
        featured_posts_remaining: subscriptionPlan.id === 'premium' ? 2 : 0,
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', payment.user_id)

      if (profileError) console.error('Profile subscription update error:', profileError)

      if (payment.listing_id && subscriptionPlan.id === 'premium') {
        const featuredUntil = periodEnd.toISOString()
        let updatePayload: Record<string, unknown> = { featured: true, featured_until: featuredUntil }

        const attemptUpdate = async () =>
          supabase.from('listings').update(updatePayload).eq('id', payment.listing_id as string)

        let { error: listingError } = await attemptUpdate()
        if (listingError) {
          const missingColumn = getMissingColumnName((listingError as { message?: string }).message)
          if (missingColumn === 'featured_until') {
            updatePayload = { featured: true }
            ;({ error: listingError } = await attemptUpdate())
          }
          if (listingError) console.error('Premium listing feature update error:', listingError)
        }
      }
    }
  } catch (err) {
    console.error('Subscription fulfillment error:', err)
  }

  // Create listing from metadata if present (new checkout flow)
  let createdListingId: string | null = null
  if (payment.metadata?.listing_data && !payment.listing_id) {
    try {
      const listingData: ListingData = JSON.parse(payment.metadata.listing_data as string)

      if (listingData.business_name) {
        const slug = generateSlug(listingData.business_name)

        const { data: newListing, error: listingError } = await supabase
          .from('listings')
          .insert({
            user_id: payment.user_id,
            business_name: listingData.business_name,
            slug,
            description: listingData.description,
            category_id: listingData.category_id,
            phone: listingData.phone,
            email: listingData.email || '',
            website_url: listingData.website_url || '',
            whatsapp_number: listingData.whatsapp_number || '',
            address: listingData.address || '',
            state_id: listingData.state_id,
            city: listingData.city,
            status: 'pending', // Requires admin approval
          })
          .select('id, slug')
          .single()

        if (listingError) {
          console.error('Error creating listing from payment:', listingError)
        } else if (newListing) {
          createdListingId = newListing.id
          listingSlug = newListing.slug

          // Update payment record with the new listing_id
          await supabase
            .from('payments')
            .update({ listing_id: newListing.id })
            .eq('id', payment.id)

          console.log('Listing created from payment:', newListing.id)
        }
      }
    } catch (parseErr) {
      console.error('Error parsing listing data from payment metadata:', parseErr)
    }
  }

  return {
    paymentId: payment.id,
    listingId: createdListingId || payment.listing_id,
    listingSlug
  }
}
