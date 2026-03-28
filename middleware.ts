import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { VISITOR_COOKIE_NAME } from '@/lib/analyticsConstants';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/admin') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  if (/\.[a-z0-9]{2,8}$/i.test(pathname)) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  if (!request.cookies.get(VISITOR_COOKIE_NAME)?.value) {
    res.cookies.set(VISITOR_COOKIE_NAME, crypto.randomUUID(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 400,
    });
  }
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
