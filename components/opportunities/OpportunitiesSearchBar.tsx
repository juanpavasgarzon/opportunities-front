'use client';

import { useTranslations } from 'next-intl';

interface OpportunitiesSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function OpportunitiesSearchBar({ value, onChange }: OpportunitiesSearchBarProps) {
  const t = useTranslations();

  return (
    <input
      type="text"
      placeholder={t('common.searchJobs')}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full sm:max-w-md px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white"
    />
  );
}
