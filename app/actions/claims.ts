'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
    canCreateAnotherListing,
    getAccountPlanLimits,
    listingLimitMessage,
    resolveAccountPlan,
} from '@/lib/entitlements'

export async function submitClaim(formData: FormData) {
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('You must be logged in to claim a business')
    }

    // Check claim permission (Premium/Lifetime only)
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, subscription_plan, subscription_status, subscription_expires_at')
        .eq('id', user.id)
        .maybeSingle()

    const accountPlan = resolveAccountPlan({
        role: profile?.role,
        subscriptionPlan: profile?.subscription_plan,
        subscriptionStatus: profile?.subscription_status,
        subscriptionExpiresAt: profile?.subscription_expires_at,
    })

    if (!getAccountPlanLimits(accountPlan).canClaimListings) {
        throw new Error('Claiming is available on Premium and Lifetime plans. Please upgrade at /pricing to claim this listing.')
    }

    const slug = formData.get('slug') as string | null
    let listingId = formData.get('listing_id') as string | null
    const notes = formData.get('notes') as string
    const proofDocument = formData.get('proof_document') as string // In a real app, this would be a file upload handling

    if (!listingId) {
        if (!slug) {
            throw new Error('Listing is required')
        }

        const { data: listing, error: listingError } = await supabase
            .from('listings')
            .select('id')
            .eq('slug', slug)
            .eq('status', 'approved')
            .single()

        if (listingError || !listing?.id) {
            console.error('Error finding listing for claim:', listingError)
            throw new Error('Listing not found')
        }

        listingId = listing.id
    }

    const { data: targetListing, error: targetListingError } = await supabase
        .from('listings')
        .select('id, status, user_id, claimed')
        .eq('id', listingId)
        .maybeSingle()

    if (targetListingError || !targetListing || targetListing.status !== 'approved') {
        throw new Error('Only an approved business listing can be claimed.')
    }
    if (targetListing.user_id === user.id) {
        throw new Error('This listing is already attached to your account.')
    }
    if (targetListing.claimed) {
        throw new Error('This business has already been claimed. Contact support if the ownership is incorrect.')
    }

    const { count: activeListingCount, error: countError } = await supabase
        .from('listings')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('status', ['pending', 'approved'])

    if (countError) throw new Error('Your listing allowance could not be checked. Please try again.')
    if (!canCreateAnotherListing(accountPlan, activeListingCount || 0)) {
        throw new Error(listingLimitMessage(accountPlan))
    }

    if (!proofDocument?.trim()) {
        throw new Error('Proof of ownership is required before a claim can be reviewed.')
    }

    // Check if already claimed or pending
    const { data: existing } = await supabase
        .from('claim_requests')
        .select('id, status')
        .eq('listing_id', listingId)
        .eq('user_id', user.id)
        .maybeSingle()

    if (existing) {
        if (existing.status === 'pending') {
            throw new Error('You already have a pending claim for this business')
        }
        if (existing.status === 'approved') {
            throw new Error('You have already claimed this business')
        }
    }

    const claimPayload = {
        notes,
        proof_document: proofDocument.trim(),
        status: 'pending',
        reviewed_by: null,
        reviewed_at: null,
        rejection_reason: null,
        updated_at: new Date().toISOString(),
    }
    const claimMutation = existing?.status === 'rejected'
        ? supabase.from('claim_requests').update(claimPayload).eq('id', existing.id)
        : supabase.from('claim_requests').insert({
            listing_id: listingId,
            user_id: user.id,
            ...claimPayload,
        })
    const { error } = await claimMutation

    if (error) {
        console.error('Error submitting claim:', error)
        throw new Error('Failed to submit claim request')
    }

    revalidatePath(`/listings`)
    return { success: true }
}
