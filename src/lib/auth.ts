/**
 * Admin şifre saklama — scrypt (node:crypto).
 *
 * Yalnızca Node.js çalışma zamanında kullanılır (API route'ları ve
 * scripts/create-admin.mjs). Oturum çerezi için src/lib/session.ts.
 */
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number
) => Promise<Buffer>;

const KEY_LEN = 64;

/** `scrypt$<saltHex>$<hashHex>` biçiminde saklanabilir değer üretir. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scryptAsync(password, salt, KEY_LEN);
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = (stored ?? '').split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;

  const salt = Buffer.from(parts[1], 'hex');
  const expected = Buffer.from(parts[2], 'hex');
  if (expected.length !== KEY_LEN) return false;

  const derived = await scryptAsync(password, salt, KEY_LEN);
  return timingSafeEqual(derived, expected);
}
