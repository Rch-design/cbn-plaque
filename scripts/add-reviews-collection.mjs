/**
 * Appwrite'a "reviews" koleksiyonunu ekler.
 * Kullanım: npm run setup:reviews
 */
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
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv();

const endpoint   = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT   || 'https://cloud.appwrite.io/v1';
const projectId  = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const apiKey     = process.env.APPWRITE_API_KEY                || '';
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'main';
const colId      = process.env.NEXT_PUBLIC_APPWRITE_COL_REVIEWS || 'reviews';

if (!projectId || !apiKey) {
  console.error('❌ NEXT_PUBLIC_APPWRITE_PROJECT_ID ve APPWRITE_API_KEY gerekli!');
  process.exit(1);
}

const client    = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const databases = new Databases(client);

async function safe(fn, label) {
  try {
    await fn();
    console.log(`  ✅ ${label}`);
  } catch (e) {
    const msg = e?.response?.message || e?.message || String(e);
    if (msg.includes('already exists')) {
      console.log(`  ⏭️  ${label} — zaten var`);
    } else {
      console.error(`  ❌ ${label}: ${msg}`);
    }
  }
  await new Promise(r => setTimeout(r, 700));
}

async function run() {
  console.log('\n⭐ CBN Plaque — Reviews Koleksiyonu Kurulumu\n');

  await safe(
    () => databases.createCollection(databaseId, colId, 'Reviews', [
      Permission.read(Role.any()),
      Permission.write(Role.users())
    ], false),
    `koleksiyon "${colId}" oluşturuldu`
  );

  await safe(() => databases.createStringAttribute(databaseId, colId, 'name',      100,  true),  'name');
  await safe(() => databases.createIntegerAttribute(databaseId, colId, 'rating',   true,  5, null, null), 'rating');
  await safe(() => databases.createStringAttribute(databaseId, colId, 'body',      2000, false), 'body');
  await safe(() => databases.createStringAttribute(databaseId, colId, 'source',    50,   false), 'source');
  await safe(() => databases.createStringAttribute(databaseId, colId, 'date_label',100,  false), 'date_label');
  await safe(() => databases.createBooleanAttribute(databaseId, colId, 'is_active',false, true),  'is_active');
  await safe(() => databases.createIntegerAttribute(databaseId, colId, 'sort_order',false, 0),    'sort_order');

  console.log('\n✅ Reviews koleksiyonu hazır!');
  console.log(`\n👉 .env.local dosyasına şunu ekle:`);
  console.log(`   NEXT_PUBLIC_APPWRITE_COL_REVIEWS=${colId}\n`);
}

run().catch(e => { console.error('💥', e); process.exit(1); });
