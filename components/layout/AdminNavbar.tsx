'use client';

import { getCurrentUser } from '@/lib/auth';
import { Briefcase, Settings, User, Users } from '@/components/icons';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function AdminNavbar() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const [user, setUser] = useState<{ role: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
      setUser(getCurrentUser());
    }, 0);
  }, []);


  if (!mounted || !user) {
    return (
      <nav className="sticky top-0 z-30 bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 md:h-14">
            <div className="h-8 w-32 bg-gray-700 rounded animate-pulse" />
            <div className="md:hidden h-8 w-8 bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </nav>
    );
  }

  const isOwner = user?.role === 'owner';

  const navItems = [
    ...(isOwner ? [{
      href: `/${locale}/admin/users`,
      label: t('admin.users'),
      icon: Users
    }] : []),
    {
      href: `/${locale}/admin/opportunities`,
      label: t('admin.opportunities'),
      icon: Briefcase
    },
    {
      href: `/${locale}/admin/profile`,
      label: t('admin.profile'),
      icon: User
    },
    ...(isOwner ? [{
      href: `/${locale}/admin/settings`,
      label: t('admin.settings'),
      icon: Settings
    }] : [])
  ];

  return (
    <nav className="sticky top-0 z-30 bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 transition-all duration-300 ease-in-out ${isActive
                  ? 'border-blue-400 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                  }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center h-12">
          <div className="flex-1 overflow-x-auto overflow-y-hidden -mx-4 px-4 scrollbar-hide">
            <div className="flex space-x-3 sm:space-x-4 min-w-max">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-300 ease-in-out whitespace-nowrap ${isActive
                      ? 'bg-blue-900/30 text-blue-400'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                      }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
