import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getProject, getProjectImages } from '@/lib/data';
import { fileViewUrl } from '@/lib/appwrite';
import { localized } from '@/lib/types';
import Gallery from '@/components/Gallery';

export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({
  params
}: {
  params: { locale: string; id: string };
}) {
  const { locale, id } = params;
  const t = await getTranslations('realisations');
  const tc = await getTranslations('realisations.categories');

  const project = await getProject(id);
  if (!project) notFound();

  const imageDocs = await getProjectImages(id);
  const images = [
    ...(project.cover_file_id ? [fileViewUrl(project.cover_file_id)] : []),
    ...imageDocs.map((img) => fileViewUrl(img.file_id))
  ];

  const title = localized(project as unknown as Record<string, unknown>, 'title', locale);
  const desc = localized(project as unknown as Record<string, unknown>, 'desc', locale);

  return (
    <div className="container-page py-14">
      <Link href="/realisations" className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700">
        ‹ {t('back')}
      </Link>

      <header className="mt-6">
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-700">
          {tc(project.category)}
        </span>
        <h1 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">{title}</h1>
        {desc && <p className="mt-3 max-w-2xl text-gray-600">{desc}</p>}
      </header>

      <div className="mt-8">
        {images.length > 0 ? (
          <Gallery images={images} title={title} />
        ) : (
          <p className="text-gray-500">{t('noImages')}</p>
        )}
      </div>
    </div>
  );
}
