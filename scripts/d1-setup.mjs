/**
 * schema.sql dosyasini Cloudflare D1'e uygular.
 * Kullanim: npm run db:setup
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadEnv, requireEnv, d1, ROOT } from './lib/cf.mjs';

loadEnv();
requireEnv('CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_D1_DATABASE_ID', 'CLOUDFLARE_API_TOKEN');

/** Yorumlari atar, ifadeleri noktali virgulden ayirir. */
function statements(sql) {
  return sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
}

const sql = readFileSync(join(ROOT, 'schema.sql'), 'utf8');
const list = statements(sql);

console.log(`\nD1 semasi uygulaniyor (${list.length} ifade)...\n`);

let created = 0;
for (const stmt of list) {
  const label = stmt.replace(/\s+/g, ' ').slice(0, 60);
  try {
    await d1(stmt);
    created++;
    console.log(`  ok   ${label}`);
  } catch (e) {
    console.error(`  HATA ${label}`);
    console.error(`       ${e.message}`);
    process.exit(1);
  }
}

const tables = await d1(
  "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf%' ORDER BY name"
);

console.log(`\n${created} ifade calisti. Tablolar:`);
for (const t of tables) console.log(`  - ${t.name}`);
console.log('\nSonraki adim: npm run admin:create\n');
