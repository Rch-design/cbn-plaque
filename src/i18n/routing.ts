import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'tr'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed'
});

export type Locale = (typeof routing.locales)[number];
