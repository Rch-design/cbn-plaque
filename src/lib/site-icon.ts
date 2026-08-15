import { getSettings, logoFileIdFromSettings } from '@/lib/data';
import { assetUrl } from '@/lib/assets';

/** Google arama favicon'u icin admin logosu (PNG/JPEG, kare) */
export async function getSiteLogoIconUrl(): Promise<string | null> {
  const settings = await getSettings();
  const logoKey = logoFileIdFromSettings(settings);
  return logoKey ? assetUrl(logoKey) || null : null;
}

export async function fetchSiteLogoIcon(): Promise<Response | null> {
  const logoUrl = await getSiteLogoIconUrl();
  if (!logoUrl) return null;

  try {
    const res = await fetch(logoUrl, { cache: 'no-store' });
    if (!res.ok) return null;
    const body = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/png';
    return new Response(body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
      }
    });
  } catch {
    return null;
  }
}
