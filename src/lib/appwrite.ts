import { Client, Account, Databases, Storage } from 'appwrite';

export const appwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? 'https://cloud.appwrite.io/v1',
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? '',
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? 'main',
  bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID ?? 'project-images',
  collections: {
    services: process.env.NEXT_PUBLIC_APPWRITE_COL_SERVICES ?? 'services',
    projects: process.env.NEXT_PUBLIC_APPWRITE_COL_PROJECTS ?? 'projects',
    projectImages: process.env.NEXT_PUBLIC_APPWRITE_COL_PROJECT_IMAGES ?? 'project_images',
    messages: process.env.NEXT_PUBLIC_APPWRITE_COL_MESSAGES ?? 'messages',
    settings: process.env.NEXT_PUBLIC_APPWRITE_COL_SETTINGS ?? 'site_settings',
    pages:     process.env.NEXT_PUBLIC_APPWRITE_COL_PAGES     ?? 'pages',
    reviews:   process.env.NEXT_PUBLIC_APPWRITE_COL_REVIEWS   ?? 'reviews',
    analytics: process.env.NEXT_PUBLIC_APPWRITE_COL_ANALYTICS ?? 'analytics',
    banners:   process.env.NEXT_PUBLIC_APPWRITE_COL_BANNERS   ?? 'banners'
  }
};

export const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export function fileViewUrl(fileId: string): string {
  if (!fileId) return '';
  return `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.bucketId}/files/${fileId}/view?project=${appwriteConfig.projectId}`;
}

/** Appwrite logo ID yoksa statik public/logo.png */
export function resolveLogoUrl(fileId?: string | null): string {
  if (fileId?.trim()) return fileViewUrl(fileId.trim());
  return '/logo.png';
}

export { ID, Query, Permission, Role } from 'appwrite';
