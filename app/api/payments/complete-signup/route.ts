import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveApplicationOrigin } from '@/lib/http/application-origin'
import { linkSuccessfulLeadToUser } from '@/lib/payments/link-paid-lead'

type CompleteSignupPayload = {
  reference?: string
  full_name?: string
  password?: string
}

async function findAuthUserByEmail(
  supabase: ReturnType<typeof createAdminClient>,
  email: string
) {
  const perPage = 1000
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error) throw error

    const match = data.users.find(user => user.email?.toLowerCase() === email)
    if (match) return match
    if (data.users.length < perPage) return null
  }

  throw new Error('Could not safely finish checking existing customer accounts.')
}

async function sendConfirmation(
  supabase: ReturnType<typeof createAdminClient>,
  email: string,
  reference: string,
  request: NextRequest
) {
  const callbackUrl = new URL('/auth/callback', resolveApplicationOrigin(request))
  callbackUrl.searchParams.set('next', `/payment/verify?reference=${encodeURIComponent(reference)}`)

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: callbackUrl.toString() },
  })
  if (error) throw new Error(`Account created, but the confirmation email could not be sent: ${error.message}`)
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
    if (!fullName || fullName.length > 160) {
      return NextResponse.json({ error: 'Enter your full name' }, { status: 400 })
    }
    if (!password || password.length < 8 || password.length > 128) {
      return NextResponse.json({ error: 'Password must be between 8 and 128 characters' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: lead, error: leadError } = await supabase
      .from('payment_leads')
      .select('email, status')
      .eq('reference', reference)
      .maybeSingle()

    if (leadError || !lead) {
      return NextResponse.json({ error: leadError?.message || 'Payment lead not found' }, { status: 404 })
    }
    if (lead.status !== 'success') {
      return NextResponse.json({ error: 'Payment is not confirmed yet' }, { status: 409 })
    }

    const email = (lead.email || '').trim().toLowerCase()
    if (!email) return NextResponse.json({ error: 'Payment email is missing' }, { status: 500 })

    let authUser = await findAuthUserByEmail(supabase, email)
    if (authUser?.email_confirmed_at) {
      return NextResponse.json(
        {
          error: 'An account already exists for this email. Sign in to link the verified payment automatically.',
          account_exists: true,
          next: `/payment/verify?reference=${encodeURIComponent(reference)}`,
        },
        { status: 409 }
      )
    }

    if (!authUser) {
      const { data: createdUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: { full_name: fullName },
      })

      if (createError || !createdUser?.user) {
        return NextResponse.json(
          { error: createError?.message || 'Failed to create user account' },
          { status: 500 }
        )
      }
      authUser = createdUser.user
    }

    await sendConfirmation(supabase, email, reference, request)

    try {
      const linked = await linkSuccessfulLeadToUser({
        reference,
        userId: authUser.id,
        userEmail: email,
        fullName,
      })

      return NextResponse.json({
        status: true,
        message: 'Account created and payment linked. Confirm your email to sign in.',
        confirmation_required: true,
        data: { listing_id: linked.listingId, email },
      })
    } catch (linkError) {
      const message = linkError instanceof Error ? linkError.message : 'Payment linking needs support.'
      return NextResponse.json(
        {
          error: `Your account was created and a confirmation email was sent, but the payment needs attention: ${message}`,
          account_created: true,
          confirmation_sent: true,
          link_pending: true,
        },
        { status: 409 }
      )
    }
  } catch (error) {
    console.error('Complete signup error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to complete signup' },
      { status: 500 }
    )
  }
}
