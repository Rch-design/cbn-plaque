import { Link } from '@/i18n/navigation';
import { fileViewUrl } from '@/lib/appwrite';
import { localized, type ProjectDoc } from '@/lib/types';
import { useTranslations } from 'next-intl';

export default function ProjectCard({
  project,
  locale
}: {
  project: ProjectDoc;
  locale: string;
}) {
  const t = useTranslations('realisations.categories');
  const title = localized(project as unknown as Record<string, unknown>, 'title', locale);
  const cover = project.cover_file_id ? fileViewUrl(project.cover_file_id) : '';

  return (
    <Link
      href={`/realisations/${project.$id}`}
      className="group block overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-brand-100 to-ocean-100">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-brand-400">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-700">
          {t(project.category)}
        </span>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-600">{title}</h3>
      </div>
    </Link>
  );
}
