'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { DataTable } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/Input';
import { ResetPasswordModal } from '@/components/ui/ResetPasswordModal';
import { useActivateUser, useCreateUser, useDeactivateUser, useDeleteUser, useResetPassword, useUpdateUser, useUsers } from '@/hooks/useUsers';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/lib/types';
import { formatDateLocale } from '@/lib/utils/date';
import { Eye, EyeOff, Key, Loader2, Plus, RefreshCw, Shield, ShieldOff, Trash2, Users, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

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

  const updateUserMutation = useUpdateUser();
  const deactivateUserMutation = useDeactivateUser();
  const activateUserMutation = useActivateUser();
  const deleteUserMutation = useDeleteUser();
  const resetPasswordMutation = useResetPassword();
  const createUserMutation = useCreateUser();
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
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
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t('common.loading')}</span>
          </div>
        </div>
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

  const handleSave = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'> & { password: string }) => {
    try {
      const { password, ...userWithoutPassword } = userData;
      await createUserMutation.mutateAsync({ ...userWithoutPassword, password });
      setAlert({
        type: 'success',
        message: t('users.userCreated')
      });
      setTimeout(() => setAlert(null), 3000);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating user:', error);
      setAlert({
        type: 'error',
        message: t('users.userCreateError')
      });
      setTimeout(() => setAlert(null), 3000);
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
        setAlert({
          type: 'success',
          message: t('users.userUpdated', { action: t('users.inactivated') })
        });
      } else {
        await activateUserMutation.mutateAsync(String(user.id));
        setAlert({
          type: 'success',
          message: t('users.userUpdated', { action: t('users.activated') })
        });
      }
      setConfirmModal({ isOpen: false, type: 'inactivate', user: null });
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      console.error('Error updating user:', error);
      const errorMessage = error instanceof Error ? error.message : t('users.userUpdateError');
      setAlert({
        type: 'error',
        message: errorMessage
      });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const confirmDelete = async () => {
    if (!confirmModal.user) {
      return;
    }
    const user = confirmModal.user;

    try {
      await deleteUserMutation.mutateAsync(String(user.id));
      setAlert({
        type: 'success',
        message: t('users.userDeleted', { username: user.username })
      });
      setConfirmModal({ isOpen: false, type: 'delete', user: null });
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      console.error('Error deleting user:', error);
      const errorMessage = error instanceof Error ? error.message : t('users.userDeleteError');
      setAlert({
        type: 'error',
        message: errorMessage
      });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const confirmResetPassword = async (password: string) => {
    if (!resetPasswordModal.user) {
      return;
    }
    const user = resetPasswordModal.user;

    try {
      await resetPasswordMutation.mutateAsync({ id: String(user.id), password });
      setAlert({
        type: 'success',
        message: t('users.passwordResetSuccess', { username: user.username })
      });
      setTimeout(() => setAlert(null), 3000);
      setResetPasswordModal({ isOpen: false, user: null });
    } catch (error) {
      console.error('Error resetting password:', error);
      setAlert({
        type: 'error',
        message: t('users.passwordResetError')
      });
      setTimeout(() => setAlert(null), 3000);
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
      render: (value: unknown) => formatDateLocale(value as string)
    },
    {
      key: 'updated_at' as const,
      label: t('users.updatedAt'),
      sortable: true,
      render: (value: unknown) => formatDateLocale(value as string)
    }
  ];

  return (
    <ProtectedRoute requiredRole={['owner']}>
      <div>
        <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
          <Users className="h-8 w-8" />
          {t('users.title')}
        </h1>

        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
            autoClose
          />
        )}

        <div className="mb-6 flex items-center justify-between gap-4">
          <input
            type="text"
            placeholder={t('common.searchUsers')}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white"
          />
          <Button
            variant="primary"
            onClick={handleCreate}
            className="flex items-center gap-2"
          >
            <Plus size={20} />
            {t('common.create')}
          </Button>
        </div>

        {isLoading ? (
          <div className="bg-gray-800 rounded-lg shadow overflow-hidden p-8">
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{t('users.loadingUsers')}</span>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
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
                const isCurrentUser = currentUser && (String(user.id) === String(currentUser.id) || user.email === currentUser.email);
                return (
                  <div className="flex gap-2">
                    <Button
                      variant={user.active ? 'danger' : 'secondary'}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInactivate(user);
                      }}
                      className="flex items-center gap-1"
                      disabled={isCurrentUser || updateUserMutation.isPending || deactivateUserMutation.isPending || activateUserMutation.isPending || resetPasswordMutation.isPending}
                      title={isCurrentUser ? t('users.cannotModifySelf') : ''}
                    >
                      {user.active ? <ShieldOff size={14} /> : <Shield size={14} />}
                      {user.active ? t('common.inactivate') : t('common.activate')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResetPassword(user);
                      }}
                      className="flex items-center gap-1"
                      disabled={isCurrentUser || updateUserMutation.isPending || deactivateUserMutation.isPending || activateUserMutation.isPending || resetPasswordMutation.isPending}
                      title={isCurrentUser ? t('users.cannotModifySelf') : ''}
                    >
                      {resetPasswordMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Key size={14} />
                      )}
                      {t('common.resetPassword')}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(user);
                      }}
                      className="flex items-center gap-1"
                      disabled={isCurrentUser || deleteUserMutation.isPending || updateUserMutation.isPending || deactivateUserMutation.isPending || activateUserMutation.isPending || resetPasswordMutation.isPending}
                      title={isCurrentUser ? t('users.cannotDeleteSelf') : ''}
                    >
                      {deleteUserMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                      {t('common.delete')}
                    </Button>
                  </div>
                );
              }}
            />
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
          onSave={handleSave}
          onClose={() => setShowCreateModal(false)}
          isOpen={showCreateModal}
        />
      </div>
    </ProtectedRoute>
  );
}

function UserModal({
  onSave,
  onClose,
  isOpen
}: {
  onSave: (data: Omit<User, 'id' | 'created_at' | 'updated_at'> & { password: string }) => void;
  onClose: () => void;
  isOpen: boolean;
}) {
  const t = useTranslations();
  const modalRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<Omit<User, 'id' | 'created_at' | 'updated_at'> & { password: string }>({
    username: '',
    name: '',
    email: '',
    role: 'admin',
    active: true,
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setFormData({
          username: '',
          name: '',
          email: '',
          role: 'admin',
          active: true,
          password: ''
        });
      }, 0);
    }
  }, [isOpen]);

  const generateSecurePassword = () => {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)];

    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword();
    setFormData({ ...formData, password: newPassword });
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div ref={modalRef} className="bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full border border-gray-700 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">
            {t('common.create')} {t('users.title')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('common.name')}
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label={t('users.username')}
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
          <Input
            label={t('auth.email')}
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('users.password')}
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  title={showPassword ? t('users.hidePassword') : t('users.showPassword')}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleGeneratePassword}
                className="flex items-center gap-2"
                title={t('users.generatePassword')}
              >
                <RefreshCw size={16} />
              </Button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('users.role')}
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'owner' | 'admin' })}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
              required
            >
              <option value="owner">{t('roles.owner')}</option>
              <option value="admin">{t('roles.admin')}</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {t('common.save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
