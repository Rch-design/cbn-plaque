'use client';

import { useEffect, useRef, useState } from 'react';
import { CONSENT_EVENT, hasAnalyticsConsent } from '@/lib/consent';

interface Props {
  slot: string;
  format?: 'auto' | 'horizontal' | 'rectangle' | 'vertical';
  fullWidth?: boolean;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function GoogleAdBanner({
  slot,
  format = 'auto',
  fullWidth = true,
  className = ''
}: Props) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const pubId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ?? '';
  const [allowed, setAllowed] = useState(false);

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
      if (!pubId || !slot || pushed.current || !hasAnalyticsConsent()) return;
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
  }, [pubId, slot]);

  if (!pubId || !slot || !allowed) return null;

  return (
    <div className={`overflow-hidden text-center ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={pubId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={fullWidth ? 'true' : 'false'}
      />
    </div>
  );
}
