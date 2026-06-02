import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getProjects } from '@/lib/data';
import { loadCategories, getCatLabel } from '@/lib/categories';
import ProjectCard from '@/components/ProjectCard';
import { Link } from '@/i18n/navigation';
import JsonLd from '@/components/JsonLd';
import { buildBreadcrumbJsonLd, buildPageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const ts = await getTranslations({ locale, namespace: 'realisations.seo' });
  return buildPageMetadata({
    locale,
    path: '/realisations',
    title: ts('title'),
    description: ts('description'),
    keywords: ts('keywords')
  });
}

export default async function RealisationsPage({
  params,
  searchParams
}: {
  params: { locale: string };
  searchParams: { cat?: string };
}) {
  const { locale } = params;
  const t = await getTranslations('realisations');

  const [cats, projects] = await Promise.all([
    loadCategories(),
    getProjects(undefined, true)
  ]);

  const validCatIds = cats.map((c) => c.id);
  const active = searchParams.cat && validCatIds.includes(searchParams.cat)
    ? searchParams.cat
    : 'all';

  const filtered = active === 'all'
    ? projects
    : projects.filter((p) => p.category === active);

  const jsonLd = buildBreadcrumbJsonLd(locale, [
    { name: locale === 'tr' ? 'Anasayfa' : 'Accueil', path: '' },
    { name: t('title'), path: '/realisations' }
  ]);

  return (
    <>
      <JsonLd data={jsonLd} />
    <div className="container-page py-14">
      <header className="text-center">
        <h1 className="section-title">{t('title')}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-gray-600">{t('subtitle')}</p>
      </header>

      {/* Kategori filtresi */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Link
          href="/realisations"
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            active === 'all'
              ? 'text-white shadow'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          style={active === 'all' ? { background: 'linear-gradient(135deg, var(--c-hero-from), var(--c-hero-to))' } : {}}
        >
          {t('all')}
        </Link>
        {cats.map((c) => (
          <Link
            key={c.id}
            href={`/realisations?cat=${c.id}`}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              active === c.id
                ? 'text-white shadow'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={active === c.id ? { background: 'linear-gradient(135deg, var(--c-hero-from), var(--c-hero-to))' } : {}}
          >
            {getCatLabel([c], c.id, locale)}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-gray-500">{t('empty')}</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard key={p.$id} project={p} locale={locale} />
          ))}
        </div>
      )}
    </div>
    </>
  );
}
