import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getSettings, settingValue } from '@/lib/data';
import ContactForm from '@/components/ContactForm';
import JsonLd from '@/components/JsonLd';
import SeoIntroBlock from '@/components/SeoIntroBlock';
import RelatedGuides from '@/components/RelatedGuides';
import {
  buildBreadcrumbJsonLd,
  buildLocalBusinessJsonLd,
  buildPageMetadata,
  EXTERNAL_LINKS
} from '@/lib/seo';
import { fileViewUrl } from '@/lib/appwrite';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const ts = await getTranslations({ locale, namespace: 'contact.seo' });
  return buildPageMetadata({
    locale,
    path: '/contact',
    title: ts('title'),
    description: ts('description'),
    keywords: ts('keywords')
  });
}

export default async function ContactPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations('contact');
  const ts = await getTranslations({ locale, namespace: 'contact.seo' });
  const settings = await getSettings();

  const phone = settingValue(settings, 'phone', locale, '06 12 60 55 00');
  const email = settingValue(settings, 'email', locale, 'cbnplaque@gmail.com');
  const zone = settingValue(settings, 'zone', locale, 'Morbier / Jura');
  const logoFileId = settings['design_logo_file_id']?.value_fr ?? '';
  const logoUrl = logoFileId ? fileViewUrl(logoFileId) : undefined;

  const jsonLd = [
    buildBreadcrumbJsonLd(locale, [
      { name: locale === 'tr' ? 'Anasayfa' : 'Accueil', path: '' },
      { name: t('title'), path: '/contact' }
    ]),
    buildLocalBusinessJsonLd({
      description: (await getTranslations({ locale, namespace: 'contact.seo' }))('description'),
      phone,
      email,
      zone,
      locale,
      url: `https://www.cbnplaque.com${locale === 'tr' ? '/tr/contact' : '/contact'}`,
      logoUrl
    })
  ];

  const info = [
    { label: t('phone'), value: phone, href: `tel:${phone.replace(/\s/g, '')}`, icon: 'M3 5a2 2 0 012-2h2l2 5-2 1a11 11 0 005 5l1-2 5 2v2a2 2 0 01-2 2A16 16 0 013 5z' },
    { label: t('email'), value: email, href: `mailto:${email}`, icon: 'M3 7l9 6 9-6M3 7v10a1 1 0 001 1h16a1 1 0 001-1V7M3 7l9 6' },
    { label: t('zone'), value: zone, href: null, icon: 'M12 21s-6-5.5-6-10a6 6 0 1112 0c0 4.5-6 10-6 10z' }
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <article className="container-page py-14">
        <header className="text-center">
          <h1 className="section-title">{ts('h1')}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">{t('subtitle')}</p>
        </header>

        <SeoIntroBlock intro1={ts('intro1')} />

        <div className="mt-12 grid gap-8 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-2">
            <div
              className="rounded-2xl p-6 text-white"
              style={{ background: 'linear-gradient(135deg, var(--c-hero-from), var(--c-hero-to))' }}
            >
              <h2 className="text-xl font-bold">{t('infoTitle')}</h2>
              <ul className="mt-6 space-y-5">
                {info.map((item) => (
                  <li key={item.label} className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={item.icon} />
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm text-white/80">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="font-semibold hover:underline">
                          {item.value}
                        </a>
                      ) : (
                        <p className="font-semibold">{item.value}</p>
                      )}
                    </div>
                  </li>
                ))}

                <li className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm text-white/80">Facebook</p>
                    <a
                      href={EXTERNAL_LINKS.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold hover:underline"
                    >
                      facebook.com/cbn.plaque
                    </a>
                  </div>
                </li>
              </ul>
            </div>

            {/* Google Business / Maps — SEO + local visibility */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">{t('googleTitle')}</h2>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{t('googleText')}</p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <a
                  href={EXTERNAL_LINKS.googleMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
                >
                  📍 {t('googleMaps')}
                </a>
                <a
                  href={EXTERNAL_LINKS.googleBusiness}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Google Business
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-gray-100 lg:col-span-3">
            <ContactForm />
          </div>
        </div>

        <RelatedGuides locale={locale} limit={2} />
      </article>
    </>
  );
}
