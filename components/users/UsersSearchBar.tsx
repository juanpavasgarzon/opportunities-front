'use client';

import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface UsersSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onCreateClick: () => void;
}

export function UsersSearchBar({ value, onChange, onCreateClick }: UsersSearchBarProps) {
  const t = useTranslations();

  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <input
        type="text"
        placeholder={t('common.searchUsers')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full max-w-md px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white"
      />
      <Button
        variant="primary"
        onClick={onCreateClick}
        className="flex items-center gap-2"
      >
        <Plus size={20} />
        {t('common.create')}
      </Button>
    </div>
  );
}
