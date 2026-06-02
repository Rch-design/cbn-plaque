import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { getProjects } from '@/lib/data';

const paths = ['', '/services', '/realisations', '/avis', '/contact'] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  try {
    const projects = await getProjects(undefined, true);
    for (const p of projects) {
      entries.push({
        url: `${SITE_URL}/realisations/${p.$id}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.6
      });
      entries.push({
        url: `${SITE_URL}/tr/realisations/${p.$id}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.6
      });
    }
  } catch {
    /* Appwrite unavailable during build — static URLs still listed */
  }

  return entries;
}
