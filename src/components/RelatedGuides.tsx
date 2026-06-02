import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getPages } from '@/lib/data';
import { localized } from '@/lib/types';
import { pageExcerpt } from '@/lib/content';

export default async function RelatedGuides({
  locale,
  excludeSlug,
  limit = 3
}: {
  locale: string;
  excludeSlug?: string;
  limit?: number;
}) {
  const t = await getTranslations('guides');
  const pages = (await getPages(true))
    .filter((p) => p.slug !== excludeSlug)
    .slice(0, limit);

  if (pages.length === 0) return null;

  return (
    <section
      aria-labelledby="related-guides-heading"
      className="mt-12 rounded-2xl border border-gray-100 bg-gray-50 p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="related-guides-heading" className="text-xl font-extrabold text-gray-900">
          {t('relatedTitle')}
        </h2>
        <Link href="/guides" className="text-sm font-semibold text-brand-600 hover:underline">
          {t('seeAll')} →
        </Link>
      </div>
      <ul className="mt-5 space-y-3">
        {pages.map((page) => {
          const title = localized(page as unknown as Record<string, unknown>, 'title', locale);
          const content = localized(page as unknown as Record<string, unknown>, 'content', locale);
          return (
            <li key={page.$id}>
              <Link
                href={`/${page.slug}`}
                className="group block rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition hover:ring-brand-200"
              >
                <span className="font-bold text-gray-900 group-hover:text-brand-700">{title}</span>
                <p className="mt-1 text-sm text-gray-600">{pageExcerpt(content, 100)}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
