'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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
        .select('can_claim_listings')
        .eq('id', user.id)
        .maybeSingle()

    if (!profile?.can_claim_listings) {
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

    // Check if already claimed or pending
    const { data: existing } = await supabase
        .from('claim_requests')
        .select('status')
        .eq('listing_id', listingId)
        .eq('user_id', user.id)
        .single()

    if (existing) {
        if (existing.status === 'pending') {
            throw new Error('You already have a pending claim for this business')
        }
        if (existing.status === 'approved') {
            throw new Error('You have already claimed this business')
        }
    }

    // Insert claim request
    const { error } = await supabase
        .from('claim_requests')
        .insert({
            listing_id: listingId,
            user_id: user.id,
            notes,
            proof_document: proofDocument,
            status: 'pending'
        })

    if (error) {
        console.error('Error submitting claim:', error)
        throw new Error('Failed to submit claim request')
    }

    revalidatePath(`/listings`)
    return { success: true }
}
