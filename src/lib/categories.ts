import { databases, appwriteConfig, ID, Query } from './appwrite';
import { Permission, Role } from 'appwrite';
import type { ProjectCategory } from './types';
import { DEFAULT_CATEGORIES } from './types';

const SETTING_KEY = 'project_categories';

export const CAT_COLOR_CLASS: Record<ProjectCategory['color'], string> = {
  orange: 'bg-orange-100 text-orange-700',
  blue:   'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  green:  'bg-green-100 text-green-700',
  red:    'bg-red-100 text-red-700',
  pink:   'bg-pink-100 text-pink-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  gray:   'bg-gray-100 text-gray-600'
};

export const COLOR_OPTIONS: { value: ProjectCategory['color']; label: string; class: string }[] = [
  { value: 'orange', label: 'Turuncu', class: 'bg-orange-400' },
  { value: 'blue',   label: 'Mavi',    class: 'bg-blue-500' },
  { value: 'purple', label: 'Mor',     class: 'bg-purple-500' },
  { value: 'green',  label: 'Yeşil',   class: 'bg-green-500' },
  { value: 'red',    label: 'Kırmızı', class: 'bg-red-500' },
  { value: 'pink',   label: 'Pembe',   class: 'bg-pink-400' },
  { value: 'yellow', label: 'Sarı',    class: 'bg-yellow-400' },
  { value: 'gray',   label: 'Gri',     class: 'bg-gray-400' }
];

export async function loadCategories(): Promise<ProjectCategory[]> {
  try {
    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.collections.settings,
      [Query.equal('key', SETTING_KEY), Query.limit(1)]
    );
    if (res.documents.length > 0) {
      const raw = res.documents[0].value_fr as string;
      if (raw) return JSON.parse(raw) as ProjectCategory[];
    }
  } catch { /* ignore */ }
  return DEFAULT_CATEGORIES;
}

export async function saveCategories(cats: ProjectCategory[]): Promise<void> {
  const json = JSON.stringify(cats);
  const res = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.collections.settings,
    [Query.equal('key', SETTING_KEY), Query.limit(1)]
  );
  if (res.documents.length > 0) {
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.settings,
      res.documents[0].$id,
      { value_fr: json, value_tr: json }
    );
  } else {
    await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.settings,
      ID.unique(),
      { key: SETTING_KEY, value_fr: json, value_tr: json },
      [Permission.read(Role.any())]
    );
  }
}

export function getCatLabel(cats: ProjectCategory[], id: string, locale = 'fr'): string {
  const cat = cats.find((c) => c.id === id);
  if (!cat) return id;
  return locale === 'tr' ? cat.tr : cat.fr;
}

export function getCatColorClass(cats: ProjectCategory[], id: string): string {
  const cat = cats.find((c) => c.id === id);
  if (!cat) return CAT_COLOR_CLASS.gray;
  return CAT_COLOR_CLASS[cat.color] ?? CAT_COLOR_CLASS.gray;
}
