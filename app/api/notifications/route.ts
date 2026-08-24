import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
    notifyAdminNewSignup,
    notifyAdminNewListing,
    notifyCustomerListingApproved,
    notifyCustomerListingRejected,
    notifyAdminContactForm
} from '@/lib/email/notifications'
import { SITE_URL } from '@/lib/seo/site-url'

// Use service role key for admin operations
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) return null
    return createClient(url, key)
}

// This endpoint stays open because the signup page and contact form call it
// before a session exists. Keep the surface as small as possible: only these
// types are accepted, and anything else is rejected before reaching the mailer.
const ALLOWED_TYPES = new Set([
    'new_signup',
    'new_listing',
    'listing_approved',
    'listing_rejected',
    'contact_form',
])

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { type, data } = body

        if (typeof type !== 'string' || !ALLOWED_TYPES.has(type)) {
            return NextResponse.json({ error: 'Unsupported notification type' }, { status: 400 })
        }

        if (!data || typeof data !== 'object') {
            return NextResponse.json({ error: 'Missing notification data' }, { status: 400 })
        }

        switch (type) {
            case 'new_signup': {
                // Notify admin of new user signup
                await notifyAdminNewSignup({
                    email: data.email,
                    fullName: data.fullName,
                    signupDate: new Date()
                })
                return NextResponse.json({ success: true, message: 'Admin notified of new signup' })
            }

            case 'new_listing': {
                // Notify admin of new listing submission
                const supabase = getSupabaseAdmin()
                if (!supabase) {
                    return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 })
                }

                // Fetch listing details
                const { data: listing } = await supabase
                    .from('listings')
                    .select(`
                        id, business_name, city,
                        categories(name),
                        profiles!listings_user_id_fkey(email, full_name)
                    `)
                    .eq('id', data.listingId)
                    .single()

                if (listing) {
                    const profile = listing.profiles as any
                    const category = listing.categories as any

                    await notifyAdminNewListing({
                        listingId: listing.id,
                        businessName: listing.business_name,
                        ownerEmail: profile?.email || 'Unknown',
                        ownerName: profile?.full_name,
                        city: listing.city,
                        category: category?.name,
                        submittedAt: new Date()
                    })
                }
                return NextResponse.json({ success: true, message: 'Admin notified of new listing' })
            }

            case 'listing_approved': {
                // Notify customer that their listing is approved
                const supabase = getSupabaseAdmin()
                if (!supabase) {
                    return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 })
                }

                // Fetch listing and owner details
                const { data: listing } = await supabase
                    .from('listings')
                    .select(`
                        id, business_name, slug,
                        profiles!listings_user_id_fkey(email, full_name)
                    `)
                    .eq('id', data.listingId)
                    .single()

                if (listing) {
                    const profile = listing.profiles as any

                    await notifyCustomerListingApproved({
                        businessName: listing.business_name,
                        ownerEmail: profile?.email,
                        ownerName: profile?.full_name,
                        listingUrl: `${SITE_URL}/listings/${listing.slug}`
                    })
                }
                return NextResponse.json({ success: true, message: 'Customer notified of approval' })
            }

            case 'listing_rejected': {
                // Notify customer that their listing was rejected
                const supabase = getSupabaseAdmin()
                if (!supabase) {
                    return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 })
                }

                // Fetch listing and owner details
                const { data: listing } = await supabase
                    .from('listings')
                    .select(`
                        id, business_name, rejection_reason,
                        profiles!listings_user_id_fkey(email, full_name)
                    `)
                    .eq('id', data.listingId)
                    .single()

                if (listing) {
                    const profile = listing.profiles as any

                    await notifyCustomerListingRejected({
                        businessName: listing.business_name,
                        ownerEmail: profile?.email,
                        ownerName: profile?.full_name,
                        rejectionReason: data.rejectionReason || listing.rejection_reason || 'No reason provided'
                    })
                }
                return NextResponse.json({ success: true, message: 'Customer notified of rejection' })
            }

            case 'contact_form': {
                // Handle contact form submission
                await notifyAdminContactForm({
                    name: data.name,
                    email: data.email,
                    subject: data.subject,
                    message: data.message
                })
                return NextResponse.json({ success: true, message: 'Contact form submitted successfully' })
            }

            default:
                return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 })
        }
    } catch (error) {
        console.error('Notification error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to send notification' },
            { status: 500 }
        )
    }
}
