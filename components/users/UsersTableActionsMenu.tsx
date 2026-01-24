'use client';

import { User } from '@/lib/types';
import { Key, Loader2, MoreVertical, Shield, ShieldOff, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';

interface UsersTableActionsMenuProps {
  user: User;
  isCurrentUser: boolean;
  isLoading: boolean;
  onInactivate: (user: User) => void;
  onResetPassword: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UsersTableActionsMenu({
  user,
  isCurrentUser,
  isLoading,
  onInactivate,
  onResetPassword,
  onDelete
}: UsersTableActionsMenuProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleInactivate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    onInactivate(user);
  };

  const handleResetPassword = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    onResetPassword(user);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    onDelete(user);
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center justify-center p-1.5"
        disabled={isLoading}
        title={t('common.actions')}
      >
        <MoreVertical size={16} />
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-1 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            onClick={handleInactivate}
            disabled={isCurrentUser || isLoading}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors duration-150 flex items-center gap-2 ${
              isCurrentUser || isLoading
                ? 'text-gray-500 cursor-not-allowed'
                : user.active
                ? 'text-red-400 hover:text-red-300'
                : 'text-green-400 hover:text-green-300'
            }`}
            title={isCurrentUser ? t('users.cannotModifySelf') : ''}
          >
            {user.active ? (
              <>
                <ShieldOff size={14} />
                {t('common.inactivate')}
              </>
            ) : (
              <>
                <Shield size={14} />
                {t('common.activate')}
              </>
            )}
          </button>
          
          <button
            onClick={handleResetPassword}
            disabled={isCurrentUser || isLoading}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors duration-150 flex items-center gap-2 ${
              isCurrentUser || isLoading
                ? 'text-gray-500 cursor-not-allowed'
                : 'text-gray-300'
            }`}
            title={isCurrentUser ? t('users.cannotModifySelf') : ''}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {t('common.loading')}
              </>
            ) : (
              <>
                <Key size={14} />
                {t('common.resetPassword')}
              </>
            )}
          </button>
          
          <button
            onClick={handleDelete}
            disabled={isCurrentUser || isLoading}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors duration-150 flex items-center gap-2 ${
              isCurrentUser || isLoading
                ? 'text-gray-500 cursor-not-allowed'
                : 'text-red-400 hover:text-red-300'
            }`}
            title={isCurrentUser ? t('users.cannotDeleteSelf') : ''}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {t('common.loading')}
              </>
            ) : (
              <>
                <Trash2 size={14} />
                {t('common.delete')}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
