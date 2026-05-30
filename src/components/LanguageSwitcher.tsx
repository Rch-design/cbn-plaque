'use client';

import { useParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const current = (params.locale as string) ?? routing.defaultLocale;

  function switchTo(locale: string) {
    router.replace(pathname, { locale });
  }

  return (
    <div className="flex items-center gap-1 rounded-full bg-gray-100 p-1 text-sm font-semibold">
      {routing.locales.map((locale) => (
        <button
          key={locale}
          onClick={() => switchTo(locale)}
          className={`rounded-full px-3 py-1 uppercase transition ${
            current === locale
              ? 'bg-brand-500 text-white shadow'
              : 'text-gray-500 hover:text-gray-900'
          }`}
          aria-label={`Changer la langue: ${locale}`}
        >
          {locale}
        </button>
      ))}
    </div>
  );
}
