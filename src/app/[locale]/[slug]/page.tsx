import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getPage } from '@/lib/data';
import { localized } from '@/lib/types';
import { buildPageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const { locale, slug } = params;
  const page = await getPage(slug);
  if (!page || !page.is_published) return { title: 'CBN Plaque' };

  const title = localized(page as unknown as Record<string, unknown>, 'title', locale);
  const content = localized(page as unknown as Record<string, unknown>, 'content', locale);

  return buildPageMetadata({
    locale,
    path: `/${slug}`,
    title: `${title} | CBN Plaque`,
    description: content.slice(0, 155) || title
  });
}

export default async function CustomPage({
  params
}: {
  params: { locale: string; slug: string };
}) {
  const { locale, slug } = params;
  const page = await getPage(slug);

  if (!page || !page.is_published) notFound();

  const title = localized(page as unknown as Record<string, unknown>, 'title', locale);
  const content = localized(page as unknown as Record<string, unknown>, 'content', locale);

  return (
    <div className="container-page py-14">
      <header className="mb-8 border-b border-gray-100 pb-6">
        <h1 className="section-title">{title}</h1>
      </header>
      <div className="prose prose-gray max-w-none">
        {content ? (
          <div style={{ whiteSpace: 'pre-wrap' }} className="text-gray-700 leading-relaxed">
            {content}
          </div>
        ) : (
          <p className="text-gray-400">İçerik bulunamadı.</p>
        )}
      </div>
      <div className="mt-10">
        <Link href="/" className="text-brand-600 hover:underline">← Ana sayfaya dön</Link>
      </div>
    </div>
  );
}
