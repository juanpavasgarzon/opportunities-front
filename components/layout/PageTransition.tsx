'use client';

import { Loader } from '@/components/ui/Loader';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {loading && <Loader />}
      <div className={loading ? 'opacity-30' : 'opacity-100 transition-opacity duration-300'}>
        {displayChildren}
      </div>
    </>
  );
}
