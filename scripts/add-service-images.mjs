/**
 * Appwrite'a service_images koleksiyonunu ekler.
 * Çalıştır: node scripts/add-service-images.mjs
 */
import { Client, Databases } from 'node-appwrite';
import 'dotenv/config';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? '')
  .setKey(process.env.APPWRITE_API_KEY ?? '');

const databases = new Databases(client);
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? 'main';
const colId = process.env.NEXT_PUBLIC_APPWRITE_COL_SERVICE_IMAGES ?? 'service_images';

async function safe(fn, label) {
  try {
    await fn();
    console.log(`✓ ${label}`);
  } catch (e) {
    if (e.code === 409) console.log(`↷ ${label} (zaten var)`);
    else console.error(`✗ ${label}:`, e.message);
  }
}

(async () => {
  console.log('service_images koleksiyonu oluşturuluyor…');

  await safe(
    () => databases.createCollection(databaseId, colId, 'Service Images',
      [
        `read("any")`,
        `create("users")`,
        `update("users")`,
        `delete("users")`
      ],
      false
    ),
    'collection service_images'
  );

  await safe(
    () => databases.createStringAttribute(databaseId, colId, 'service_id', 255, true),
    'attr service_id'
  );
  await safe(
    () => databases.createStringAttribute(databaseId, colId, 'file_id', 255, true),
    'attr file_id'
  );
  await safe(
    () => databases.createIntegerAttribute(databaseId, colId, 'sort_order', false, 0),
    'attr sort_order'
  );

  // İndeks: service_id ile sorgulama için
  await safe(
    () => databases.createIndex(databaseId, colId, 'by_service', 'key', ['service_id'], ['ASC']),
    'index by_service'
  );

  // is_active ve image_file_id attribute'larını services koleksiyonuna ekle
  const servicesColId = process.env.NEXT_PUBLIC_APPWRITE_COL_SERVICES ?? 'services';
  await safe(
    () => databases.createBooleanAttribute(databaseId, servicesColId, 'is_active', false, true),
    'attr services.is_active'
  );
  await safe(
    () => databases.createStringAttribute(databaseId, servicesColId, 'image_file_id', 255, false),
    'attr services.image_file_id'
  );

  console.log('\n✅ Tamamlandı!');
  console.log('Şimdi .env.local dosyanıza şu satırı ekleyin:');
  console.log('NEXT_PUBLIC_APPWRITE_COL_SERVICE_IMAGES=service_images');
})();
