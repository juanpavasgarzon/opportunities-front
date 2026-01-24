'use client';

import { Loader2 } from '@/components/icons';
import { useTranslations } from 'next-intl';

export function Loader() {
  const t = useTranslations();
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Loader2 className="h-12 w-12 text-blue-400 animate-spin" />
          <div className="absolute inset-0 h-12 w-12 border-4 border-blue-400/20 rounded-full animate-ping" />
        </div>
        <p className="text-white text-sm font-medium">{t('common.loading')}</p>
      </div>
    </div>
  );
}
