/**
 * Appwrite'taki tum veriyi ve dosyalari yerel `migration-data/` klasorune indirir.
 * Appwrite REST API kullanir (SDK gerekmez).
 *
 * Cikti:
 *   migration-data/collections/<ad>.json
 *   migration-data/files/<fileId>.<uzanti>
 *   migration-data/file-map.json     ({ fileId: { key, name, mime, size } })
 *
 * Kullanim: npm run migrate:export
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadEnv, requireEnv, ROOT, extFromMime } from './lib/cf.mjs';

loadEnv();
requireEnv('NEXT_PUBLIC_APPWRITE_PROJECT_ID', 'APPWRITE_API_KEY');

const endpoint = (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/+$/, '');
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID.trim();
const apiKey = process.env.APPWRITE_API_KEY.trim();
const databaseId = (process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'main').trim();
const bucketId = (process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || 'project-images').trim();

const OUT = join(ROOT, 'migration-data');
const COLLECTIONS_DIR = join(OUT, 'collections');
const FILES_DIR = join(OUT, 'files');

const COLLECTIONS = [
  ['services', process.env.NEXT_PUBLIC_APPWRITE_COL_SERVICES || 'services'],
  ['projects', process.env.NEXT_PUBLIC_APPWRITE_COL_PROJECTS || 'projects'],
  ['project_images', process.env.NEXT_PUBLIC_APPWRITE_COL_PROJECT_IMAGES || 'project_images'],
  ['messages', process.env.NEXT_PUBLIC_APPWRITE_COL_MESSAGES || 'messages'],
  ['settings', process.env.NEXT_PUBLIC_APPWRITE_COL_SETTINGS || 'site_settings'],
  ['pages', process.env.NEXT_PUBLIC_APPWRITE_COL_PAGES || 'pages'],
  ['reviews', process.env.NEXT_PUBLIC_APPWRITE_COL_REVIEWS || 'reviews'],
  ['analytics', process.env.NEXT_PUBLIC_APPWRITE_COL_ANALYTICS || 'analytics'],
  ['banners', process.env.NEXT_PUBLIC_APPWRITE_COL_BANNERS || 'banners']
];

const headers = { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey };

async function api(path, params = []) {
  const query = params.map((p) => `queries[]=${encodeURIComponent(JSON.stringify(p))}`).join('&');
  const url = `${endpoint}${path}${query ? `?${query}` : ''}`;
  const res = await fetch(url, { headers });
  const text = await res.text();

  if (!res.ok) {
    let message = text.slice(0, 300);
    try {
      message = JSON.parse(text).message ?? message;
    } catch {}
    if (message.includes('paused')) {
      console.error('\nAppwrite projesi duraklatilmis durumda.');
      console.error('https://cloud.appwrite.io/console adresinden Restore edip tekrar deneyin.\n');
      process.exit(1);
    }
    throw new Error(`Appwrite ${res.status}: ${message}`);
  }
  return JSON.parse(text);
}

/** Appwrite sayfa basina en fazla 100 kayit doner; hepsini toplar. */
async function listAll(path, key) {
  const out = [];
  for (let offset = 0; ; offset += 100) {
    const page = await api(path, [
      { method: 'limit', values: [100] },
      { method: 'offset', values: [offset] }
    ]);
    const items = page[key] ?? [];
    out.push(...items);
    if (items.length < 100) break;
  }
  return out;
}

for (const dir of [OUT, COLLECTIONS_DIR, FILES_DIR]) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

console.log('\nAppwrite disa aktarimi basliyor...\n');

/* ------------------------------ koleksiyonlar ----------------------------- */

const counts = {};
for (const [name, collectionId] of COLLECTIONS) {
  try {
    const docs = await listAll(
      `/databases/${databaseId}/collections/${collectionId}/documents`,
      'documents'
    );
    writeFileSync(join(COLLECTIONS_DIR, `${name}.json`), JSON.stringify(docs, null, 2), 'utf8');
    counts[name] = docs.length;
    console.log(`  ${String(docs.length).padStart(4)} kayit  ${name}`);
  } catch (e) {
    counts[name] = 0;
    writeFileSync(join(COLLECTIONS_DIR, `${name}.json`), '[]', 'utf8');
    console.log(`     0 kayit  ${name}  (${e.message})`);
  }
}

/* --------------------------------- dosyalar -------------------------------- */

console.log('\nDosyalar indiriliyor...\n');

const files = await listAll(`/storage/buckets/${bucketId}/files`, 'files');
const fileMap = {};
let downloaded = 0;

for (const file of files) {
  const ext = extFromMime(file.mimeType) === 'bin'
    ? (file.name.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase() ?? 'bin')
    : extFromMime(file.mimeType);
  const key = `images/${file.$id}.${ext}`;

  const res = await fetch(
    `${endpoint}/storage/buckets/${bucketId}/files/${file.$id}/download`,
    { headers }
  );
  if (!res.ok) {
    console.log(`  ATLANDI  ${file.$id} (${res.status})`);
    continue;
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(join(FILES_DIR, `${file.$id}.${ext}`), buffer);

  fileMap[file.$id] = {
    key,
    name: file.name,
    mime: file.mimeType || 'application/octet-stream',
    size: buffer.length,
    localFile: `${file.$id}.${ext}`
  };
  downloaded++;
  console.log(`  ${String(downloaded).padStart(4)}/${files.length}  ${file.$id}  ${file.name}`);
}

writeFileSync(join(OUT, 'file-map.json'), JSON.stringify(fileMap, null, 2), 'utf8');

/* ---------------------------------- ozet ---------------------------------- */

writeFileSync(
  join(OUT, 'summary.json'),
  JSON.stringify({ exportedAt: new Date().toISOString(), counts, files: downloaded }, null, 2),
  'utf8'
);

console.log('\n--- Ozet ---');
for (const [name, n] of Object.entries(counts)) console.log(`  ${name}: ${n}`);
console.log(`  dosya: ${downloaded}/${files.length}`);
console.log('\nSonraki adim: npm run migrate:import\n');
