import { NextResponse } from 'next/server'

export function GET(request: Request) {
  return NextResponse.redirect(
    new URL('/og/9jadirectory-social.png', request.url),
    308
  )
}
