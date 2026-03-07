import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { SITE_URL } from '@/lib/seo/site-url'

export async function middleware(request: NextRequest) {
  const requestPath = request.nextUrl.pathname
  const isAmpersandPath = requestPath === '/&' || requestPath === '/%26'
  const isProtectedRoute = requestPath.startsWith('/add-business') || requestPath.startsWith('/dashboard')
  const isAdminRoute = requestPath.startsWith('/admin')
  const canonicalHost = new URL(SITE_URL).host
  const requestHost = request.headers.get('host')

  // Canonicalize only known production hosts to avoid mixed host SEO signals.
  if (requestHost && (requestHost === '9jadirectory.org' || requestHost === 'www.9jadirectory.org') && requestHost !== canonicalHost) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.host = canonicalHost
    redirectUrl.protocol = 'https:'
    return NextResponse.redirect(redirectUrl, 308)
  }

  // Only redirect malformed ampersand paths
  if (isAmpersandPath) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/'
    return NextResponse.redirect(redirectUrl, 308)
  }

  if (!isProtectedRoute && !isAdminRoute) {
    return NextResponse.next({
      request,
    })
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
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 3. Check for admin role if accessing admin routes
  if (isAdminRoute && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
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
