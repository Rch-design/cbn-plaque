import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getServices } from '@/lib/data';
import { localized } from '@/lib/types';
import ServiceIcon from '@/components/ServiceIcon';
import { fileViewUrl } from '@/lib/appwrite';

export const dynamic = 'force-dynamic';

const DEFAULT_SERVICES = [
  { icon: 'wall', fr: ['Pose de plaques de plâtre', "Cloisons, doublages, faux-plafonds et aménagement de vos espaces avec une pose nette et durable."], tr: ['Alçıpan montajı', 'Bölme duvarlar, kaplamalar, asma tavanlar ve mekanlarınızın temiz, dayanıklı şekilde düzenlenmesi.'] },
  { icon: 'trowel', fr: ['Plâtrerie', 'Enduits, jointoiement et finitions lisses pour des surfaces parfaitement préparées.'], tr: ['Alçı işleri', 'Mükemmel hazırlanmış yüzeyler için sıva, derz ve pürüzsüz son işçilik.'] },
  { icon: 'paint', fr: ['Peinture', 'Peinture intérieure soignée pour murs et plafonds, choix des teintes et finitions.'], tr: ['Boya', 'Duvar ve tavanlar için özenli iç mekan boyası, renk ve son kat seçenekleri.'] },
  { icon: 'deco', fr: ['Décoration', 'Meubles TV en placo, niches, habillages bois et créations sur mesure.'], tr: ['Dekorasyon', 'Alçıpan TV ünitesi, nişler, ahşap kaplamalar ve özel tasarımlar.'] },
  { icon: 'insulation', fr: ['Isolation thermique', "Isolation des murs et plafonds par l'intérieur pour plus de confort et d'économies."], tr: ['Isı yalıtımı', 'Daha fazla konfor ve tasarruf için duvar ve tavanların içeriden yalıtımı.'] }
];

export default async function ServicesPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations('services');
  const tc = await getTranslations('home');
  const services = await getServices();
  const idx = locale === 'tr' ? 'tr' : 'fr';

  return (
    <div className="container-page py-14">
      <header className="text-center">
        <h1 className="section-title">{t('title')}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-gray-600">{t('subtitle')}</p>
      </header>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {services.length === 0
          ? DEFAULT_SERVICES.map((d) => (
              <article key={d.icon} className="flex gap-5 rounded-2xl bg-white p-6 shadow-md ring-1 ring-gray-100">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-ocean-500 text-white">
                  <ServiceIcon name={d.icon} className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{d[idx as 'fr' | 'tr'][0]}</h2>
                  <p className="mt-1 text-gray-600">{d[idx as 'fr' | 'tr'][1]}</p>
                </div>
              </article>
            ))
          : services.map((s) => (
              <article key={s.$id} className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-gray-100">
                {s.image_file_id && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={fileViewUrl(s.image_file_id)}
                    alt={localized(s as unknown as Record<string, unknown>, 'title', locale)}
                    className="h-48 w-full object-cover"
                  />
                )}
                <div className="flex gap-4 p-5">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{ background: 'linear-gradient(135deg, var(--c-hero-from), var(--c-hero-to))' }}
                  >
                    <ServiceIcon name={s.icon} className="h-7 w-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {localized(s as unknown as Record<string, unknown>, 'title', locale)}
                    </h2>
                    <p className="mt-1 text-gray-600">
                      {localized(s as unknown as Record<string, unknown>, 'desc', locale)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
      </div>

      <div className="mt-12 rounded-3xl bg-gradient-to-r from-ocean-600 to-brand-600 px-8 py-10 text-center text-white">
        <h2 className="text-2xl font-extrabold">{tc('ctaTitle')}</h2>
        <p className="mt-2 text-white/90">{tc('ctaText')}</p>
        <Link href="/contact" className="btn-primary mt-5 !bg-white !text-brand-700 hover:!bg-brand-50">
          {tc('ctaButton')}
        </Link>
      </div>
    </div>
  );
}
