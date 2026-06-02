'use client';

import { useEffect } from 'react';

/** TR sayfalarinda html lang attribute (root layout fr sabit) */
export default function LocaleHtmlLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale === 'tr' ? 'tr' : 'fr';
  }, [locale]);
  return null;
}
