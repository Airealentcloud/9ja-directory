'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { notifyCustomerListingApproved, notifyCustomerListingRejected } from '@/lib/email/notifications'

// Helper to check if user is admin
// Helper to check if user is admin
async function checkAdmin() {
    const supabase = await createClient()

    // Use the secure RPC function to check admin status
    // This avoids RLS recursion issues
    const { data: isAdmin, error } = await supabase.rpc('is_admin')

    if (error) {
        console.error('Error checking admin status:', error)
        throw new Error('Error checking admin status')
    }

    if (!isAdmin) {
        throw new Error('Unauthorized: Admin access required')
    }

    return supabase
}

// --- Review Actions ---

export async function approveReview(reviewId: string) {
    const supabase = await checkAdmin()

    const { error } = await supabase
        .from('reviews')
        .update({
            status: 'approved',
            moderated_at: new Date().toISOString(),
            moderated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', reviewId)

    if (error) throw error
    revalidatePath('/admin/reviews')
    revalidatePath('/listings') // Ideally revalidate specific listing but we might not have ID here easily
}

export async function rejectReview(reviewId: string) {
    const supabase = await checkAdmin()

    const { error } = await supabase
        .from('reviews')
        .update({
            status: 'rejected',
            moderated_at: new Date().toISOString(),
            moderated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', reviewId)

    if (error) throw error
    revalidatePath('/admin/reviews')
}

// --- Claim Actions ---

export async function approveClaim(claimId: string) {
    const supabase = await checkAdmin()

    // 1. Get the claim details
    const { data: claim, error: fetchError } = await supabase
        .from('claim_requests')
        .select('*')
        .eq('id', claimId)
        .single()

    if (fetchError || !claim) throw new Error('Claim not found')

    // 2. Update the listing to be claimed by this user
    const { error: listingError } = await supabase
        .from('listings')
        .update({
            claimed: true,
            claimed_by: claim.user_id,
            claimed_at: new Date().toISOString(),
            user_id: claim.user_id,
        })
        .eq('id', claim.listing_id)

    if (listingError) throw listingError

    // 3. Update claim status
    const { error: claimError } = await supabase
        .from('claim_requests')
        .update({
            status: 'approved',
            reviewed_at: new Date().toISOString(),
            reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', claimId)

    if (claimError) throw claimError

    revalidatePath('/admin/claims')
    revalidatePath('/listings')
}

export async function rejectClaim(claimId: string, reason?: string) {
    const supabase = await checkAdmin()

    const { error } = await supabase
        .from('claim_requests')
        .update({
            status: 'rejected',
            rejection_reason: reason,
            reviewed_at: new Date().toISOString(),
            reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', claimId)

    if (error) throw error
    revalidatePath('/admin/claims')
}

// --- Listing Actions ---

export async function getAdminListings(status: 'all' | 'pending' | 'approved' | 'rejected' = 'all') {
    const supabase = await checkAdmin()

    let query = supabase
        .from('listings')
        .select(`
            *,
            categories (name),
            profiles (full_name, email),
            payments (status, reference, created_at, paid_at)
        `)
        .order('created_at', { ascending: false })

    if (status !== 'all') {
        query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching admin listings:', error)
        throw error
    }

    const normalized = (data || []).map((listing: any) => {
        const payments = Array.isArray(listing.payments) ? listing.payments : []
        const latestPayment = payments.reduce((latest: any, current: any) => {
            if (!latest) return current
            const latestTime = new Date(latest.created_at || 0).getTime()
            const currentTime = new Date(current.created_at || 0).getTime()
            return currentTime > latestTime ? current : latest
        }, null as any)

        return {
            ...listing,
            payment_status: latestPayment?.status ?? 'none',
            payment_reference: latestPayment?.reference ?? null,
            payment_created_at: latestPayment?.created_at ?? null,
            payment_paid_at: latestPayment?.paid_at ?? null,
        }
    })

    console.log(`Admin listings fetch result: Found ${normalized.length} listings`)
    return normalized
}

export async function approveListingServer(id: string) {
    const supabase = await checkAdmin()

    // Get listing with owner details before approving
    const { data: listing } = await supabase
        .from('listings')
        .select(`
            id, business_name, slug,
            profiles!listings_user_id_fkey(email, full_name)
        `)
        .eq('id', id)
        .single()

    const { data: latestPayment } = await supabase
        .from('payments')
        .select('status, reference, created_at')
        .eq('listing_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (!latestPayment || latestPayment.status !== 'success') {
        return { error: { message: 'Payment not completed for this listing.' } }
    }

    const { data, error } = await supabase
        .from('listings')
        .update({
            status: 'approved',
            rejection_reason: null
        })
        .eq('id', id)
        .select()

    if (error) return { error }

    // Send notification to customer
    if (listing) {
        const profile = listing.profiles as any
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://9jadirectory.org'

        notifyCustomerListingApproved({
            businessName: listing.business_name,
            ownerEmail: profile?.email,
            ownerName: profile?.full_name,
            listingUrl: `${siteUrl}/listings/${listing.slug}`
        }).catch(console.error)
    }

    revalidatePath('/admin/listings')
    return { data }
}

export async function rejectListingServer(id: string, reason: string) {
    const supabase = await checkAdmin()

    // Get listing with owner details before rejecting
    const { data: listing } = await supabase
        .from('listings')
        .select(`
            id, business_name,
            profiles!listings_user_id_fkey(email, full_name)
        `)
        .eq('id', id)
        .single()

    const { data, error } = await supabase
        .from('listings')
        .update({
            status: 'rejected',
            rejection_reason: reason
        })
        .eq('id', id)
        .select()

    if (error) return { error }

    // Send notification to customer
    if (listing) {
        const profile = listing.profiles as any

        notifyCustomerListingRejected({
            businessName: listing.business_name,
            ownerEmail: profile?.email,
            ownerName: profile?.full_name,
            rejectionReason: reason
        }).catch(console.error)
    }

    revalidatePath('/admin/listings')
    return { data }
}
