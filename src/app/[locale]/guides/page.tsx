import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getPages } from '@/lib/data';
import BlogPostCard from '@/components/BlogPostCard';
import JsonLd from '@/components/JsonLd';
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildGuidesListJsonLd, buildPageMetadata } from '@/lib/seo';
import { localized } from '@/lib/types';

export const revalidate = 300;

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
  const tf = await getTranslations('guides.faq');
  const pages = await getPages(true);

  const faqItems = [
    { question: tf('q1'), answer: tf('a1') },
    { question: tf('q2'), answer: tf('a2') },
    { question: tf('q3'), answer: tf('a3') },
    { question: tf('q4'), answer: tf('a4') }
  ];

  const jsonLd = [
    buildBreadcrumbJsonLd(locale, [
      { name: locale === 'tr' ? 'Anasayfa' : 'Accueil', path: '' },
      { name: t('title'), path: '/guides' }
    ]),
    buildFaqJsonLd(faqItems),
    ...(pages.length > 0
      ? [
          buildGuidesListJsonLd(
            locale,
            pages.map((p) => ({
              slug: p.slug,
              title: localized(p as unknown as Record<string, unknown>, 'title', locale)
            }))
          )
        ]
      : [])
  ];

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
          <section aria-labelledby="articles-heading" className="mt-12">
            <h2 id="articles-heading" className="text-center text-2xl font-extrabold text-gray-900">
              {t('articlesTitle')}
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pages.map((page) => (
                <BlogPostCard
                  key={page.$id}
                  page={page}
                  locale={locale}
                  readMore={t('readMore')}
                />
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="faq-heading" className="mx-auto mt-16 max-w-3xl">
          <h2 id="faq-heading" className="section-title text-center">
            {t('faqTitle')}
          </h2>
          <dl className="mt-10 space-y-4">
            {faqItems.map((item, i) => (
              <div key={i} className="rounded-2xl bg-gray-50 p-5 ring-1 ring-gray-100">
                <dt className="font-bold text-gray-900">{item.question}</dt>
                <dd className="mt-2 leading-relaxed text-gray-600">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <aside className="mx-auto mt-14 max-w-2xl rounded-2xl bg-gradient-to-r from-ocean-600 to-brand-600 px-6 py-8 text-center text-white">
          <h2 className="text-xl font-extrabold">{t('ctaTitle')}</h2>
          <p className="mt-2 text-white/90">{t('ctaText')}</p>
          <Link
            href="/contact"
            className="btn-primary mt-5 inline-flex !bg-white !text-brand-700 hover:!bg-brand-50"
          >
            {t('ctaButton')}
          </Link>
        </aside>
      </div>
    </>
  );
}
