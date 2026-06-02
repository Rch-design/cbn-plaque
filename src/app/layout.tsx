import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Script from 'next/script';
import './globals.css';

const GOOGLE_SITE_VERIFICATION =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ??
  'GVVOExB0uTBHn4oNCCPh8fbAnTqH-sIeXk13u_St258';

export const metadata: Metadata = {
  title: 'CBN Plaque - Plaquiste & Peintre Morbier | Haut-Jura',
  description:
    'Artisan plaquiste et peintre à Morbier dans le Haut-Jura. Pose de plaques de plâtre, peinture intérieure, isolation et décoration. Devis gratuit au 06 12 60 55 00.',
  keywords:
    'plaquiste Morbier, peintre Morbier, plâtrerie Haut-Jura, isolation Jura, pose plaque plâtre, décoration intérieure Jura, artisan Morbier, devis plaquiste 39',
  authors: [{ name: 'CBN Plaque' }],
  creator: 'CBN Plaque',
  metadataBase: new URL('https://www.cbnplaque.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'CBN Plaque - Plaquiste & Peintre à Morbier',
    description:
      'Artisan plaquiste et peintre à Morbier dans le Haut-Jura. Devis gratuit.',
    url: 'https://www.cbnplaque.com',
    siteName: 'CBN Plaque',
    locale: 'fr_FR',
    type: 'website',
  },
  ...(GOOGLE_SITE_VERIFICATION
    ? { verification: { google: GOOGLE_SITE_VERIFICATION } }
    : {}),
};
const ADS_PUB_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ?? '';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
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
