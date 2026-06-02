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
