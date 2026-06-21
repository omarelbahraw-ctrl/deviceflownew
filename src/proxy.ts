import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const sessionRaw = request.cookies.get('deviceflow_session')?.value;
  const { pathname } = request.nextUrl;

  // Parse session
  let role = '';
  if (sessionRaw) {
    try {
      const parsed = JSON.parse(sessionRaw);
      role = parsed.role || '';
    } catch {
      role = sessionRaw; // Fallback for old cookie format
    }
  }

  // Protect all routes except login and api
  if (!sessionRaw && !pathname.startsWith('/login') && !pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based restrictions for EMPLOYEE
  if (role === 'EMPLOYEE') {
    if (pathname.startsWith('/settings')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Role-based restrictions for TECHNICIAN
  if (role === 'TECHNICIAN') {
    const adminPaths = ["/settings", "/users", "/reports"];
    const isTryingToAccessAdminRoute = adminPaths.some(p => pathname === p || pathname.startsWith(p + "/"));
    if (isTryingToAccessAdminRoute) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Redirect authenticated users away from login
  if (sessionRaw && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
