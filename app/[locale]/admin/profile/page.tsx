'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ResetPasswordModal } from '@/components/ui/ResetPasswordModal';
import { useLogout, useMe, useResetMyPassword, useUpdateMe } from '@/hooks/useAuth';
import { setCurrentUser } from '@/lib/auth';
import { User } from '@/lib/types';
import { Key, Loader2, LogOut, Save, User as UserIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authKeys } from '@/hooks/useAuth';

export default function ProfilePage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const logoutMutation = useLogout();
  const updateMeMutation = useUpdateMe();
  const resetPasswordMutation = useResetMyPassword();
  const { data: meResponse, isLoading: isLoadingMe, error: meError } = useMe();
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: ''
  });
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  useEffect(() => {
    if (meResponse) {
      const user: User = {
        id: String(meResponse.id),
        username: meResponse.username,
        name: meResponse.full_name,
        full_name: meResponse.full_name,
        email: meResponse.email,
        role: meResponse.role,
        active: meResponse.active,
        created_at: meResponse.created_at,
        updated_at: meResponse.updated_at,
      };

      setCurrentUser(user);

      setTimeout(() => {
        setFormData({
          username: user.username || '',
          name: user.name || user.full_name || '',
          email: user.email || ''
        });
      }, 0);
    }
  }, [meResponse]);

  const handleUpdateAccount = async () => {
    if (!formData.name.trim()) {
      setAlert({
        type: 'error',
        message: t('profile.nameRequired')
      });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    try {
      await updateMeMutation.mutateAsync(formData.name.trim());

      setAlert({
        type: 'success',
        message: t('profile.accountUpdated')
      });
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : t('profile.errorUpdatingAccount');
      setAlert({
        type: 'error',
        message: errorMessage
      });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleResetPassword = async (password: string) => {
    try {
      await resetPasswordMutation.mutateAsync(password);
      setAlert({
        type: 'success',
        message: t('profile.passwordResetSuccess')
      });
      setTimeout(() => setAlert(null), 5000);
      setShowResetPasswordModal(false);
    } catch (error) {
      console.error('Error resetting password:', error);
      const errorMessage = error instanceof Error ? error.message : t('profile.errorResettingPassword');
      setAlert({
        type: 'error',
        message: errorMessage
      });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error('Logout error:', error);
    }
    router.push(`/${locale}/login`);
  };

  const user: User | null = meResponse ? {
    id: String(meResponse.id),
    username: meResponse.username,
    name: meResponse.full_name,
    full_name: meResponse.full_name,
    email: meResponse.email,
    role: meResponse.role,
    active: meResponse.active,
    created_at: meResponse.created_at,
    updated_at: meResponse.updated_at,
  } : null;

  if (isLoadingMe) {
    return (
      <ProtectedRoute requiredRole={['owner', 'admin']}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </ProtectedRoute>
    );
  }

  if (meError || !user) {
    return (
      <ProtectedRoute requiredRole={['owner', 'admin']}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-400 mb-4">{t('profile.errorLoadingProfile')}</p>
            <Button
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: authKeys.me() })}
            >
              {t('common.retry')}
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole={['owner', 'admin']}>
      <div>
        <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
          <UserIcon className="h-8 w-8" />
          {t('profile.title')}
        </h1>

        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
            autoClose
          />
        )}

        <div className="space-y-6">
          {/* User Information Card */}
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

          {/* Update Account Section */}
          <div className="bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              {t('profile.updateAccount')}
            </h2>
            <div className="space-y-4">
              <Input
                label={t('users.username')}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled
                className="opacity-60 cursor-not-allowed"
              />
              <Input
                label={t('auth.email')}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled
                type="email"
                className="opacity-60 cursor-not-allowed"
              />
              <Input
                label={t('common.name')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('profile.namePlaceholder')}
              />
              <Button
                variant="primary"
                onClick={handleUpdateAccount}
                disabled={updateMeMutation.isPending || formData.name.trim() === (user.name || user.full_name || '')}
                className="flex items-center gap-2"
              >
                {updateMeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {t('common.save')}
              </Button>
            </div>
          </div>

          {/* Reset Password Section */}
          <div className="bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              {t('profile.resetPassword')}
            </h2>
            <Button
              variant="outline"
              onClick={() => setShowResetPasswordModal(true)}
              disabled={resetPasswordMutation.isPending}
              className="flex items-center gap-2"
            >
              {resetPasswordMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Key className="h-4 w-4" />
              )}
              {t('profile.resetPasswordButton')}
            </Button>
          </div>

          {/* Logout Section */}
          <div className="bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              {t('profile.session')}
            </h2>
            <Button
              variant="danger"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="flex items-center gap-2"
            >
              {logoutMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              {t('common.logout')}
            </Button>
          </div>
        </div>

        <ResetPasswordModal
          isOpen={showResetPasswordModal}
          onClose={() => setShowResetPasswordModal(false)}
          onConfirm={handleResetPassword}
          title={t('profile.resetPassword')}
          username={user.username}
          loading={resetPasswordMutation.isPending}
        />
      </div>
    </ProtectedRoute>
  );
}
