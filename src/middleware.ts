import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("deviceflow_session");
  const path = request.nextUrl.pathname;

  // Public paths
  if (path === "/login" || path.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Check if authenticated
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const session = JSON.parse(sessionCookie.value);
    const role = session.role;

    // Admin only routes
    const adminPaths = ["/settings", "/users", "/reports"];
    
    if (role === "TECHNICIAN") {
      const isTryingToAccessAdminRoute = adminPaths.some(p => path === p || path.startsWith(p + "/"));
      if (isTryingToAccessAdminRoute) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  } catch (e) {
    // Invalid cookie
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
