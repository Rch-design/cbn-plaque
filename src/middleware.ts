import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import { SESSION_COOKIE, verifySessionToken } from './lib/session';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') ?? '';
  const pathname = url.pathname;

  // Admin API'si oturum ister; dil yonlendirmesi uygulanmaz.
  if (pathname.startsWith('/api/admin')) {
    const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
    if (!session) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

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
  matcher: ['/', '/(fr|tr)/:path*', '/api/admin/:path*', '/((?!api|admin|_next|_vercel|.*\\..*).*)']
};
