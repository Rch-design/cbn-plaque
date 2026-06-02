import type { MetadataRoute } from 'next';
import { getProjects } from '@/lib/data';
import { SITE_URL } from '@/lib/seo';
import { SEO_PAGE_SLUGS } from '@/lib/page-templates';

const paths = ['', '/services', '/realisations', '/guides', '/avis', '/contact'] as const;

export const dynamic = 'force-dynamic';

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

  for (const slug of SEO_PAGE_SLUGS) {
    entries.push({
      url: `${SITE_URL}/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
      alternates: {
        languages: {
          fr: `${SITE_URL}/${slug}`,
          tr: `${SITE_URL}/tr/${slug}`
        }
      }
    });
    entries.push({
      url: `${SITE_URL}/tr/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.65
    });
  }

  const projects = await getProjects(undefined, true);
  for (const project of projects) {
    const path = `/realisations/${project.$id}`;
    const updated = (project as { $updatedAt?: string }).$updatedAt;
    const lastModified = updated ? new Date(updated) : now;

    entries.push({
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: {
          fr: `${SITE_URL}${path}`,
          tr: `${SITE_URL}/tr${path}`
        }
      }
    });
    entries.push({
      url: `${SITE_URL}/tr${path}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6
    });
  }

  return entries;
}
