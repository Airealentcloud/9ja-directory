import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { initializePayment, generateReference } from '@/lib/paystack'
import { getPlanById, nairaToKobo, type PlanId } from '@/lib/pricing'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check if user is authenticated
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'You must be logged in to make a payment' },
                { status: 401 }
            )
        }

        // Get request body
        const body = await request.json()
        const { plan_id, listing_id } = body as { plan_id: PlanId; listing_id?: string }

        if (!plan_id) {
            return NextResponse.json(
                { error: 'Plan ID is required' },
                { status: 400 }
            )
        }

        // Get plan details
        const plan = getPlanById(plan_id)
        if (!plan) {
            return NextResponse.json(
                { error: 'Invalid plan selected' },
                { status: 400 }
            )
        }

        // If listing_id is provided, ensure the listing belongs to the current user
        if (listing_id) {
            const { data: listing, error: listingError } = await supabase
                .from('listings')
                .select('id')
                .eq('id', listing_id)
                .eq('user_id', user.id)
                .maybeSingle()

            if (listingError) {
                return NextResponse.json(
                    { error: listingError.message },
                    { status: 500 }
                )
            }

            if (!listing) {
                return NextResponse.json(
                    { error: 'Listing not found (or you do not own it)' },
                    { status: 404 }
                )
            }
        }

        // Generate unique reference
        const reference = generateReference()

        // Create pending payment record in database (before redirecting to Paystack)
        const { error: dbError } = await supabase.from('payments').insert({
            user_id: user.id,
            listing_id: listing_id || null,
            provider: 'paystack',
            reference,
            plan: plan.id,
            amount: nairaToKobo(plan.price),
            currency: 'NGN',
            status: 'pending',
            metadata: {
                plan_id: plan.id,
                plan_name: plan.name,
                plan_interval: plan.interval,
                listing_id: listing_id || null,
                user_id: user.id,
            },
        })

        if (dbError) {
            const lower = (dbError.message || '').toLowerCase()
            const msg =
                lower.includes('relation') && lower.includes('payments')
                    ? 'Database table `payments` is missing. Run `migrations/006_payments_and_featured.sql` in Supabase SQL Editor.'
                    : dbError.message
            return NextResponse.json({ error: msg }, { status: 500 })
        }

        // Get callback URL (Paystack will redirect back here)
        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://9jadirectory.org'
        const callbackUrl = `${origin}/payment/verify?reference=${reference}`

        // Initialize payment with Paystack
        const paystackResponse = await initializePayment({
            email: user.email!,
            amount: nairaToKobo(plan.price),
            reference,
            callback_url: callbackUrl,
            metadata: {
                plan_id: plan.id,
                user_id: user.id,
                listing_id: listing_id || '',
                custom_fields: [
                    {
                        display_name: 'Plan',
                        variable_name: 'plan_name',
                        value: plan.name,
                    },
                    {
                        display_name: 'Customer ID',
                        variable_name: 'user_id',
                        value: user.id,
                    },
                ],
            },
        })

        if (!paystackResponse.status) {
            return NextResponse.json(
                { error: paystackResponse.message || 'Failed to initialize payment' },
                { status: 500 }
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
        console.error('Payment initialization error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to initialize payment' },
            { status: 500 }
        )
    }
}
