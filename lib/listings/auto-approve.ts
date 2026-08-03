import { createAdminClient } from '@/lib/supabase/admin'
import {
  getApprovedListingPlanFlags,
  getMissingListingFields,
  isPaidPlanId,
  PAID_PLAN_IDS,
  type AccountPlanId,
} from '@/lib/entitlements'
import { queueListingApprovedEmail } from '@/lib/email/transactional'

type AutoApprovalResult = {
  approved: boolean
  listingSlug: string | null
}

/**
 * Publishes a complete listing only when its owner has a successful payment for
 * the active account plan. Listing form validation happens before this helper is
 * called, and the service-role update is deliberately kept on the server.
 */
export async function autoApproveVerifiedPaidListing(input: {
  listingId: string
  userId: string
  planId: AccountPlanId
  paymentReference?: string
}): Promise<AutoApprovalResult> {
  if (!isPaidPlanId(input.planId)) {
    return { approved: false, listingSlug: null }
  }

  const supabase = createAdminClient()
  let paymentQuery = supabase
    .from('payments')
    .select('id, listing_id')
    .eq('user_id', input.userId)
    .eq('status', 'success')
    .order('paid_at', { ascending: false })
    .limit(1)

  paymentQuery = input.paymentReference
    ? paymentQuery.eq('reference', input.paymentReference)
    : paymentQuery.in('plan', [...PAID_PLAN_IDS])

  const { data: successfulPayment, error: paymentError } = await paymentQuery.maybeSingle()

  if (paymentError) {
    throw new Error(`Could not confirm the successful payment: ${paymentError.message}`)
  }
  if (!successfulPayment) {
    return { approved: false, listingSlug: null }
  }

  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('id, user_id, business_name, slug, status, plan_tier, featured, featured_until, description, category_id, phone, state_id, city')
    .eq('id', input.listingId)
    .eq('user_id', input.userId)
    .single()

  if (listingError || !listing) {
    throw new Error(listingError?.message || 'The completed listing could not be loaded.')
  }

  // A payment alone is never enough to publish a partial or placeholder row.
  if (getMissingListingFields(listing).length > 0) {
    return { approved: false, listingSlug: listing.slug }
  }

  if (listing.status !== 'approved') {
    const flags = getApprovedListingPlanFlags(input.planId, {
      status: 'approved',
      planTier: listing.plan_tier,
      featured: listing.featured,
      featuredUntil: listing.featured_until,
    })

    const { error: approvalError } = await supabase
      .from('listings')
      .update({
        status: 'approved',
        rejection_reason: null,
        ...flags,
      })
      .eq('id', listing.id)
      .eq('user_id', input.userId)

    if (approvalError) {
      throw new Error(`Could not publish the paid listing: ${approvalError.message}`)
    }
  }

  // Older checkout records may have activated the account before a listing was
  // submitted. Attach one such record for a complete audit trail.
  if (!successfulPayment.listing_id) {
    const { error: paymentLinkError } = await supabase
      .from('payments')
      .update({ listing_id: listing.id })
      .eq('id', successfulPayment.id)
      .is('listing_id', null)

    if (paymentLinkError) {
      console.error('Paid listing was published, but its payment link could not be updated:', paymentLinkError)
    }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', input.userId)
    .maybeSingle()

  if (profileError) {
    console.error('Could not load the paid customer profile for approval email:', profileError)
  }

  let customerEmail = profile?.email?.trim() || ''
  let customerName = profile?.full_name || null
  if (!customerEmail) {
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(input.userId)
    if (authError) {
      console.error('Could not load the paid customer email for approval email:', authError)
    } else {
      customerEmail = authUser.user?.email?.trim() || ''
      customerName = customerName ||
        (typeof authUser.user?.user_metadata?.full_name === 'string'
          ? authUser.user.user_metadata.full_name
          : null)
    }
  }

  if (customerEmail) {
    try {
      await queueListingApprovedEmail({
        listingId: listing.id,
        userId: input.userId,
        email: customerEmail,
        fullName: customerName,
        businessName: listing.business_name,
        listingSlug: listing.slug,
        planId: input.planId,
      })
    } catch (notificationError) {
      console.error('Paid listing was published, but its approval email could not be queued:', notificationError)
    }
  }

  return { approved: true, listingSlug: listing.slug }
}
