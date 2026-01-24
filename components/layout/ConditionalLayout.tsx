'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageTransition } from '@/components/layout/PageTransition';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface ConditionalLayoutProps {
  children: ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  const isLegalPage = pathname?.includes('/legal/');
  if (isLegalPage) {
    return <div className="min-h-screen bg-gray-900">{children}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-900">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}
