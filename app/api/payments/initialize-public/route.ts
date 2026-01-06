import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateReference, initializePayment } from '@/lib/paystack'
import { getPlanById, nairaToKobo, type PlanId } from '@/lib/pricing'

type InitializePublicPayload = {
  plan_id?: PlanId
  email?: string
  business_name?: string
  phone?: string
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export async function POST(request: NextRequest) {
  let reference = ''
  try {
    const body = (await request.json()) as InitializePublicPayload
    const planId = body.plan_id
    const email = body.email?.trim()
    const businessName = body.business_name?.trim()
    const phone = body.phone?.trim()

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!businessName) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 })
    }

    const plan = getPlanById(planId)
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 })
    }

    reference = generateReference()
    const amount = nairaToKobo(plan.price)
    const supabase = createAdminClient()

    const { error: leadError } = await supabase.from('payment_leads').insert({
      email: normalizeEmail(email),
      phone: phone || null,
      business_name: businessName,
      plan: plan.id,
      amount,
      currency: 'NGN',
      reference,
      status: 'pending',
      metadata: {
        plan_id: plan.id,
        plan_name: plan.name,
        source: 'public_checkout',
      },
    })

    if (leadError) {
      return NextResponse.json({ error: leadError.message }, { status: 500 })
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://9jadirectory.org'
    const callbackUrl = `${origin}/payment/verify?reference=${reference}`

    const paystackResponse = await initializePayment({
      email: normalizeEmail(email),
      amount,
      reference,
      callback_url: callbackUrl,
      metadata: {
        plan_id: plan.id,
        lead_reference: reference,
        business_name: businessName,
        phone: phone || undefined,
        custom_fields: [
          { display_name: 'Plan', variable_name: 'plan_name', value: plan.name },
          { display_name: 'Business', variable_name: 'business_name', value: businessName },
        ],
      },
    })

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
        const supabase = createAdminClient()
        await supabase.from('payment_leads').update({ status: 'failed' }).eq('reference', reference)
      } catch (updateError) {
        console.error('Failed to mark lead as failed:', updateError)
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to initialize payment' },
      { status: 500 }
    )
  }
}
