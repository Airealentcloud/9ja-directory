import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { fulfillPaystackSuccess } from '@/lib/payments/fulfill'

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
      await fulfillPaystackSuccess({
        reference: payload.data.reference,
        amountKobo: payload.data.amount ?? 0,
        currency: payload.data.currency ?? 'NGN',
        paidAt: payload.data.paid_at ?? null,
      })
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Webhook processing error' },
      { status: 500 }
    )
  }
}

