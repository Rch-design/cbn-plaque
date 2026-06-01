/**
 * Analytics koleksiyonu izinlerini duzeltir (misafir okuma + yazma + guncelleme).
 * node scripts/fix-analytics-permissions.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Client, Databases, Permission, Role } from 'node-appwrite';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const path = join(__dirname, '..', '.env.local');
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv();

const endpoint   = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? '';
const projectId  = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? '';
const apiKey     = process.env.APPWRITE_API_KEY ?? '';
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? 'main';
const colId      = process.env.NEXT_PUBLIC_APPWRITE_COL_ANALYTICS ?? 'analytics';

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const databases = new Databases(client);

const perms = [
  Permission.read(Role.any()),
  Permission.create(Role.any()),
  Permission.update(Role.any()),
  Permission.delete(Role.users())
];

async function run() {
  console.log('\n📊 Analytics izinleri guncelleniyor...\n');
  await databases.updateCollection(databaseId, colId, 'Analytics', perms, true);
  console.log('  ✅ Koleksiyon izinleri: read/create/update = any, delete = users\n');
}

run().catch((e) => {
  console.error('❌', e?.response?.message || e.message);
  process.exit(1);
});
