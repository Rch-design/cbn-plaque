import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'tr'],
  defaultLocale: 'fr',
  localePrefix: 'always'
});

export type Locale = (typeof routing.locales)[number];
