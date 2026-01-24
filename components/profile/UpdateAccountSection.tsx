'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User } from '@/lib/types';
import { Loader2, Save } from '@/components/icons';
import { useTranslations } from 'next-intl';

interface UpdateAccountSectionProps {
  formData: {
    username: string;
    name: string;
    email: string;
  };
  user: User;
  isLoading: boolean;
  onFormDataChange: (data: { username: string; name: string; email: string }) => void;
  onUpdate: () => void;
}

export function UpdateAccountSection({
  formData,
  user,
  isLoading,
  onFormDataChange,
  onUpdate
}: UpdateAccountSectionProps) {
  const t = useTranslations();

  const hasChanges = 
    formData.username.trim() !== (user.username || '') ||
    formData.email.trim() !== (user.email || '') ||
    formData.name.trim() !== (user.name || user.full_name || '');

  const isDisabled = isLoading || !hasChanges;

  return (
    <div className="bg-gray-800 rounded-lg shadow p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
        {t('profile.updateAccount')}
      </h2>
      <div className="space-y-4">
        <Input
          label={t('users.username')}
          value={formData.username}
          onChange={(e) => onFormDataChange({ ...formData, username: e.target.value })}
          required
        />
        <Input
          label={t('auth.email')}
          value={formData.email}
          onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
          type="email"
          required
        />
        <Input
          label={t('common.name')}
          value={formData.name}
          onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
          placeholder={t('profile.namePlaceholder')}
          required
        />
        <Button
          variant="primary"
          onClick={onUpdate}
          disabled={isDisabled}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {t('common.save')}
        </Button>
      </div>
    </div>
  );
}
