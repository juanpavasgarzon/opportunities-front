'use client';

import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
}

export function ErrorState({ message, onRetry, retryText, className = '' }: ErrorStateProps) {
  const t = useTranslations();

  return (
    <div className={`flex items-center justify-center min-h-screen ${className}`}>
      <div className="text-center">
        <p className="text-red-400 mb-4">{message}</p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            {retryText || t('common.retry')}
          </Button>
        )}
      </div>
    </div>
  );
}
