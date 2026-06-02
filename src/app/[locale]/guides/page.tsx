import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getPages } from '@/lib/data';
import BlogPostCard from '@/components/BlogPostCard';
import JsonLd from '@/components/JsonLd';
import { buildBreadcrumbJsonLd, buildPageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const ts = await getTranslations({ locale, namespace: 'guides.seo' });
  return buildPageMetadata({
    locale,
    path: '/guides',
    title: ts('title'),
    description: ts('description'),
    keywords: ts('keywords')
  });
}

export default async function GuidesPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations('guides');
  const pages = await getPages(true);

  const jsonLd = buildBreadcrumbJsonLd(locale, [
    { name: locale === 'tr' ? 'Anasayfa' : 'Accueil', path: '' },
    { name: t('title'), path: '/guides' }
  ]);

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="container-page py-14">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            {t('badge')}
          </p>
          <h1 className="section-title mt-2">{t('title')}</h1>
          <p className="mt-4 text-lg text-gray-600">{t('subtitle')}</p>
        </header>

        {pages.length === 0 ? (
          <p className="mt-12 text-center text-gray-500">{t('empty')}</p>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pages.map((page) => (
              <BlogPostCard
                key={page.$id}
                page={page}
                locale={locale}
                readMore={t('readMore')}
              />
            ))}
          </div>
        )}

        <aside className="mx-auto mt-14 max-w-2xl rounded-2xl bg-gray-50 px-6 py-8 text-center">
          <h2 className="text-xl font-extrabold text-gray-900">{t('ctaTitle')}</h2>
          <p className="mt-2 text-gray-600">{t('ctaText')}</p>
          <Link href="/contact" className="btn-primary mt-5 inline-flex">
            {t('ctaButton')}
          </Link>
        </aside>
      </div>
    </>
  );
}
