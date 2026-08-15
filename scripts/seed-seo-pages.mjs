/**
 * SEO sablon sayfalarini Cloudflare D1'e yayinlar.
 * Kullanim: npm run seed:seo-pages
 */
import { randomBytes } from 'node:crypto';
import { loadEnv, requireEnv, d1 } from './lib/cf.mjs';
import { PAGE_TEMPLATES } from '../src/lib/seo-pages-data.mjs';

loadEnv();
requireEnv('CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_D1_DATABASE_ID', 'CLOUDFLARE_API_TOKEN');

console.log('\nSEO sayfalari yayinlaniyor...\n');

let order = 0;
for (const tpl of PAGE_TEMPLATES) {
  const existing = await d1('SELECT id FROM pages WHERE slug = ? LIMIT 1', [tpl.slug]);
  const values = [
    tpl.title_fr,
    tpl.title_tr,
    tpl.content_fr,
    tpl.content_tr,
    order++
  ];

  if (existing.length) {
    await d1(
      `UPDATE pages SET title_fr = ?, title_tr = ?, content_fr = ?, content_tr = ?,
         sort_order = ?, is_published = 1, updated_at = datetime('now')
       WHERE slug = ?`,
      [...values, tpl.slug]
    );
    console.log(`  guncellendi  /${tpl.slug}`);
  } else {
    await d1(
      `INSERT INTO pages (id, slug, title_fr, title_tr, content_fr, content_tr, sort_order, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [randomBytes(16).toString('hex'), tpl.slug, ...values]
    );
    console.log(`  olusturuldu  /${tpl.slug}`);
  }
}

console.log('\nCanli URL\'ler:');
for (const tpl of PAGE_TEMPLATES) console.log(`  https://www.cbnplaque.com/${tpl.slug}`);
console.log('');
