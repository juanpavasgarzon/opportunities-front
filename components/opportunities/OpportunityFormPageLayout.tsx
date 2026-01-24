'use client';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface OpportunityFormPageLayoutProps {
  children: ReactNode;
  alert?: { type: 'success' | 'error'; message: string } | null;
  onAlertClose?: () => void;
  backUrl: string;
}

export function OpportunityFormPageLayout({ 
  children, 
  alert, 
  onAlertClose,
  backUrl
}: OpportunityFormPageLayoutProps) {
  const t = useTranslations();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl mb-6">
        <Button
          variant="outline"
          onClick={() => router.push(backUrl)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.goBack')}
        </Button>
      </div>
      
      {alert && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl mb-6">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={onAlertClose}
          />
        </div>
      )}

      {children}
    </div>
  );
}
