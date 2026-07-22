import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { SITE_URL } from '@/lib/seo/site-url'

function withDeploymentHeaders(response: NextResponse, request: NextRequest) {
  const requestHost = request.headers.get('host')?.split(':')[0].toLowerCase()
  const isWorkersPreview = requestHost?.endsWith('.workers.dev') === true

  if (process.env.DEPLOYMENT_ENV === 'staging' || isWorkersPreview) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }
  return response
}

const STAGING_LOCKED_PAGE_PREFIXES = [
  '/login',
  '/signup',
  '/auth',
  '/checkout',
  '/add-business',
  '/dashboard',
  '/admin',
  '/payment',
  '/paystack',
  '/listing-created',
  '/test-payment',
  '/debug',
  '/test-db',
  '/stats',
]

const STAGING_LOCKED_API_PREFIXES = [
  '/api/admin',
  '/api/ai',
  '/api/cron',
  '/api/newsletter',
  '/api/notifications',
  '/api/payments',
  '/api/paystack',
  '/api/press-release',
  '/api/send-emails',
]

function isStagingLockedRequest(request: NextRequest) {
  const requestHost = request.headers.get('host')?.split(':')[0].toLowerCase()
  const isStaging = process.env.DEPLOYMENT_ENV === 'staging'
  const isWorkersPreview = requestHost?.endsWith('.workers.dev') === true
  const previewWritesEnabled = isStaging
    ? process.env.STAGING_MUTATIONS_ENABLED === 'true'
    : process.env.PREVIEW_MUTATIONS_ENABLED === 'true'

  if ((!isStaging && !isWorkersPreview) || previewWritesEnabled) {
    return false
  }

  const path = request.nextUrl.pathname
  const isMutation = !['GET', 'HEAD', 'OPTIONS'].includes(request.method)
  const isLockedPage = STAGING_LOCKED_PAGE_PREFIXES.some(prefix => path.startsWith(prefix))
  const isClaimPage = /^\/listings\/[^/]+\/claim(?:\/|$)/.test(path)
  const isLockedApi = STAGING_LOCKED_API_PREFIXES.some(prefix => path.startsWith(prefix))

  return isMutation || isLockedPage || isClaimPage || isLockedApi
}

function stagingLockedResponse(request: NextRequest) {
  const headers = {
    'Cache-Control': 'private, no-store',
    'Retry-After': '3600',
  }

  if (request.nextUrl.pathname.startsWith('/api/')) {
    return withDeploymentHeaders(NextResponse.json(
      { error: 'Interactive preview routes are disabled until production services are verified.' },
      { status: 503, headers }
    ), request)
  }

  return withDeploymentHeaders(new NextResponse(
    'This preview page is temporarily disabled while authentication and payments are verified.',
    { status: 503, headers }
  ), request)
}

export async function middleware(request: NextRequest) {
  const requestPath = request.nextUrl.pathname

  if (isStagingLockedRequest(request)) {
    return stagingLockedResponse(request)
  }
  const isAmpersandPath = requestPath === '/&' || requestPath === '/%26'
  const isProtectedRoute = requestPath.startsWith('/add-business') || requestPath.startsWith('/dashboard')
  const isAdminRoute =
    requestPath.startsWith('/admin') ||
    requestPath.startsWith('/test-payment') ||
    requestPath.startsWith('/debug') ||
    requestPath.startsWith('/test-db') ||
    requestPath.startsWith('/stats')
  const canonicalHost = new URL(SITE_URL).host
  const requestHost = request.headers.get('host')

  // Canonicalize only known production hosts to avoid mixed host SEO signals.
  if (requestHost && (requestHost === '9jadirectory.org' || requestHost === 'www.9jadirectory.org') && requestHost !== canonicalHost) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.host = canonicalHost
    redirectUrl.protocol = 'https:'
    return withDeploymentHeaders(NextResponse.redirect(redirectUrl, 308), request)
  }

  // Only redirect malformed ampersand paths
  if (isAmpersandPath) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/'
    return withDeploymentHeaders(NextResponse.redirect(redirectUrl, 308), request)
  }

  if (!isProtectedRoute && !isAdminRoute) {
    return withDeploymentHeaders(NextResponse.next({
      request,
    }), request)
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing Supabase Env Vars in Middleware!')
  }

  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refreshing the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if ((isProtectedRoute || isAdminRoute) && !user) {
    return withDeploymentHeaders(NextResponse.redirect(new URL('/login', request.url)), request)
  }

  // 3. Check for admin role if accessing admin routes
  if (isAdminRoute && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return withDeploymentHeaders(NextResponse.redirect(new URL('/dashboard', request.url)), request)
    }
  }

  return withDeploymentHeaders(response, request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
