'use client';

import { User } from '@/lib/types';
import { useTranslations } from 'next-intl';

interface UserInfoCardProps {
  user: User;
}

export function UserInfoCard({ user }: UserInfoCardProps) {
  const t = useTranslations();

  return (
    <div className="bg-gray-800 rounded-lg shadow p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
        {t('profile.userInformation')}
      </h2>
      <div className="space-y-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="h-16 w-16 sm:h-20 sm:w-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold flex-shrink-0">
            {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base sm:text-lg font-semibold text-white truncate">
              {user.name || user.username}
            </p>
            <p className="text-xs sm:text-sm text-gray-400 truncate">{user.email}</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              {t('roles.' + user.role)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
