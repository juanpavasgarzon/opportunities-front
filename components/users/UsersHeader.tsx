'use client';

import { Users } from '@/components/icons';
import { useTranslations } from 'next-intl';

export function UsersHeader() {
  const t = useTranslations();

  return (
    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
      <Users className="h-6 w-6 sm:h-8 sm:w-8" />
      {t('users.title')}
    </h1>
  );
}
