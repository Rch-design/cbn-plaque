'use client';

import { useEffect, useRef } from 'react';

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
  const adRef  = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const pubId  = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ?? '';

  useEffect(() => {
    if (!pubId || !slot || pushed.current) return;
    try {
      pushed.current = true;
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, [pubId, slot]);

  if (!pubId || !slot) return null;

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
