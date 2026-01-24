'use client';

import { Alert } from '@/components/ui/Alert';
import { ReactNode } from 'react';

interface OpportunityFormPageLayoutProps {
  children: ReactNode;
  alert?: { type: 'success' | 'error'; message: string } | null;
  onAlertClose?: () => void;
}

export function OpportunityFormPageLayout({ 
  children, 
  alert, 
  onAlertClose
}: OpportunityFormPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900 py-8">
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
