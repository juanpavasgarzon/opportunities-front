'use client';

import { useAppInfo } from '@/hooks/useConfiguration';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { data: appInfo } = useAppInfo();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);
  }, []);


  const handleLanguageChange = (newLocale: string) => {
    if (!mounted || newLocale === locale) {
      return;
    }

    const path = pathname || '';
    const pathWithoutLocale = path.replace(/^\/(en|es|pt)/, '');
    const newPath = `/${newLocale}${pathWithoutLocale || ''}`;
    router.push(newPath);
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'pt', name: 'Português' }
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              {appInfo?.company_logo && (
                <Image
                  src={appInfo.company_logo}
                  alt={appInfo.company_name || 'Company Logo'}
                  width={40}
                  height={40}
                  className="h-10 w-auto object-contain"
                />
              )}
              <h3 className="text-xl font-bold text-white">
                {appInfo?.company_name || t('footer.appName')}
              </h3>
            </div>
            <div className="space-y-4">
              <p className="text-gray-400 text-sm leading-relaxed">
                {t('footer.description')}
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                {t('footer.description2')}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">{t('footer.quickLinks')}</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-gray-300 text-sm font-medium">
                  {t('footer.termsAndConditions')}
                </p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {t('footer.termsDescription')}
                </p>
                <a
                  href={`/${locale}/legal/terms-and-conditions`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium underline underline-offset-2 inline-block"
                >
                  {t('footer.accessHere')} →
                </a>
              </div>
              <div className="space-y-2">
                <p className="text-gray-300 text-sm font-medium">
                  {t('footer.privacyPolicy')}
                </p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {t('footer.privacyDescription')}
                </p>
                <a
                  href={`/${locale}/legal/privacy-policy`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium underline underline-offset-2 inline-block"
                >
                  {t('footer.accessHere')} →
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">{t('footer.contact')}</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t('footer.contactDescription')}
            </p>
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">
                {t('footer.contactInfo')}
              </p>
            </div>
            <div className="mt-4">
              <label htmlFor="language-select" className="block text-sm font-semibold text-white mb-2">
                {t('footer.language')}
              </label>
              <div className="relative">
                <select
                  id="language-select"
                  value={locale}
                  onChange={(e) => {
                    const newLocale = e.target.value;
                    if (newLocale !== locale) {
                      handleLanguageChange(newLocale);
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer pr-8"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-gray-400 text-xs sm:text-sm text-center md:text-left">
              © {currentYear} {appInfo?.company_name || t('footer.appName')}. {t('footer.allRightsReserved')}
            </p>
            <p className="text-gray-500 text-xs text-center md:text-right">
              {t('footer.poweredBy')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
