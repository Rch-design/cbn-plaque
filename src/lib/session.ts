/**
 * Admin oturum çerezi — HMAC-SHA256 ile imzalanmış, httpOnly.
 *
 * Web Crypto kullanır; böylece hem Node.js API route'larında hem de
 * Edge'de çalışan middleware'de aynı kod doğrulama yapabilir.
 */

export const SESSION_COOKIE = 'cbn_admin';
export const SESSION_MAX_AGE = 60 * 60 * 12; // 12 saat

export interface SessionPayload {
  sub: string;
  email: string;
  exp: number;
}

const encoder = new TextEncoder();

function base64UrlEncode(input: string): string {
  return btoa(unescape(encodeURIComponent(input)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  return decodeURIComponent(escape(atob(padded)));
}

function bytesToBase64Url(bytes: ArrayBuffer): string {
  const arr = new Uint8Array(bytes);
  let binary = '';
  for (const b of arr) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function secret(): string {
  const value = (process.env.ADMIN_SESSION_SECRET ?? '').trim();
  if (!value) throw new Error('ADMIN_SESSION_SECRET tanimli degil');
  return value;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

async function sign(data: string): Promise<string> {
  const signature = await crypto.subtle.sign('HMAC', await hmacKey(), encoder.encode(data));
  return bytesToBase64Url(signature);
}

/** Sabit süreli karşılaştırma — imza uzunluğu bilgisini sızdırmaz. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(user: { id: string; email: string }): Promise<string> {
  const payload: SessionPayload = {
    sub: user.id,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE
  };
  const body = base64UrlEncode(JSON.stringify(payload));
  return `${body}.${await sign(body)}`;
}

export async function verifySessionToken(token?: string | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;

  try {
    if (!safeEqual(signature, await sign(body))) return null;
    const payload = JSON.parse(base64UrlDecode(body)) as SessionPayload;
    if (!payload?.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAge: number = SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge
  };
}
