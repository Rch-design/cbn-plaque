import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getServices } from '@/lib/data';
import { fileViewUrl } from '@/lib/appwrite';
import { localized } from '@/lib/types';
import ServiceIcon from '@/components/ServiceIcon';

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
  const services = await getServices();
  const idx = locale === 'tr' ? 'tr' : 'fr';

  return (
    <div className="container-page py-14">
      <header className="text-center">
        <h1 className="section-title">{t('title')}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-gray-600">{t('subtitle')}</p>
      </header>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.length === 0
          ? DEFAULT_SERVICES.map((d) => (
              <article key={d.icon} className="flex gap-5 rounded-2xl bg-white p-6 shadow-md ring-1 ring-gray-100">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white"
                  style={{ background: 'linear-gradient(135deg, var(--c-hero-from), var(--c-hero-to))' }}
                >
                  <ServiceIcon name={d.icon} className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{d[idx as 'fr' | 'tr'][0]}</h2>
                  <p className="mt-1 text-gray-600">{d[idx as 'fr' | 'tr'][1]}</p>
                </div>
              </article>
            ))
          : services.map((s) => {
              const title = localized(s as unknown as Record<string, unknown>, 'title', locale);
              const desc  = localized(s as unknown as Record<string, unknown>, 'desc', locale);
              return (
                <Link
                  key={s.$id}
                  href={`/services/${s.$id}`}
                  className="group overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Fotoğraf ya da ikon */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    {s.image_file_id ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={fileViewUrl(s.image_file_id)}
                        alt={title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="flex h-full items-center justify-center text-white"
                        style={{ background: 'linear-gradient(135deg, var(--c-hero-from), var(--c-hero-to))' }}
                      >
                        <ServiceIcon name={s.icon} className="h-16 w-16 opacity-60" />
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/40 to-transparent opacity-0 transition group-hover:opacity-100">
                      <span className="m-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold"
                        style={{ color: 'var(--c-primary-dark, #ea580c)' }}>
                        {t('discover')} →
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                      style={{ background: 'linear-gradient(135deg, var(--c-hero-from), var(--c-hero-to))' }}
                    >
                      <ServiceIcon name={s.icon} className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900">{title}</h2>
                      {desc && <p className="mt-1 text-sm text-gray-500 line-clamp-2">{desc}</p>}
                    </div>
                  </div>
                </Link>
              );
            })
        }
      </div>

      <div
        className="mt-12 rounded-3xl px-8 py-10 text-center text-white shadow-xl"
        style={{ background: 'linear-gradient(135deg, var(--c-secondary), var(--c-primary))' }}
      >
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
