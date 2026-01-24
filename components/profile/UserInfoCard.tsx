'use client';

import { User } from '@/lib/types';
import { useTranslations } from 'next-intl';

interface UserInfoCardProps {
  user: User;
}

export function UserInfoCard({ user }: UserInfoCardProps) {
  const t = useTranslations();

  return (
    <div className="bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-white mb-4">
        {t('profile.userInformation')}
      </h2>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-white">
              {user.name || user.username}
            </p>
            <p className="text-sm text-gray-400">{user.email}</p>
            <p className="text-sm text-gray-400 mt-1">
              {t('roles.' + user.role)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
