'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  const t = useTranslations();
  const locale = useLocale();

  return (
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
          <Button variant="primary">
            {t('common.goHome')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
