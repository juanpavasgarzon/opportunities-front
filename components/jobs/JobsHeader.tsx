'use client';

import { Briefcase } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function JobsHeader() {
  const t = useTranslations();

  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
        <Briefcase className="h-8 w-8" />
        {t('jobs.title')}
      </h1>
      <p className="text-gray-400">
        {t('jobs.subtitle')}
      </p>
    </div>
  );
}
