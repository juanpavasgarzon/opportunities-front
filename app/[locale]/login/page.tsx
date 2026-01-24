'use client';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLogin, useMe } from '@/hooks/useAuth';
import { getCurrentUser, setCurrentUser } from '@/lib/auth';
import { User } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';
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
  // Only fetch /auth/me if there's a user in localStorage (to avoid unnecessary requests after logout)
  const localUser = typeof window !== 'undefined' ? getCurrentUser() : null;
  const { data: currentUser, isLoading: isLoadingUser, error: meError } = useMe({
    enabled: !!localUser, // Only fetch if there's a user in localStorage
  });

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    // If there's an error (401, etc.), user is not authenticated - stay on login page
    // Clear any stale user data from localStorage
    if (meError) {
      const staleUser = getCurrentUser();
      if (staleUser) {
        // Clear stale user data
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_user');
        }
      }
      return;
    }

    const localUser = getCurrentUser();
    
    // Only redirect if there's a valid user in localStorage AND we got a valid response from API
    // This prevents redirecting when user just logged out (localStorage cleared but API might still be loading)
    if (localUser && localUser.active && !isLoadingUser && currentUser && currentUser.active) {
      if (currentUser.role === 'owner') {
        router.replace(`/${locale}/admin/users`);
      } else if (currentUser.role === 'admin') {
        router.replace(`/${locale}/admin/opportunities`);
      }
      return;
    }

    // If localStorage is empty but API returns a user, update localStorage and redirect
    if (!localUser && !isLoadingUser && currentUser && currentUser.active) {
      const user: User = {
        id: String(currentUser.id),
        username: currentUser.username,
        name: currentUser.full_name,
        full_name: currentUser.full_name,
        email: currentUser.email,
        role: currentUser.role,
        active: currentUser.active,
        created_at: currentUser.created_at,
        updated_at: currentUser.updated_at,
      };
      setCurrentUser(user);
      
      if (currentUser.role === 'owner') {
        router.replace(`/${locale}/admin/users`);
      } else if (currentUser.role === 'admin') {
        router.replace(`/${locale}/admin/opportunities`);
      }
    }
  }, [mounted, currentUser, isLoadingUser, meError, router, locale]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await loginMutation.mutateAsync({ username_or_email: username, password });

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
    <div className="flex items-start justify-center bg-gray-900 pt-20 pb-20 relative">
      <div className="absolute top-4 left-0 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="outline"
            onClick={() => router.push(`/${locale}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.goBack')}
          </Button>
        </div>
      </div>
      <div className="w-full max-w-md space-y-6 mt-4">
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
              label={t('auth.usernameOrEmail')}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              placeholder={t('auth.usernameOrEmailPlaceholder')}
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

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? t('common.loading') : t('auth.loginButton')}
          </Button>
        </form>
      </div>
    </div>
  );
}
