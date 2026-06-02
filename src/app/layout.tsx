import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Script from 'next/script';
import './globals.css';

/** Sadece metadataBase — sayfa bazlı SEO alt layout/page'de */
export const metadata: Metadata = {
  metadataBase: new URL('https://www.cbnplaque.com'),
  title: {
    default: 'CBN Plaque - Plaquiste & Peintre Morbier',
    template: '%s'
  },
  robots: { index: true, follow: true }
};

const ADS_PUB_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ?? '';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      </head>
      <body className="font-sans antialiased">
        {children}
        {ADS_PUB_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_PUB_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
