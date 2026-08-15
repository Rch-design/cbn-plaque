import { NextRequest, NextResponse } from 'next/server';
import { d1First, isD1Configured } from '@/lib/d1';
import { verifyPassword } from '@/lib/auth';
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface AdminRow {
  id: string;
  email: string;
  password_hash: string;
}

export async function POST(req: NextRequest) {
  if (!isD1Configured() || !(process.env.ADMIN_SESSION_SECRET ?? '').trim()) {
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 });
  }

  const { email, password } = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };

  const mail = (email ?? '').trim().toLowerCase();
  const pass = password ?? '';

  if (!mail || !pass) {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 });
  }

  const user = await d1First<AdminRow>(
    'SELECT id, email, password_hash FROM admin_users WHERE email = ? LIMIT 1',
    [mail]
  );

  // Kullanici yoksa da ayni scrypt maliyetini ode: hangi e-postanin kayitli
  // oldugu yanit suresinden anlasilmasin.
  const DUMMY_HASH = `scrypt$${'0'.repeat(32)}$${'0'.repeat(128)}`;
  const valid = await verifyPassword(pass, user?.password_hash ?? DUMMY_HASH);

  if (!user || !valid) {
    return NextResponse.json({ ok: false, error: 'invalid_credentials' }, { status: 401 });
  }

  const token = await createSessionToken({ id: user.id, email: user.email });
  const res = NextResponse.json({ ok: true, email: user.email });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}
