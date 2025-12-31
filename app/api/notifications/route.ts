import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
    notifyAdminNewSignup,
    notifyAdminNewListing,
    notifyCustomerListingApproved,
    notifyCustomerListingRejected,
    notifyAdminContactForm
} from '@/lib/email/notifications'

// Use service role key for admin operations
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) return null
    return createClient(url, key)
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { type, data } = body

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
                    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://9jadirectory.org'

                    await notifyCustomerListingApproved({
                        businessName: listing.business_name,
                        ownerEmail: profile?.email,
                        ownerName: profile?.full_name,
                        listingUrl: `${siteUrl}/listings/${listing.slug}`
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
