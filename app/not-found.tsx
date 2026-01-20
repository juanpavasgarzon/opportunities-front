import { locales, type Locale } from '@/i18n';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import Link from 'next/link';

function detectLocaleFromUrl(url: string): Locale {
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0 && locales.includes(pathSegments[0] as Locale)) {
      return pathSegments[0] as Locale;
    }
  } catch (error) {
    console.error(error);
  }
  return 'en';
}

function detectLocaleFromPathname(pathname: string): Locale {
  const pathSegments = pathname.split('/').filter(Boolean);
  if (pathSegments.length > 0 && locales.includes(pathSegments[0] as Locale)) {
    return pathSegments[0] as Locale;
  }
  return 'en';
}

export default async function NotFound() {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || headersList.get('referer') || '';

  let locale: Locale = 'en';
  if (pathname) {
    if (pathname.startsWith('/')) {
      locale = detectLocaleFromPathname(pathname);
    } else {
      locale = detectLocaleFromUrl(pathname);
    }
  }

  const t = await getTranslations({ locale });

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body className="antialiased dark" suppressHydrationWarning>
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
          <div className="text-center px-4">
            <h1 className="text-6xl font-bold text-white mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-gray-300 mb-4">
              {t('common.pageNotFound')}
            </h2>
            <p className="text-gray-400 mb-8">
              {t('common.pageNotFoundDescription')}
            </p>
            <Link href={`/${locale}`}>
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                {t('common.goHome')}
              </button>
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
