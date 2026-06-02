import {
  PAGE_TEMPLATES,
  SEO_PAGE_SLUGS
} from './seo-pages-data.mjs';

export type PageTemplate = (typeof PAGE_TEMPLATES)[number];

export { PAGE_TEMPLATES, SEO_PAGE_SLUGS };

export function getPageTemplate(id: string): PageTemplate | undefined {
  return PAGE_TEMPLATES.find((t) => t.id === id);
}

export function getTemplateKeywords(slug: string, locale: string): string | undefined {
  const t = PAGE_TEMPLATES.find((p) => p.slug === slug);
  if (!t) return undefined;
  return locale === 'tr' ? t.seo_keywords_tr : t.seo_keywords_fr;
}
