import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { fulfillPaystackSuccess } from '@/lib/payments/fulfill'
import { createAdminClient } from '@/lib/supabase/admin'

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

    if (payload.event === 'charge.success' && payload.data?.reference) {
      const supabase = createAdminClient()
      const reference = payload.data.reference

      const { data: paymentRow } = await supabase
        .from('payments')
        .select('id')
        .eq('reference', reference)
        .maybeSingle()

      if (paymentRow?.id) {
        await fulfillPaystackSuccess({
          reference,
          amountKobo: payload.data.amount ?? 0,
          currency: payload.data.currency ?? 'NGN',
          paidAt: payload.data.paid_at ?? null,
        })
      } else {
        const leadUpdate: Record<string, unknown> = {
          status: 'success',
          paid_at: payload.data.paid_at ?? null,
          currency: payload.data.currency ?? 'NGN',
        }
        if (typeof payload.data.amount === 'number') {
          leadUpdate.amount = payload.data.amount
        }

        const { error: leadError } = await supabase
          .from('payment_leads')
          .update(leadUpdate)
          .eq('reference', reference)

        if (leadError) {
          console.error('Failed to update payment lead:', leadError)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Webhook processing error' },
      { status: 500 }
    )
  }
}
