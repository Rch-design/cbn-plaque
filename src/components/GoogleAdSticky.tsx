'use client';

import { useEffect, useRef, useState } from 'react';
import { CONSENT_EVENT, hasAnalyticsConsent } from '@/lib/consent';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function GoogleAdSticky() {
  const pushed = useRef(false);
  const [closed, setClosed] = useState(false);
  const [allowed, setAllowed] = useState(false);

  const pubId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ?? '';
  const slotId = process.env.NEXT_PUBLIC_ADSENSE_STICKY_SLOT ?? '';

  useEffect(() => {
    function sync() {
      setAllowed(hasAnalyticsConsent());
    }
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  useEffect(() => {
    function pushAd() {
      if (!pubId || !slotId || pushed.current || closed || !hasAnalyticsConsent()) return;
      try {
        pushed.current = true;
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        pushed.current = false;
      }
    }

    pushAd();
    window.addEventListener(CONSENT_EVENT, pushAd);
    return () => window.removeEventListener(CONSENT_EVENT, pushAd);
  }, [pubId, slotId, closed]);

  if (!pubId || !slotId || closed || !allowed) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center bg-white/95 shadow-[0_-2px_12px_rgba(0,0,0,0.12)] backdrop-blur-sm"
      style={{ minHeight: 60 }}
    >
      <button
        onClick={() => setClosed(true)}
        aria-label="Reklamı kapat"
        className="absolute right-2 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-600 transition hover:bg-gray-300"
      >
        ✕
      </button>

      <div className="w-full max-w-4xl px-8">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={pubId}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
