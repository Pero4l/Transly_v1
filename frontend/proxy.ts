import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('transly_token')?.value;

  const protectedRoutes = ['/dashboard', '/admin', '/driver', '/request', '/profile'];
  const isProtected = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/driver/:path*', '/request/:path*', '/profile/:path*'],
};
