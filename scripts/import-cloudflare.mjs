/**
 * `migration-data/` icerigini Cloudflare'e yazar:
 *   - dosyalari R2'ye yukler
 *   - kayitlari D1'e yazar, gorsel alanlarini yeni R2 anahtarlariyla degistirir
 *
 * Tekrar calistirilabilir (INSERT OR REPLACE).
 * Kullanim: npm run migrate:import
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadEnv, requireEnv, d1, r2Put, ROOT, bool } from './lib/cf.mjs';

loadEnv();
requireEnv(
  'CLOUDFLARE_ACCOUNT_ID',
  'CLOUDFLARE_D1_DATABASE_ID',
  'CLOUDFLARE_API_TOKEN',
  'R2_BUCKET',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY'
);

const OUT = join(ROOT, 'migration-data');
if (!existsSync(OUT)) {
  console.error('\nmigration-data klasoru yok. Once: npm run migrate:export\n');
  process.exit(1);
}

const read = (name) => JSON.parse(readFileSync(join(OUT, 'collections', `${name}.json`), 'utf8'));
const fileMap = JSON.parse(readFileSync(join(OUT, 'file-map.json'), 'utf8'));

/** Appwrite file_id -> R2 anahtari. Bilinmeyen id bos string olur. */
function key(fileId) {
  const id = (fileId ?? '').trim();
  if (!id) return '';
  const entry = fileMap[id];
  if (!entry) {
    console.log(`  uyari: ${id} icin dosya bulunamadi, alan bosaltildi`);
    return '';
  }
  return entry.key;
}

const str = (v) => (v === null || v === undefined ? '' : String(v));
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const ts = (v) => str(v) || new Date().toISOString();

/* ------------------------------ 1) R2 yukleme ----------------------------- */

console.log('\nGorseller R2\'ye yukleniyor...\n');

let uploaded = 0;
const entries = Object.entries(fileMap);
for (const [fileId, meta] of entries) {
  const path = join(OUT, 'files', meta.localFile);
  if (!existsSync(path)) {
    console.log(`  ATLANDI  ${fileId} (yerel dosya yok)`);
    continue;
  }
  try {
    await r2Put(meta.key, readFileSync(path), meta.mime);
    uploaded++;
    console.log(`  ${String(uploaded).padStart(4)}/${entries.length}  ${meta.key}`);
  } catch (e) {
    console.error(`  HATA  ${meta.key}: ${e.message}`);
    process.exit(1);
  }
}

/* ------------------------------- 2) D1 yazma ------------------------------ */

console.log('\nKayitlar D1\'e yaziliyor...\n');

async function insertAll(label, rows, sql, toParams) {
  for (const row of rows) await d1(sql, toParams(row));
  console.log(`  ${String(rows.length).padStart(4)} kayit  ${label}`);
  return rows.length;
}

const stats = {};

stats.services = await insertAll(
  'services',
  read('services'),
  `INSERT OR REPLACE INTO services
     (id, title_fr, title_tr, desc_fr, desc_tr, icon, image_file_id, sort_order, is_active, created_at, updated_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  (d) => [
    d.$id,
    str(d.title_fr), str(d.title_tr), str(d.desc_fr), str(d.desc_tr),
    str(d.icon), key(d.image_file_id), num(d.sort_order),
    bool(d.is_active !== false), ts(d.$createdAt), ts(d.$updatedAt)
  ]
);

stats.projects = await insertAll(
  'projects',
  read('projects'),
  `INSERT OR REPLACE INTO projects
     (id, title_fr, title_tr, desc_fr, desc_tr, category, cover_file_id, sort_order, is_active, created_at, updated_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  (d) => [
    d.$id,
    str(d.title_fr), str(d.title_tr), str(d.desc_fr), str(d.desc_tr),
    str(d.category), key(d.cover_file_id), num(d.sort_order),
    bool(d.is_active !== false), ts(d.$createdAt), ts(d.$updatedAt)
  ]
);

// project_images projects'ten sonra gelmeli (foreign key).
const projectIds = new Set(read('projects').map((p) => p.$id));
const images = read('project_images').filter((img) => {
  if (projectIds.has(str(img.project_id))) return true;
  console.log(`  uyari: ${img.$id} sahipsiz (project_id=${img.project_id}), atlandi`);
  return false;
});

stats.project_images = await insertAll(
  'project_images',
  images,
  `INSERT OR REPLACE INTO project_images (id, project_id, file_id, sort_order, created_at)
   VALUES (?, ?, ?, ?, ?)`,
  (d) => [d.$id, str(d.project_id), key(d.file_id), num(d.sort_order), ts(d.$createdAt)]
);

stats.messages = await insertAll(
  'messages',
  read('messages'),
  `INSERT OR REPLACE INTO messages (id, name, email, phone, body, is_read, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
  (d) => [
    d.$id, str(d.name), str(d.email), str(d.phone), str(d.body),
    bool(d.is_read === true, 0), ts(d.$createdAt)
  ]
);

// design_logo_file_id degeri bir dosya kimligi tutar; R2 anahtarina cevrilir.
stats.settings = await insertAll(
  'settings',
  read('settings'),
  `INSERT OR REPLACE INTO settings (id, key, value_fr, value_tr, updated_at)
   VALUES (?, ?, ?, ?, ?)`,
  (d) => {
    const isLogo = d.key === 'design_logo_file_id';
    return [
      d.$id,
      str(d.key),
      isLogo ? key(d.value_fr) : str(d.value_fr),
      isLogo ? key(d.value_tr) : str(d.value_tr),
      ts(d.$updatedAt)
    ];
  }
);

stats.pages = await insertAll(
  'pages',
  read('pages'),
  `INSERT OR REPLACE INTO pages
     (id, slug, title_fr, title_tr, content_fr, content_tr, is_published, sort_order, created_at, updated_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  (d) => [
    d.$id, str(d.slug), str(d.title_fr), str(d.title_tr),
    str(d.content_fr), str(d.content_tr),
    bool(d.is_published !== false), num(d.sort_order), ts(d.$createdAt), ts(d.$updatedAt)
  ]
);

stats.reviews = await insertAll(
  'reviews',
  read('reviews'),
  `INSERT OR REPLACE INTO reviews
     (id, name, rating, body, source, date_label, is_active, sort_order, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  (d) => [
    d.$id, str(d.name), num(d.rating) || 5, str(d.body), str(d.source), str(d.date_label),
    bool(d.is_active !== false), num(d.sort_order), ts(d.$createdAt)
  ]
);

stats.analytics = await insertAll(
  'analytics',
  read('analytics'),
  `INSERT OR REPLACE INTO analytics (id, date, page, views) VALUES (?, ?, ?, ?)`,
  (d) => [d.$id, str(d.date), str(d.page), num(d.views)]
);

stats.banners = await insertAll(
  'banners',
  read('banners'),
  `INSERT OR REPLACE INTO banners
     (id, title, subtitle, cta_text, cta_link, bg_color, text_color, image_file_id, pages, is_active, sort_order, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  (d) => [
    d.$id, str(d.title), str(d.subtitle), str(d.cta_text), str(d.cta_link),
    str(d.bg_color), str(d.text_color), key(d.image_file_id),
    str(d.pages) || 'all', bool(d.is_active !== false), num(d.sort_order), ts(d.$createdAt)
  ]
);

/* ------------------------------- 3) dogrulama ----------------------------- */

console.log('\nDogrulama...\n');

const tables = ['services', 'projects', 'project_images', 'messages', 'settings', 'pages', 'reviews', 'analytics', 'banners'];
let mismatch = 0;

for (const table of tables) {
  const [{ n }] = await d1(`SELECT COUNT(*) AS n FROM ${table}`);
  const expected = stats[table] ?? 0;
  const ok = Number(n) >= expected;
  if (!ok) mismatch++;
  console.log(`  ${ok ? 'ok  ' : 'HATA'} ${table}: D1'de ${n}, aktarilan ${expected}`);
}

const [{ n: missingCovers }] = await d1(
  "SELECT COUNT(*) AS n FROM projects WHERE cover_file_id = '' AND is_active = 1"
);
const [{ n: logoRows }] = await d1(
  "SELECT COUNT(*) AS n FROM settings WHERE key = 'design_logo_file_id' AND value_fr != ''"
);

console.log(`\n  gorseli olmayan aktif proje: ${missingCovers}`);
console.log(`  logo ayari: ${logoRows ? 'var' : 'yok'}`);
console.log(`  R2'ye yuklenen dosya: ${uploaded}/${entries.length}`);

if (mismatch) {
  console.error('\nBazi tablolar eksik. Yukaridaki HATA satirlarina bakin.\n');
  process.exit(1);
}
console.log('\nAktarim tamam. Sonraki adim: npm run build\n');
