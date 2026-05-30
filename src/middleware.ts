import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Exclut /api, /_next, /admin (gere sa propre logique) et les fichiers statiques
  matcher: ['/', '/(fr|tr)/:path*', '/((?!api|admin|_next|_vercel|.*\\..*).*)']
};
