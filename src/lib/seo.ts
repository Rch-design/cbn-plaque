import type { Metadata } from 'next';

export const SITE_URL = 'https://www.cbnplaque.com';

export function localePath(locale: string, path = ''): string {
  const clean = path.startsWith('/') ? path : path ? `/${path}` : '';
  if (locale === 'fr') return clean || '/';
  return `/tr${clean}`;
}

export function absoluteUrl(locale: string, path = ''): string {
  const p = localePath(locale, path);
  return `${SITE_URL}${p === '/' ? '' : p}`;
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
    inLanguage: locale === 'tr' ? 'tr-TR' : 'fr-FR',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/services?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
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
        'tr-TR': absoluteUrl('tr', path)
      }
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'CBN Plaque',
      locale: locale === 'tr' ? 'tr_TR' : 'fr_FR',
      type: 'website' as const
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description
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

export const GOOGLE_MAPS_SEARCH =
  'https://www.google.com/maps/search/?api=1&query=CBN+Plaque+Morbier+39400';

export const EXTERNAL_LINKS = {
  facebook: 'https://www.facebook.com/cbn.plaque',
  googleMaps: GOOGLE_MAPS_SEARCH,
  googleBusiness: 'https://business.google.com/'
};
