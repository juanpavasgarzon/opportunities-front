'use client';

import { Button } from '@/components/ui/Button';
import { User } from '@/lib/types';
import { Key, Loader2, Shield, ShieldOff, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface UsersTableActionsProps {
  user: User;
  isCurrentUser: boolean;
  isLoading: boolean;
  onInactivate: (user: User) => void;
  onResetPassword: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UsersTableActions({
  user,
  isCurrentUser,
  isLoading,
  onInactivate,
  onResetPassword,
  onDelete
}: UsersTableActionsProps) {
  const t = useTranslations();

  return (
    <div className="flex gap-2">
      <Button
        variant={user.active ? 'danger' : 'secondary'}
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onInactivate(user);
        }}
        className="flex items-center justify-center p-1.5"
        disabled={isCurrentUser || isLoading}
        title={isCurrentUser ? t('users.cannotModifySelf') : (user.active ? t('common.inactivate') : t('common.activate'))}
      >
        {user.active ? <ShieldOff size={16} /> : <Shield size={16} />}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onResetPassword(user);
        }}
        className="flex items-center justify-center p-1.5"
        disabled={isCurrentUser || isLoading}
        title={isCurrentUser ? t('users.cannotModifySelf') : t('common.resetPassword')}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Key size={16} />
        )}
      </Button>
      <Button
        variant="danger"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(user);
        }}
        className="flex items-center justify-center p-1.5"
        disabled={isCurrentUser || isLoading}
        title={isCurrentUser ? t('users.cannotDeleteSelf') : t('common.delete')}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 size={16} />
        )}
      </Button>
    </div>
  );
}
