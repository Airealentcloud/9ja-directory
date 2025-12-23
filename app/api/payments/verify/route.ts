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
    } catch (error) {
        console.error('Payment verification error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to verify payment' },
            { status: 500 }
        )
    }
}
