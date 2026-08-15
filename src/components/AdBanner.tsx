import Link from 'next/link';
import { getBanners } from '@/lib/data';
import { assetUrl } from '@/lib/assets';

export default async function AdBanner({ pageSlug }: { pageSlug: string }) {
  const banners = await getBanners(pageSlug);
  if (banners.length === 0) return null;

  return (
    <div className="w-full space-y-0">
      {banners.map((b) => {
        const bg   = b.bg_color   || '#1e40af';
        const text = b.text_color || '#ffffff';
        const inner = (
          <div
            className="flex w-full items-center justify-between gap-4 px-6 py-4 sm:px-10"
            style={{ backgroundColor: bg, color: text }}
          >
            <div className="flex items-center gap-4 min-w-0">
              {b.image_file_id && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={assetUrl(b.image_file_id)}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-full object-cover shadow"
                />
              )}
              <div className="min-w-0">
                <p className="font-extrabold text-base sm:text-lg leading-tight truncate"
                  style={{ color: text }}>{b.title}</p>
                {b.subtitle && (
                  <p className="text-sm opacity-80 truncate" style={{ color: text }}>{b.subtitle}</p>
                )}
              </div>
            </div>
            {b.cta_text && (
              <span
                className="shrink-0 rounded-full border-2 px-4 py-1.5 text-sm font-bold whitespace-nowrap transition hover:opacity-90"
                style={{ borderColor: text, color: text }}
              >
                {b.cta_text} →
              </span>
            )}
          </div>
        );

        if (b.cta_link) {
          const isExternal = b.cta_link.startsWith('http');
          return isExternal ? (
            <a key={b.$id} href={b.cta_link} target="_blank" rel="noopener noreferrer"
              className="block w-full hover:opacity-95 transition">
              {inner}
            </a>
          ) : (
            <Link key={b.$id} href={b.cta_link} className="block w-full hover:opacity-95 transition">
              {inner}
            </Link>
          );
        }

        return <div key={b.$id}>{inner}</div>;
      })}
    </div>
  );
}
