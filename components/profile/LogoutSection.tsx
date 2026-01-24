'use client';

import { Button } from '@/components/ui/Button';
import { Loader2, LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface LogoutSectionProps {
  isLoading: boolean;
  onLogout: () => void;
}

export function LogoutSection({ isLoading, onLogout }: LogoutSectionProps) {
  const t = useTranslations();

  return (
    <div className="bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-white mb-4">
        {t('profile.session')}
      </h2>
      <Button
        variant="danger"
        onClick={onLogout}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="h-4 w-4" />
        )}
        {t('common.logout')}
      </Button>
    </div>
  );
}
