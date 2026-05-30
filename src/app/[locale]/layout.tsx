import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { getSettings, settingValue } from '@/lib/data';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="flex min-h-screen flex-col">
        <Header locale={locale} phone={phone} email={email} />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} settings={settings} />
      </div>
    </NextIntlClientProvider>
  );
}
