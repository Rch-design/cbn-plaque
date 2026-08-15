'use client';

import { useState } from 'react';
import { assetUrl } from '@/lib/assets';

const BOX = {
  sm: 'h-10 w-10',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-20 w-20'
} as const;

/** Admin logosu — overflow-hidden ile koseler gercekten yuvarlak/oval */
export default function SiteLogo({
  logoFileId,
  size = 'md',
  showFallbackText = true,
  showSiteName = false,
  className = ''
}: {
  logoFileId?: string;
  size?: keyof typeof BOX;
  showFallbackText?: boolean;
  /** Logo varken yaninda "CBN Plaque" (header icin) */
  showSiteName?: boolean;
  className?: string;
}) {
  const [error, setError] = useState(false);
  const logoUrl = assetUrl(logoFileId);
  const rounded = 'rounded-3xl';

  if (logoUrl && !error) {
    const image = (
      <div
        className={`relative shrink-0 overflow-hidden ${rounded} ${BOX[size]} ring-1 ring-black/5`}
        title="CBN Plaque"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt="CBN Plaque"
          className="h-full w-full object-contain"
          onError={() => setError(true)}
        />
      </div>
    );

    if (showSiteName) {
      return (
        <span className={`inline-flex items-center gap-2.5 ${className}`}>
          {image}
          <span className="text-lg font-extrabold tracking-tight">
            CBN <span style={{ color: 'var(--c-primary)' }}>Plaque</span>
          </span>
        </span>
      );
    }

    return <span className={`inline-flex ${className}`}>{image}</span>;
  }

  if (!showFallbackText) return null;

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className={`flex shrink-0 items-center justify-center font-black text-white ${rounded} ${BOX[size]}`}
        style={{ background: 'linear-gradient(135deg, var(--c-primary), var(--c-secondary))' }}
      >
        CBN
      </span>
      <span className="text-lg font-extrabold tracking-tight">
        CBN <span style={{ color: 'var(--c-primary)' }}>Plaque</span>
      </span>
    </span>
  );
}
