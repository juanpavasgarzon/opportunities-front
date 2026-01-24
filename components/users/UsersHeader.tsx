'use client';

import { Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function UsersHeader() {
  const t = useTranslations();

  return (
    <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
      <Users className="h-8 w-8" />
      {t('users.title')}
    </h1>
  );
}
