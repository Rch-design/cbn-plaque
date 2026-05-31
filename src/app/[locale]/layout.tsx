import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { getSettings, settingValue } from '@/lib/data';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ThemeStyle from '@/components/ThemeStyle';
import Tracker from '@/components/Tracker';
import AdBanner from '@/components/AdBanner';

export const dynamic = 'force-dynamic';

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
  const settings = await getSettings();

  const phone = settingValue(settings, 'phone', locale, '06 12 60 55 00');
  const email = settingValue(settings, 'email', locale, 'cbnplaque@gmail.com');

  const logoFileId = settings['design_logo_file_id']?.value_fr ?? '';

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeStyle />
      <Tracker />
      <div className="flex min-h-screen flex-col">
        <Header locale={locale} phone={phone} email={email} logoFileId={logoFileId} />
        <AdBanner pageSlug="all" />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} settings={settings} />
      </div>
    </NextIntlClientProvider>
  );
}
