import { ImageResponse } from 'next/og';
import { fetchSiteLogoIcon, getSiteLogoIconUrl } from '@/lib/site-icon';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const size = { width: 48, height: 48 };
export const contentType = 'image/png';

function fallbackIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 14,
          background: 'linear-gradient(135deg, #f97316, #2563eb)',
          color: 'white',
          fontSize: 18,
          fontWeight: 800
        }}
      >
        CB
      </div>
    ),
    { ...size }
  );
}

/** Google SERP favicon — SVG desteklenmez, PNG/JPEG gerekir (min 48px) */
export default async function Icon() {
  const logoUrl = await getSiteLogoIconUrl();

  if (logoUrl) {
    try {
      return new ImageResponse(
        (
          <div
            style={{
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 14,
              overflow: 'hidden',
              background: '#ffffff'
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} width={48} height={48} alt="" style={{ objectFit: 'cover' }} />
          </div>
        ),
        { ...size }
      );
    } catch {
      const direct = await fetchSiteLogoIcon();
      if (direct) return direct;
    }
  }

  return fallbackIcon();
}
