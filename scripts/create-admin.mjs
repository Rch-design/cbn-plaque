/**
 * D1'deki admin_users tablosuna yonetici hesabini ekler/gunceller.
 * ADMIN_EMAIL ve ADMIN_PASSWORD .env.local'den okunur.
 *
 * Kullanim: npm run admin:create
 */
import { randomBytes } from 'node:crypto';
import { loadEnv, requireEnv, d1 } from './lib/cf.mjs';
import { hashPassword } from '../src/lib/auth.ts';

loadEnv();
requireEnv(
  'CLOUDFLARE_ACCOUNT_ID',
  'CLOUDFLARE_D1_DATABASE_ID',
  'CLOUDFLARE_API_TOKEN',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD'
);

const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (password.length < 8) {
  console.error('\nADMIN_PASSWORD en az 8 karakter olmali.\n');
  process.exit(1);
}

const hash = await hashPassword(password);
const existing = await d1('SELECT id FROM admin_users WHERE email = ?', [email]);

if (existing.length) {
  await d1('UPDATE admin_users SET password_hash = ? WHERE email = ?', [hash, email]);
  console.log(`\nSifre guncellendi: ${email}\n`);
} else {
  await d1('INSERT INTO admin_users (id, email, password_hash) VALUES (?, ?, ?)', [
    randomBytes(16).toString('hex'),
    email,
    hash
  ]);
  console.log(`\nYonetici olusturuldu: ${email}\n`);
}

if (!(process.env.ADMIN_SESSION_SECRET || '').trim()) {
  console.log('Uyari: ADMIN_SESSION_SECRET bos. Su degeri .env.local dosyasina ekleyin:');
  console.log(`ADMIN_SESSION_SECRET=${randomBytes(32).toString('hex')}\n`);
}
