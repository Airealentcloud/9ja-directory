import { NextRequest, NextResponse } from 'next/server'
import { verifyPayment } from '@/lib/paystack'
import { koboToNaira, getPlanById } from '@/lib/pricing'
import { getPaymentPlan } from '@/lib/payments/plans'
import { createAdminClient } from '@/lib/supabase/admin'
import { fulfillPaystackSuccess } from '@/lib/payments/fulfill'
import { linkSuccessfulLeadToUser } from '@/lib/payments/link-paid-lead'
import { createClient } from '@/lib/supabase/server'

type StoredPaymentStatus = 'pending' | 'success' | 'failed' | 'abandoned'

function normalizePaymentStatus(value: unknown): StoredPaymentStatus {
    return value === 'success' || value === 'failed' || value === 'abandoned'
        ? value
        : 'pending'
}

function paymentMismatchResponse() {
    return NextResponse.json(
        { error: 'The confirmed amount or currency does not match the selected plan. Contact support before retrying.' },
        { status: 409 }
    )
}

export async function GET(request: NextRequest) {
    try {
        const reference = request.nextUrl.searchParams.get('reference')?.trim()
        if (!reference) {
            return NextResponse.json({ error: 'Payment reference is required' }, { status: 400 })
        }

        const verification = await verifyPayment(reference)
        if (!verification.status) {
            return NextResponse.json(
                { error: verification.message || 'Payment verification failed' },
                { status: 400 }
            )
        }

        const paymentData = verification.data
        if (paymentData.reference !== reference) {
            return NextResponse.json({ error: 'Payment reference mismatch' }, { status: 409 })
        }

        const status = normalizePaymentStatus(paymentData.status)
        const currency = paymentData.currency || 'NGN'
        const amountKobo = paymentData.amount ?? 0
        const supabaseAdmin = createAdminClient()

        const { data: paymentRow, error: paymentLookupError } = await supabaseAdmin
            .from('payments')
            .select('id, plan, amount, currency, listing_id')
            .eq('reference', reference)
            .maybeSingle()

        if (paymentLookupError) {
            return NextResponse.json({ error: paymentLookupError.message }, { status: 500 })
        }

        if (paymentRow?.id) {
            const selectedPlan = getPaymentPlan(paymentRow.plan)
            if (
                !selectedPlan ||
                paymentRow.amount !== selectedPlan.amountKobo ||
                paymentRow.currency !== selectedPlan.currency ||
                amountKobo !== selectedPlan.amountKobo ||
                currency !== selectedPlan.currency
            ) {
                return paymentMismatchResponse()
            }

            if (status === 'success') {
                await fulfillPaystackSuccess({
                    reference,
                    amountKobo,
                    currency,
                    paidAt: paymentData.paid_at ?? null,
                })
            } else {
                const { error: updateError } = await supabaseAdmin
                    .from('payments')
                    .update({ status, paid_at: paymentData.paid_at ?? null })
                    .eq('id', paymentRow.id)
                if (updateError) throw updateError
            }

            return NextResponse.json({
                status: true,
                message: 'Payment verified successfully',
                data: {
                    status,
                    amount: koboToNaira(amountKobo),
                    reference,
                    paid_at: paymentData.paid_at,
                    plan_id: paymentRow.plan,
                    listing_id: paymentRow.listing_id,
                    requires_account: false,
                },
            })
        }

        const { data: lead, error: leadLookupError } = await supabaseAdmin
            .from('payment_leads')
            .select('id, user_id, listing_id, email, business_name, phone, plan, amount, currency')
            .eq('reference', reference)
            .maybeSingle()

        if (leadLookupError || !lead) {
            return NextResponse.json(
                { error: leadLookupError?.message || 'Payment reference not found' },
                { status: 404 }
            )
        }

        const selectedPlan = getPlanById(lead.plan)
        const officialAmount = selectedPlan ? selectedPlan.price * 100 : null
        if (
            !selectedPlan ||
            officialAmount === null ||
            lead.amount !== officialAmount ||
            lead.currency !== 'NGN' ||
            amountKobo !== officialAmount ||
            currency !== 'NGN'
        ) {
            return paymentMismatchResponse()
        }

        const { error: leadUpdateError } = await supabaseAdmin
            .from('payment_leads')
            .update({
                status,
                paid_at: paymentData.paid_at ?? null,
                amount: amountKobo,
                currency,
            })
            .eq('id', lead.id)

        if (leadUpdateError) throw leadUpdateError

        let linkedUserId = lead.user_id
        let linkedListingId = lead.listing_id
        let accountExists = Boolean(lead.user_id)
        let linkError: string | null = null
        if (status === 'success') {
            const userSupabase = await createClient()
            const { data: { user } } = await userSupabase.auth.getUser()
            const signedInEmail = user?.email?.trim().toLowerCase()
            const paidEmail = lead.email?.trim().toLowerCase()

            if (user?.id && signedInEmail && signedInEmail === paidEmail) {
                accountExists = true
                try {
                    const linked = await linkSuccessfulLeadToUser({
                        reference,
                        userId: user.id,
                        userEmail: signedInEmail,
                        fullName: user.user_metadata?.full_name,
                    })
                    linkedUserId = user.id
                    linkedListingId = linked.listingId
                } catch (error) {
                    linkError = error instanceof Error ? error.message : 'Account linking needs support.'
                    console.error('Verified payment could not be linked automatically:', error)
                }
            }
        }

        return NextResponse.json({
            status: true,
            message: 'Payment verified successfully',
            data: {
                status,
                amount: koboToNaira(amountKobo),
                reference,
                paid_at: paymentData.paid_at,
                plan_id: lead.plan,
                listing_id: linkedListingId,
                requires_account: status === 'success' && !accountExists,
                link_error: linkError,
                lead: {
                    email: lead.email ?? null,
                    business_name: lead.business_name ?? null,
                    phone: lead.phone ?? null,
                },
            },
        })
    } catch (error) {
        console.error('Payment verification error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to verify payment' },
            { status: 500 }
        )
    }
}
