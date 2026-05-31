/**
 * Migration: is_active ve image_file_id attribute'larini ekler.
 * Mevcut koleksiyonlara dokunmaz, sadece eksik attribute'ları ekler.
 *
 * Kullanım: npm run migrate:attributes
 */

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Client, Databases } from 'node-appwrite';

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

const endpoint  = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT  || 'https://cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const apiKey    = process.env.APPWRITE_API_KEY || '';
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'cbn_db';

const COL = {
  services:  process.env.NEXT_PUBLIC_APPWRITE_COL_SERVICES  || 'services',
  projects:  process.env.NEXT_PUBLIC_APPWRITE_COL_PROJECTS  || 'projects',
};

if (!projectId || !apiKey) {
  console.error('❌ NEXT_PUBLIC_APPWRITE_PROJECT_ID ve APPWRITE_API_KEY gerekli!');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

async function safe(fn, label) {
  try {
    await fn();
    console.log(`  ✅ ${label}`);
  } catch (e) {
    const msg = e?.response?.message || e?.message || String(e);
    if (msg.includes('already exists') || msg.includes('Attribute with the requested ID already exists')) {
      console.log(`  ⏭️  ${label} — zaten var, atlandı`);
    } else {
      console.error(`  ❌ ${label}: ${msg}`);
    }
  }
  // Appwrite attribute işlemlerini sırayla bekle
  await new Promise(r => setTimeout(r, 800));
}

async function run() {
  console.log('\n🔧 CBN Plaque — Attribute Migration\n');
  console.log(`📡 Endpoint  : ${endpoint}`);
  console.log(`🗄️  Database  : ${databaseId}`);
  console.log('');

  console.log('📋 services koleksiyonuna attribute ekleniyor...');
  await safe(
    () => databases.createBooleanAttribute(databaseId, COL.services, 'is_active', false, true),
    'services.is_active (boolean)'
  );
  await safe(
    () => databases.createStringAttribute(databaseId, COL.services, 'image_file_id', 255, false),
    'services.image_file_id (string)'
  );

  console.log('\n📋 projects koleksiyonuna attribute ekleniyor...');
  await safe(
    () => databases.createBooleanAttribute(databaseId, COL.projects, 'is_active', false, true),
    'projects.is_active (boolean)'
  );

  console.log('\n✅ Migration tamamlandı!');
  console.log('');
  console.log('⚠️  Appwrite attribute\'ları aktif hale gelene kadar ~30 saniye bekleyin,');
  console.log('   ardından admin panelinden yeniden kaydetmeyi deneyin.');
  console.log('');
}

run().catch(e => {
  console.error('💥 Kritik hata:', e);
  process.exit(1);
});
