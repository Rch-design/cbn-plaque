import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { settingValue } from '@/lib/data';
import type { SettingDoc } from '@/lib/types';
import { EXTERNAL_LINKS } from '@/lib/seo';

export default function Footer({
  locale,
  settings
}: {
  locale: string;
  settings: Record<string, SettingDoc>;
}) {
  const t = useTranslations();

  const phone = settingValue(settings, 'phone', locale, '06 12 60 55 00');
  const email = settingValue(settings, 'email', locale, 'cbnplaque@gmail.com');
  const zone  = settingValue(settings, 'zone', locale, 'Morbier / Jura');

  return (
    <footer
      className="mt-16"
      style={{ backgroundColor: 'var(--c-footer-bg)', color: 'var(--c-footer-text)' }}
    >
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl font-black text-white"
              style={{ background: 'linear-gradient(135deg, var(--c-primary), var(--c-secondary))' }}
            >
              CBN
            </span>
            <span className="text-lg font-extrabold text-white">CBN Plaque</span>
          </div>
          <p className="mt-3 text-sm opacity-60">{t('footer.madeWith')}</p>
        </div>

        <div>
          <h3 className="font-semibold text-white">{t('contact.infoTitle')}</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="opacity-80 transition hover:opacity-100">
                {phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${email}`} className="opacity-80 transition hover:opacity-100">
                {email}
              </a>
            </li>
            <li className="opacity-70">{zone}</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-white">{t('nav.services')}</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/services" className="opacity-80 transition hover:opacity-100">
                {t('nav.services')}
              </Link>
            </li>
            <li>
              <Link href="/realisations" className="opacity-80 transition hover:opacity-100">
                {t('nav.realisations')}
              </Link>
            </li>
            <li>
              <Link href="/avis" className="opacity-80 transition hover:opacity-100">
                {t('nav.avis')}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="opacity-80 transition hover:opacity-100">
                {t('nav.contact')}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div
        className="py-4 text-xs opacity-60"
        style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="container-page flex flex-wrap items-center justify-between gap-3">
          <span>&copy; 2023 CBN Plaque. {t('footer.rights')}</span>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={EXTERNAL_LINKS.googleMaps}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 transition hover:bg-white/20"
            >
              📍 Google Maps
            </a>
            <a
              href="https://www.facebook.com/cbn.plaque"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 transition hover:bg-white/20"
            aria-label="Facebook"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
            </svg>
            cbn.plaque
          </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
