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
  const zone = settingValue(settings, 'zone', locale, 'Morbier / Jura');

  return (
    <footer className="mt-16 bg-gray-900 text-gray-300">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-ocean-500 font-black text-white">
              CB
            </span>
            <span className="text-lg font-extrabold text-white">CBN Plaque</span>
          </div>
          <p className="mt-3 text-sm text-gray-400">{t('footer.madeWith')}</p>
        </div>

        <div>
          <h3 className="font-semibold text-white">{t('contact.infoTitle')}</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-brand-400">
                {phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${email}`} className="hover:text-brand-400">
                {email}
              </a>
            </li>
            <li>{zone}</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-white">{t('nav.services')}</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/services" className="hover:text-brand-400">
                {t('nav.services')}
              </Link>
            </li>
            <li>
              <Link href="/realisations" className="hover:text-brand-400">
                {t('nav.realisations')}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-brand-400">
                {t('nav.contact')}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        &copy; 2023 CBN Plaque. {t('footer.rights')}
      </div>
    </footer>
  );
}
