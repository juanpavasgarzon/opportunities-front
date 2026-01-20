import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['en', 'es', 'pt'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale, requestLocale }) => {
  const resolvedLocale = locale || await requestLocale;
  
  if (!resolvedLocale || !locales.includes(resolvedLocale as Locale)) {
    notFound();
  }

  return {
    locale: resolvedLocale,
    messages: (await import(`./messages/${resolvedLocale}.json`)).default
  };
});
