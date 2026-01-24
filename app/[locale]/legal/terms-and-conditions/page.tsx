'use client';

import { useTermsAndConditions } from '@/hooks/useLegal';
import { formatDate } from '@/lib/utils/date';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function TermsAndConditionsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { data: legalDocument, isLoading, error } = useTermsAndConditions(locale);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href={`/${locale}`}>
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t('common.goHome')}
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-gray-400">{t('legal.documentNotFound')}</p>
          </div>
        ) : legalDocument ? (
          <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-8">
            <h1 className="text-3xl font-bold text-white mb-6">
              {legalDocument.title}
            </h1>

            {legalDocument.introduction && (
              <div className="prose prose-invert max-w-none mb-8">
                <p className="text-gray-300 text-lg leading-relaxed">
                  {legalDocument.introduction}
                </p>
              </div>
            )}

            <div className="space-y-8">
              {legalDocument.sections.map((section, index) => (
                <div key={index} className="border-b border-gray-700 pb-6 last:border-b-0">
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    {section.title}
                  </h2>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {legalDocument.last_updated && (
              <div className="mt-8 pt-6 border-t border-gray-700">
                <p className="text-sm text-gray-400">
                  {t('legal.lastUpdated')}: {formatDate(legalDocument.last_updated)}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400">{t('legal.documentNotFound')}</p>
          </div>
        )}
    </div>
  );
}
