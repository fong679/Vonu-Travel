import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('sb-tsluwjhhlkfuhexrhsbq-auth-token')
  const isLanding = request.nextUrl.pathname === '/landing'
  const isLogin = request.nextUrl.pathname === '/login'
  const isRoot = request.nextUrl.pathname === '/'

  if (isRoot && !token) {
    return NextResponse.redirect(new URL('/landing', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/']
}
