import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';

  // www olmayan → www (canonical domain)
  if (host === 'cbnplaque.com') {
    const url = request.nextUrl.clone();
    url.host = 'www.cbnplaque.com';
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(fr|tr)/:path*', '/((?!api|admin|_next|_vercel|.*\\..*).*)']
};
