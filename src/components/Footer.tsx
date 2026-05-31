import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { settingValue } from '@/lib/data';
import type { SettingDoc } from '@/lib/types';

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
              CB
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
              <Link href="/contact" className="opacity-80 transition hover:opacity-100">
                {t('nav.contact')}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div
        className="py-4 text-center text-xs opacity-50"
        style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
      >
        &copy; 2023 CBN Plaque. {t('footer.rights')}
      </div>
    </footer>
  );
}
