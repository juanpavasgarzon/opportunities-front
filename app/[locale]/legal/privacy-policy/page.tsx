'use client';

import { usePrivacyPolicy } from '@/hooks/useLegal';
import { formatDate } from '@/lib/utils/date';
import { Loader2 } from '@/components/icons';
import { useTranslations, useLocale } from 'next-intl';

export default function PrivacyPolicyPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { data: legalDocument, isLoading, error } = usePrivacyPolicy(locale);

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-4xl">

        {isLoading ? (
          <div className="flex items-center justify-center py-12 sm:py-20">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="text-center py-12 sm:py-20">
            <p className="text-sm sm:text-base text-gray-400">{t('legal.documentNotFound')}</p>
          </div>
        ) : legalDocument ? (
          <div className="bg-gray-800 rounded-lg shadow-xl border-[#374151] border p-4 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
              {legalDocument.title}
            </h1>

            {legalDocument.introduction && (
              <div className="prose prose-invert max-w-none mb-6 sm:mb-8">
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  {legalDocument.introduction}
                </p>
              </div>
            )}

            <div className="space-y-6 sm:space-y-8">
              {legalDocument.sections.map((section, index) => (
                <div key={index} className="border-b border-gray-700 pb-4 sm:pb-6 last:border-b-0">
                  <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4">
                    {section.title}
                  </h2>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                      {section.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {legalDocument.last_updated && (
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-700">
                <p className="text-xs sm:text-sm text-gray-400">
                  {t('legal.lastUpdated')}: {formatDate(legalDocument.last_updated)}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-20">
            <p className="text-sm sm:text-base text-gray-400">{t('legal.documentNotFound')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
