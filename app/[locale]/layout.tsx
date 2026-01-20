import { Header } from '@/components/layout/Header';
import { PageTransition } from '@/components/layout/PageTransition';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { Locale, locales } from '@/i18n';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <QueryProvider>
      <NextIntlClientProvider messages={messages}>
        <Header />
        <main className="min-h-screen bg-gray-900">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </NextIntlClientProvider>
    </QueryProvider>
  );
}
