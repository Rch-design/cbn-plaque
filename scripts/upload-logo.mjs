/**
 * Logo dosyasini Appwrite'a yukler ve design_logo_file_id ayarini gunceller.
 * Kullanim: npm run upload:logo
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client, Databases, Storage, ID, Query, Permission, Role } from 'node-appwrite';
import { InputFile } from 'node-appwrite/file';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const path = join(__dirname, '..', '.env.local');
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
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

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const apiKey = process.env.APPWRITE_API_KEY || '';
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'main';
const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || 'project-images';
const settingsCol = process.env.NEXT_PUBLIC_APPWRITE_COL_SETTINGS || 'site_settings';
const logoPath = join(__dirname, '..', 'public', 'logo.png');

if (!projectId || !apiKey) {
  console.error('❌ APPWRITE_API_KEY ve PROJECT_ID gerekli');
  process.exit(1);
}

if (!existsSync(logoPath)) {
  console.error('❌ public/logo.png bulunamadi');
  process.exit(1);
}

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const storage = new Storage(client);
const databases = new Databases(client);

async function findSetting() {
  const res = await databases.listDocuments(databaseId, settingsCol, [
    Query.equal('key', 'design_logo_file_id'),
    Query.limit(1)
  ]);
  return res.documents[0] ?? null;
}

async function run() {
  console.log('\n🖼️  Logo yukleniyor...\n');

  const existing = await findSetting();
  const oldFileId = existing?.value_fr;
  if (oldFileId) {
    try {
      await storage.deleteFile(bucketId, oldFileId);
    } catch {
      /* ignore */
    }
  }

  const uploaded = await storage.createFile(
    bucketId,
    ID.unique(),
    InputFile.fromPath(logoPath, 'logo.png'),
    [Permission.read(Role.any())]
  );

  const payload = { value_fr: uploaded.$id, value_tr: uploaded.$id };
  if (existing) {
    await databases.updateDocument(databaseId, settingsCol, existing.$id, payload);
  } else {
    await databases.createDocument(
      databaseId,
      settingsCol,
      ID.unique(),
      { key: 'design_logo_file_id', ...payload },
      [Permission.read(Role.any())]
    );
  }

  console.log(`  ✅ Logo yuklendi: ${uploaded.$id}`);
  console.log('  ✅ Ayar design_logo_file_id guncellendi');
  console.log('\n  Statik yedek: https://www.cbnplaque.com/logo.png\n');
}

run().catch((e) => {
  console.error('❌', e?.message || e);
  process.exit(1);
});
