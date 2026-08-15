import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getProject, getProjectImages } from '@/lib/data';
import { assetUrl } from '@/lib/assets';
import { localized } from '@/lib/types';
import { getCategories } from '@/lib/data';
import { getCatLabel, getCatColorClass } from '@/lib/categories';
import Gallery from '@/components/Gallery';
import JsonLd from '@/components/JsonLd';
import { absoluteUrl, buildBreadcrumbJsonLd, buildPageMetadata } from '@/lib/seo';

export const revalidate = 300;

export async function generateMetadata({
  params
}: {
  params: { locale: string; id: string };
}): Promise<Metadata> {
  const { locale, id } = params;
  const project = await getProject(id);
  if (!project) return { title: 'CBN Plaque' };

  const title = localized(project as unknown as Record<string, unknown>, 'title', locale);
  const desc = localized(project as unknown as Record<string, unknown>, 'desc', locale);
  const suffix =
    locale === 'tr'
      ? 'CBN Plaque Morbier referans projesi'
      : 'réalisation CBN Plaque Morbier';

  return buildPageMetadata({
    locale,
    path: `/realisations/${id}`,
    title: `${title} | ${suffix}`,
    description:
      desc ||
      (locale === 'tr'
        ? `${title} — alçıpan ve boya projesi Morbier, Haut-Jura.`
        : `${title} — projet plâtrerie peinture à Morbier, Haut-Jura.`)
  });
}

export default async function ProjectDetailPage({
  params
}: {
  params: { locale: string; id: string };
}) {
  const { locale, id } = params;
  const t = await getTranslations('realisations');

  const project = await getProject(id);
  if (!project) notFound();

  const [imageDocs, cats] = await Promise.all([
    getProjectImages(id),
    getCategories()
  ]);

  const images = [
    assetUrl(project.cover_file_id),
    ...imageDocs.map((img) => assetUrl(img.file_id))
  ].filter(Boolean);

  const title = localized(project as unknown as Record<string, unknown>, 'title', locale);
  const desc = localized(project as unknown as Record<string, unknown>, 'desc', locale);
  const catLabel = getCatLabel(cats, project.category, locale);
  const catColor = getCatColorClass(cats, project.category);

  const jsonLd = [
    buildBreadcrumbJsonLd(locale, [
      { name: locale === 'tr' ? 'Anasayfa' : 'Accueil', path: '' },
      { name: t('title'), path: '/realisations' },
      { name: title, path: `/realisations/${id}` }
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'ImageGallery',
      name: title,
      description: desc || title,
      url: absoluteUrl(locale, `/realisations/${id}`),
      image: images.slice(0, 10),
      author: { '@type': 'Organization', name: 'CBN Plaque' }
    }
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="container-page py-14">
        <Link href="/realisations" className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700">
          ‹ {t('back')}
        </Link>

        <header className="mt-6">
          <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${catColor}`}>
            {catLabel}
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">{title}</h1>
          {desc && <p className="mt-3 max-w-2xl text-gray-600">{desc}</p>}
        </header>

        <div className="mt-8">
          {images.length > 0 ? (
            <Gallery images={images} title={title} locale={locale} />
          ) : (
            <p className="text-gray-500">{t('noImages')}</p>
          )}
        </div>
      </div>
    </>
  );
}
