import { NextRequest, NextResponse } from 'next/server'
import { verifyPayment } from '@/lib/paystack'
import { getPlanById, koboToNaira } from '@/lib/pricing'
import { createAdminClient } from '@/lib/supabase/admin'
import { fulfillPaystackSuccess } from '@/lib/payments/fulfill'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const reference = searchParams.get('reference')

        if (!reference) {
            return NextResponse.json(
                { error: 'Payment reference is required' },
                { status: 400 }
            )
        }

        // Verify payment with Paystack
        const verification = await verifyPayment(reference)

        if (!verification.status) {
            return NextResponse.json(
                { error: verification.message || 'Payment verification failed' },
                { status: 400 }
            )
        }

        const paymentData = verification.data
        const supabaseAdmin = createAdminClient()

        const { data: paymentRow } = await supabaseAdmin
            .from('payments')
            .select('id')
            .eq('reference', reference)
            .maybeSingle()

        if (paymentRow?.id) {
            // Track non-success outcomes too (e.g. abandoned) so the UI can show the latest state.
            if (paymentData.status !== 'success') {
                const { error: updateError } = await supabaseAdmin
                    .from('payments')
                    .update({
                        status: paymentData.status,
                        paid_at: paymentData.paid_at,
                    })
                    .eq('reference', reference)

                if (updateError) {
                    console.error('Error updating payment status:', updateError)
                }
            } else {
                await fulfillPaystackSuccess({
                    reference: paymentData.reference,
                    amountKobo: paymentData.amount ?? 0,
                    currency: paymentData.currency ?? 'NGN',
                    paidAt: paymentData.paid_at ?? null,
                })
            }

            return NextResponse.json({
                status: true,
                message: 'Payment verified successfully',
                data: {
                    status: paymentData.status,
                    amount: koboToNaira(paymentData.amount),
                    reference: paymentData.reference,
                    paid_at: paymentData.paid_at,
                    plan_id: paymentData.metadata?.plan_id ? getPlanById(paymentData.metadata.plan_id as any)?.id : null,
                },
            })
        }

        const leadUpdate: Record<string, unknown> = {
            status: paymentData.status,
            paid_at: paymentData.paid_at ?? null,
            currency: paymentData.currency ?? 'NGN',
        }
        if (typeof paymentData.amount === 'number') {
            leadUpdate.amount = paymentData.amount
        }

        const { data: leadRows, error: leadError } = await supabaseAdmin
            .from('payment_leads')
            .update(leadUpdate)
            .eq('reference', reference)
            .select('email, business_name, phone, plan, amount, currency')

        if (leadError || !leadRows || leadRows.length === 0) {
            return NextResponse.json(
                { error: leadError?.message || 'Payment reference not found' },
                { status: 404 }
            )
        }

        const lead = leadRows[0] as {
            email?: string | null
            business_name?: string | null
            phone?: string | null
            plan?: string | null
            amount?: number | null
            currency?: string | null
        }

        const amountKobo = paymentData.amount ?? lead.amount ?? 0

        return NextResponse.json({
            status: true,
            message: 'Payment verified successfully',
            data: {
                status: paymentData.status,
                amount: koboToNaira(amountKobo),
                reference: paymentData.reference,
                paid_at: paymentData.paid_at,
                plan_id: lead.plan ?? null,
                requires_account: paymentData.status === 'success',
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
