import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getServices, getProjects, getSettings, settingValue } from '@/lib/data';
import { localized } from '@/lib/types';
import ServiceIcon from '@/components/ServiceIcon';
import ProjectCard from '@/components/ProjectCard';
import { fileViewUrl } from '@/lib/appwrite';

export const dynamic = 'force-dynamic';

export default async function HomePage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations('home');

  const [services, projects, settings] = await Promise.all([
    getServices(),
    getProjects(),
    getSettings()
  ]);

  const phone = settingValue(settings, 'phone', locale, '06 12 60 55 00');
  const featured = projects.slice(0, 6);

  const heroTitleKey = locale === 'tr' ? 'design_hero_title_tr' : 'design_hero_title_fr';
  const heroSubKey   = locale === 'tr' ? 'design_hero_sub_tr'   : 'design_hero_sub_fr';
  const heroTitle    = settingValue(settings, heroTitleKey, locale, '') || t('heroTitle');
  const heroSubtitle = settingValue(settings, heroSubKey, locale, '') || t('heroSubtitle');

  return (
    <>
      {/* Hero */}
      <section
        className="relative overflow-hidden text-white"
        style={{ background: 'linear-gradient(135deg, var(--c-hero-from) 0%, var(--c-hero-via) 50%, var(--c-hero-to) 100%)' }}
      >
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,white_2px,transparent_2px)] [background-size:32px_32px]" />
        <div className="container-page relative grid gap-8 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-semibold backdrop-blur">
              Haut-Jura
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              {heroTitle}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/90">{heroSubtitle}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold transition"
                style={{ backgroundColor: 'white', color: 'var(--c-primary-dark)' }}
              >
                {t('heroCta')}
              </Link>
              <Link
                href="/realisations"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/70 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                {t('heroSecondary')}
              </Link>
            </div>
            <a href={`tel:${phone.replace(/\s/g, '')}`} className="mt-6 inline-block text-white/90">
              📞 {phone}
            </a>
          </div>
          <div className="hidden items-center justify-center lg:flex">
            <div className="grid w-full max-w-md grid-cols-2 gap-4">
              {['wall', 'paint', 'trowel', 'deco'].map((icon, i) => (
                <div
                  key={icon}
                  className="flex aspect-square flex-col items-center justify-center rounded-3xl bg-white/15 p-6 backdrop-blur"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <ServiceIcon name={icon} className="h-12 w-12 text-white" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="container-page py-16">
        <div className="text-center">
          <h2 className="section-title">{t('servicesTitle')}</h2>
          <p className="mt-2 text-gray-600">{t('servicesSubtitle')}</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.length === 0 ? (
            <DefaultServices locale={locale} />
          ) : (
            services.map((s) => (
              <div key={s.$id} className="card overflow-hidden !p-0">
                {s.image_file_id && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={fileViewUrl(s.image_file_id)}
                    alt={localized(s as unknown as Record<string, unknown>, 'title', locale)}
                    className="h-40 w-full object-cover"
                  />
                )}
                <div className="p-5">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--c-primary) 10%, transparent)', color: 'var(--c-primary-dark)' }}
                  >
                    <ServiceIcon name={s.icon} className="h-6 w-6" />
                  </div>
                  <h3 className="mt-3 text-xl font-bold text-gray-900">
                    {localized(s as unknown as Record<string, unknown>, 'title', locale)}
                  </h3>
                  <p className="mt-1 text-gray-600">
                    {localized(s as unknown as Record<string, unknown>, 'desc', locale)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Why */}
      <WhySection />

      {/* Featured */}
      {featured.length > 0 && (
        <section className="container-page py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="section-title">{t('featuredTitle')}</h2>
              <p className="mt-2 text-gray-600">{t('featuredSubtitle')}</p>
            </div>
            <Link href="/realisations" className="btn-secondary !py-2">
              {t('viewAll')}
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProjectCard key={p.$id} project={p} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container-page pb-16">
        <div
          className="rounded-3xl px-8 py-12 text-center text-white shadow-xl"
          style={{ background: 'linear-gradient(135deg, var(--c-secondary), var(--c-primary))' }}
        >
          <h2 className="text-3xl font-extrabold">{t('ctaTitle')}</h2>
          <p className="mx-auto mt-2 max-w-xl text-white/90">{t('ctaText')}</p>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold transition"
            style={{ backgroundColor: 'white', color: 'var(--c-primary-dark)' }}
          >
            {t('ctaButton')}
          </Link>
        </div>
      </section>
    </>
  );
}

function WhySection() {
  const t = useTranslations('home.why');
  const tt = useTranslations('home');
  const items = [
    { key: 'quality', icon: 'M9 12l2 2 4-4' },
    { key: 'local', icon: 'M12 21s-6-5.5-6-10a6 6 0 1112 0c0 4.5-6 10-6 10z' },
    { key: 'free', icon: 'M12 8v8m-4-4h8' }
  ];
  return (
    <section className="bg-gray-50 py-16">
      <div className="container-page">
        <h2 className="section-title text-center">{tt('whyTitle')}</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {items.map((item) => (
            <div key={item.key} className="rounded-2xl bg-white p-6 text-center shadow-sm">
              <div
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: 'color-mix(in srgb, var(--c-secondary) 12%, transparent)', color: 'var(--c-secondary-dark)' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
              </div>
              <h3 className="mt-4 font-bold text-gray-900">{t(item.key)}</h3>
              <p className="mt-1 text-sm text-gray-600">{t(`${item.key}Text`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DefaultServices({ locale }: { locale: string }) {
  const defaults = [
    { icon: 'wall', fr: ['Plaques de plâtre', 'Cloisons, doublages et aménagement de vos espaces.'], tr: ['Alçıpan montajı', 'Bölme duvarlar, kaplamalar ve mekan düzenleme.'] },
    { icon: 'trowel', fr: ['Plâtrerie', 'Enduits, joints et finitions lisses et soignées.'], tr: ['Alçı işleri', 'Sıva, derz ve pürüzsüz, özenli son işçilik.'] },
    { icon: 'paint', fr: ['Peinture', 'Peinture intérieure de qualité, murs et plafonds.'], tr: ['Boya', 'Kaliteli iç mekan boyası, duvar ve tavanlar.'] },
    { icon: 'deco', fr: ['Décoration', 'Meubles en placo, niches, habillages sur mesure.'], tr: ['Dekorasyon', 'Alçıpan mobilya, nişler, özel kaplamalar.'] },
    { icon: 'insulation', fr: ['Isolation', 'Isolation thermique des murs et plafonds.'], tr: ['İzolasyon', 'Duvar ve tavanların ısı yalıtımı.'] }
  ];
  const idx = locale === 'tr' ? 'tr' : 'fr';
  return (
    <>
      {defaults.map((d) => (
        <div key={d.icon} className="card">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: 'color-mix(in srgb, var(--c-primary) 10%, transparent)', color: 'var(--c-primary-dark)' }}
          >
            <ServiceIcon name={d.icon} className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-xl font-bold text-gray-900">{d[idx][0]}</h3>
          <p className="mt-2 text-gray-600">{d[idx][1]}</p>
        </div>
      ))}
    </>
  );
}
