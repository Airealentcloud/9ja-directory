import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fulfillPaystackSuccess } from '@/lib/payments/fulfill'

type CompleteSignupPayload = {
  reference?: string
  full_name?: string
  password?: string
}

function buildSlug(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') +
    '-' +
    Math.random().toString(36).substring(2, 7)
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CompleteSignupPayload
    const reference = body.reference?.trim()
    const fullName = body.full_name?.trim()
    const password = body.password?.trim()

    if (!reference) {
      return NextResponse.json({ error: 'Payment reference is required' }, { status: 400 })
    }

    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id, listing_id')
      .eq('reference', reference)
      .maybeSingle()

    if (existingPayment?.id) {
      return NextResponse.json({
        status: true,
        message: 'Payment already linked',
        data: { listing_id: existingPayment.listing_id },
      })
    }

    const { data: leadRow, error: leadError } = await supabase
      .from('payment_leads')
      .select('id, email, phone, business_name, plan, amount, currency, paid_at, status')
      .eq('reference', reference)
      .maybeSingle()

    if (leadError || !leadRow) {
      return NextResponse.json({ error: leadError?.message || 'Payment lead not found' }, { status: 404 })
    }

    if (leadRow.status !== 'success') {
      return NextResponse.json({ error: 'Payment is not confirmed yet' }, { status: 409 })
    }

    if (typeof leadRow.amount !== 'number' || !leadRow.currency) {
      return NextResponse.json({ error: 'Payment amount is missing' }, { status: 500 })
    }

    const email = (leadRow.email || '').trim().toLowerCase()
    if (!email) {
      return NextResponse.json({ error: 'Lead email is missing' }, { status: 500 })
    }

    // Check if user already exists by listing users and filtering by email
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account already exists for this email. Please sign in.' },
        { status: 409 }
      )
    }

    const { data: createdUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || leadRow.business_name || '',
        phone: leadRow.phone || '',
      },
    })

    if (createError || !createdUser?.user) {
      return NextResponse.json(
        { error: createError?.message || 'Failed to create user account' },
        { status: 500 }
      )
    }

    const userId = createdUser.user.id

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          email,
          full_name: fullName || leadRow.business_name || null,
          phone: leadRow.phone || null,
        },
        { onConflict: 'id' }
      )

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    const listingName = leadRow.business_name || fullName || 'Business Listing'
    const slug = buildSlug(listingName)

    const { data: listingData, error: listingError } = await supabase
      .from('listings')
      .insert({
        user_id: userId,
        business_name: listingName,
        slug,
        phone: leadRow.phone || null,
        email,
        status: 'pending',
      })
      .select('id')
      .single()

    if (listingError || !listingData) {
      return NextResponse.json(
        { error: listingError?.message || 'Failed to create listing' },
        { status: 500 }
      )
    }

    const { error: paymentInsertError } = await supabase.from('payments').insert({
      user_id: userId,
      listing_id: listingData.id,
      provider: 'paystack',
      reference,
      plan: leadRow.plan,
      amount: leadRow.amount,
      currency: leadRow.currency,
      status: 'pending',
      paid_at: leadRow.paid_at,
      metadata: {
        plan_id: leadRow.plan,
        lead_reference: reference,
      },
    })

    if (paymentInsertError) {
      return NextResponse.json({ error: paymentInsertError.message }, { status: 500 })
    }

    await supabase
      .from('payment_leads')
      .update({ user_id: userId, listing_id: listingData.id })
      .eq('reference', reference)

    await fulfillPaystackSuccess({
      reference,
      amountKobo: leadRow.amount,
      currency: leadRow.currency,
      paidAt: leadRow.paid_at ?? null,
    })

    return NextResponse.json({
      status: true,
      message: 'Account created successfully',
      data: {
        listing_id: listingData.id,
        email,
      },
    })
  } catch (error) {
    console.error('Complete signup error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to complete signup' },
      { status: 500 }
    )
  }
}
