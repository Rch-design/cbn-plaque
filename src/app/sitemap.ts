import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

const paths = ['', '/services', '/realisations', '/avis', '/contact'] as const;

/** Statik sitemap — Appwrite bagimliligi yok, Google her zaman okuyabilir */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of paths) {
    entries.push({
      url: `${SITE_URL}${path || '/'}`,
      lastModified: now,
      changeFrequency: path === '' ? 'weekly' : 'monthly',
      priority: path === '' ? 1 : 0.8,
      alternates: {
        languages: {
          fr: `${SITE_URL}${path || '/'}`,
          tr: `${SITE_URL}/tr${path}`
        }
      }
    });

    if (path !== '') {
      entries.push({
        url: `${SITE_URL}/tr${path}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7
      });
    }
  }

  entries.push({
    url: `${SITE_URL}/tr`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.9
  });

  return entries;
}
