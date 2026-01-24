'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { LogoutSection } from '@/components/profile/LogoutSection';
import { ResetPasswordSection } from '@/components/profile/ResetPasswordSection';
import { UpdateAccountSection } from '@/components/profile/UpdateAccountSection';
import { UserInfoCard } from '@/components/profile/UserInfoCard';
import { ResetPasswordModal } from '@/components/ui/ResetPasswordModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useLogout, useMe, useResetMyPassword, useUpdateMe } from '@/hooks/useAuth';
import { ApiError } from '@/lib/api/client';
import { setCurrentUser } from '@/lib/auth';
import { User } from '@/lib/types';
import { User as UserIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authKeys } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

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
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);
  const [showPasswordChangeConfirmModal, setShowPasswordChangeConfirmModal] = useState(false);
  const [showAccountUpdateConfirmModal, setShowAccountUpdateConfirmModal] = useState(false);
  const [pendingPassword, setPendingPassword] = useState<string | null>(null);
  const [originalUserData, setOriginalUserData] = useState<{ username: string; email: string; full_name: string } | null>(null);

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
        // Store original values for comparison
        setOriginalUserData({
          username: user.username || '',
          email: user.email || '',
          full_name: user.full_name || ''
        });
      }, 0);
    }
  }, [meResponse]);

  const handleUpdateAccount = async () => {
    if (!formData.name.trim() || !formData.username.trim() || !formData.email.trim()) {
      toast.error(t('profile.allFieldsRequired'));
      return;
    }

    // Check if sensitive data (username or email) has changed
    const usernameChanged = originalUserData && formData.username.trim() !== originalUserData.username;
    const emailChanged = originalUserData && formData.email.trim() !== originalUserData.email;

    // If sensitive data changed, show confirmation modal
    if (usernameChanged || emailChanged) {
      setShowAccountUpdateConfirmModal(true);
      return;
    }

    // If only full_name changed, proceed without confirmation
    await performAccountUpdate();
  };

  const performAccountUpdate = async () => {
    try {
      await updateMeMutation.mutateAsync({
        full_name: formData.name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
      });

      toast.success(t('profile.accountUpdated'));
    } catch (error) {
      console.error(error);
      // If 401, the API client will handle logout and redirect automatically
      // We just need to show the error message
      if (error instanceof ApiError && error.status === 401) {
        toast.error(error.message || t('profile.sessionExpired'));
        // Redirect is handled by API client, but we can add a small delay for UX
      } else {
        const errorMessage = error instanceof Error ? error.message : t('profile.errorUpdatingAccount');
        toast.error(errorMessage);
      }
    }
  };

  const confirmAccountUpdate = async () => {
    setShowAccountUpdateConfirmModal(false);
    await performAccountUpdate();
  };

  const handleResetPassword = async (password: string) => {
    // Show confirmation modal first
    setPendingPassword(password);
    setShowPasswordChangeConfirmModal(true);
    setShowResetPasswordModal(false);
  };

  const confirmPasswordChange = async () => {
    if (!pendingPassword) return;

    try {
      await resetPasswordMutation.mutateAsync(pendingPassword);
      toast.success(t('profile.passwordResetSuccess'));
      // Session will be invalidated by backend, API client will handle redirect
      // Don't close modal here - let the redirect happen
    } catch (error) {
      console.error('Error resetting password:', error);
      const errorMessage = error instanceof Error ? error.message : t('profile.errorResettingPassword');
      toast.error(errorMessage);
      setShowPasswordChangeConfirmModal(false);
      setPendingPassword(null);
    }
  };

  const handleLogout = () => {
    // Show confirmation modal first
    setShowLogoutConfirmModal(true);
  };

  const confirmLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      // Even if logout API fails, we still clear local auth
      console.error('Logout error (ignored):', error);
    }
    // clearAuth is already called in the hook's onSuccess/onError
    // Use replace to avoid adding to history and prevent loops
    router.replace(`/${locale}/login`);
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
        <LoadingState />
      </ProtectedRoute>
    );
  }

  if (meError || !user) {
    return (
      <ProtectedRoute requiredRole={['owner', 'admin']}>
        <ErrorState
          message={t('profile.errorLoadingProfile')}
          onRetry={() => queryClient.invalidateQueries({ queryKey: authKeys.me() })}
        />
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

        <div className="space-y-6">
          <UserInfoCard user={user} />
          <UpdateAccountSection
            formData={formData}
            user={user}
            isLoading={updateMeMutation.isPending}
            onFormDataChange={setFormData}
            onUpdate={handleUpdateAccount}
          />
          <ResetPasswordSection
            isLoading={resetPasswordMutation.isPending}
            onResetClick={() => setShowResetPasswordModal(true)}
          />
          <LogoutSection
            isLoading={logoutMutation.isPending}
            onLogout={handleLogout}
          />
        </div>

        <ResetPasswordModal
          isOpen={showResetPasswordModal}
          onClose={() => setShowResetPasswordModal(false)}
          onConfirm={handleResetPassword}
          title={t('profile.resetPassword')}
          username={user.username}
          loading={resetPasswordMutation.isPending}
          showSessionWarning={true}
        />

        <ConfirmModal
          isOpen={showLogoutConfirmModal}
          onClose={() => setShowLogoutConfirmModal(false)}
          onConfirm={confirmLogout}
          title={t('profile.confirmLogout')}
          message={t('profile.logoutWarning')}
          confirmText={t('common.logout')}
          cancelText={t('common.cancel')}
          variant="warning"
        />

        <ConfirmModal
          isOpen={showPasswordChangeConfirmModal}
          onClose={() => {
            setShowPasswordChangeConfirmModal(false);
            setPendingPassword(null);
            // Reopen the password modal if user cancels
            if (pendingPassword) {
              setShowResetPasswordModal(true);
            }
          }}
          onConfirm={confirmPasswordChange}
          title={t('profile.confirmPasswordChange')}
          message={t('profile.passwordChangeWarning')}
          confirmText={t('common.confirm')}
          cancelText={t('common.cancel')}
          variant="warning"
          closeOnConfirm={false}
        />

        <ConfirmModal
          isOpen={showAccountUpdateConfirmModal}
          onClose={() => setShowAccountUpdateConfirmModal(false)}
          onConfirm={confirmAccountUpdate}
          title={t('profile.confirmAccountUpdate')}
          message={t('profile.accountUpdateWarning')}
          confirmText={t('common.confirm')}
          cancelText={t('common.cancel')}
          variant="warning"
          closeOnConfirm={false}
        />
      </div>
    </ProtectedRoute>
  );
}
