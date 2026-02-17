'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { setApiRedirectCallback } from '@/lib/api/client';

interface ApiProviderProps {
  children: ReactNode;
}

export function ApiProvider({ children }: ApiProviderProps) {
  const router = useRouter();

  useEffect(() => {
    // Initialize API redirect callback with Next.js router
    setApiRedirectCallback((url: string) => {
      router.push(url);
    });
  }, [router]);

  return <>{children}</>;
}
