'use client';

import { useAppInfo } from '@/hooks/useConfiguration';
import { FileText } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';

export function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const { data: appInfo } = useAppInfo();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Information */}
          <div className="space-y-4">
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
            <p className="text-gray-400 text-sm leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${locale}/legal/terms-and-conditions`}
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
                >
                  <FileText className="h-4 w-4" />
                  {t('footer.termsAndConditions')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/legal/privacy-policy`}
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
                >
                  <FileText className="h-4 w-4" />
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact/Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">{t('footer.contact')}</h4>
            <p className="text-gray-400 text-sm">
              {t('footer.contactDescription')}
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
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
