'use client';

import { Briefcase } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function OpportunitiesHeader() {
  const t = useTranslations();

  return (
    <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
      <Briefcase className="h-8 w-8" />
      {t('admin.opportunities')}
    </h1>
  );
}
