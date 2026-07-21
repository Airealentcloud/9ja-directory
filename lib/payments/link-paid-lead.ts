import { createAdminClient } from '@/lib/supabase/admin'
import { getPlanById, nairaToKobo } from '@/lib/pricing'
import {
    PLAN_LIMITS,
    isPaidPlanId,
    resolveAccountPlan,
    type AccountPlanId,
} from '@/lib/entitlements'
import { fulfillPaystackSuccess } from '@/lib/payments/fulfill'

function normalizeEmail(value: unknown) {
    return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function normalizeBusinessName(value: unknown) {
    return typeof value === 'string'
        ? value.trim().toLowerCase().replace(/\s+/g, ' ')
        : ''
}

function buildSlug(name: string) {
    const stem = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
        .slice(0, 70) || 'business-listing'
    return `${stem}-${Math.random().toString(36).substring(2, 7)}`
}

function planCapacity(planId: AccountPlanId) {
    return PLAN_LIMITS[planId].maxListings
}

export async function linkSuccessfulLeadToUser(input: {
    reference: string
    userId: string
    userEmail: string
    fullName?: string | null
}) {
    const supabase = createAdminClient()
    const email = normalizeEmail(input.userEmail)
    if (!email) throw new Error('The signed-in account does not have an email address.')

    const { data: lead, error: leadError } = await supabase
        .from('payment_leads')
        .select('id, user_id, listing_id, email, phone, business_name, plan, amount, currency, paid_at, status')
        .eq('reference', input.reference)
        .maybeSingle()

    if (leadError || !lead) throw new Error(leadError?.message || 'Paid lead not found.')
    if (lead.status !== 'success') throw new Error('Payment is not confirmed yet.')
    if (normalizeEmail(lead.email) !== email) {
        throw new Error('Sign in with the same email address used for payment.')
    }
    if (!isPaidPlanId(lead.plan)) throw new Error('The paid lead has an invalid plan.')

    const purchasedPlan = getPlanById(lead.plan)
    const officialAmount = purchasedPlan ? nairaToKobo(purchasedPlan.price) : null
    if (!purchasedPlan || officialAmount === null || lead.amount !== officialAmount || lead.currency !== 'NGN') {
        throw new Error('The paid amount does not match the selected plan.')
    }
    if (lead.user_id && lead.user_id !== input.userId) {
        throw new Error('This payment is already linked to another account.')
    }

    const { data: existingProfile, error: profileLookupError } = await supabase
        .from('profiles')
        .select('id, email, full_name, phone_number')
        .eq('id', input.userId)
        .maybeSingle()

    if (profileLookupError) throw new Error(profileLookupError.message)

    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: input.userId,
            email: existingProfile?.email || email,
            full_name: existingProfile?.full_name || input.fullName || lead.business_name || null,
            phone_number: existingProfile?.phone_number || lead.phone || null,
        }, { onConflict: 'id' })

    if (profileError) throw new Error(`Could not prepare the customer profile: ${profileError.message}`)

    // Create or validate the immutable payment record before granting the plan. The
    // listing is linked afterwards so the database can enforce its newly active quota.
    const { data: existingPayment, error: paymentLookupError } = await supabase
        .from('payments')
        .select('id, user_id, listing_id, plan, amount, currency')
        .eq('reference', input.reference)
        .maybeSingle()

    if (paymentLookupError) throw new Error(paymentLookupError.message)
    if (existingPayment?.user_id && existingPayment.user_id !== input.userId) {
        throw new Error('This payment is already linked to another account.')
    }
    if (existingPayment?.id && (
        existingPayment.plan !== lead.plan ||
        existingPayment.amount !== lead.amount ||
        existingPayment.currency !== lead.currency
    )) {
        throw new Error('The linked payment record does not match the verified paid lead.')
    }

    if (!existingPayment?.id) {
        const { error: paymentInsertError } = await supabase.from('payments').insert({
            user_id: input.userId,
            listing_id: null,
            provider: 'paystack',
            reference: input.reference,
            plan: lead.plan,
            amount: lead.amount,
            currency: lead.currency,
            status: 'pending',
            paid_at: lead.paid_at,
            metadata: {
                plan_id: lead.plan,
                lead_reference: input.reference,
                source: 'verified_public_checkout',
            },
        })
        if (paymentInsertError) throw new Error(paymentInsertError.message)
    }

    const fulfillment = await fulfillPaystackSuccess({
        reference: input.reference,
        amountKobo: lead.amount,
        currency: lead.currency,
        paidAt: lead.paid_at ?? null,
    })

    const { data: activeProfile, error: activeProfileError } = await supabase
        .from('profiles')
        .select('role, subscription_plan, subscription_status, subscription_expires_at')
        .eq('id', input.userId)
        .single()
    if (activeProfileError || !activeProfile) {
        throw new Error(activeProfileError?.message || 'The paid account plan could not be loaded.')
    }

    const activePlan = resolveAccountPlan({
        role: activeProfile.role,
        subscriptionPlan: activeProfile.subscription_plan,
        subscriptionStatus: activeProfile.subscription_status,
        subscriptionExpiresAt: activeProfile.subscription_expires_at,
    })
    if (activePlan === 'free') throw new Error('The paid plan was not activated.')

    const { data: userListings, error: listingLookupError } = await supabase
        .from('listings')
        .select('id, business_name, slug, status')
        .eq('user_id', input.userId)
        .order('created_at', { ascending: false })
    if (listingLookupError) throw new Error(listingLookupError.message)

    const activeListings = (userListings || []).filter(listing =>
        listing.status === 'pending' || listing.status === 'approved'
    )
    const linkedListingId = fulfillment.listingId || existingPayment?.listing_id || lead.listing_id
    let listing = linkedListingId
        ? (userListings || []).find(item => item.id === linkedListingId)
        : undefined

    if (!listing) {
        const paidBusinessName = normalizeBusinessName(lead.business_name)
        listing = activeListings.find(item =>
            normalizeBusinessName(item.business_name) === paidBusinessName
        )
    }

    if (!listing) {
        const capacity = planCapacity(activePlan)
        if (capacity !== -1 && activeListings.length >= capacity) {
            throw new Error(
                `Your ${activePlan} plan listing allowance is already full. Contact support to assign this payment.`
            )
        }

        const listingName = lead.business_name?.trim() || input.fullName?.trim() || 'Business Listing'
        const { data: createdListing, error: listingError } = await supabase
            .from('listings')
            .insert({
                user_id: input.userId,
                business_name: listingName,
                slug: buildSlug(listingName),
                phone: lead.phone || null,
                email,
                status: 'pending',
                verified: false,
                featured: false,
                featured_until: null,
            })
            .select('id, business_name, slug, status')
            .single()

        if (listingError || !createdListing) {
            throw new Error(listingError?.message || 'Could not create the paid listing.')
        }
        listing = createdListing
    }

    const { error: paymentLinkError } = await supabase
        .from('payments')
        .update({ user_id: input.userId, listing_id: listing.id })
        .eq('reference', input.reference)
    if (paymentLinkError) throw new Error(`Could not link the payment to the listing: ${paymentLinkError.message}`)

    const { error: leadLinkError } = await supabase
        .from('payment_leads')
        .update({ user_id: input.userId, listing_id: listing.id })
        .eq('id', lead.id)
    if (leadLinkError) throw new Error(`Plan activated, but lead linking failed: ${leadLinkError.message}`)

    return {
        listingId: listing.id,
        listingSlug: listing.slug,
        planId: lead.plan,
    }
}
