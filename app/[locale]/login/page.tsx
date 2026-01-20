'use client';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLogin, useMe } from '@/hooks/useAuth';
import { getCurrentUser, setCurrentUser } from '@/lib/auth';
import { User } from '@/lib/types';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const loginMutation = useLogin();
  const { data: currentUser, isLoading: isLoadingUser, error: meError } = useMe();

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    if (meError) {
      return;
    }

    const localUser = getCurrentUser();
    if (localUser) {
      if (localUser.role === 'owner') {
        router.push(`/${locale}/admin/users`);
      } else {
        router.push(`/${locale}/admin/opportunities`);
      }
      return;
    }

    if (!isLoadingUser && currentUser) {
      if (currentUser.role === 'owner') {
        router.push(`/${locale}/admin/users`);
      } else {
        router.push(`/${locale}/admin/opportunities`);
      }
    }
  }, [mounted, currentUser, isLoadingUser, meError, router, locale]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await loginMutation.mutateAsync({ username, password });
      
      const user: User = {
        id: String(response.id),
        username: response.username,
        name: response.full_name,
        full_name: response.full_name,
        email: response.email,
        role: response.role,
        active: response.active,
        created_at: response.created_at,
        updated_at: response.updated_at,
      };
      
      setCurrentUser(user);
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-user-updated'));
      }
      
      if (user.role === 'owner') {
        router.push(`/${locale}/admin/users`);
      } else {
        router.push(`/${locale}/admin/opportunities`);
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : t('auth.invalidCredentials');
      setError(errorMessage);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 py-4 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-md w-full space-y-6">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-white">
            {t('auth.loginTitle')}
          </h2>
          <p className="mt-3 text-center text-sm text-gray-300 max-w-md mx-auto">
            {t('auth.loginDescription')}
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label={t('auth.username')}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
            <Input
              label={t('auth.password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError('')}
            />
          )}

          <div className="space-y-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? t('common.loading') : t('auth.loginButton')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => router.push(`/${locale}`)}
            >
              {t('common.goHome')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
