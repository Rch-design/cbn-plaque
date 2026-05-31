import { databases, appwriteConfig, Query } from './appwrite';
import type {
  ServiceDoc,
  ProjectDoc,
  ProjectImageDoc,
  SettingDoc
} from './types';

const { databaseId, collections } = appwriteConfig;

function isConfigured(): boolean {
  return Boolean(appwriteConfig.projectId);
}

export async function getServices(activeOnly = true): Promise<ServiceDoc[]> {
  if (!isConfigured()) return [];
  try {
    // is_active attribute may not exist yet — query without it first, filter in memory
    const res = await databases.listDocuments(databaseId, collections.services, [
      Query.orderAsc('sort_order'),
      Query.limit(100)
    ]);
    const docs = res.documents as unknown as ServiceDoc[];
    return activeOnly ? docs.filter((d) => d.is_active !== false) : docs;
  } catch {
    return [];
  }
}

export async function getProjects(category?: string, activeOnly = true): Promise<ProjectDoc[]> {
  if (!isConfigured()) return [];
  try {
    const queries = [Query.orderAsc('sort_order'), Query.limit(100)];
    if (category && category !== 'all') queries.push(Query.equal('category', category));
    const res = await databases.listDocuments(databaseId, collections.projects, queries);
    const docs = res.documents as unknown as ProjectDoc[];
    return activeOnly ? docs.filter((d) => d.is_active !== false) : docs;
  } catch {
    return [];
  }
}

export async function getProject(id: string): Promise<ProjectDoc | null> {
  if (!isConfigured()) return null;
  try {
    const doc = await databases.getDocument(databaseId, collections.projects, id);
    return doc as unknown as ProjectDoc;
  } catch {
    return null;
  }
}

export async function getProjectImages(projectId: string): Promise<ProjectImageDoc[]> {
  if (!isConfigured()) return [];
  try {
    const res = await databases.listDocuments(databaseId, collections.projectImages, [
      Query.equal('project_id', projectId),
      Query.orderAsc('sort_order'),
      Query.limit(100)
    ]);
    return res.documents as unknown as ProjectImageDoc[];
  } catch {
    return [];
  }
}

export async function getSettings(): Promise<Record<string, SettingDoc>> {
  if (!isConfigured()) return {};
  try {
    const res = await databases.listDocuments(databaseId, collections.settings, [
      Query.limit(100)
    ]);
    const map: Record<string, SettingDoc> = {};
    for (const doc of res.documents as unknown as SettingDoc[]) {
      map[doc.key] = doc;
    }
    return map;
  } catch {
    return {};
  }
}

export async function getPages(publishedOnly = true): Promise<import('./types').PageDoc[]> {
  if (!isConfigured()) return [];
  try {
    const queries = [Query.orderAsc('sort_order'), Query.limit(100)];
    if (publishedOnly) queries.push(Query.equal('is_published', true));
    const res = await databases.listDocuments(databaseId, collections.pages, queries);
    return res.documents as unknown as import('./types').PageDoc[];
  } catch {
    return [];
  }
}

export async function getPage(slug: string): Promise<import('./types').PageDoc | null> {
  if (!isConfigured()) return null;
  try {
    const res = await databases.listDocuments(databaseId, collections.pages, [
      Query.equal('slug', slug),
      Query.limit(1)
    ]);
    return (res.documents[0] as unknown as import('./types').PageDoc) ?? null;
  } catch {
    return null;
  }
}

export function settingValue(
  settings: Record<string, SettingDoc>,
  key: string,
  locale: string,
  fallback = ''
): string {
  const doc = settings[key];
  if (!doc) return fallback;
  const localized = locale === 'tr' ? doc.value_tr : doc.value_fr;
  return localized || doc.value_fr || fallback;
}
