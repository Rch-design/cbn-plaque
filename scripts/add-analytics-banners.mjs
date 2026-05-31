/**
 * analytics + banners koleksiyonlarini Appwrite'a ekler.
 * Kullanim: node scripts/add-analytics-banners.mjs
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

const endpoint   = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT    || 'https://cloud.appwrite.io/v1';
const projectId  = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID  || '';
const apiKey     = process.env.APPWRITE_API_KEY                 || '';
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'main';

if (!projectId || !apiKey) { console.error('❌ PROJECT_ID ve APPWRITE_API_KEY gerekli!'); process.exit(1); }

const client    = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const databases = new Databases(client);

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function safe(fn, label) {
  try { await fn(); console.log(`  ✅ ${label}`); }
  catch (e) {
    const msg = e?.response?.message || e?.message || String(e);
    if (msg.includes('already exists')) console.log(`  ⏭️  ${label} — zaten var`);
    else console.error(`  ❌ ${label}: ${msg}`);
  }
  await sleep(600);
}

async function run() {
  console.log('\n📊 Analytics + 🎯 Banners Kurulumu\n');

  // ── analytics ──
  const anlCol = 'analytics';
  await safe(() => databases.createCollection(databaseId, anlCol, 'Analytics', [
    Permission.read(Role.any()),
    Permission.write(Role.any())
  ], false), `koleksiyon "${anlCol}"`);
  await safe(() => databases.createStringAttribute(databaseId, anlCol, 'date',  20, true),  'date');
  await safe(() => databases.createStringAttribute(databaseId, anlCol, 'page', 200, true),  'page');
  await safe(() => databases.createIntegerAttribute(databaseId, anlCol, 'views', true, 1),  'views');
  // composite index for fast lookup
  await safe(() => databases.createIndex(databaseId, anlCol, 'date_page', 'key', ['date', 'page']), 'index date_page');

  // ── banners ──
  const banCol = 'banners';
  await safe(() => databases.createCollection(databaseId, banCol, 'Banners', [
    Permission.read(Role.any()),
    Permission.write(Role.users())
  ], false), `koleksiyon "${banCol}"`);
  await safe(() => databases.createStringAttribute(databaseId, banCol, 'title',       200, true),  'title');
  await safe(() => databases.createStringAttribute(databaseId, banCol, 'subtitle',    500, false), 'subtitle');
  await safe(() => databases.createStringAttribute(databaseId, banCol, 'cta_text',    100, false), 'cta_text');
  await safe(() => databases.createStringAttribute(databaseId, banCol, 'cta_link',    300, false), 'cta_link');
  await safe(() => databases.createStringAttribute(databaseId, banCol, 'bg_color',     20, false), 'bg_color');
  await safe(() => databases.createStringAttribute(databaseId, banCol, 'text_color',   20, false), 'text_color');
  await safe(() => databases.createStringAttribute(databaseId, banCol, 'image_file_id',100, false), 'image_file_id');
  await safe(() => databases.createStringAttribute(databaseId, banCol, 'pages',        500, false), 'pages');
  await safe(() => databases.createBooleanAttribute(databaseId, banCol, 'is_active', false, true), 'is_active');
  await safe(() => databases.createIntegerAttribute(databaseId, banCol, 'sort_order', false, 0),   'sort_order');

  console.log('\n✅ Tüm koleksiyonlar hazır!');
  console.log('\n👉 .env.local dosyasına ekle:');
  console.log('   NEXT_PUBLIC_APPWRITE_COL_ANALYTICS=analytics');
  console.log('   NEXT_PUBLIC_APPWRITE_COL_BANNERS=banners\n');
}

run().catch(e => { console.error('💥', e); process.exit(1); });
