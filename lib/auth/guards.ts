import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Guards for API routes that use the service-role key.
 *
 * Middleware only matches page paths (`/admin`), so it never runs for
 * `/api/admin/*`. Any route that bypasses RLS has to check for itself.
 */

type Denied = { ok: false; response: NextResponse }
type Allowed = { ok: true; userId: string }

/** Requires a signed-in user whose profile role is `admin`. */
export async function requireAdmin(): Promise<Allowed | Denied> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Authentication required' }, { status: 401 }),
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Admin access required' }, { status: 403 }),
    }
  }

  return { ok: true, userId: user.id }
}

/**
 * Requires `Authorization: Bearer <CRON_SECRET>`.
 *
 * Fails closed: a missing CRON_SECRET denies every request rather than
 * allowing them, so a misconfigured deploy cannot expose the route.
 */
export function requireServiceSecret(request: NextRequest): Allowed | Denied {
  const secret = process.env.CRON_SECRET

  if (!secret) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Endpoint not configured' }, { status: 503 }),
    }
  }

  const header = request.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : ''

  if (token !== secret) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  return { ok: true, userId: 'service' }
}
