/**
 * Genel site okuma katmanı — Cloudflare D1.
 *
 * Dönen nesneler Appwrite döneminden kalan `$id` / `$createdAt` alan
 * adlarını korur; böylece bileşenler değişmeden çalışır.
 *
 * Sonuçlar Next.js veri önbelleğinde tutulur ve admin bir kayıt
 * değiştirdiğinde `CONTENT_TAG` ile tazelenir (bkz. src/lib/revalidate.ts).
 */
import { unstable_cache } from 'next/cache';
import { d1Query, isD1Configured, toBool } from './d1';
import { CATEGORIES_SETTING_KEY, parseCategories } from './categories';
import type {
  ServiceDoc,
  ProjectDoc,
  ProjectImageDoc,
  SettingDoc,
  ReviewDoc,
  PageDoc,
  ProjectCategory
} from './types';

export const CONTENT_TAG = 'cbn-content';
const REVALIDATE_SECONDS = 300;

/* ------------------------------ satır eşleme ------------------------------ */

interface Row {
  [key: string]: unknown;
}

const s = (v: unknown): string => (v === null || v === undefined ? '' : String(v));
const n = (v: unknown): number => (Number.isFinite(Number(v)) ? Number(v) : 0);

function toService(r: Row): ServiceDoc {
  return {
    $id: s(r.id),
    $createdAt: s(r.created_at),
    $updatedAt: s(r.updated_at),
    title_fr: s(r.title_fr),
    title_tr: s(r.title_tr),
    desc_fr: s(r.desc_fr),
    desc_tr: s(r.desc_tr),
    icon: s(r.icon),
    image_file_id: s(r.image_file_id),
    sort_order: n(r.sort_order),
    is_active: toBool(r.is_active, true)
  };
}

function toProject(r: Row): ProjectDoc {
  return {
    $id: s(r.id),
    $createdAt: s(r.created_at),
    title_fr: s(r.title_fr),
    title_tr: s(r.title_tr),
    desc_fr: s(r.desc_fr),
    desc_tr: s(r.desc_tr),
    category: s(r.category),
    cover_file_id: s(r.cover_file_id),
    sort_order: n(r.sort_order),
    is_active: toBool(r.is_active, true)
  };
}

function toProjectImage(r: Row): ProjectImageDoc {
  return {
    $id: s(r.id),
    project_id: s(r.project_id),
    file_id: s(r.file_id),
    sort_order: n(r.sort_order)
  };
}

function toSetting(r: Row): SettingDoc {
  return {
    $id: s(r.id),
    key: s(r.key),
    value_fr: s(r.value_fr),
    value_tr: s(r.value_tr)
  };
}

function toReview(r: Row): ReviewDoc {
  return {
    $id: s(r.id),
    $createdAt: s(r.created_at),
    name: s(r.name),
    rating: n(r.rating),
    body: s(r.body),
    source: s(r.source),
    date_label: s(r.date_label),
    is_active: toBool(r.is_active, true),
    sort_order: n(r.sort_order)
  };
}

function toPage(r: Row): PageDoc {
  return {
    $id: s(r.id),
    slug: s(r.slug),
    title_fr: s(r.title_fr),
    title_tr: s(r.title_tr),
    content_fr: s(r.content_fr),
    content_tr: s(r.content_tr),
    is_published: toBool(r.is_published, true),
    sort_order: n(r.sort_order)
  };
}

export interface BannerDoc {
  $id: string;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  bg_color: string;
  text_color: string;
  image_file_id: string;
  pages: string;
  is_active: boolean;
  sort_order: number;
}

function toBanner(r: Row): BannerDoc {
  return {
    $id: s(r.id),
    title: s(r.title),
    subtitle: s(r.subtitle),
    cta_text: s(r.cta_text),
    cta_link: s(r.cta_link),
    bg_color: s(r.bg_color),
    text_color: s(r.text_color),
    image_file_id: s(r.image_file_id),
    pages: s(r.pages) || 'all',
    is_active: toBool(r.is_active, true),
    sort_order: n(r.sort_order)
  };
}

/* -------------------------------- önbellek -------------------------------- */

/**
 * D1 yapılandırılmamışsa ya da sorgu patlarsa site çökmemeli;
 * bölüm boş görünür.
 */
function cachedQuery<T>(
  name: string,
  run: (args: string[]) => Promise<T>,
  fallback: T
): (...args: string[]) => Promise<T> {
  const cached = unstable_cache(run, [name], {
    revalidate: REVALIDATE_SECONDS,
    tags: [CONTENT_TAG]
  });

  return async (...args: string[]) => {
    if (!isD1Configured()) return fallback;
    try {
      return await cached(args);
    } catch (e) {
      console.error(`[data] ${name}:`, e instanceof Error ? e.message : e);
      return fallback;
    }
  };
}

/* --------------------------------- okuma --------------------------------- */

const servicesQuery = cachedQuery(
  'services',
  async () =>
    (await d1Query('SELECT * FROM services ORDER BY sort_order ASC LIMIT 100')).map(toService),
  [] as ServiceDoc[]
);

export async function getServices(activeOnly = true): Promise<ServiceDoc[]> {
  const rows = await servicesQuery();
  return activeOnly ? rows.filter((d) => d.is_active !== false) : rows;
}

const projectsQuery = cachedQuery(
  'projects',
  async () =>
    (await d1Query('SELECT * FROM projects ORDER BY sort_order ASC LIMIT 200')).map(toProject),
  [] as ProjectDoc[]
);

export async function getProjects(category?: string, activeOnly = true): Promise<ProjectDoc[]> {
  let rows = await projectsQuery();
  if (category && category !== 'all') rows = rows.filter((d) => d.category === category);
  return activeOnly ? rows.filter((d) => d.is_active !== false) : rows;
}

export async function getProject(id: string): Promise<ProjectDoc | null> {
  const rows = await projectsQuery();
  return rows.find((p) => p.$id === id) ?? null;
}

const projectImagesQuery = cachedQuery(
  'project-images',
  async ([projectId]) =>
    (
      await d1Query(
        'SELECT * FROM project_images WHERE project_id = ? ORDER BY sort_order ASC LIMIT 100',
        [projectId]
      )
    ).map(toProjectImage),
  [] as ProjectImageDoc[]
);

export async function getProjectImages(projectId: string): Promise<ProjectImageDoc[]> {
  if (!projectId) return [];
  return projectImagesQuery(projectId);
}

const settingsQuery = cachedQuery(
  'settings',
  async () => {
    const map: Record<string, SettingDoc> = {};
    for (const row of await d1Query('SELECT * FROM settings LIMIT 200')) {
      const doc = toSetting(row);
      map[doc.key] = doc;
    }
    return map;
  },
  {} as Record<string, SettingDoc>
);

export async function getSettings(): Promise<Record<string, SettingDoc>> {
  return settingsQuery();
}

const pagesQuery = cachedQuery(
  'pages',
  async () => (await d1Query('SELECT * FROM pages ORDER BY sort_order ASC LIMIT 200')).map(toPage),
  [] as PageDoc[]
);

export async function getPages(publishedOnly = true): Promise<PageDoc[]> {
  const rows = await pagesQuery();
  return publishedOnly ? rows.filter((p) => p.is_published) : rows;
}

export async function getPage(slug: string): Promise<PageDoc | null> {
  if (!slug) return null;
  const rows = await pagesQuery();
  return rows.find((p) => p.slug === slug) ?? null;
}

const reviewsQuery = cachedQuery(
  'reviews',
  async () =>
    (await d1Query('SELECT * FROM reviews ORDER BY sort_order ASC LIMIT 200')).map(toReview),
  [] as ReviewDoc[]
);

export async function getReviews(activeOnly = true): Promise<ReviewDoc[]> {
  const rows = await reviewsQuery();
  return activeOnly ? rows.filter((d) => d.is_active !== false) : rows;
}

const bannersQuery = cachedQuery(
  'banners',
  async () =>
    (await d1Query('SELECT * FROM banners ORDER BY sort_order ASC LIMIT 20')).map(toBanner),
  [] as BannerDoc[]
);

export async function getBanners(pageSlug: string): Promise<BannerDoc[]> {
  const rows = await bannersQuery();
  return rows.filter((b) => b.is_active !== false && (b.pages === 'all' || b.pages === pageSlug));
}

/** Kategoriler `settings` içinde JSON olarak saklanır. */
export async function getCategories(): Promise<ProjectCategory[]> {
  const settings = await getSettings();
  return parseCategories(settings[CATEGORIES_SETTING_KEY]?.value_fr);
}

/* -------------------------------- yardımcı -------------------------------- */

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

/** Logo artık R2 nesne anahtarı tutar; alan adı geriye dönük uyumluluk için aynı. */
export function logoFileIdFromSettings(
  settings: Record<string, SettingDoc>,
  override = ''
): string {
  const fromProp = override?.trim();
  if (fromProp) return fromProp;
  const doc = settings['design_logo_file_id'];
  if (!doc) return '';
  return (doc.value_fr || doc.value_tr || '').trim();
}
