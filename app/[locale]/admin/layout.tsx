'use client';

import { AdminNavbar } from '@/components/layout/AdminNavbar';
import { PageTransition } from '@/components/layout/PageTransition';
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdminNavbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageTransition>
          {children}
        </PageTransition>
      </div>
    </>
  );
}
