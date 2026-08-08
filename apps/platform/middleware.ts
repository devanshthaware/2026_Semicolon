import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export default NextAuth(authConfig).auth((req) => {
  const isLoggedIn = !!req.auth;
  const userRole = (req.auth?.user as any)?.role || 'USER';

  const pathname = req.nextUrl.pathname;
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAdminLoginRoute = pathname === '/admin/login';
  const isAdminAccessDeniedRoute = pathname === '/admin/access-denied';
  const isAdminRoute = pathname.startsWith('/admin') && !isAdminLoginRoute && !isAdminAccessDeniedRoute;

  // Dashboard routes check
  if (isDashboardRoute && !isLoggedIn) {
    return Response.redirect(new URL('/login', req.nextUrl));
  }

  // Admin login page check: if logged in as ADMIN, go straight to /admin
  if (isAdminLoginRoute && isLoggedIn && userRole === 'ADMIN') {
    return Response.redirect(new URL('/admin', req.nextUrl));
  }

  // Admin routes protection: require logged in AND role === 'ADMIN'
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return Response.redirect(new URL('/admin/login', req.nextUrl));
    }
    if (userRole !== 'ADMIN') {
      return Response.redirect(new URL('/admin/access-denied', req.nextUrl));
    }
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
