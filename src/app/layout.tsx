import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'CBN Plaque - Plâtrerie, peinture & décoration',
  description:
    'Pose de plaques de plâtre, plâtrerie, peinture, décoration et isolation dans le Haut-Jura. Devis gratuit.',
  icons: {
    icon: '/favicon.svg'
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
