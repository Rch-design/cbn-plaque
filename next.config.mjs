import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.cloud.appwrite.io' },
      { protocol: 'https', hostname: 'cloud.appwrite.io' }
    ]
  },

  async redirects() {
    return [
      // Eski statik dosyalar → anasayfa
      { source: '/index.html',        destination: '/', permanent: true },
      { source: '/index.php',         destination: '/', permanent: true },
      { source: '/home.html',         destination: '/', permanent: true },
      { source: '/accueil.html',      destination: '/', permanent: true },
      // Eski sayfa adları → yeni sayfalar
      { source: '/services.html',     destination: '/services',     permanent: true },
      { source: '/contact.html',      destination: '/contact',      permanent: true },
      { source: '/realisations.html', destination: '/realisations', permanent: true },
      { source: '/gallery.html',      destination: '/realisations', permanent: true },
      { source: '/galerie.html',      destination: '/realisations', permanent: true },
      // wp / cms artıkları
      { source: '/wp-admin',          destination: '/admin',        permanent: false },
      { source: '/wp-login.php',      destination: '/admin',        permanent: false },
    ];
  }
};

export default withNextIntl(nextConfig);
