import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only redirect root for guests
  if (pathname !== '/') return NextResponse.next()

  const cookies = request.cookies
  const hasSession = cookies.get('sb-access-token') ||
    [...cookies.getAll()].some(c => c.name.includes('auth-token') && c.value)

  if (!hasSession) {
    return NextResponse.redirect(new URL('/landing', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/']
}
