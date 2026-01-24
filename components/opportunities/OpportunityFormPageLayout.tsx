'use client';

import { Button } from '@/components/ui/Button';
import { ArrowLeft } from '@/components/icons';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface OpportunityFormPageLayoutProps {
  children: ReactNode;
  backUrl: string;
}

export function OpportunityFormPageLayout({ 
  children, 
  backUrl
}: OpportunityFormPageLayoutProps) {
  const t = useTranslations();
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-4xl">
      <div className="mb-4 sm:mb-6">
        <Button
          variant="outline"
          onClick={() => router.push(backUrl)}
          className="flex items-center gap-2 text-sm sm:text-base"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.goBack')}
        </Button>
      </div>

      {children}
    </div>
  );
}
