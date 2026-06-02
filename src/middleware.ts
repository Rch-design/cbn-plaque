import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') ?? '';
  const pathname = url.pathname;

  // HTTP → HTTPS
  const proto = request.headers.get('x-forwarded-proto');
  if (proto === 'http') {
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }

  // cbnplaque.com → www.cbnplaque.com
  if (host === 'cbnplaque.com') {
    url.host = 'www.cbnplaque.com';
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }

  // /fr/* tekrar eden URL → canonical path (SEO)
  if (pathname === '/fr' || pathname.startsWith('/fr/')) {
    const stripped = pathname.replace(/^\/fr/, '') || '/';
    url.pathname = stripped;
    return NextResponse.redirect(url, 301);
  }

  const response = intlMiddleware(request);
  response.headers.set('x-pathname', pathname);
  if (url.searchParams.has('_rsc')) {
    response.headers.set('X-Robots-Tag', 'noindex');
  }
  return response;
}

export const config = {
  matcher: ['/', '/(fr|tr)/:path*', '/((?!api|admin|_next|_vercel|.*\\..*).*)']
};
