'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { fileViewUrl } from '@/lib/appwrite';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header({
  locale,
  phone,
  email,
  logoFileId
}: {
  locale: string;
  phone: string;
  email: string;
  logoFileId: string;
}) {
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

  const logoUrl = logoFileId ? fileViewUrl(logoFileId) : '';

  return (
    <header
      className="sticky top-0 z-40 shadow-sm"
      style={{
        backgroundColor: 'var(--c-header-bg)',
        borderBottom: '1px solid var(--c-header-border)',
        color: 'var(--c-header-text)'
      }}
    >
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {logoUrl ? (
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-0.5 shadow">
              <Image src={logoUrl} alt="Logo" width={40} height={40} className="h-full w-full object-contain" />
            </span>
          ) : (
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl font-black text-white"
              style={{ background: 'linear-gradient(135deg, var(--c-primary), var(--c-secondary))' }}
            >
              CB
            </span>
          )}
          <span className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--c-header-text)' }}>
            CBN <span style={{ color: 'var(--c-primary)' }}>Plaque</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-semibold transition"
              style={{
                backgroundColor: isActive(link.href)
                  ? `color-mix(in srgb, var(--c-primary) 12%, transparent)`
                  : 'transparent',
                color: isActive(link.href) ? 'var(--c-primary-dark)' : 'var(--c-header-text)'
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <div className="text-xs" style={{ color: 'var(--c-header-text)', opacity: 0.7 }}>
            <a href={`mailto:${email}`} className="hover:opacity-100">{email}</a>
          </div>
          <LanguageSwitcher />
          <Link href="/contact" className="btn-primary !px-5 !py-2 text-sm">
            {t('quote')}
          </Link>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg md:hidden"
          style={{ color: 'var(--c-header-text)' }}
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
        <div
          className="md:hidden"
          style={{ borderTop: '1px solid var(--c-header-border)', backgroundColor: 'var(--c-header-bg)' }}
        >
          <div className="container-page flex flex-col gap-1 py-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-2 font-semibold"
                style={{ color: isActive(link.href) ? 'var(--c-primary)' : 'var(--c-header-text)' }}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center justify-between px-4 py-2">
              <LanguageSwitcher />
              <Link href="/contact" onClick={() => setOpen(false)} className="btn-primary !px-5 !py-2 text-sm">
                {t('quote')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
