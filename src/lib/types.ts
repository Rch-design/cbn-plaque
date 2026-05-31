export type Category = 'mur' | 'plafond' | 'comble';

export interface ServiceDoc {
  $id: string;
  title_fr: string;
  title_tr: string;
  desc_fr: string;
  desc_tr: string;
  icon: string;
  sort_order: number;
}

export interface ProjectDoc {
  $id: string;
  title_fr: string;
  title_tr: string;
  desc_fr: string;
  desc_tr: string;
  category: Category;
  cover_file_id: string;
  sort_order: number;
  $createdAt: string;
}

export interface ProjectImageDoc {
  $id: string;
  project_id: string;
  file_id: string;
  sort_order: number;
}

export interface MessageDoc {
  $id: string;
  name: string;
  email: string;
  phone: string;
  body: string;
  is_read: boolean;
  $createdAt: string;
}

export interface SettingDoc {
  $id: string;
  key: string;
  value_fr: string;
  value_tr: string;
}

export interface PageDoc {
  $id: string;
  slug: string;
  title_fr: string;
  title_tr: string;
  content_fr: string;
  content_tr: string;
  is_published: boolean;
  sort_order: number;
}

export const CATEGORIES: Category[] = ['mur', 'plafond', 'comble'];

export function localized<T extends Record<string, unknown>>(
  doc: T,
  base: string,
  locale: string
): string {
  const key = `${base}_${locale}`;
  const fallback = `${base}_fr`;
  return (doc[key] as string) || (doc[fallback] as string) || '';
}
