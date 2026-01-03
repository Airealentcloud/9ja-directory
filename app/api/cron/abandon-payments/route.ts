import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return true

  const header = request.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : ''
  return token === secret
}

function getAbandonAfterHours(request: NextRequest) {
  const value = request.nextUrl.searchParams.get('hours')
  if (!value) return 24
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 24
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    const hours = getAbandonAfterHours(request)
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

    const { data: abandoned, error } = await supabase
      .from('payments')
      .update({ status: 'abandoned' })
      .eq('status', 'pending')
      .lt('created_at', cutoff)
      .select('id, user_id, listing_id, reference, created_at')

    if (error) {
      const msg = (error as { message?: string }).message || 'Failed to mark abandoned payments'
      return NextResponse.json({ error: msg }, { status: 500 })
    }

    if (!abandoned || abandoned.length === 0) {
      return NextResponse.json({ success: true, abandoned: 0 })
    }

    const userIds = Array.from(new Set(abandoned.map((item) => item.user_id).filter(Boolean)))
    const listingIds = Array.from(new Set(abandoned.map((item) => item.listing_id).filter(Boolean)))

    const [profilesResult, listingsResult] = await Promise.all([
      userIds.length > 0
        ? supabase.from('profiles').select('id, email, full_name').in('id', userIds)
        : Promise.resolve({ data: [] as any[] }),
      listingIds.length > 0
        ? supabase.from('listings').select('id, business_name').in('id', listingIds)
        : Promise.resolve({ data: [] as any[] }),
    ])

    const profilesMap = (profilesResult.data || []).reduce((acc: Record<string, any>, profile: any) => {
      acc[profile.id] = profile
      return acc
    }, {})

    const listingsMap = (listingsResult.data || []).reduce((acc: Record<string, any>, listing: any) => {
      acc[listing.id] = listing
      return acc
    }, {})

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://9jadirectory.org'
    const notifications = abandoned
      .map((payment) => {
        const profile = profilesMap[payment.user_id]
        if (!profile?.email) return null
        const listing = payment.listing_id ? listingsMap[payment.listing_id] : null
        const businessName = listing?.business_name || 'your business listing'
        const resumeUrl = payment.listing_id
          ? `${siteUrl}/listing-created?listing_id=${payment.listing_id}`
          : `${siteUrl}/pricing`

        return {
          user_id: payment.user_id,
          email: profile.email,
          type: 'payment_abandoned',
          subject: `Complete your 9jaDirectory listing`,
          body:
            `Hi ${profile.full_name || 'there'},\n\n` +
            `We noticed you started a payment for ${businessName}, but it was not completed.\n\n` +
            `Finish your payment to get listed and start receiving customers:\n` +
            `${resumeUrl}\n\n` +
            `If you need help, reply to this email.\n\n` +
            `Reference: ${payment.reference}\n`,
          listing_id: payment.listing_id,
        }
      })
      .filter(Boolean)

    if (notifications.length > 0) {
      const { error: insertError } = await supabase.from('email_notifications').insert(notifications)
      if (insertError) {
        console.error('Failed to queue abandoned payment emails:', insertError)
      }
    }

    return NextResponse.json({ success: true, abandoned: abandoned.length, queued: notifications.length })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to mark abandoned payments' },
      { status: 500 }
    )
  }
}
