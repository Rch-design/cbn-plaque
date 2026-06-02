import type { Metadata } from 'next';
import type { ReactNode } from 'react';
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
