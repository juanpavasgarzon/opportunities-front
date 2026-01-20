'use client';

import { getCurrentUser, isAuthorized } from '@/lib/auth';
import { User, UserRole } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole[];
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
      const currentUser = getCurrentUser();
      setUser(currentUser);

      if (!currentUser || !isAuthorized(currentUser, requiredRole)) {
        const locale = pathname?.split('/')[1] || 'en';
        if (!pathname?.includes('/login')) {
          router.push(`/${locale}/login`);
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    }, 0);
  }, [router, pathname, requiredRole]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen" suppressHydrationWarning>
        <div className="flex items-center gap-2 text-gray-400">
          <div className="h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (!user || !isAuthorized(user, requiredRole)) {
    return null;
  }

  return <>{children}</>;
}
