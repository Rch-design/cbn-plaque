'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  CONSENT_EVENT,
  CONSENT_OPEN_EVENT,
  getConsent,
  setConsent
} from '@/lib/consent';

export default function CookieConsent() {
  const t = useTranslations('cookies');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getConsent() === null);

    function onChange() {
      setVisible(getConsent() === null);
    }
    function onOpen() {
      setVisible(true);
    }

    window.addEventListener(CONSENT_EVENT, onChange);
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener(CONSENT_EVENT, onChange);
      window.removeEventListener(CONSENT_OPEN_EVENT, onOpen);
    };
  }, []);

  if (!visible) return null;

  function accept() {
    setConsent('accepted');
    setVisible(false);
  }

  function reject() {
    setConsent('rejected');
    setVisible(false);
  }

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-title"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-gray-200 bg-white/95 p-4 shadow-[0_-4px_24px_rgba(0,0,0,0.12)] backdrop-blur-sm sm:p-5"
    >
      <div className="container-page flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl text-sm text-gray-700">
          <p id="cookie-title" className="font-bold text-gray-900">
            {t('title')}
          </p>
          <p className="mt-1 leading-relaxed">{t('text')}</p>
          <Link href="/contact" className="mt-1 inline-block text-sm font-medium text-brand-600 hover:underline">
            {t('privacy')}
          </Link>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={reject}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            {t('reject')}
          </button>
          <button type="button" onClick={accept} className="btn-primary !py-2 text-sm">
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
