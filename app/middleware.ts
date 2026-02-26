import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('sb-tsluwjhhlkfuhexrhsbq-auth-token')?.value ||
                request.cookies.get('sb-access-token')?.value

  // Always show landing to guests on root
  if (pathname === '/' && !token) {
    return NextResponse.redirect(new URL('/landing', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/']
}
