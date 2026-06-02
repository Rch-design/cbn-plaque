'use client';

import { useTranslations } from 'next-intl';
import { openConsentBanner } from '@/lib/consent';

export default function CookieSettingsLink() {
  const t = useTranslations('cookies');

  return (
    <button
      type="button"
      onClick={openConsentBanner}
      className="rounded-full bg-white/10 px-3 py-1 transition hover:bg-white/20"
    >
      {t('manage')}
    </button>
  );
}
