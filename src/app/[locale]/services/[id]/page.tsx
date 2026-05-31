import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getService, getServiceImages } from '@/lib/data';
import { fileViewUrl } from '@/lib/appwrite';
import { localized } from '@/lib/types';
import Gallery from '@/components/Gallery';
import ServiceIcon from '@/components/ServiceIcon';

export const dynamic = 'force-dynamic';

export default async function ServiceDetailPage({
  params
}: {
  params: { locale: string; id: string };
}) {
  const { locale, id } = params;
  const t = await getTranslations('services');

  const service = await getService(id);
  if (!service || service.is_active === false) notFound();

  const imageDocs = await getServiceImages(id);
  const images = [
    ...(service.image_file_id ? [fileViewUrl(service.image_file_id)] : []),
    ...imageDocs.map((img) => fileViewUrl(img.file_id))
  ];

  const title = localized(service as unknown as Record<string, unknown>, 'title', locale);
  const desc  = localized(service as unknown as Record<string, unknown>, 'desc', locale);

  return (
    <div className="container-page py-14">
      <Link
        href="/services"
        className="inline-flex items-center gap-2 text-sm font-semibold"
        style={{ color: 'var(--c-primary-dark, #ea580c)' }}
      >
        ‹ {t('back')}
      </Link>

      <header className="mt-6 flex items-start gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white"
          style={{ background: 'linear-gradient(135deg, var(--c-hero-from), var(--c-hero-to))' }}
        >
          <ServiceIcon name={service.icon} className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{title}</h1>
          {desc && <p className="mt-3 max-w-2xl text-gray-600">{desc}</p>}
        </div>
      </header>

      <div className="mt-8">
        {images.length > 0 ? (
          <Gallery images={images} title={title} />
        ) : (
          <div className="rounded-2xl bg-gray-50 py-16 text-center text-gray-400">
            <ServiceIcon name={service.icon} className="mx-auto h-16 w-16 opacity-30" />
            <p className="mt-4">{t('noImages')}</p>
          </div>
        )}
      </div>

      <div className="mt-12 rounded-3xl px-8 py-10 text-center text-white shadow-xl"
        style={{ background: 'linear-gradient(135deg, var(--c-secondary), var(--c-primary))' }}>
        <h2 className="text-2xl font-extrabold">{t('ctaTitle')}</h2>
        <p className="mt-2 text-white/90">{t('ctaText')}</p>
        <Link href="/contact"
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold transition"
          style={{ backgroundColor: 'white', color: 'var(--c-primary-dark, #ea580c)' }}>
          {t('ctaButton')}
        </Link>
      </div>
    </div>
  );
}
