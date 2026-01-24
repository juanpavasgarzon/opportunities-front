'use client';

import { Button } from '@/components/ui/Button';
import { Key, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ResetPasswordSectionProps {
  isLoading: boolean;
  onResetClick: () => void;
}

export function ResetPasswordSection({ isLoading, onResetClick }: ResetPasswordSectionProps) {
  const t = useTranslations();

  return (
    <div className="bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-white mb-4">
        {t('profile.resetPassword')}
      </h2>
      <Button
        variant="outline"
        onClick={onResetClick}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Key className="h-4 w-4" />
        )}
        {t('profile.resetPasswordButton')}
      </Button>
    </div>
  );
}
