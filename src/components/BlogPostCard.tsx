import { Link } from '@/i18n/navigation';
import { pageExcerpt } from '@/lib/content';
import type { PageDoc } from '@/lib/types';
import { localized } from '@/lib/types';

export default function BlogPostCard({
  page,
  locale,
  readMore
}: {
  page: PageDoc;
  locale: string;
  readMore: string;
}) {
  const title = localized(page as unknown as Record<string, unknown>, 'title', locale);
  const content = localized(page as unknown as Record<string, unknown>, 'content', locale);
  const excerpt = pageExcerpt(content);

  return (
    <article className="card flex flex-col !p-0 overflow-hidden">
      <div
        className="px-5 py-4"
        style={{
          background:
            'linear-gradient(135deg, color-mix(in srgb, var(--c-primary) 8%, white), color-mix(in srgb, var(--c-secondary) 6%, white))'
        }}
      >
        <p className="text-xs font-bold uppercase tracking-wide text-brand-600">
          {locale === 'tr' ? 'Rehber' : 'Guide'}
        </p>
        <h3 className="mt-1 text-lg font-bold leading-snug text-gray-900">{title}</h3>
      </div>
      <div className="flex flex-1 flex-col p-5 pt-3">
        <p className="flex-1 text-sm leading-relaxed text-gray-600">{excerpt}</p>
        <Link
          href={`/${page.slug}`}
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline"
        >
          {readMore} →
        </Link>
      </div>
    </article>
  );
}
