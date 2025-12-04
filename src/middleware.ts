import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth')
  const isLoginPage = request.nextUrl.pathname === '/login'
  const isLandingPage = request.nextUrl.pathname === '/'

  if (!authCookie && !isLoginPage && !isLandingPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (authCookie && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
 
  return NextResponse.next()
}
 
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|logo.png|icon.png|manifest.json).*)',
  ],
}
