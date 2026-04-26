import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Currently checking the dummy cookie set by the login API
  const session = request.cookies.get('deviceflow_session')?.value;
  const { pathname } = request.nextUrl;

  // Protect all routes except login and api
  if (!session && !pathname.startsWith('/login') && !pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based restrictions
  if (session === 'EMPLOYEE') {
    // Employees cannot access traders management or discount warehouse
    if (pathname.startsWith('/traders') || pathname.startsWith('/discount-warehouse')) {
      return NextResponse.redirect(new URL('/', request.url)); // Redirect to dashboard
    }
  }

  // Redirect authenticated users away from login
  if (session && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
