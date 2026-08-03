import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { fulfillPaystackSuccess } from '@/lib/payments/fulfill'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPlanById, nairaToKobo } from '@/lib/pricing'
import { queuePaymentReceivedEmail } from '@/lib/email/transactional'
import { updateVerifiedPaymentLead } from '@/lib/payments/update-lead-status'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getPaystackSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key) throw new Error('Missing PAYSTACK_SECRET_KEY env var')
  return key
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-paystack-signature')
    const secret = getPaystackSecretKey()
    const rawBody = await request.text()

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    const computed = createHmac('sha512', secret).update(rawBody).digest('hex')
    const sigOk =
      signature.length === computed.length &&
      timingSafeEqual(Buffer.from(signature, 'utf8'), Buffer.from(computed, 'utf8'))

    if (!sigOk) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(rawBody) as {
      event?: string
      data?: { reference?: string; status?: string; amount?: number; currency?: string; paid_at?: string }
    }

    if (payload.event !== 'charge.success' || !payload.data?.reference) {
      return NextResponse.json({ received: true })
    }

    const reference = payload.data.reference
    const amountKobo = payload.data.amount ?? 0
    const currency = payload.data.currency ?? 'NGN'
    const supabase = createAdminClient()

    const { data: paymentRow, error: paymentError } = await supabase
      .from('payments')
      .select('id')
      .eq('reference', reference)
      .maybeSingle()

    if (paymentError) throw paymentError

    if (paymentRow?.id) {
      await fulfillPaystackSuccess({
        reference,
        amountKobo,
        currency,
        paidAt: payload.data.paid_at ?? null,
      })
      return NextResponse.json({ received: true })
    }

    const { data: lead, error: leadLookupError } = await supabase
      .from('payment_leads')
      .select('id, email, business_name, plan, amount, currency')
      .eq('reference', reference)
      .maybeSingle()

    if (leadLookupError) throw leadLookupError
    if (!lead) {
      console.error('Paystack webhook reference was not found locally:', reference)
      return NextResponse.json({ received: true, linked: false })
    }

    const plan = getPlanById(lead.plan)
    const officialAmount = plan ? nairaToKobo(plan.price) : null
    if (
      !plan ||
      officialAmount === null ||
      lead.amount !== officialAmount ||
      lead.currency !== 'NGN' ||
      amountKobo !== officialAmount ||
      currency !== 'NGN'
    ) {
      console.error('Rejected mismatched Paystack lead payment:', {
        reference,
        storedPlan: lead.plan,
        storedAmount: lead.amount,
        paidAmount: amountKobo,
        paidCurrency: currency,
      })
      return NextResponse.json({ received: true, linked: false })
    }

    await updateVerifiedPaymentLead(supabase, {
      id: lead.id,
      status: 'success',
      paidAt: payload.data.paid_at ?? null,
    })

    try {
      await queuePaymentReceivedEmail({
        reference,
        email: lead.email,
        businessName: lead.business_name,
        planId: plan.id,
        amountKobo,
        currency,
        paidAt: payload.data.paid_at ?? null,
        requiresAccountSetup: true,
      })
    } catch (notificationError) {
      console.error('Could not queue paid-lead receipt:', notificationError)
    }

    return NextResponse.json({ received: true, linked: true })
  } catch (error) {
    console.error('Paystack webhook processing error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook processing error' },
      { status: 500 }
    )
  }
}
