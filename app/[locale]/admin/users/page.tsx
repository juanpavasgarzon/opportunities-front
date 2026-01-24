'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoadingState } from '@/components/common/LoadingState';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { DataTable } from '@/components/ui/DataTable';
import { ResetPasswordModal } from '@/components/ui/ResetPasswordModal';
import { UserModal } from '@/components/users/UserModal';
import { UsersHeader } from '@/components/users/UsersHeader';
import { UsersSearchBar } from '@/components/users/UsersSearchBar';
import { UsersTableActions } from '@/components/users/UsersTableActions';
import { useActivateUser, useCreateUser, useDeactivateUser, useDeleteUser, useResetPassword, useUpdateUser, useUsers } from '@/hooks/useUsers';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/lib/types';
import { formatDateLocale } from '@/lib/utils/date';
import { Loader2 } from '@/components/icons';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const { data: usersResponse, isLoading } = useUsers({
    page: currentPage,
    pageSize,
    search: searchTerm || undefined,
    sortBy: sortConfig?.key,
    sortOrder: sortConfig?.direction,
  });

  const users = usersResponse?.data || [];
  const totalCount = usersResponse?.total || 0;

  const deactivateUserMutation = useDeactivateUser();
  const activateUserMutation = useActivateUser();
  const deleteUserMutation = useDeleteUser();
  const resetPasswordMutation = useResetPassword();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'inactivate' | 'delete';
    user: User | null;
  }>({
    isOpen: false,
    type: 'inactivate',
    user: null
  });
  const [resetPasswordModal, setResetPasswordModal] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({
    isOpen: false,
    user: null
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editModal, setEditModal] = useState<{ isOpen: boolean; user: User | null }>({
    isOpen: false,
    user: null
  });
  const [currentUser, setCurrentUser] = useState<ReturnType<typeof getCurrentUser> | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
      const user = getCurrentUser();
      setCurrentUser(user);

      if (user?.role !== 'owner') {
        router.push(`/${locale}/admin/opportunities`);
      }
    }, 0);
  }, [router, locale]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(inputValue);
      setCurrentPage(1);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [inputValue]);

  if (!mounted) {
    return (
      <ProtectedRoute requiredRole={['owner']}>
        <LoadingState message={t('common.loading')} />
      </ProtectedRoute>
    );
  }

  if (currentUser?.role !== 'owner') {
    return null;
  }

  const handleInactivate = (user: User) => {
    setConfirmModal({
      isOpen: true,
      type: 'inactivate',
      user
    });
  };

  const handleResetPassword = (user: User) => {
    setResetPasswordModal({
      isOpen: true,
      user
    });
  };

  const handleDelete = (user: User) => {
    setConfirmModal({
      isOpen: true,
      type: 'delete',
      user
    });
  };

  const handleCreate = () => {
    setShowCreateModal(true);
  };

  const handleEdit = (user: User) => {
    setEditModal({
      isOpen: true,
      user
    });
  };

  const handleCreateUser = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'> & { password?: string }) => {
    try {
      const { password, ...userWithoutPassword } = userData;
      if (!password) {
        toast.error(t('users.passwordRequired'));
        return;
      }
      await createUserMutation.mutateAsync({
        full_name: userWithoutPassword.full_name || userWithoutPassword.name || '',
        username: userWithoutPassword.username,
        email: userWithoutPassword.email,
        role: userWithoutPassword.role,
        active: userWithoutPassword.active,
        password
      });
      toast.success(t('users.userCreated'));
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error instanceof Error ? error.message : t('users.userCreateError');
      toast.error(errorMessage);
    }
  };

  const handleUpdateUser = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    if (!editModal.user) {
      return;
    }

    try {
      await updateUserMutation.mutateAsync({
        id: String(editModal.user.id),
        data: {
          full_name: userData.full_name || userData.name,
          username: userData.username,
          email: userData.email,
          role: userData.role
        }
      });
      toast.success(t('users.userUpdated', { action: t('common.updated') }));
      setEditModal({ isOpen: false, user: null });
    } catch (error) {
      console.error('Error updating user:', error);
      const errorMessage = error instanceof Error ? error.message : t('users.userUpdateError');
      toast.error(errorMessage);
    }
  };

  const confirmInactivate = async () => {
    if (!confirmModal.user) {
      return;
    }
    const user = confirmModal.user;

    try {
      if (user.active) {
        await deactivateUserMutation.mutateAsync(String(user.id));
        toast.success(t('users.userUpdated', { action: t('users.inactivated') }));
      } else {
        await activateUserMutation.mutateAsync(String(user.id));
        toast.success(t('users.userUpdated', { action: t('users.activated') }));
      }
      setConfirmModal({ isOpen: false, type: 'inactivate', user: null });
    } catch (error) {
      console.error('Error updating user:', error);
      const errorMessage = error instanceof Error ? error.message : t('users.userUpdateError');
      toast.error(errorMessage);
    }
  };

  const confirmDelete = async () => {
    if (!confirmModal.user) {
      return;
    }
    const user = confirmModal.user;

    try {
      await deleteUserMutation.mutateAsync(String(user.id));
      toast.success(t('users.userDeleted', { username: user.username }));
      setConfirmModal({ isOpen: false, type: 'delete', user: null });
    } catch (error) {
      console.error('Error deleting user:', error);
      const errorMessage = error instanceof Error ? error.message : t('users.userDeleteError');
      toast.error(errorMessage);
    }
  };

  const confirmResetPassword = async (password: string) => {
    if (!resetPasswordModal.user) {
      return;
    }
    const user = resetPasswordModal.user;

    try {
      await resetPasswordMutation.mutateAsync({ id: String(user.id), password });
      toast.success(t('users.passwordResetSuccess', { username: user.username }));
      setResetPasswordModal({ isOpen: false, user: null });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(t('users.passwordResetError'));
    }
  };

  const columns = [
    {
      key: 'username' as const,
      label: t('users.username'),
      sortable: true
    },
    {
      key: 'full_name' as const,
      label: t('common.name'),
      sortable: true,
      render: (value: unknown, row: User) => {
        return (row.full_name || row.name || '') as string;
      }
    },
    {
      key: 'email' as const,
      label: t('users.email'),
      sortable: true
    },
    {
      key: 'role' as const,
      label: t('users.role'),
      sortable: true,
      render: (value: unknown) => (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {t(`roles.${value as string}`)}
        </span>
      )
    },
    {
      key: 'active' as const,
      label: t('users.active'),
      sortable: true,
      render: (value: unknown) => {
        const isActive = value as boolean;
        return (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isActive
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
            {isActive ? t('users.active') : t('users.inactive')}
          </span>
        );
      }
    },
    {
      key: 'created_at' as const,
      label: t('users.createdAt'),
      sortable: true,
      render: (value: unknown) => (
        <span className="whitespace-nowrap min-w-[120px] inline-block">
          {formatDateLocale(value as string)}
        </span>
      )
    },
    {
      key: 'updated_at' as const,
      label: t('users.updatedAt'),
      sortable: true,
      render: (value: unknown) => (
        <span className="whitespace-nowrap min-w-[120px] inline-block">
          {formatDateLocale(value as string)}
        </span>
      )
    }
  ];

  const isActionLoading = deactivateUserMutation.isPending ||
    activateUserMutation.isPending ||
    resetPasswordMutation.isPending ||
    deleteUserMutation.isPending;

  return (
    <ProtectedRoute requiredRole={['owner']}>
      <div>
        <UsersHeader />

        <UsersSearchBar
          value={inputValue}
          onChange={setInputValue}
          onCreateClick={handleCreate}
        />

        {isLoading ? (
          <div className="bg-gray-800 rounded-lg shadow overflow-hidden p-8">
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{t('users.loadingUsers')}</span>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto overflow-y-visible">
              <DataTable
                data={users}
                columns={columns}
                pageSize={pageSize}
                currentPage={currentPage}
                totalCount={totalCount}
                onPageChange={setCurrentPage}
                onSortChange={(key, direction) => {
                  setSortConfig(direction ? { key, direction } : null);
                  setCurrentPage(1);
                }}
                sortConfig={sortConfig}
                serverSide={true}
                actions={(user) => {
                  return (
                    <UsersTableActions
                      user={user}
                      isLoading={isActionLoading}
                      onEdit={handleEdit}
                      onInactivate={handleInactivate}
                      onResetPassword={handleResetPassword}
                      onDelete={handleDelete}
                    />
                  );
                }}
              />
            </div>
          </div>
        )}

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, type: confirmModal.type, user: null })}
          onConfirm={confirmModal.type === 'delete' ? confirmDelete : confirmInactivate}
          title={t('common.areYouSure')}
          message={
            confirmModal.user
              ? confirmModal.type === 'delete'
                ? t('users.confirmDelete', { username: confirmModal.user.username })
                : t('users.confirmInactivate', {
                  action: confirmModal.user.active ? t('users.inactivate') : t('users.activate'),
                  username: confirmModal.user.username
                })
              : ''
          }
          confirmText={t('common.confirm')}
          cancelText={t('common.cancel')}
          variant={confirmModal.type === 'delete' ? 'danger' : 'warning'}
        />

        <ResetPasswordModal
          isOpen={resetPasswordModal.isOpen}
          onClose={() => setResetPasswordModal({ isOpen: false, user: null })}
          onConfirm={confirmResetPassword}
          title={t('common.resetPassword')}
          username={resetPasswordModal.user?.username}
          loading={resetPasswordMutation.isPending}
        />

        <UserModal
          onSave={handleCreateUser}
          onClose={() => setShowCreateModal(false)}
          isOpen={showCreateModal}
        />
        <UserModal
          onSave={handleUpdateUser}
          onClose={() => setEditModal({ isOpen: false, user: null })}
          isOpen={editModal.isOpen}
          user={editModal.user}
          isEdit={true}
        />
      </div>
    </ProtectedRoute>
  );
}
