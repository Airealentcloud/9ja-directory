import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { initializePayment, generateReference } from '@/lib/paystack'
import { getPlanById, nairaToKobo, type PlanId } from '@/lib/pricing'
import { resolveApplicationOrigin } from '@/lib/http/application-origin'
import {
    canCreateAnotherListing,
    getMissingListingFields,
    sanitizeListingForPlan,
} from '@/lib/entitlements'

type InitializePayload = {
    plan_id?: PlanId
    listing_id?: string
    listing_data?: Record<string, unknown>
}

export async function POST(request: NextRequest) {
    let reference = ''

    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user?.email) {
            return NextResponse.json(
                { error: 'You must be logged in to make a payment' },
                { status: 401 }
            )
        }

        const body = (await request.json()) as InitializePayload
        const plan = body.plan_id ? getPlanById(body.plan_id) : undefined
        if (!plan) {
            return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 })
        }

        if (!body.listing_id && !body.listing_data) {
            return NextResponse.json(
                { error: 'Add or select a business listing before making payment.' },
                { status: 400 }
            )
        }

        let sanitizedListingData: Record<string, unknown> | null = null
        if (body.listing_data) {
            const missingFields = getMissingListingFields(body.listing_data)
            if (missingFields.length > 0) {
                return NextResponse.json(
                    { error: `Complete the required fields: ${missingFields.join(', ')}.` },
                    { status: 400 }
                )
            }

            const sanitized = sanitizeListingForPlan(plan.id, body.listing_data)
            if (sanitized.errors.length > 0) {
                return NextResponse.json({ error: sanitized.errors.join(' ') }, { status: 400 })
            }
            sanitizedListingData = sanitized.value

            const { count, error: countError } = await supabase
                .from('listings')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .in('status', ['pending', 'approved'])

            if (countError) {
                return NextResponse.json({ error: countError.message }, { status: 500 })
            }
            if (!canCreateAnotherListing(plan.id, count || 0)) {
                return NextResponse.json(
                    { error: `The ${plan.name} plan's listing allowance has already been used.` },
                    { status: 409 }
                )
            }
        }

        if (body.listing_id) {
            const { data: listing, error: listingError } = await supabase
                .from('listings')
                .select('id, status')
                .eq('id', body.listing_id)
                .eq('user_id', user.id)
                .maybeSingle()

            if (listingError) {
                return NextResponse.json({ error: listingError.message }, { status: 500 })
            }
            if (!listing) {
                return NextResponse.json(
                    { error: 'Listing not found or you do not own it' },
                    { status: 404 }
                )
            }
            if (!['pending', 'approved'].includes(listing.status)) {
                return NextResponse.json(
                    { error: 'Only pending or approved listings can be linked to a plan.' },
                    { status: 409 }
                )
            }

            const { count, error: countError } = await supabase
                .from('listings')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .in('status', ['pending', 'approved'])

            if (countError) {
                return NextResponse.json({ error: countError.message }, { status: 500 })
            }
            if (plan.limits.maxListings !== -1 && (count || 0) > plan.limits.maxListings) {
                const listingWord = plan.limits.maxListings === 1 ? 'listing' : 'listings'
                return NextResponse.json(
                    { error: 'The ' + plan.name + ' plan supports ' + plan.limits.maxListings + ' active ' + listingWord + '. Choose a higher plan or remove extra listings.' },
                    { status: 409 }
                )
            }
        }

        reference = generateReference()
        const amount = nairaToKobo(plan.price)
        const { error: dbError } = await supabase.from('payments').insert({
            user_id: user.id,
            listing_id: body.listing_id || null,
            provider: 'paystack',
            reference,
            plan: plan.id,
            amount,
            currency: 'NGN',
            status: 'pending',
            metadata: {
                plan_id: plan.id,
                plan_name: plan.name,
                plan_interval: plan.interval,
                listing_id: body.listing_id || null,
                user_id: user.id,
                listing_data: sanitizedListingData
                    ? JSON.stringify(sanitizedListingData)
                    : null,
            },
        })

        if (dbError) {
            const lower = (dbError.message || '').toLowerCase()
            const message = lower.includes('relation') && lower.includes('payments')
                ? 'Database table payments is missing. Apply migration 006.'
                : dbError.message
            return NextResponse.json({ error: message }, { status: 500 })
        }

        const callbackUrl = new URL('/payment/verify', resolveApplicationOrigin(request))
        callbackUrl.searchParams.set('reference', reference)

        const paystackResponse = await initializePayment({
            email: user.email,
            amount,
            reference,
            callback_url: callbackUrl.toString(),
            metadata: {
                plan_id: plan.id,
                user_id: user.id,
                listing_id: body.listing_id || '',
                custom_fields: [
                    { display_name: 'Plan', variable_name: 'plan_name', value: plan.name },
                    { display_name: 'Customer ID', variable_name: 'user_id', value: user.id },
                ],
            },
        })

        if (!paystackResponse.status) {
            await createAdminClient()
                .from('payments')
                .update({ status: 'failed' })
                .eq('reference', reference)
            return NextResponse.json(
                { error: paystackResponse.message || 'Failed to initialize payment' },
                { status: 502 }
            )
        }

        return NextResponse.json({
            status: true,
            message: 'Payment initialized successfully',
            data: {
                authorization_url: paystackResponse.data.authorization_url,
                access_code: paystackResponse.data.access_code,
                reference: paystackResponse.data.reference,
            },
        })
    } catch (error) {
        if (reference) {
            try {
                await createAdminClient()
                    .from('payments')
                    .update({ status: 'failed' })
                    .eq('reference', reference)
            } catch (statusError) {
                console.error('Could not mark failed payment initialization:', statusError)
            }
        }

        console.error('Payment initialization error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to initialize payment' },
            { status: 500 }
        )
    }
}
