import type { Metadata } from 'next';

export const SITE_URL = 'https://www.cbnplaque.com';

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og.svg`;

export function localePath(locale: string, path = ''): string {
  const clean = path.startsWith('/') ? path : path ? `/${path}` : '';
  if (locale === 'fr') return clean || '/';
  return `/tr${clean}`;
}

export function absoluteUrl(locale: string, path = ''): string {
  const p = localePath(locale, path);
  return `${SITE_URL}${p === '/' ? '' : p}`;
}

/** Pathname → tek canonical URL (www, https, /fr yok) */
export function canonicalFromPathname(pathname: string): string {
  let path = pathname.split('?')[0] || '/';

  if (path.startsWith('/fr/')) path = path.slice(3) || '/';
  else if (path === '/fr') path = '/';

  if (path === '/' || path === '') return SITE_URL;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export interface LocalBusinessInput {
  name?: string;
  description: string;
  phone: string;
  email: string;
  zone: string;
  locale: string;
  url: string;
  logoUrl?: string;
}

export function buildLocalBusinessJsonLd(input: LocalBusinessInput) {
  const tel = input.phone.replace(/\s/g, '');
  const phone = tel.startsWith('+') ? tel : tel.startsWith('0') ? `+33${tel.slice(1)}` : tel;

  return {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    name: input.name ?? 'CBN Plaque',
    description: input.description,
    url: input.url,
    telephone: phone,
    email: input.email,
    image: input.logoUrl || `${SITE_URL}/favicon.svg`,
    priceRange: '€€',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Morbier',
      addressRegion: 'Jura',
      postalCode: '39400',
      addressCountry: 'FR'
    },
    areaServed: [
      { '@type': 'City', name: 'Morbier' },
      { '@type': 'AdministrativeArea', name: 'Haut-Jura' },
      { '@type': 'AdministrativeArea', name: 'Jura' }
    ],
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 46.607,
      longitude: 6.012
    },
    knowsAbout: [
      'Plaques de plâtre',
      'Plâtrerie',
      'Peinture intérieure',
      'Décoration',
      'Isolation'
    ],
    sameAs: [
      'https://www.facebook.com/cbn.plaque',
      GOOGLE_MAPS_SEARCH
    ],
    inLanguage: input.locale === 'tr' ? 'tr-TR' : 'fr-FR'
  };
}

export function buildFaqJsonLd(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };
}

export function buildWebSiteJsonLd(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CBN Plaque',
    url: absoluteUrl(locale),
    description:
      locale === 'tr'
        ? 'Morbier ve Haut-Jura alçıpan, boya ve dekorasyon ustası'
        : 'Plaquiste et peintre à Morbier — plâtrerie, peinture et décoration Haut-Jura',
    inLanguage: locale === 'tr' ? 'tr-TR' : 'fr-FR'
  };
}

/** SEO-friendly image alt text for project/service photos */
export function seoImageAlt(title: string, locale: string, index?: number): string {
  const suffix =
    locale === 'tr'
      ? 'CBN Plaque Morbier — alçıpan ve boya'
      : 'CBN Plaque Morbier — plaquiste peintre';
  const base = `${title} — ${suffix}`;
  return index !== undefined ? `${base} (${index + 1})` : base;
}

export interface PageMetaInput {
  locale: string;
  path: string;
  title: string;
  description: string;
  keywords?: string;
}

/** Shared metadata builder for inner pages */
export function buildPageMetadata(input: PageMetaInput): Metadata {
  const { locale, path, title, description, keywords } = input;
  const url = absoluteUrl(locale, path);

  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: {
      canonical: url,
      languages: {
        'fr-FR': absoluteUrl('fr', path),
        'tr-TR': absoluteUrl('tr', path),
        'x-default': absoluteUrl('fr', path)
      }
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'CBN Plaque',
      locale: locale === 'tr' ? 'tr_TR' : 'fr_FR',
      type: 'website' as const,
      images: [{ url: DEFAULT_OG_IMAGE, alt: 'CBN Plaque — Plaquiste Morbier' }]
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: [DEFAULT_OG_IMAGE]
    },
    robots: { index: true, follow: true }
  };
}

export function buildBreadcrumbJsonLd(
  locale: string,
  items: { name: string; path: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(locale, item.path)
    }))
  };
}

export function buildArticleJsonLd(input: {
  locale: string;
  slug: string;
  title: string;
  description: string;
  datePublished?: string;
}) {
  const url = absoluteUrl(input.locale, `/${input.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description.slice(0, 300),
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    datePublished: input.datePublished ?? '2025-06-01',
    dateModified: new Date().toISOString().split('T')[0],
    image: DEFAULT_OG_IMAGE,
    author: { '@type': 'Organization', name: 'CBN Plaque', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'CBN Plaque',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.svg` }
    },
    inLanguage: input.locale === 'tr' ? 'tr-TR' : 'fr-FR'
  };
}

export function buildProjectListJsonLd(
  locale: string,
  projects: { id: string; title: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name:
      locale === 'tr'
        ? 'CBN Plaque referans projeleri — Morbier'
        : 'Réalisations CBN Plaque — plaquiste Morbier',
    itemListElement: projects.slice(0, 30).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.title,
      url: absoluteUrl(locale, `/realisations/${p.id}`)
    }))
  };
}

export function buildServiceListJsonLd(
  locale: string,
  services: { name: string; description: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: locale === 'tr' ? 'Hizmetler' : 'Services CBN Plaque',
    itemListElement: services.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Service',
        name: s.name,
        description: s.description,
        provider: { '@type': 'LocalBusiness', name: 'CBN Plaque' },
        areaServed: 'Haut-Jura, Jura, Morbier'
      }
    }))
  };
}

export function buildGuidesListJsonLd(
  locale: string,
  pages: { slug: string; title: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: locale === 'tr' ? 'Rehberler & ipuçları' : 'Guides & conseils CBN Plaque',
    itemListElement: pages.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.title,
      url: absoluteUrl(locale, `/${p.slug}`)
    }))
  };
}

export function buildReviewsJsonLd(
  reviews: { name: string; rating: number; body: string }[],
  avgRating: number
) {
  if (reviews.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'CBN Plaque',
    url: SITE_URL,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Morbier',
      postalCode: '39400',
      addressCountry: 'FR'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: avgRating,
      reviewCount: reviews.length,
      bestRating: 5,
      worstRating: 1
    },
    review: reviews.slice(0, 10).map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.name },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating,
        bestRating: 5,
        worstRating: 1
      },
      reviewBody: r.body.slice(0, 500)
    }))
  };
}

export const GOOGLE_MAPS_SEARCH =
  'https://www.google.com/maps/search/?api=1&query=CBN+Plaque+Morbier+39400';

export const EXTERNAL_LINKS = {
  facebook: 'https://www.facebook.com/cbn.plaque',
  googleMaps: GOOGLE_MAPS_SEARCH,
  googleBusiness: 'https://business.google.com/'
};
