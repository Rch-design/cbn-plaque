import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'CBN Plaque - Plâtrerie, peinture & décoration',
  description:
    'Pose de plaques de plâtre, plâtrerie, peinture, décoration et isolation dans le Haut-Jura. Devis gratuit.',
  icons: {
    icon: '/favicon.svg'
  }
};

const ADS_PUB_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ?? '';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        {ADS_PUB_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_PUB_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
