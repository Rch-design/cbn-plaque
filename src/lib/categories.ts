/**
 * Proje kategorileri — saf yardımcılar.
 *
 * Bu dosya tarayıcıda da import edildiği için veritabanına dokunmaz.
 * Kategorileri okumak: `getCategories()` (src/lib/data.ts),
 * yazmak: `PUT /api/admin/categories`.
 */
import type { ProjectCategory } from './types';
import { DEFAULT_CATEGORIES } from './types';

export const CATEGORIES_SETTING_KEY = 'project_categories';

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

/** settings.project_categories JSON metnini güvenli biçimde çözer. */
export function parseCategories(raw?: string | null): ProjectCategory[] {
  const text = (raw ?? '').trim();
  if (!text) return DEFAULT_CATEGORIES;
  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_CATEGORIES;
    return parsed as ProjectCategory[];
  } catch {
    return DEFAULT_CATEGORIES;
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
