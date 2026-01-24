'use client';

import { Loader2, LogIn, Menu, User, X } from '@/components/icons';
import { useAppInfo } from '@/hooks/useConfiguration';
import { getCurrentUser } from '@/lib/auth';
import { User as UserType } from '@/lib/types';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/Button';

export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const { data: appInfo, isLoading: isLoadingAppInfo } = useAppInfo();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setTimeout(() => {
      setMounted(true);
      setUser(getCurrentUser());

      if (appInfo) {
        if (appInfo.company_logo) {
          setLogo(appInfo.company_logo);
          localStorage.setItem('app_logo', appInfo.company_logo);
        } else {
          setLogo(null);
        }
        if (appInfo.company_name) {
          setCompanyName(appInfo.company_name);
          localStorage.setItem('app_company_name', appInfo.company_name);
        } else {
          setCompanyName(null);
        }
        setLogoLoading(false);
      } else if (!isLoadingAppInfo) {
        try {
          const savedLogo = localStorage.getItem('app_logo');
          const savedCompanyName = localStorage.getItem('app_company_name');
          if (savedLogo) {
            setLogo(savedLogo);
          } else {
            setLogo(null);
          }
          if (savedCompanyName) {
            setCompanyName(savedCompanyName);
          } else {
            setCompanyName(null);
          }
          setLogoLoading(false);
        } catch (e) {
          console.error('Error accessing localStorage:', e);
          setLogoLoading(false);
        }
      }
    }, 0);

    const handleStorageChange = () => {
      try {
        const newLogo = localStorage.getItem('app_logo');
        const newCompanyName = localStorage.getItem('app_company_name');
        if (newLogo) {
          setLogo(newLogo);
        } else {
          setLogo(null);
        }
        if (newCompanyName) {
          setCompanyName(newCompanyName);
        } else {
          setCompanyName(null);
        }
        setLogoLoading(false);
      } catch (e) {
        console.error('Error accessing localStorage:', e);
        setLogoLoading(false);
      }
    };

    const handleAuthChange = () => {
      setTimeout(() => {
        setUser(getCurrentUser());
      }, 0);
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'app_logo' || e.key === 'app_company_name') {
        handleStorageChange();
      }
      if (e.key === 'auth_user') {
        handleAuthChange();
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('logo-updated', handleStorageChange);
    window.addEventListener('company-name-updated', handleStorageChange);
    window.addEventListener('auth-user-updated', handleAuthChange);
    window.addEventListener('auth-user-removed', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('logo-updated', handleStorageChange);
      window.removeEventListener('company-name-updated', handleStorageChange);
      window.removeEventListener('auth-user-updated', handleAuthChange);
      window.removeEventListener('auth-user-removed', handleAuthChange);
    };
  }, [appInfo, isLoadingAppInfo]);

  const isLoginPage = mounted && pathname?.includes('/login');
  const isAdminPage = mounted && pathname?.includes('/admin');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (mobileMenuRef.current && mobileMenuRef.current.contains(target)) {
        return;
      }

      if (showMobileMenu) {
        setShowMobileMenu(false);
      }
    };

    if (showMobileMenu) {
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside, true);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleClickOutside, true);
      };
    }
  }, [showMobileMenu]);

  const handleProfileClick = () => {
    if (!user) {
      return;
    }

    if (user.role === 'owner') {
      router.push(`/${locale}/admin/users`);
    } else {
      router.push(`/${locale}/admin/opportunities`);
    }
  };

  if (!mounted) {
    return (
      <header className="sticky top-0 z-40 w-full border-b bg-gray-900 border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
              </div>
              <span className="text-xl font-semibold text-white">
                {t('header.logo')}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="h-5 w-5" />
                <div className="h-4 w-16 bg-gray-700 rounded" />
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={`${isAdminPage ? '' : 'sticky top-0'} z-40 w-full border-b bg-gray-900 border-gray-800`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          <div
            className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => router.push(`/${locale}`)}
          >
            {logoLoading ? (
              <div className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center">
                <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 animate-spin" />
              </div>
            ) : logo ? (
              <div className="relative h-10 w-auto sm:h-12">
                <Image
                  src={logo}
                  alt="Logo"
                  width={48}
                  height={48}
                  className="object-contain h-10 sm:h-12"
                  unoptimized
                />
              </div>
            ) : (
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                J
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-base sm:text-xl font-semibold text-white">
                {t('header.logo')}
              </span>
              {companyName && (
                <span className="text-xs text-gray-400 hidden sm:block">
                  {companyName}
                </span>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isAdminPage && (
              <Button
                variant="outline"
                size="md"
                onClick={() => router.push(`/${locale}`)}
                className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
              >
                {t('common.goHome')}
              </Button>
            )}

            {user && !isAdminPage ? (
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-all duration-200 hover:scale-105"
              >
                <User className="h-5 w-5 text-gray-300" />
                <span className="text-sm font-medium text-gray-300">
                  {user.name || user.username}
                </span>
              </button>
            ) : !isLoginPage && !isAdminPage ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => router.push(`/${locale}/login`)}
                className="flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 whitespace-nowrap"
              >
                <LogIn className="h-4 w-4 flex-shrink-0" />
                <span>{t('common.login')}</span>
              </Button>
            ) : null}
          </div>

          {!isLoginPage && (
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                aria-label="Menu"
              >
                {showMobileMenu ? (
                  <X className="h-6 w-6 text-gray-300" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-300" />
                )}
              </button>
            </div>
          )}
        </div>

        {showMobileMenu && !isLoginPage && (
          <div ref={mobileMenuRef} className="md:hidden border-t border-gray-800 py-4 space-y-3">
            {isAdminPage && (
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  router.push(`/${locale}`);
                  setShowMobileMenu(false);
                }}
                className="w-full justify-center"
              >
                {t('common.goHome')}
              </Button>
            )}

            {user && !isAdminPage ? (
              <button
                onClick={() => {
                  handleProfileClick();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <User className="h-5 w-5 text-gray-300" />
                <span className="text-sm font-medium text-gray-300">
                  {user.name || user.username}
                </span>
              </button>
            ) : !isAdminPage ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  router.push(`/${locale}/login`);
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <LogIn className="h-4 w-4 flex-shrink-0" />
                <span>{t('common.login')}</span>
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </header>
  );
}
