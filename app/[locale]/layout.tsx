import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
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
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 bg-gray-900">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
          <Footer />
        </div>
      </NextIntlClientProvider>
    </QueryProvider>
  );
}
