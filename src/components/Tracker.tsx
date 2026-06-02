'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/analytics';
import { CONSENT_EVENT, hasAnalyticsConsent } from '@/lib/consent';

export default function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    function maybeTrack() {
      if (typeof window === 'undefined' || !pathname) return;
      if (!hasAnalyticsConsent()) return;

      const key = `tracked_${pathname}`;
      if (sessionStorage.getItem(key)) return;

      const ua = navigator.userAgent.toLowerCase();
      if (/bot|crawler|spider|prerender|lighthouse|headless/.test(ua)) return;

      sessionStorage.setItem(key, '1');
      trackPageView(pathname);
    }

    maybeTrack();
    window.addEventListener(CONSENT_EVENT, maybeTrack);
    return () => window.removeEventListener(CONSENT_EVENT, maybeTrack);
  }, [pathname]);

  return null;
}
