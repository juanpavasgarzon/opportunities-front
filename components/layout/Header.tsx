'use client';

import { useAppInfo } from '@/hooks/useConfiguration';
import { getCurrentUser } from '@/lib/auth';
import { User as UserType } from '@/lib/types';
import { Loader2, LogIn, User } from 'lucide-react';
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
  const [showLangMenu, setShowLangMenu] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  
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
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    };

    if (showLangMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLangMenu]);

  const handleLanguageChange = (newLocale: string) => {
    if (!mounted) {
      return;
    }
    
    const path = pathname || '';
    const pathWithoutLocale = path.replace(/^\/(en|es|pt)/, '');
    setShowLangMenu(false);
    setTimeout(() => {
      router.push(`/${newLocale}${pathWithoutLocale || ''}`);
    }, 150);
  };


  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' }
  ];

  const currentLanguage = languages.find(lang => lang.code === locale);

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
        <div className="flex h-20 items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => router.push(`/${locale}`)}
          >
            {logoLoading ? (
              <div className="h-12 w-12 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
              </div>
            ) : logo ? (
              <div className="relative h-12 w-auto">
                <Image
                  src={logo}
                  alt="Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                  unoptimized
                />
              </div>
            ) : (
              <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                J
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-white">
                {t('header.logo')}
              </span>
              {companyName && (
                <span className="text-xs text-gray-400">
                  {companyName}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">

            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-all duration-200 hover:scale-105"
              >
                <span className="text-lg">{currentLanguage?.flag}</span>
                <span className="text-sm font-medium text-gray-300">
                  {currentLanguage?.name}
                </span>
              </button>
              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors duration-150 flex items-center gap-2 ${
                        locale === lang.code ? 'bg-blue-900/20 text-blue-400' : 'text-gray-300'
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user && !isAdminPage ? (
              <button
                onClick={() => {
                  if (user.role === 'owner' || user.role === 'admin') {
                    router.push(`/${locale}/admin/opportunities`);
                  }
                }}
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
                className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
              >
                <LogIn className="h-4 w-4" />
                {t('common.login')}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
