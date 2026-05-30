import { getTranslations } from 'next-intl/server';
import { getProjects } from '@/lib/data';
import { CATEGORIES } from '@/lib/types';
import ProjectCard from '@/components/ProjectCard';
import CategoryFilter from '@/components/CategoryFilter';

export const dynamic = 'force-dynamic';

export default async function RealisationsPage({
  params,
  searchParams
}: {
  params: { locale: string };
  searchParams: { cat?: string };
}) {
  const { locale } = params;
  const t = await getTranslations('realisations');

  const cat = searchParams.cat;
  const active = cat && (CATEGORIES as string[]).includes(cat) ? cat : 'all';
  const projects = await getProjects(active);

  return (
    <div className="container-page py-14">
      <header className="text-center">
        <h1 className="section-title">{t('title')}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-gray-600">{t('subtitle')}</p>
      </header>

      <div className="mt-8">
        <CategoryFilter active={active} />
      </div>

      {projects.length === 0 ? (
        <p className="mt-16 text-center text-gray-500">{t('empty')}</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.$id} project={p} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
