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

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('listings')
      .update({ featured: false, featured_until: null })
      .eq('featured', true)
      .not('featured_until', 'is', null)
      .lte('featured_until', now)
      .select('id')

    if (error) {
      const msg = (error as { message?: string }).message || 'Failed to expire featured listings'
      return NextResponse.json({ error: msg }, { status: 500 })
    }

    return NextResponse.json({ success: true, expired: data?.length ?? 0 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to expire featured listings' },
      { status: 500 }
    )
  }
}

