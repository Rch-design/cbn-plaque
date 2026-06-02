/**
 * SEO sablon sayfalarini Appwrite'a yayinlar.
 * Kullanim: npm run seed:seo-pages
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Client, Databases, ID, Query } from 'node-appwrite';
import { PAGE_TEMPLATES } from '../src/lib/seo-pages-data.mjs';

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
const colId = process.env.NEXT_PUBLIC_APPWRITE_COL_PAGES || 'pages';

if (!projectId || !apiKey) {
  console.error('❌ NEXT_PUBLIC_APPWRITE_PROJECT_ID ve APPWRITE_API_KEY gerekli (.env.local)');
  process.exit(1);
}

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const databases = new Databases(client);

async function findBySlug(slug) {
  const res = await databases.listDocuments(databaseId, colId, [
    Query.equal('slug', slug),
    Query.limit(1)
  ]);
  return res.documents[0] ?? null;
}

async function run() {
  console.log('\n📄 CBN Plaque — SEO sayfalari yayinlaniyor...\n');

  let order = 0;
  for (const tpl of PAGE_TEMPLATES) {
    const payload = {
      slug: tpl.slug,
      title_fr: tpl.title_fr,
      title_tr: tpl.title_tr,
      content_fr: tpl.content_fr,
      content_tr: tpl.content_tr,
      is_published: true,
      sort_order: order++
    };

    const existing = await findBySlug(tpl.slug);
    if (existing) {
      await databases.updateDocument(databaseId, colId, existing.$id, payload);
      console.log(`  ✏️  Guncellendi: /${tpl.slug}`);
    } else {
      await databases.createDocument(databaseId, colId, ID.unique(), payload);
      console.log(`  ✅ Olusturuldu: /${tpl.slug}`);
    }
  }

  console.log('\n🌐 Canli URL\'ler:');
  for (const tpl of PAGE_TEMPLATES) {
    console.log(`   https://www.cbnplaque.com/${tpl.slug}`);
  }
  console.log('\n✅ Tamam!\n');
}

run().catch((e) => {
  console.error('❌ Hata:', e?.message || e);
  process.exit(1);
});
