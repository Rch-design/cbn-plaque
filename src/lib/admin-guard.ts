import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken, type SessionPayload } from './session';

/**
 * `/api/admin/*` uçları için oturum kontrolü.
 * Middleware zaten engelliyor; bu ikinci katman, matcher değişse bile
 * uçların açıkta kalmamasını garanti eder.
 */
export async function requireAdmin(
  req: NextRequest
): Promise<{ session: SessionPayload } | { response: NextResponse }> {
  const session = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return { response: NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 }) };
  }
  return { session };
}

/** İstisnaları tek biçimli JSON hataya çevirir. */
export function adminError(e: unknown): NextResponse {
  const message = e instanceof Error ? e.message : 'server_error';
  console.error('[admin]', message);
  return NextResponse.json({ ok: false, error: message }, { status: 500 });
}
