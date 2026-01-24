'use client';

import { Button } from '@/components/ui/Button';
import { Plus } from '@/components/icons';
import { useTranslations } from 'next-intl';

interface UsersSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onCreateClick: () => void;
}

export function UsersSearchBar({ value, onChange, onCreateClick }: UsersSearchBarProps) {
  const t = useTranslations();

  return (
    <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
      <input
        type="text"
        placeholder={t('common.searchUsers')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full sm:max-w-md px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white"
      />
      <Button
        variant="primary"
        onClick={onCreateClick}
        className="flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
      >
        <Plus size={18} className="sm:w-5 sm:h-5" />
        {t('common.create')}
      </Button>
    </div>
  );
}
