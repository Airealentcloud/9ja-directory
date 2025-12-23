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
    .select('id, reference, user_id, listing_id, plan, amount, currency, status, paid_at')
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

  return { paymentId: payment.id, listingId: payment.listing_id, listingSlug }
}
