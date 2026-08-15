/**
 * Scriptler icin paylasilan Cloudflare yardimcilari (D1 + R2) ve .env.local yukleyici.
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(__dirname, '..', '..');

export function loadEnv() {
  const path = join(ROOT, '.env.local');
  if (!existsSync(path)) return;
  const content = readFileSync(path, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

export function requireEnv(...names) {
  const missing = names.filter((n) => !(process.env[n] || '').trim());
  if (missing.length) {
    console.error(`\nEksik ortam degiskeni: ${missing.join(', ')}`);
    console.error('CLOUDFLARE-KURULUM.md dosyasindaki adimlari izleyin.\n');
    process.exit(1);
  }
}

/* ---------------------------------- D1 ---------------------------------- */

export async function d1(sql, params = []) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID.trim();
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID.trim();
  const token = process.env.CLOUDFLARE_API_TOKEN.trim();

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql, params })
    }
  );

  const text = await res.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error(`D1 gecersiz yanit (${res.status}): ${text.slice(0, 300)}`);
  }
  if (!res.ok || !payload.success) {
    const detail = (payload.errors || []).map((e) => e.message).join('; ') || `HTTP ${res.status}`;
    throw new Error(`D1: ${detail}\nSQL: ${sql.slice(0, 200)}`);
  }
  return payload.result?.[0]?.results ?? [];
}

/* ---------------------------------- R2 ---------------------------------- */

/** Uygulamanin kullandigi imzalama kodunun aynisi (scripts/sigv4-test.mjs ile dogrulanir). */
export async function r2Put(key, body, contentType) {
  const { r2Put: put } = await import('../../src/lib/r2.ts');
  return put(key, body, contentType);
}

/* -------------------------------- yardimci ------------------------------- */

export function bool(value, fallback = 1) {
  if (value === null || value === undefined) return fallback;
  return value ? 1 : 0;
}

export function extFromMime(mime = '') {
  const map = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
    'image/svg+xml': 'svg'
  };
  return map[mime.toLowerCase()] || 'bin';
}
