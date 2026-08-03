import { NextRequest, NextResponse } from 'next/server'
import { verifyPayment } from '@/lib/paystack'
import { koboToNaira, getPlanById } from '@/lib/pricing'
import { getPaymentPlan } from '@/lib/payments/plans'
import { createAdminClient } from '@/lib/supabase/admin'
import { fulfillPaystackSuccess } from '@/lib/payments/fulfill'
import { linkSuccessfulLeadToUser } from '@/lib/payments/link-paid-lead'
import { createClient } from '@/lib/supabase/server'
import { queuePaymentReceivedEmail } from '@/lib/email/transactional'
import { updateVerifiedPaymentLead } from '@/lib/payments/update-lead-status'

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
    let verificationStage = 'request'
    try {
        const reference = request.nextUrl.searchParams.get('reference')?.trim()
        if (!reference) {
            return NextResponse.json({ error: 'Payment reference is required' }, { status: 400 })
        }

        verificationStage = 'paystack-verification'
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

        // Public checkout references live in payment_leads. Check that source
        // first so old payments-table casts cannot block a valid public payment.
        verificationStage = 'payment-lead-lookup'
        const { data: lead, error: leadLookupError } = await supabaseAdmin
            .from('payment_leads')
            .select('id, user_id, listing_id, email, business_name, phone, plan, amount, currency')
            .eq('reference', reference)
            .maybeSingle()

        if (leadLookupError) {
            return NextResponse.json({ error: leadLookupError.message }, { status: 500 })
        }

        let paymentRow: {
            id: string
            user_id: string
            plan: string
            amount: number
            currency: string
            listing_id: string | null
        } | null = null
        let paymentLookupUserId = paymentData.metadata?.user_id?.trim() || ''

        if (!lead) {
            verificationStage = 'payment-record-lookup'
            if (!paymentLookupUserId && paymentData.customer?.email) {
                const { data: paymentProfile, error: profileLookupError } = await supabaseAdmin
                    .from('profiles')
                    .select('id')
                    .ilike('email', paymentData.customer.email.trim())
                    .maybeSingle()

                if (profileLookupError) {
                    return NextResponse.json({ error: profileLookupError.message }, { status: 500 })
                }
                paymentLookupUserId = paymentProfile?.id || ''
            }

            const lookup = paymentLookupUserId
                ? await supabaseAdmin
                    .from('payments')
                    .select('id, user_id, reference, plan, amount, currency, listing_id')
                    .eq('user_id', paymentLookupUserId)
                    .eq('amount', amountKobo)
                    .eq('currency', currency)
                    .order('created_at', { ascending: false })
                    .limit(20)
                : await supabaseAdmin
                    .from('payments')
                    .select('id, user_id, reference, plan, amount, currency, listing_id')
                    .order('created_at', { ascending: false })
                    .limit(500)

            if (lookup.error) {
                return NextResponse.json({ error: lookup.error.message }, { status: 500 })
            }
            paymentRow = (lookup.data || []).find((row) => row.reference === reference) || null
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

            let fulfilledListingId = paymentRow.listing_id
            if (status === 'success') {
                const fulfillment = await fulfillPaystackSuccess({
                    reference,
                    amountKobo,
                    currency,
                    paidAt: paymentData.paid_at ?? null,
                    userId: paymentRow.user_id,
                    planId: paymentRow.plan,
                })
                fulfilledListingId = fulfillment.listingId
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
                    listing_id: fulfilledListingId,
                    requires_account: false,
                },
            })
        }

        if (!lead) {
            return NextResponse.json(
                { error: 'Payment reference not found' },
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

        verificationStage = 'payment-lead-update'
        await updateVerifiedPaymentLead(supabaseAdmin, {
            id: lead.id,
            status,
            paidAt: paymentData.paid_at ?? null,
        })

        let linkedUserId = lead.user_id
        let linkedListingId = lead.listing_id
        let accountExists = Boolean(lead.user_id)
        let linkError: string | null = null
        if (status === 'success') {
            verificationStage = 'signed-in-customer-lookup'
            const userSupabase = await createClient()
            const { data: { user } } = await userSupabase.auth.getUser()
            const signedInEmail = user?.email?.trim().toLowerCase()
            const paidEmail = lead.email?.trim().toLowerCase()

            if (user?.id && signedInEmail && signedInEmail === paidEmail) {
                accountExists = true
                try {
                    verificationStage = 'customer-payment-linking'
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

            try {
                verificationStage = 'payment-receipt'
                await queuePaymentReceivedEmail({
                    reference,
                    email: lead.email,
                    userId: linkedUserId,
                    listingId: linkedListingId,
                    fullName: undefined,
                    businessName: lead.business_name,
                    planId: selectedPlan.id,
                    amountKobo,
                    currency,
                    paidAt: paymentData.paid_at ?? null,
                    requiresAccountSetup: !linkedUserId,
                })
            } catch (notificationError) {
                console.error('Could not queue verified payment receipt:', notificationError)
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
        console.error('Payment verification error:', {
            stage: verificationStage,
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        })
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to verify payment' },
            { status: 500 }
        )
    }
}
