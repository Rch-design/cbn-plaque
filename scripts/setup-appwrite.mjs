/**
 * Configuration automatique d'Appwrite pour CBN Plaque.
 *
 * Utilisation :
 *   1. Copiez .env.local.example vers .env.local et remplissez NEXT_PUBLIC_APPWRITE_PROJECT_ID
 *      ainsi que APPWRITE_API_KEY (cle serveur creee dans la console Appwrite).
 *   2. (Optionnel) Pour creer le compte admin, ajoutez ADMIN_EMAIL et ADMIN_PASSWORD dans .env.local.
 *   3. Lancez : npm run setup:appwrite
 */

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  Client,
  Databases,
  Storage,
  Users,
  Permission,
  Role,
  ID
} from 'node-appwrite';

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- Chargement simple de .env.local ---
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
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnv();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'main';
const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || 'project-images';

const COL = {
  services: process.env.NEXT_PUBLIC_APPWRITE_COL_SERVICES || 'services',
  projects: process.env.NEXT_PUBLIC_APPWRITE_COL_PROJECTS || 'projects',
  projectImages: process.env.NEXT_PUBLIC_APPWRITE_COL_PROJECT_IMAGES || 'project_images',
  messages: process.env.NEXT_PUBLIC_APPWRITE_COL_MESSAGES || 'messages',
  settings: process.env.NEXT_PUBLIC_APPWRITE_COL_SETTINGS || 'site_settings',
  pages: process.env.NEXT_PUBLIC_APPWRITE_COL_PAGES || 'pages'
};

if (!projectId || !apiKey) {
  console.error('\n[ERREUR] NEXT_PUBLIC_APPWRITE_PROJECT_ID et APPWRITE_API_KEY sont requis dans .env.local\n');
  process.exit(1);
}

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const databases = new Databases(client);
const storage = new Storage(client);
const users = new Users(client);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function ok(label) {
  console.log(`  ✓ ${label}`);
}

async function ignoreExists(promise, label) {
  try {
    await promise;
    ok(label);
  } catch (e) {
    if (e.code === 409) {
      console.log(`  • ${label} (existe déjà)`);
    } else {
      throw e;
    }
  }
}

const contentPerms = [
  Permission.read(Role.any()),
  Permission.create(Role.users()),
  Permission.update(Role.users()),
  Permission.delete(Role.users())
];

const messagePerms = [
  Permission.create(Role.any()),
  Permission.read(Role.users()),
  Permission.update(Role.users()),
  Permission.delete(Role.users())
];

async function str(col, key, size, required) {
  await ignoreExists(
    databases.createStringAttribute(databaseId, col, key, size, required),
    `attribut ${col}.${key}`
  );
  await sleep(400);
}

async function int(col, key, required, def) {
  await ignoreExists(
    databases.createIntegerAttribute(databaseId, col, key, required, undefined, undefined, def),
    `attribut ${col}.${key}`
  );
  await sleep(400);
}

async function bool(col, key, def) {
  await ignoreExists(
    databases.createBooleanAttribute(databaseId, col, key, false, def),
    `attribut ${col}.${key}`
  );
  await sleep(400);
}

async function main() {
  console.log(`\nConfiguration Appwrite (projet ${projectId})\n`);

  // Database
  await ignoreExists(databases.create(databaseId, 'CBN Plaque'), `base de données "${databaseId}"`);

  // Collections
  await ignoreExists(
    databases.createCollection(databaseId, COL.services, 'Services', contentPerms, false),
    'collection services'
  );
  await ignoreExists(
    databases.createCollection(databaseId, COL.projects, 'Projects', contentPerms, false),
    'collection projects'
  );
  await ignoreExists(
    databases.createCollection(databaseId, COL.projectImages, 'Project Images', contentPerms, false),
    'collection project_images'
  );
  await ignoreExists(
    databases.createCollection(databaseId, COL.messages, 'Messages', messagePerms, false),
    'collection messages'
  );
  await ignoreExists(
    databases.createCollection(databaseId, COL.settings, 'Site Settings', contentPerms, false),
    'collection site_settings'
  );
  await ignoreExists(
    databases.createCollection(databaseId, COL.pages, 'Pages', contentPerms, false),
    'collection pages'
  );

  console.log('\nAttributs...');

  // services
  await str(COL.services, 'title_fr', 255, true);
  await str(COL.services, 'title_tr', 255, false);
  await str(COL.services, 'desc_fr', 2000, false);
  await str(COL.services, 'desc_tr', 2000, false);
  await str(COL.services, 'icon', 50, false);
  await int(COL.services, 'sort_order', false, 0);
  await safe(
    () => databases.createBooleanAttribute(databaseId, COL.services, 'is_active', false, true),
    'attr services.is_active'
  );
  await safe(
    () => databases.createStringAttribute(databaseId, COL.services, 'image_file_id', 255, false),
    'attr services.image_file_id'
  );

  // projects
  await str(COL.projects, 'title_fr', 255, true);
  await str(COL.projects, 'title_tr', 255, false);
  await str(COL.projects, 'desc_fr', 5000, false);
  await str(COL.projects, 'desc_tr', 5000, false);
  await str(COL.projects, 'category', 50, true);
  await str(COL.projects, 'cover_file_id', 255, false);
  await int(COL.projects, 'sort_order', false, 0);
  await safe(
    () => databases.createBooleanAttribute(databaseId, COL.projects, 'is_active', false, true),
    'attr projects.is_active'
  );

  // project_images
  await str(COL.projectImages, 'project_id', 255, true);
  await str(COL.projectImages, 'file_id', 255, true);
  await int(COL.projectImages, 'sort_order', false, 0);

  // messages
  await str(COL.messages, 'name', 255, true);
  await str(COL.messages, 'email', 255, true);
  await str(COL.messages, 'phone', 50, false);
  await str(COL.messages, 'body', 5000, true);
  await bool(COL.messages, 'is_read', false);

  // settings
  await str(COL.settings, 'key', 100, true);
  await str(COL.settings, 'value_fr', 2000, false);
  await str(COL.settings, 'value_tr', 2000, false);

  // pages
  await str(COL.pages, 'slug', 100, true);
  await str(COL.pages, 'title_fr', 255, true);
  await str(COL.pages, 'title_tr', 255, false);
  await str(COL.pages, 'content_fr', 50000, false);
  await str(COL.pages, 'content_tr', 50000, false);
  await bool(COL.pages, 'is_published', true);
  await int(COL.pages, 'sort_order', false, 0);

  console.log('\nStockage...');
  await ignoreExists(
    storage.createBucket(
      bucketId,
      'Project Images',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ],
      false, // fileSecurity
      true, // enabled
      undefined, // maximumFileSize (defaut)
      ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'],
      'gzip'
    ),
    `bucket "${bucketId}"`
  );

  // Compte admin (optionnel)
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    console.log('\nCompte administrateur...');
    await ignoreExists(
      users.create(ID.unique(), adminEmail, undefined, adminPassword, 'Admin'),
      `utilisateur ${adminEmail}`
    );
  } else {
    console.log('\n• Compte admin non créé (ajoutez ADMIN_EMAIL et ADMIN_PASSWORD pour le créer automatiquement).');
  }

  console.log('\n✅ Terminé ! Lancez maintenant : npm run dev\n');
}

main().catch((e) => {
  console.error('\n[ERREUR]', e.message || e);
  process.exit(1);
});
