import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Client, Databases, Permission, Role } from 'node-appwrite';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const path = join(__dirname, '..', '.env.local');
  if (!existsSync(path)) return;
  const content = readFileSync(path, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnv();

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'main';
const colId = process.env.NEXT_PUBLIC_APPWRITE_COL_PAGES || 'pages';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function safe(promise, label) {
  try { await promise; console.log(`  ✓ ${label}`); }
  catch (e) {
    if (e.code === 409) console.log(`  • ${label} (zaten mevcut)`);
    else throw e;
  }
}

async function str(key, size, required) {
  await safe(databases.createStringAttribute(databaseId, colId, key, size, required), `${key}`);
  await sleep(400);
}

async function bool(key, def) {
  await safe(databases.createBooleanAttribute(databaseId, colId, key, false, def), `${key}`);
  await sleep(400);
}

async function intAttr(key, def) {
  await safe(databases.createIntegerAttribute(databaseId, colId, key, false, undefined, undefined, def), `${key}`);
  await sleep(400);
}

const perms = [
  Permission.read(Role.any()),
  Permission.create(Role.users()),
  Permission.update(Role.users()),
  Permission.delete(Role.users())
];

console.log('\nPages koleksiyonu oluşturuluyor...\n');

await safe(databases.createCollection(databaseId, colId, 'Pages', perms, false), 'collection pages');

await str('slug', 100, true);
await str('title_fr', 255, true);
await str('title_tr', 255, false);
await str('content_fr', 50000, false);
await str('content_tr', 50000, false);
await bool('is_published', true);
await intAttr('sort_order', 0);

console.log('\n✅ Pages koleksiyonu hazır!\n');
