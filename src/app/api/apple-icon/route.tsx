import { ImageResponse } from 'next/og';
import { getSiteLogoIconUrl } from '@/lib/site-icon';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SIZE = { width: 180, height: 180 };

export async function GET() {
  const logoUrl = await getSiteLogoIconUrl();

  if (logoUrl) {
    return new ImageResponse(
      (
        <div
          style={{
            width: 180,
            height: 180,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 40,
            overflow: 'hidden',
            background: '#ffffff'
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} width={180} height={180} alt="" style={{ objectFit: 'cover' }} />
        </div>
      ),
      SIZE
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 40,
          background: 'linear-gradient(135deg, #f97316, #2563eb)',
          color: 'white',
          fontSize: 64,
          fontWeight: 800
        }}
      >
        CB
      </div>
    ),
    SIZE
  );
}
