import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client, Databases, Query } from 'node-appwrite';

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
const colId = process.env.NEXT_PUBLIC_APPWRITE_COL_PROJECTS || 'projects';

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const databases = new Databases(client);

const res = await databases.listDocuments(databaseId, colId, [Query.limit(100)]);
const active = res.documents.filter((d) => d.is_active !== false);

console.log('\nReferans URL\'leri (FR):\n');
for (const d of active) {
  console.log(`https://www.cbnplaque.com/realisations/${d.$id}`);
}
console.log('\nReferans URL\'leri (TR):\n');
for (const d of active) {
  console.log(`https://www.cbnplaque.com/tr/realisations/${d.$id}`);
}
console.log(`\nToplam: ${active.length} proje (${active.length * 2} URL)\n`);
