import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { getSettings, getPages, settingValue } from '@/lib/data';
import { canonicalFromPathname } from '@/lib/seo';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LocaleHtmlLang from '@/components/LocaleHtmlLang';
import ThemeStyle from '@/components/ThemeStyle';
import Tracker from '@/components/Tracker';
import AdBanner from '@/components/AdBanner';
import GoogleAdSticky from '@/components/GoogleAdSticky';
import CookieConsent from '@/components/CookieConsent';
import WhatsAppButton from '@/components/WhatsAppButton';
import AdSenseLoader from '@/components/AdSenseLoader';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const headersList = headers();
  const pathname = headersList.get('x-pathname') ?? '/';
  const canonical = canonicalFromPathname(pathname);

  return {
    alternates: { canonical }
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();
  const [settings, blogPages] = await Promise.all([getSettings(), getPages(true)]);

  const phone = settingValue(settings, 'phone', locale, '06 12 60 55 00');
  const email = settingValue(settings, 'email', locale, 'cbnplaque@gmail.com');

  const logoFileId = settings['design_logo_file_id']?.value_fr ?? '';

  return (
    <NextIntlClientProvider messages={messages}>
      <LocaleHtmlLang locale={locale} />
      <ThemeStyle />
      <AdSenseLoader />
      <Tracker />
      <div className="flex min-h-screen flex-col">
        <Header locale={locale} phone={phone} email={email} logoFileId={logoFileId} />
        <AdBanner pageSlug="all" />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} settings={settings} pages={blogPages} />
        <GoogleAdSticky />
        <WhatsAppButton phone={phone} />
        <CookieConsent />
      </div>
    </NextIntlClientProvider>
  );
}
