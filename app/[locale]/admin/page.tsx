'use client';

import { getCurrentUser } from '@/lib/auth';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    const user = getCurrentUser();
    
    if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
      router.push(`/${locale}/login`);
    } else {
      if (user.role === 'owner') {
        router.replace(`/${locale}/admin/users`);
      } else {
        router.replace(`/${locale}/admin/opportunities`);
      }
    }
  }, [router, locale]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-400">Redirigiendo...</div>
    </div>
  );
}
