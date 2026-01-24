'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLogin, useMe } from '@/hooks/useAuth';
import { getCurrentUser, setCurrentUser } from '@/lib/auth';
import { User } from '@/lib/types';
import { ArrowLeft, Eye, EyeOff } from '@/components/icons';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const loginMutation = useLogin();
  
  const localUser = typeof window !== 'undefined' ? getCurrentUser() : null;
  const { data: currentUser, isLoading: isLoadingUser, error: meError } = useMe({
    enabled: !!localUser,
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

    if (meError) {
      const staleUser = getCurrentUser();
      if (staleUser) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_user');
        }
      }
      return;
    }

    const localUser = getCurrentUser();

    if (localUser && localUser.active && !isLoadingUser && currentUser && currentUser.active) {
      if (currentUser.role === 'owner') {
        router.replace(`/${locale}/admin/users`);
      } else if (currentUser.role === 'admin') {
        router.replace(`/${locale}/admin/opportunities`);
      }
      return;
    }

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
      toast.error(errorMessage);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 relative">
      <div className="mb-4 sm:mb-6">
        <Button
          variant="outline"
          onClick={() => router.push(`/${locale}`)}
          className="flex items-center gap-2 text-sm sm:text-base"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{t('common.goBack')}</span>
          <span className="sm:hidden">{t('common.goBack')}</span>
        </Button>
      </div>
      <div className="flex items-center justify-center min-h-[calc(100vh-180px)] sm:min-h-[calc(100vh-200px)]">
        <div className="w-full max-w-md space-y-4 sm:space-y-6 px-2 sm:px-0">
          <div>
            <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-white">
              {t('auth.loginTitle')}
            </h2>
            <p className="mt-2 sm:mt-3 text-center text-xs sm:text-sm text-gray-300 max-w-md mx-auto px-2">
              {t('auth.loginDescription')}
            </p>
          </div>
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-3 sm:space-y-4">
              <Input
                label={t('auth.usernameOrEmail')}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder={t('auth.usernameOrEmailPlaceholder')}
              />
              <div className="w-full">
                <label className="block text-sm font-medium mb-1 text-gray-300">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full px-3 py-2 pr-10 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white text-sm sm:text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full text-sm sm:text-base"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? t('common.loading') : t('auth.loginButton')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
