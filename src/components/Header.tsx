'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header({ locale, phone, email }: { locale: string; phone: string; email: string }) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/', label: t('home') },
    { href: '/services', label: t('services') },
    { href: '/realisations', label: t('realisations') },
    { href: '/contact', label: t('contact') }
  ];

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-ocean-500 font-black text-white">
            CB
          </span>
          <span className="text-lg font-extrabold tracking-tight text-gray-900">
            CBN <span className="text-brand-600">Plaque</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive(link.href)
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <Link href="/contact" className="btn-primary !px-5 !py-2 text-sm">
            {t('quote')}
          </Link>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-100 bg-white md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-4 py-2 font-semibold ${
                  isActive(link.href) ? 'bg-brand-50 text-brand-700' : 'text-gray-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center justify-between px-4 py-2">
              <LanguageSwitcher />
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="btn-primary !px-5 !py-2 text-sm"
              >
                {t('quote')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
