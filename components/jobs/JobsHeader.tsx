'use client';

import { Briefcase } from '@/components/icons';
import { useTranslations } from 'next-intl';

export function JobsHeader() {
  const t = useTranslations();

  return (
    <div className="mb-4 sm:mb-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-2">
        <Briefcase className="h-6 w-6 sm:h-8 sm:w-8" />
        {t('jobs.title')}
      </h1>
      <p className="text-sm sm:text-base text-gray-400">
        {t('jobs.subtitle')}
      </p>
    </div>
  );
}
