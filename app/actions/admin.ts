'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { notifyCustomerListingApproved, notifyCustomerListingRejected, notifyCustomerClaimApproved, notifyCustomerClaimRejected } from '@/lib/email/notifications'
import { SITE_URL } from '@/lib/seo/site-url'

// Helper to check if user is admin
async function checkAdmin() {
    const supabase = await createClient()

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
        console.error('Error loading user for admin check:', userError)
        throw new Error('Unauthorized: Admin access required')
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profileError) {
        console.error('Error checking admin status:', profileError)
        throw new Error('Error checking admin status')
    }

    if (profile?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required')
    }

    return supabase
}

function buildSlug(name: string) {
    const base = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
        .slice(0, 70)

    return `${base || 'business-listing'}-${Math.random().toString(36).slice(2, 7)}`
}

function shouldUseLegalCategory(input: string) {
    const value = input.toLowerCase()
    return ['law', 'legal', 'lawfirm', 'law firm', 'solicitor', 'attorney', 'barrister'].some((term) =>
        value.includes(term)
    )
}

export async function createListingFromPaymentLeadServer(formData: FormData) {
    const supabase = await checkAdmin()

    const {
        data: { user: adminUser },
    } = await supabase.auth.getUser()

    const leadId = String(formData.get('lead_id') || '').trim()
    if (!leadId) {
        return { error: { message: 'Payment lead ID is required.' } }
    }

    const { data: lead, error: leadError } = await supabase
        .from('payment_leads')
        .select('id, user_id, listing_id, email, phone, business_name, plan, amount, currency, reference, status, paid_at')
        .eq('id', leadId)
        .maybeSingle()

    if (leadError || !lead) {
        return { error: { message: leadError?.message || 'Payment lead not found.' } }
    }

    if (lead.listing_id) {
        return { data: { listing_id: lead.listing_id, message: 'This payment lead already has a listing.' } }
    }

    if (lead.status !== 'success') {
        return { error: { message: 'Only successful paid leads can be converted to listings.' } }
    }

    const email = String(lead.email || '').trim().toLowerCase()
    if (!email) {
        return { error: { message: 'The paid lead has no email address.' } }
    }

    const businessName = String(lead.business_name || '').trim() || email.split('@')[0] || 'Business Listing'
    const phone = String(lead.phone || '').trim() || null
    const userId = lead.user_id || adminUser?.id
    if (!userId) {
        return { error: { message: 'Could not identify an account to attach this listing to.' } }
    }

    let categoryId: string | null = null
    if (shouldUseLegalCategory(`${businessName} ${email}`)) {
        const { data: legalCategory } = await supabase
            .from('categories')
            .select('id')
            .or('name.ilike.%legal%,slug.ilike.%legal%,name.ilike.%law%,slug.ilike.%law%')
            .limit(1)
            .maybeSingle()

        categoryId = legalCategory?.id || null
    }

    const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
            user_id: userId,
            business_name: businessName,
            slug: buildSlug(businessName),
            description: 'Premium paid listing created from payment verification. Please review and complete the business details before approval.',
            phone,
            email,
            category_id: categoryId,
            status: 'pending',
        })
        .select('id')
        .single()

    if (listingError || !listing) {
        return { error: { message: listingError?.message || 'Could not create pending listing.' } }
    }

    const { data: existingPayment } = await supabase
        .from('payments')
        .select('id')
        .eq('reference', lead.reference)
        .maybeSingle()

    if (existingPayment?.id) {
        const { error: paymentUpdateError } = await supabase
            .from('payments')
            .update({
                user_id: userId,
                listing_id: listing.id,
                plan: lead.plan,
                amount: lead.amount,
                currency: lead.currency,
                status: 'success',
                paid_at: lead.paid_at || new Date().toISOString(),
            })
            .eq('id', existingPayment.id)

        if (paymentUpdateError) {
            return { error: { message: paymentUpdateError.message } }
        }
    } else {
        const { error: paymentInsertError } = await supabase.from('payments').insert({
            user_id: userId,
            listing_id: listing.id,
            provider: 'paystack',
            reference: lead.reference,
            plan: lead.plan,
            amount: lead.amount,
            currency: lead.currency,
            status: 'success',
            paid_at: lead.paid_at || new Date().toISOString(),
            metadata: {
                source: 'admin_paid_lead_conversion',
                payment_lead_id: lead.id,
                customer_email: email,
            },
        })

        if (paymentInsertError) {
            return { error: { message: paymentInsertError.message } }
        }
    }

    const { error: leadUpdateError } = await supabase
        .from('payment_leads')
        .update({
            user_id: userId,
            listing_id: listing.id,
        })
        .eq('id', lead.id)

    if (leadUpdateError) {
        return { error: { message: leadUpdateError.message } }
    }

    revalidatePath('/admin/payment-leads')
    revalidatePath('/admin/listings')
    revalidatePath('/admin/dashboard')

    return { data: { listing_id: listing.id } }
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

    // Send email notification to the claimer
    const { data: listing } = await supabase
        .from('listings')
        .select('business_name, slug')
        .eq('id', claim.listing_id)
        .maybeSingle()

    const { data: claimProfile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', claim.user_id)
        .maybeSingle()

    if (listing && claimProfile?.email) {
        notifyCustomerClaimApproved({
            businessName: listing.business_name,
            ownerEmail: claimProfile.email,
            ownerName: claimProfile.full_name,
            listingUrl: `${SITE_URL}/listings/${listing.slug}`,
        }).catch(console.error)
    }

    revalidatePath('/admin/claims')
    revalidatePath('/listings')
}

export async function rejectClaim(claimId: string, reason?: string) {
    const supabase = await checkAdmin()

    // Get claim details for notification
    const { data: claim } = await supabase
        .from('claim_requests')
        .select('listing_id, user_id')
        .eq('id', claimId)
        .maybeSingle()

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

    // Send email notification to the claimer
    if (claim) {
        const { data: listing } = await supabase
            .from('listings')
            .select('business_name')
            .eq('id', claim.listing_id)
            .maybeSingle()

        const { data: claimProfile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', claim.user_id)
            .maybeSingle()

        if (listing && claimProfile?.email) {
            notifyCustomerClaimRejected({
                businessName: listing.business_name,
                ownerEmail: claimProfile.email,
                ownerName: claimProfile.full_name,
                rejectionReason: reason || 'Insufficient proof of ownership',
            }).catch(console.error)
        }
    }

    revalidatePath('/admin/claims')
}

// --- Listing Actions ---

export async function getAdminListings(status: 'all' | 'pending' | 'approved' | 'rejected' = 'all') {
    const supabase = await checkAdmin()

    let query = supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })

    if (status !== 'all') {
        query = query.eq('status', status)
    }

    const { data: listingsData, error } = await query

    if (error) {
        console.error('Error fetching admin listings:', error)
        throw error
    }

    const listings = listingsData || []

    const categoryIds = Array.from(
        new Set(listings.map((listing: any) => listing.category_id).filter(Boolean))
    )
    const userIds = Array.from(
        new Set(listings.map((listing: any) => listing.user_id).filter(Boolean))
    )
    const listingIds = Array.from(
        new Set(listings.map((listing: any) => listing.id).filter(Boolean))
    )

    let categoriesMap: Record<string, { name: string }> = {}
    if (categoryIds.length > 0) {
        const { data: categoriesData, error: categoriesError } = await supabase
            .from('categories')
            .select('id, name')
            .in('id', categoryIds)

        if (categoriesError) {
            console.warn('Error fetching categories for admin listings:', categoriesError)
        } else {
            categoriesMap = (categoriesData || []).reduce((acc, category: any) => {
                acc[category.id] = { name: category.name }
                return acc
            }, {} as Record<string, { name: string }>)
        }
    }

    let profilesMap: Record<string, { email?: string; full_name?: string }> = {}
    if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', userIds)

        if (profilesError) {
            console.warn('Error fetching profiles for admin listings:', profilesError)
        } else {
            profilesMap = (profilesData || []).reduce((acc, profile: any) => {
                acc[profile.id] = { email: profile.email, full_name: profile.full_name }
                return acc
            }, {} as Record<string, { email?: string; full_name?: string }>)
        }
    }

    let paymentsMap: Record<string, any> = {}
    if (listingIds.length > 0) {
        const { data: paymentsData, error: paymentsError } = await supabase
            .from('payments')
            .select('listing_id, status, reference, created_at, paid_at')
            .in('listing_id', listingIds)

        if (paymentsError) {
            console.warn('Error fetching payments for admin listings:', paymentsError)
        } else {
            (paymentsData || []).forEach((payment: any) => {
                if (!payment.listing_id) return
                const existing = paymentsMap[payment.listing_id]
                if (!existing) {
                    paymentsMap[payment.listing_id] = payment
                    return
                }
                const existingTime = new Date(existing.created_at || 0).getTime()
                const nextTime = new Date(payment.created_at || 0).getTime()
                if (nextTime > existingTime) {
                    paymentsMap[payment.listing_id] = payment
                }
            })
        }
    }

    const normalized = listings.map((listing: any) => {
        const payment = listing.id ? paymentsMap[listing.id] : null
        const category = listing.category_id ? categoriesMap[listing.category_id] : null
        const profile = listing.user_id ? profilesMap[listing.user_id] : null

        return {
            ...listing,
            categories: category || undefined,
            profiles: profile || undefined,
            payment_status: payment?.status ?? 'none',
            payment_reference: payment?.reference ?? null,
            payment_created_at: payment?.created_at ?? null,
            payment_paid_at: payment?.paid_at ?? null,
        }
    })

    console.log(`Admin listings fetch result: Found ${normalized.length} listings`)
    return normalized
}

export async function approveListingServer(id: string) {
    const supabase = await checkAdmin()

    // Get listing with owner details before approving
    const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select('id, business_name, slug, user_id')
        .eq('id', id)
        .single()

    if (listingError) {
        return { error: listingError }
    }

    let profile: { email?: string; full_name?: string } | null = null
    if (listing?.user_id) {
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', listing.user_id)
            .maybeSingle()

        if (profileError) {
            console.warn('Error fetching listing owner profile:', profileError)
        } else {
            profile = profileData
        }
    }

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
    if (listing && profile?.email) {
        notifyCustomerListingApproved({
            businessName: listing.business_name,
            ownerEmail: profile.email,
            ownerName: profile.full_name,
            listingUrl: `${SITE_URL}/listings/${listing.slug}`
        }).catch(console.error)
    }

    revalidatePath('/admin/listings')
    return { data }
}

export async function rejectListingServer(id: string, reason: string) {
    const supabase = await checkAdmin()

    // Get listing with owner details before rejecting
    const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select('id, business_name, user_id')
        .eq('id', id)
        .single()

    if (listingError) {
        return { error: listingError }
    }

    let profile: { email?: string; full_name?: string } | null = null
    if (listing?.user_id) {
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', listing.user_id)
            .maybeSingle()

        if (profileError) {
            console.warn('Error fetching listing owner profile:', profileError)
        } else {
            profile = profileData
        }
    }

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
    if (listing && profile?.email) {
        notifyCustomerListingRejected({
            businessName: listing.business_name,
            ownerEmail: profile.email,
            ownerName: profile.full_name,
            rejectionReason: reason
        }).catch(console.error)
    }

    revalidatePath('/admin/listings')
    return { data }
}
