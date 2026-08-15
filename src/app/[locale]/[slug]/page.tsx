import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getPage } from '@/lib/data';
import { localized } from '@/lib/types';
import { getTemplateKeywords } from '@/lib/page-templates';
import PageContent from '@/components/PageContent';
import JsonLd from '@/components/JsonLd';
import { buildArticleJsonLd, buildBreadcrumbJsonLd, buildPageMetadata } from '@/lib/seo';

export const revalidate = 300;

const RESERVED_SLUGS = new Set(['icon', 'apple-icon', 'favicon']);

export async function generateMetadata({
  params
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const { locale, slug } = params;
  if (RESERVED_SLUGS.has(slug)) return { title: 'CBN Plaque' };
  const page = await getPage(slug);
  if (!page || !page.is_published) return { title: 'CBN Plaque' };

  const title = localized(page as unknown as Record<string, unknown>, 'title', locale);
  const content = localized(page as unknown as Record<string, unknown>, 'content', locale);
  const keywords = getTemplateKeywords(slug, locale);

  return buildPageMetadata({
    locale,
    path: `/${slug}`,
    title: `${title} | CBN Plaque Morbier`,
    description: content.replace(/^#+\s/gm, '').slice(0, 155) || title,
    keywords
  });
}

export default async function CustomPage({
  params
}: {
  params: { locale: string; slug: string };
}) {
  const { locale, slug } = params;
  if (RESERVED_SLUGS.has(slug)) notFound();
  const t = await getTranslations('customPage');
  const page = await getPage(slug);

  if (!page || !page.is_published) notFound();

  const title = localized(page as unknown as Record<string, unknown>, 'title', locale);
  const content = localized(page as unknown as Record<string, unknown>, 'content', locale);
  const plainDesc = content.replace(/^#+\s/gm, '').slice(0, 300);

  const jsonLd = [
    buildBreadcrumbJsonLd(locale, [
      { name: locale === 'tr' ? 'Anasayfa' : 'Accueil', path: '' },
      { name: title, path: `/${slug}` }
    ]),
    buildArticleJsonLd({ locale, slug, title, description: plainDesc })
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <article className="container-page py-14">
        <header className="mb-8 border-b border-gray-100 pb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            {t('badge')}
          </p>
          <h1 className="section-title mt-2">{title}</h1>
        </header>

        <PageContent content={content} />

        <aside className="mt-12 rounded-2xl bg-gradient-to-r from-ocean-600 to-brand-600 px-6 py-8 text-center text-white">
          <h2 className="text-xl font-extrabold">{t('ctaTitle')}</h2>
          <p className="mt-2 text-white/90">{t('ctaText')}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="btn-primary !bg-white !text-brand-700 hover:!bg-brand-50">
              {t('ctaButton')}
            </Link>
            <Link href="/services" className="rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold hover:bg-white/10">
              {t('servicesLink')}
            </Link>
          </div>
        </aside>

        <nav className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link href="/guides" className="text-brand-600 hover:underline">
            ← {t('guidesLink')}
          </Link>
          <Link href="/" className="text-brand-600 hover:underline">
            {t('homeLink')}
          </Link>
          <Link href="/contact" className="text-brand-600 hover:underline">
            {t('contactLink')}
          </Link>
        </nav>
      </article>
    </>
  );
}
